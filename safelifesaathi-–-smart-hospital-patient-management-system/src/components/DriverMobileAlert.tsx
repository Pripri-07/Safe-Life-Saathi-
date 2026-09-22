import React, { useState } from 'react';
import {
  Siren,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  Navigation,
  ArrowUpRight,
  AlertOctagon,
  Car,
  Clock,
  Compass,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Bell,
  Send
} from 'lucide-react';
import { Ambulance, Vehicle, AppTab, CorridorActivityLog } from '../types';
import { playEmergencyWarningTone } from '../utils/audio';
import { CorridorAlertsAndLogs } from './CorridorAlertsAndLogs';

interface DriverMobileAlertProps {
  ambulance: Ambulance;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  activityLogs: CorridorActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<CorridorActivityLog[]>>;
  selectedVehicleId?: string;
  setSelectedVehicleId?: (id: string) => void;
  setActiveTab?: (tab: AppTab) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const DriverMobileAlert: React.FC<DriverMobileAlertProps> = ({
  ambulance,
  vehicles,
  setVehicles,
  activityLogs,
  setActivityLogs,
  selectedVehicleId: initialSelectedId,
  setSelectedVehicleId,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
}) => {
  // Select active vehicle (defaults to first non-compliant or first vehicle)
  const defaultVeh = vehicles.find(v => v.id === initialSelectedId) || vehicles.find(v => v.status === 'non-compliant') || vehicles[0];
  const [activeVehId, setActiveVehId] = useState<string>(defaultVeh?.id || 'veh-ka-1');

  const currentVehicle = vehicles.find(v => v.id === activeVehId) || vehicles[0];
  const isFront = currentVehicle.isAhead === true && currentVehicle.direction === 'same' && (currentVehicle.lateralOffset === undefined || currentVehicle.lateralOffset > -2.5);
  const isOpposite = currentVehicle.direction === 'opposite' || (currentVehicle.lateralOffset !== undefined && currentVehicle.lateralOffset < -2.5);
  const isBehind = !isFront && !isOpposite;
  const isCleared = currentVehicle.isCleared || currentVehicle.status === 'cleared';
  const isNonCompliant = (currentVehicle.status === 'non-compliant' || currentVehicle.isNonCompliant) && !isCleared;

  const handleAcknowledge = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setVehicles(prev => prev.map(v => {
      if (v.id === currentVehicle.id) {
        return {
          ...v,
          isCleared: true,
          status: 'cleared',
          isNonCompliant: false,
          acknowledgedAt: timeStr,
          timeAgo: 'Just now',
        };
      }
      return v;
    }));

    const newLog: CorridorActivityLog = {
      id: `act-${Date.now()}`,
      type: 'lane-cleared',
      message: `Driver ${currentVehicle.plate} moved to shoulder — Lane cleared for ${currentVehicle.ambulanceId || ambulance.id}`,
      timestamp: timeStr,
      source: currentVehicle.ambulanceId || ambulance.id,
      ambulanceId: currentVehicle.ambulanceId || ambulance.id,
      severity: 'success',
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const handleResetVehicleStatus = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setVehicles(prev => prev.map(v => {
      if (v.id === currentVehicle.id) {
        return {
          ...v,
          isCleared: false,
          status: 'non-compliant',
          isNonCompliant: true,
          timeAgo: 'Just now',
        };
      }
      return v;
    }));

    const newLog: CorridorActivityLog = {
      id: `act-${Date.now()}`,
      type: 'non-compliant',
      message: `Vehicle ${currentVehicle.plate} re-entered active lane (${currentVehicle.lane || 'Lane 3'})`,
      timestamp: timeStr,
      source: currentVehicle.ambulanceId || ambulance.id,
      ambulanceId: currentVehicle.ambulanceId || ambulance.id,
      severity: 'critical',
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const handleTriggerBeep = () => {
    playEmergencyWarningTone();
  };

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-8 font-sans">

      {/* Top Header & Car Selector Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Car className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">Connected Vehicle In-Cabin Alert System (V2V)</h1>
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                    Front Vehicle Targeted
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select any vehicle to test the directional V2V alerts. Automatic notifications target only front vehicles in the forward zone.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('ambulance-clearance')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>Open Radar Map</span>
          </button>
        </div>

        {/* Vehicle Quick Switcher Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Switch In-Car HUD Perspective:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {vehicles.map(v => {
              const isSelected = v.id === currentVehicle.id;
              const isVehFront = v.isAhead === true && v.direction === 'same' && (v.lateralOffset === undefined || v.lateralOffset > -2.5);
              const isVehNonCompliant = (v.status === 'non-compliant' || v.isNonCompliant) && !v.isCleared;
              const isVehCleared = v.status === 'cleared' || v.isCleared;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVehId(v.id);
                    if (setSelectedVehicleId) setSelectedVehicleId(v.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                >
                  {isVehNonCompliant ? (
                    <AlertTriangle className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-rose-600'}`} />
                  ) : isVehCleared ? (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  ) : (
                    <Bell className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-300' : 'text-sky-600'}`} />
                  )}
                  <span className="font-mono font-bold">{v.plate}</span>
                  <span className="opacity-70 text-[10px] capitalize">({v.type})</span>
                  {isVehFront ? (
                    <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1 rounded font-mono">Ahead</span>
                  ) : (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded font-mono">Skipped</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smartphone In-Cabin Alert HUD Simulation */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-slate-800 text-white relative overflow-hidden">

          {/* Top Smartphone Status Bar */}
          <div className="flex items-center justify-between px-3 py-1 text-[11px] text-slate-400 border-b border-slate-800/80 mb-4 font-mono">
            <span>09:41 AM</span>
            <div className="flex items-center gap-2">
              <span>5G V2V {isFront ? 'Active Alert' : 'Standby'}</span>
              <span className={`h-2 w-2 rounded-full ${isFront ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            </div>
          </div>

          {/* Big Alert Banner */}
          <div className={`p-6 rounded-2xl border transition-all ${!isFront
              ? 'bg-slate-800/90 border-slate-700 text-slate-200'
              : isCleared
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
                : isNonCompliant
                  ? 'bg-rose-950/90 border-rose-500 text-rose-100 animate-pulse'
                  : 'bg-amber-950/80 border-amber-500 text-amber-100 animate-pulse'
            }`}>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`p-3 rounded-2xl flex items-center justify-center ${!isFront
                    ? 'bg-slate-800 text-slate-400'
                    : isCleared
                      ? 'bg-emerald-900 text-emerald-300'
                      : isNonCompliant
                        ? 'bg-rose-900 text-rose-200 animate-bounce'
                        : 'bg-amber-900 text-amber-200 animate-bounce'
                  }`}>
                  {!isFront ? (
                    <CheckCircle2 className="w-8 h-8 text-slate-400" />
                  ) : isCleared ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : isNonCompliant ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <Siren className="w-8 h-8" />
                  )}
                </span>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded ${!isFront
                      ? 'text-slate-300 bg-slate-800'
                      : isCleared
                        ? 'text-emerald-400 bg-emerald-900/60'
                        : isNonCompliant
                          ? 'text-rose-400 bg-rose-900/60'
                          : 'text-amber-400 bg-amber-900/60'
                    }`}>
                    {!isFront
                      ? (isBehind ? 'VEHICLE BEHIND AMBULANCE • NO ALERT' : 'OPPOSITE DIRECTION • NO ALERT')
                      : isCleared
                        ? 'LANE CLEARED • SAFE ON SHOULDER'
                        : isNonCompliant
                          ? '⚠️ NON-COMPLIANT: CLEAR LANE IMMEDIATELY'
                          : 'URGENT FORWARD ROAD CLEARANCE'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                    {!isFront
                      ? (isBehind ? 'AMBULANCE HAS PASSED' : 'OPPOSITE TRAFFIC LANE')
                      : isCleared
                        ? 'ROADWAY CLEARED'
                        : isNonCompliant
                          ? '🚨 AMBULANCE BLOCKED AHEAD'
                          : '🚨 AMBULANCE APPROACHING'}
                  </h2>
                </div>
              </div>

              {/* Audio warning test button */}
              {isFront && (
                <button
                  onClick={handleTriggerBeep}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  title="Test emergency audio chime"
                >
                  <Volume2 className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline text-[10px]">Test Siren</span>
                </button>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              {!isFront ? (
                <span className="text-slate-300">
                  {isBehind ? (
                    <>Ambulance <strong>{currentVehicle.ambulanceId || ambulance.id}</strong> is ahead of you. No emergency clearance action required for your vehicle.</>
                  ) : (
                    <>Vehicle is in the opposite carriageway separated by median. No emergency clearance action required.</>
                  )}
                </span>
              ) : isCleared ? (
                <span className="text-emerald-300">
                  Thank you! Vehicle <strong>{currentVehicle.plate}</strong> has moved to the emergency shoulder. {currentVehicle.ambulanceId || ambulance.id} has an open clearance corridor.
                </span>
              ) : isNonCompliant ? (
                <span>
                  Emergency corridor priority: <strong>{currentVehicle.plate}</strong> is in the forward path blocking <strong>{currentVehicle.lane || 'Lane 3'}</strong> on <strong>{currentVehicle.roadName || 'Corridor'}</strong>.
                  {currentVehicle.reminderCount && currentVehicle.reminderCount > 0 && ` (${currentVehicle.reminderCount} automated reminders issued)`}
                </span>
              ) : (
                <span>
                  An emergency ambulance is approaching from behind within Range in your travel direction on <strong>{currentVehicle.lane || 'Lane 2'}</strong>. Please smoothly move to the shoulder.
                </span>
              )}
            </p>

            {/* Key Distance & ETA Grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Position</span>
                <span className={`text-base sm:text-xl font-black font-mono ${isFront ? 'text-amber-400' : 'text-slate-400'}`}>
                  {isFront ? `${currentVehicle.distanceToAmbulance || 120}m Ahead` : isBehind ? 'Behind' : 'Opposite'}
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Assigned Lane</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 block pt-1">
                  {isCleared ? 'Emergency Shoulder' : currentVehicle.lane || 'Lane 3'}
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Approaching Amb</span>
                <span className="text-xl sm:text-2xl font-black text-red-400 font-mono">
                  {currentVehicle.ambulanceId || ambulance.id}
                </span>
              </div>
            </div>

            {/* Suggested Safe Driving Action */}
            <div className="mt-4 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-300 block font-semibold">Suggested Driver Action:</strong>
                <span className="text-slate-300">
                  {!isFront
                    ? 'Drive normally. The emergency vehicle is not in your immediate clearance path.'
                    : isCleared
                      ? 'Maintain safe speed on shoulder until emergency vehicle passes.'
                      : 'Turn on left/right indicator and smoothly transition into the shoulder lane. Do not brake abruptly.'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {isFront && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {!isCleared ? (
                  <button
                    onClick={handleAcknowledge}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Acknowledge & Moved to Shoulder</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetVehicleStatus}
                    className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Simulate Blocking Lane Again
                  </button>
                )}

                <button
                  onClick={() => setActiveTab && setActiveTab('ambulance-clearance')}
                  className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span>View Full Radar Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Live In-Car HUD mini representation */}
          <div className="mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-400" /> Vehicle: <strong className="font-mono text-white">{currentVehicle.plate}</strong>
              </span>
              <span className="font-mono text-[10px]">Speed: {currentVehicle.speedKmh} km/h</span>
            </div>

            {/* Visual Lane representation */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${isCleared
                    ? 'bg-emerald-900/80 text-emerald-300'
                    : isNonCompliant
                      ? 'bg-rose-900/80 text-rose-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                  {isCleared ? 'SHOULDER / SAFE LANE' : `${currentVehicle.lane || 'LANE 3'} (CLEAR NEEDED)`}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Assigned Target: <strong>{currentVehicle.ambulanceId || ambulance.id}</strong>
              </div>
            </div>
          </div>

          {/* Protocol notice */}
          <div className="mt-3 text-center text-[10px] text-slate-500">
            SafeLifeSaathi V2V Traffic Safety Protocol • Compliant with MoRTH / ITU-T Emergency Broadcast Standards
          </div>
        </div>
      </div>

      {/* Vehicle Alerts & Corridor Activity Log Section (Matching User Image) */}
      <div className="mt-6">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Corridor Vehicle Alerts & Live Activity Log</h2>
          <p className="text-xs text-slate-500">Real-time status for all vehicles responding to active corridor ambulances.</p>
        </div>
        <CorridorAlertsAndLogs
          vehicles={vehicles}
          setVehicles={setVehicles}
          activityLogs={activityLogs}
          setActivityLogs={setActivityLogs}
          ambulance={ambulance}
          selectedVehicleId={currentVehicle.id}
          onSelectVehicle={(veh) => setActiveVehId(veh.id)}
          onOpenDriverHUD={(vehId) => setActiveVehId(vehId)}
          soundEnabled={soundEnabled}
        />
      </div>

    </div>
  );
};

