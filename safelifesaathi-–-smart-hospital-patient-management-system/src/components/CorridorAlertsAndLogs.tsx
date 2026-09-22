import React, { useState, useEffect } from 'react';
import {
  Car,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Activity,
  RotateCcw,
  Radio,
  Siren,
  AlertCircle,
  Send,
  Volume2,
  Smartphone,
  ShieldAlert,
  Filter,
  Check,
  Zap,
  ArrowUp,
  ArrowDown,
  Compass,
  Radar
} from 'lucide-react';
import { Vehicle, CorridorActivityLog, Ambulance } from '../types';
import { playEmergencyWarningTone } from '../utils/audio';

interface CorridorAlertsAndLogsProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  activityLogs: CorridorActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<CorridorActivityLog[]>>;
  ambulance?: Ambulance;
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onOpenDriverHUD?: (vehicleId: string) => void;
  soundEnabled?: boolean;
  autoNotifyEnabled?: boolean;
  setAutoNotifyEnabled?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CorridorAlertsAndLogs: React.FC<CorridorAlertsAndLogsProps> = ({
  vehicles,
  setVehicles,
  activityLogs,
  setActivityLogs,
  ambulance,
  selectedVehicleId,
  onSelectVehicle,
  onOpenDriverHUD,
  soundEnabled = true,
  autoNotifyEnabled = true,
  setAutoNotifyEnabled,
}) => {
  const [filterType, setFilterType] = useState<'front-only' | 'non-compliant' | 'notified' | 'cleared' | 'all'>('front-only');
  const [sentNoticeVehicleId, setSentNoticeVehicleId] = useState<string | null>(null);
  const [lastAutoScanTime, setLastAutoScanTime] = useState<string>('Live');

  // Strict Front Vehicle Filter: ahead, same direction, within 500m, same roadway
  const frontVehicles = vehicles.filter(v =>
    v.isAhead === true &&
    v.direction === 'same' &&
    (v.lateralOffset === undefined || v.lateralOffset > -2.5) &&
    (v.distanceToAmbulance <= 500 || v.isIn500mForwardZone)
  );

  const nonCompliantFrontCount = frontVehicles.filter(v => (v.status === 'non-compliant' || v.isNonCompliant) && !v.isCleared).length;
  const clearedCount = vehicles.filter(v => v.status === 'cleared' || v.isCleared).length;

  // Periodic Automatic Notification Scanner for Front Vehicles
  useEffect(() => {
    if (!autoNotifyEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLastAutoScanTime(timeStr);

      // Identify front vehicles that require automated notification
      let newlyNotifiedCount = 0;
      let newlyNotifiedPlate = '';

      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          const isFront = veh.isAhead === true && veh.direction === 'same' && (veh.distanceToAmbulance <= 500 || veh.isIn500mForwardZone);

          // Only check FRONT vehicles
          if (isFront && !veh.isCleared) {
            // If not notified yet, auto-notify immediately
            if (!veh.isNotified) {
              newlyNotifiedCount++;
              newlyNotifiedPlate = veh.plate;
              return {
                ...veh,
                isNotified: true,
                reminderCount: (veh.reminderCount || 0) + 1,
                timeAgo: 'Just now',
              };
            }
          }
          return veh;
        });
      });

      // Log automated alert if any new front vehicle was notified
      if (newlyNotifiedCount > 0 && newlyNotifiedPlate) {
        if (soundEnabled) {
          playEmergencyWarningTone();
        }
        const newLog: CorridorActivityLog = {
          id: `act-${Date.now()}`,
          type: 'reminder-sent',
          message: `[Auto-Notify Engine] Automatic V2X forward clearance dispatched to ${newlyNotifiedPlate} (Front Zone)`,
          timestamp: timeStr,
          source: ambulance?.id || 'AMB-047',
          ambulanceId: ambulance?.id || 'AMB-047',
          severity: 'info',
        };
        setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [autoNotifyEnabled, ambulance?.id, setActivityLogs, setVehicles, soundEnabled]);

  // Filtered vehicles based on selected tab
  const filteredVehicles = vehicles.filter(v => {
    const isFront = v.isAhead === true && v.direction === 'same' && (v.lateralOffset === undefined || v.lateralOffset > -2.5);

    if (filterType === 'front-only') return isFront;
    if (filterType === 'non-compliant') return (v.status === 'non-compliant' || v.isNonCompliant) && !v.isCleared && isFront;
    if (filterType === 'notified') return (v.status === 'notified' || v.isNotified) && !v.isCleared && isFront;
    if (filterType === 'cleared') return v.status === 'cleared' || v.isCleared;
    return true; // 'all' tab shows everything (including behind/opposite for comparison)
  });

  // Handle single vehicle manual reminder (only for front vehicles)
  const handleSendReminder = (veh: Vehicle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (soundEnabled) {
      playEmergencyWarningTone();
    }

    setSentNoticeVehicleId(veh.id);
    setTimeout(() => setSentNoticeVehicleId(null), 2500);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Update vehicle reminder count
    setVehicles(prev => prev.map(v => {
      if (v.id === veh.id) {
        return {
          ...v,
          reminderCount: (v.reminderCount || 0) + 1,
          timeAgo: 'Just now',
          isNotified: true,
        };
      }
      return v;
    }));

    // Add activity log
    const newLog: CorridorActivityLog = {
      id: `act-${Date.now()}`,
      type: 'reminder-sent',
      message: `Direct clearance alert re-sent to ${veh.plate} (${veh.lane || 'Lane'} · ${veh.distanceToAmbulance || 120}m Ahead)`,
      timestamp: timeStr,
      source: veh.ambulanceId || ambulance?.id || 'AMB-047',
      ambulanceId: veh.ambulanceId || ambulance?.id || 'AMB-047',
      severity: 'warning',
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Broadcast reminder to ALL front non-compliant vehicles
  const handleBroadcastToFrontVehicles = () => {
    if (soundEnabled) {
      playEmergencyWarningTone();
    }
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setVehicles(prev => prev.map(v => {
      const isFront = v.isAhead === true && v.direction === 'same';
      if (isFront && !v.isCleared) {
        return {
          ...v,
          reminderCount: (v.reminderCount || 0) + 1,
          timeAgo: 'Just now',
          isNotified: true,
        };
      }
      return v;
    }));

    const newLog: CorridorActivityLog = {
      id: `act-${Date.now()}`,
      type: 'non-compliant',
      message: `[Front Broadcast] High-priority audio/visual alert broadcast to ${frontVehicles.length} front vehicles in forward cone`,
      timestamp: timeStr,
      source: ambulance?.id || 'AMB-047',
      ambulanceId: ambulance?.id || 'AMB-047',
      severity: 'critical',
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Toggle vehicle cleared status
  const handleToggleCleared = (veh: Vehicle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willBeCleared = !veh.isCleared;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setVehicles(prev => prev.map(v => {
      if (v.id === veh.id) {
        return {
          ...v,
          isCleared: willBeCleared,
          status: willBeCleared ? 'cleared' : 'non-compliant',
          isNonCompliant: !willBeCleared,
          timeAgo: 'Just now',
          acknowledgedAt: willBeCleared ? timeStr : undefined,
        };
      }
      return v;
    }));

    const newLog: CorridorActivityLog = {
      id: `act-${Date.now()}`,
      type: willBeCleared ? 'lane-cleared' : 'non-compliant',
      message: willBeCleared
        ? `Vehicle ${veh.plate} pulled over to shoulder — Lane cleared for ${veh.ambulanceId || ambulance?.id || 'Ambulance'}`
        : `Vehicle ${veh.plate} reverted to ${veh.lane || 'Lane 3'} (blocking)`,
      timestamp: timeStr,
      source: veh.ambulanceId || ambulance?.id || 'AMB-047',
      ambulanceId: veh.ambulanceId || ambulance?.id || 'AMB-047',
      severity: willBeCleared ? 'success' : 'critical',
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">

      {/* =========================================================================
          LEFT: Vehicle Alerts List (Focused on Front Vehicles Only)
      ========================================================================= */}
      <div className="lg:col-span-6 bg-[#0B1120] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-5 flex flex-col justify-between">
        <div>
          {/* Top Header with Automatic Notify Status */}
          <div className="pb-3 border-b border-slate-800/80 mb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-500">
                  <Car className="w-5 h-5 stroke-[2.5]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Vehicle Alerts</h3>
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60 flex items-center gap-1">
                      <Radar className="w-3 h-3 text-cyan-400 animate-spin" />
                      Front Vehicles
                    </span>
                  </div>
                </div>
              </div>

              {/* Automatic Notify Engine Toggle / Action */}
              <div className="flex items-center gap-2">
                {setAutoNotifyEnabled && (
                  <button
                    onClick={() => setAutoNotifyEnabled(!autoNotifyEnabled)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${autoNotifyEnabled
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    title="Toggle automatic forward vehicle notification engine"
                  >
                    <Zap className={`w-3.5 h-3.5 ${autoNotifyEnabled ? 'text-emerald-400 fill-emerald-400 animate-pulse' : ''}`} />
                    <span>Auto-Notify: {autoNotifyEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                )}

                {nonCompliantFrontCount > 0 && (
                  <button
                    onClick={handleBroadcastToFrontVehicles}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/70 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="Send audio & visual reminder to all front vehicles"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Auto-Notify</span>
                  </button>
                )}
              </div>
            </div>

            {/* Subtext explaining directional filtering */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                Scanning {frontVehicles.length} vehicles ahead in forward Zone
              </span>
              <span className="text-slate-500 font-mono">Behind/Opposite: Filtered</span>
            </div>
          </div>

          {/* Quick Filters Tabs */}
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto text-[11px]">
            {[
              { key: 'front-only', label: `Front Vehicles (${frontVehicles.length})` },
              { key: 'non-compliant', label: `Non-Compliant (${nonCompliantFrontCount})` },
              { key: 'notified', label: 'Notified' },
              { key: 'cleared', label: `Cleared (${clearedCount})` },
              { key: 'all', label: 'All (Incl. Filtered)' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${filterType === tab.key
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Vehicle Rows List */}
          <div className="divide-y divide-slate-800/80 mt-1">
            {filteredVehicles.slice(0, 7).map(veh => {
              const isFront = veh.isAhead === true && veh.direction === 'same';
              const isOpposite = veh.direction === 'opposite' || (veh.lateralOffset !== undefined && veh.lateralOffset < -2.5);
              const isBehind = !isFront && !isOpposite;
              const isNonCompliant = (veh.status === 'non-compliant' || veh.isNonCompliant) && !veh.isCleared;
              const isCleared = veh.status === 'cleared' || veh.isCleared;
              const isSelected = selectedVehicleId === veh.id;

              return (
                <div
                  key={veh.id}
                  onClick={() => onSelectVehicle && onSelectVehicle(veh)}
                  className={`py-3 px-2.5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${isSelected
                    ? 'bg-slate-900/90 border border-slate-700'
                    : 'hover:bg-slate-900/50'
                    } ${!isFront ? 'opacity-50 hover:opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isNonCompliant ? (
                        <span className="text-rose-500 flex items-center justify-center" title="Non-compliant blocking vehicle">
                          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                        </span>
                      ) : isCleared ? (
                        <span className="text-emerald-400 flex items-center justify-center" title="Cleared onto shoulder">
                          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                        </span>
                      ) : isFront ? (
                        <span className="text-sky-400 flex items-center justify-center" title="Auto-notified in front zone">
                          <Bell className="w-5 h-5 stroke-[2.2]" />
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center justify-center" title="Filtered (Behind or Opposite)">
                          <Compass className="w-5 h-5 stroke-[1.8]" />
                        </span>
                      )}
                    </div>

                    {/* Vehicle Plate & Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white tracking-wide">
                          {veh.plate}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {veh.type}
                        </span>

                        {/* Directional Tag */}
                        {isFront ? (
                          <span className="text-[10px] bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                            <ArrowUp className="w-3 h-3 text-cyan-400" />
                            {veh.distanceToAmbulance || 120}m Ahead
                          </span>
                        ) : isBehind ? (
                          <span className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.2 rounded font-mono flex items-center gap-0.5">
                            <ArrowDown className="w-3 h-3 text-slate-500" />
                            Behind (Skipped)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            Opposite (Skipped)
                          </span>
                        )}

                        {veh.reminderCount && veh.reminderCount > 1 && (
                          <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                            {veh.reminderCount}x rem
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                        <span>{veh.ambulanceId || ambulance?.id || 'AMB-047'}</span>
                        <span className="mx-1.5 opacity-60">·</span>
                        <span>{veh.lane || 'Lane 3'}</span>
                        <span className="mx-1.5 opacity-60">·</span>
                        <span>{veh.timeAgo || '1m ago'}</span>
                        {isFront && (
                          <>
                            <span className="mx-1.5 opacity-60">·</span>
                            <span className="text-emerald-400/90 font-mono text-[11px]">Auto-Targeted</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this vehicle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Send reminder button (Only for Front Vehicles) */}
                    {isFront ? (
                      <button
                        onClick={(e) => handleSendReminder(veh, e)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${sentNoticeVehicleId === veh.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80'
                          }`}
                        title="Send instant audio & visual reminder to this front vehicle"
                      >
                        {sentNoticeVehicleId === veh.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Sent!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-sky-400" />
                            <span className="hidden sm:inline text-[10px]">Remind</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono px-2 py-1 bg-slate-900/60 rounded border border-slate-800">
                        Ignored
                      </span>
                    )}

                    {/* Toggle Cleared / Shoulder */}
                    {isFront && (
                      <button
                        onClick={(e) => handleToggleCleared(veh, e)}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isCleared
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/80 hover:bg-slate-700'
                          }`}
                        title={isCleared ? 'Vehicle is on shoulder (Cleared)' : 'Mark vehicle as moved to shoulder'}
                      >
                        {isCleared ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="text-[10px]">Clear</span>
                        )}
                      </button>
                    )}

                    {/* Open in In-Car Driver View */}
                    {onOpenDriverHUD && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDriverHUD(veh.id);
                        }}
                        className="p-2 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Simulate In-Car Driver HUD for this vehicle"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Forward directional geofence active</span>
          </span>
          <span className="font-mono">Auto-Scan: {lastAutoScanTime}</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT: Activity Log (Matching Image 2 Exact Layout & Palette)
      ========================================================================= */}
      <div className="lg:col-span-6 bg-[#0B1120] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">Activity Log</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Last 15 minutes
            </span>
          </div>

          {/* Activity Logs Feed (Matching Image 2 Design) */}
          <div className="divide-y divide-slate-800/80">
            {activityLogs.slice(0, 6).map(log => {
              // Icon selector matching screenshot
              let iconElement = <RotateCcw className="w-4 h-4 text-sky-400 stroke-[2.2]" />;
              if (log.type === 'reroute') {
                iconElement = <RotateCcw className="w-4 h-4 text-sky-400 stroke-[2.2]" />;
              } else if (log.type === 'non-compliant' || log.severity === 'critical') {
                iconElement = <AlertTriangle className="w-4 h-4 text-rose-500 stroke-[2.2]" />;
              } else if (log.type === 'signal-override') {
                iconElement = <Radio className="w-4 h-4 text-emerald-400 stroke-[2.2]" />;
              } else if (log.type === 'lane-cleared') {
                iconElement = <Car className="w-4 h-4 text-teal-400 stroke-[2.2]" />;
              } else if (log.type === 'corridor-activated') {
                iconElement = <Siren className="w-4 h-4 text-teal-400 stroke-[2.2]" />;
              } else if (log.type === 'signal-fault' || log.severity === 'warning') {
                iconElement = <Radio className="w-4 h-4 text-amber-500 stroke-[2.2]" />;
              } else if (log.type === 'reminder-sent') {
                iconElement = <Bell className="w-4 h-4 text-sky-400 stroke-[2.2]" />;
              }

              return (
                <div key={log.id} className="py-3.5 px-2 rounded-xl hover:bg-slate-900/40 transition-colors flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Icon container */}
                    <div className="shrink-0 mt-0.5">
                      {iconElement}
                    </div>

                    {/* Log text and source */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                        {log.message}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {log.source}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live sync indicator */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live event streaming active</span>
          </div>
          <span className="font-mono text-emerald-400">Auto-Alert: Active</span>
        </div>
      </div>

    </div>
  );
};

