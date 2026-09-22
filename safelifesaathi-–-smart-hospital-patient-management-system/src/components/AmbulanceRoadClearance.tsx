import React, { useState, useEffect, useRef } from 'react';
import {
  Siren,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  Gauge,
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Send,
  Layers,
  HelpCircle,
  Activity,
  Heart,
  Volume2,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { Ambulance, Vehicle, AppTab, CorridorActivityLog } from '../types';
import { playEmergencyWarningTone } from '../utils/audio';
import { CorridorAlertsAndLogs } from './CorridorAlertsAndLogs';

interface AmbulanceRoadClearanceProps {
  ambulance: Ambulance;
  setAmbulance: React.Dispatch<React.SetStateAction<Ambulance>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  activityLogs: CorridorActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<CorridorActivityLog[]>>;
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenDriverView?: (vehicleId?: string) => void;
  setActiveTab?: (tab: AppTab) => void;
  soundEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Exact Cubic Bezier Highway Path Definition:
// P0: (60, 370)  -> Origin Corridor (Bottom-Left)
// P1: (260, 330) -> Janpath South Bend
// P2: (440, 150) -> Hospital Boulevard Junction
// P3: (720, 70)  -> SafeLife City Hospital Emergency Trauma Bay (Top-Right)
// ---------------------------------------------------------------------------
const P0 = { x: 60, y: 370 };
const P1 = { x: 260, y: 330 };
const P2 = { x: 440, y: 150 };
const P3 = { x: 720, y: 70 };

const getRoutePointAndAngle = (distanceMeters: number, laneOffset = 0) => {
  // Normalize distance to [0, 1] parameter along 1000m corridor
  const clampedDist = Math.max(0, Math.min(1000, distanceMeters % 1000));
  const t = clampedDist / 1000;

  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  // Cubic Bezier coordinates along center spine
  const bx = mt3 * P0.x + 3 * mt2 * t * P1.x + 3 * mt * t2 * P2.x + t3 * P3.x;
  const by = mt3 * P0.y + 3 * mt2 * t * P1.y + 3 * mt * t2 * P2.y + t3 * P3.y;

  // Tangent vector derivative (dB/dt)
  const dx = 3 * mt2 * (P1.x - P0.x) + 6 * mt * t * (P2.x - P1.x) + 3 * t2 * (P3.x - P2.x);
  const dy = 3 * mt2 * (P1.y - P0.y) + 6 * mt * t * (P2.y - P1.y) + 3 * t2 * (P3.y - P2.y);

  const len = Math.hypot(dx, dy) || 1;
  const unitDx = dx / len;
  const unitDy = dy / len;

  // Normal vector perpendicular to travel direction (for lanes & side shoulders)
  const normalX = -unitDy;
  const normalY = unitDx;

  const laneSpacing = 16; // px per lane unit
  const x = bx + normalX * laneOffset * laneSpacing;
  const y = by + normalY * laneOffset * laneSpacing;

  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

  return { x, y, angleDeg, unitDx, unitDy, normalX, normalY, bx, by };
};

export const AmbulanceRoadClearance: React.FC<AmbulanceRoadClearanceProps> = ({
  ambulance,
  setAmbulance,
  vehicles,
  setVehicles,
  activityLogs,
  setActivityLogs,
  isSimulating,
  setIsSimulating,
  onOpenDriverView,
  setActiveTab,
  soundEnabled,
}) => {
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [showLogicGuide, setShowLogicGuide] = useState(true);
  const [arrivedBanner, setArrivedBanner] = useState(false);

  const simulationIntervalRef = useRef<any>(null);

  // Sound trigger on new critical zone entry
  useEffect(() => {
    if (isSimulating && soundEnabled) {
      const activeInZone = vehicles.filter(v => (v.isIn500mForwardZone || v.isIn300mForwardZone) && !v.isCleared);
      if (activeInZone.length > 0 && Math.random() > 0.65) {
        playEmergencyWarningTone();
      }
    }
  }, [ambulance.distanceAlongRoute, isSimulating, soundEnabled, vehicles]);

  // Simulation physics loop
  useEffect(() => {
    if (!isSimulating) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    simulationIntervalRef.current = setInterval(() => {
      let currentAmbDist = 0;
      let reachedHospital = false;

      setAmbulance(prevAmb => {
        let newDist = prevAmb.distanceAlongRoute + (9 * simulationSpeed);

        // Check if ambulance reaches hospital (1000m)
        if (newDist >= 980) {
          reachedHospital = true;
          newDist = 60; // Loop around corridor
        }

        currentAmbDist = newDist;

        // Calculate ETA accurately
        const remainingMeters = Math.max(0, 1000 - newDist);
        const minutesRemaining = Math.max(0.2, (remainingMeters / 1000) * 4.2);
        const mins = Math.floor(minutesRemaining);
        const secs = Math.floor((minutesRemaining - mins) * 60);
        const etaFormatted = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;

        return {
          ...prevAmb,
          distanceAlongRoute: newDist,
          etaMinutes: etaFormatted,
          speedKmh: Math.floor(52 + Math.sin(newDist / 40) * 7),
        };
      });

      if (reachedHospital) {
        setArrivedBanner(true);
        setTimeout(() => setArrivedBanner(false), 3000);
      }

      // Update Vehicles status according to the 4 strict conditions with 500m range
      setVehicles(prevVehicles => {
        const ambPos = currentAmbDist || 120;
        return prevVehicles.map(veh => {
          let updatedDist = veh.distanceAlongRoute;
          if (veh.direction === 'same') {
            updatedDist = (veh.distanceAlongRoute + (3.2 * simulationSpeed)) % 1000;
          } else {
            updatedDist = (veh.distanceAlongRoute - (4.2 * simulationSpeed) + 1000) % 1000;
          }

          // Condition 1: Physically ahead along route vector (traveling towards hospital)
          const isAhead = veh.direction === 'same'
            ? (updatedDist > ambPos && (updatedDist - ambPos) < 850)
            : false;

          // Distance calculation along route
          const rawDist = Math.abs(updatedDist - ambPos);

          // Condition 2: Same road/route (lateral offset > -2.5, opposite lane is -3.0)
          const isSameRoad = veh.lateralOffset > -2.5;

          // Condition 3: Same direction
          const isSameDirection = veh.direction === 'same';

          // Condition 4: Within 500 METERS
          const isWithin500m = rawDist <= 500;

          // Strict ALL 4 Conditions: Zero false alarms
          const isIn500mForwardZone = isAhead && isSameRoad && isSameDirection && isWithin500m;

          // Auto-clear logic in simulation: simulated cars transition to shoulder
          let isCleared = veh.isCleared;
          if (isIn500mForwardZone && !veh.isCleared) {
            if (rawDist < 260 && Math.random() > 0.45) {
              isCleared = true;
            }
          }

          return {
            ...veh,
            distanceAlongRoute: updatedDist,
            isAhead,
            distanceToAmbulance: Math.round(rawDist),
            isIn500mForwardZone,
            isIn300mForwardZone: isIn500mForwardZone && rawDist <= 300,
            isNotified: isIn500mForwardZone,
            isCleared,
          };
        });
      });

    }, 450);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [isSimulating, simulationSpeed, setAmbulance, setVehicles]);

  // Derive aggregate metrics for 500m range
  const vehiclesInZone = vehicles.filter(v => v.isIn500mForwardZone || v.isIn300mForwardZone);
  const vehiclesNotifiedCount = vehiclesInZone.length;
  const unclearedInZone = vehiclesInZone.filter(v => !v.isCleared).length;

  let roadStatus: 'CLEAR' | 'CLEARING' | 'CONGESTED' = 'CLEAR';
  if (unclearedInZone > 3) roadStatus = 'CONGESTED';
  else if (unclearedInZone > 0) roadStatus = 'CLEARING';
  else roadStatus = 'CLEAR';

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setAmbulance(prev => ({
      ...prev,
      distanceAlongRoute: 120,
      etaMinutes: '04:12',
      speedKmh: 54,
    }));
    setVehicles(prev => prev.map((v, i) => ({
      ...v,
      distanceAlongRoute: [260, 340, 410, 300, 580, 750, 80, 280][i % 8],
      isCleared: i === 1,
    })));
  };

  const handleAcknowledgeVehicle = (vehId: string) => {
    setVehicles(prev => prev.map(v => v.id === vehId ? { ...v, isCleared: true } : v));
    if (selectedVehicle?.id === vehId) {
      setSelectedVehicle(prev => prev ? { ...prev, isCleared: true } : null);
    }
  };

  // Points along the route for rendering
  const ambPoint = getRoutePointAndAngle(ambulance.distanceAlongRoute, 0);
  const forward250mPoint = getRoutePointAndAngle(Math.min(1000, ambulance.distanceAlongRoute + 250), 0);
  const forward500mPoint = getRoutePointAndAngle(Math.min(1000, ambulance.distanceAlongRoute + 500), 0);

  // SVG Highway Path String matching the cubic Bezier
  const highwayPathString = `M ${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`;

  // Forward cone path calculation along the road curve
  const ambLeft = getRoutePointAndAngle(ambulance.distanceAlongRoute, -0.6);
  const ambRight = getRoutePointAndAngle(ambulance.distanceAlongRoute, 0.6);
  const fwdLeft = getRoutePointAndAngle(Math.min(1000, ambulance.distanceAlongRoute + 500), -2.2);
  const fwdRight = getRoutePointAndAngle(Math.min(1000, ambulance.distanceAlongRoute + 500), 2.2);
  const fwdMid = getRoutePointAndAngle(Math.min(1000, ambulance.distanceAlongRoute + 500), 0);

  return (
    <div className="space-y-6">

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Siren className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Incoming Ambulance Notifier</h1>
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Directional Range Radar
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time GPS / GNSS tracking with <strong>forward geofencing</strong> directing ambulances straight to Destination Hospital Trauma Center with zero false-alarm directional filtering.
                </p>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isSimulating ? 'Pause Simulation' : 'Simulate Ambulance'}</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
              title="Reset route"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 text-[10px] px-1 font-semibold">Speed:</span>
              {[1, 2, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${simulationSpeed === spd
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* In-Car Driver View Quick Trigger */}
            <button
              onClick={() => {
                if (onOpenDriverView) onOpenDriverView();
                else if (setActiveTab) setActiveTab('driver-alert');
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Simulated Driver UI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Arrival Alert Toast if reached hospital */}
      {arrivedBanner && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">Ambulance AMB-1024 arrived safely at Destination Hospital Trauma Emergency Bay!</span>
          </div>
          <span className="text-xs bg-emerald-700 px-2 py-1 rounded-lg font-bold">Corridor Cleared in Record Time</span>
        </div>
      )}

      {/* Main Grid: Interactive Map + Right Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left/Center: Interactive Vector GPS Map (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">

          {/* Map Header Overlay */}
          <div className="flex items-center justify-between z-10 relative mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-semibold text-slate-200">GNSS Live Radar Feed</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-400 font-mono">20.2961° N, 85.8245° E (Janpath Arterial)</span>
              </div>
            </div>

            {/* 500m Zone Status Tag */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
                Forward Cone: {vehiclesInZone.length} Vehicles
              </span>
            </div>
          </div>

          {/* Interactive SVG Radar Highway Canvas */}
          <div className="relative w-full aspect-16/10 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden select-none">

            {/* Grid Pattern Background */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radar-grid)" />
            </svg>

            <svg viewBox="0 0 800 440" className="w-full h-full">

              {/* Destination Hospital Marker (At exact curve endpoint P3: 720, 70) */}
              <g transform="translate(720, 70)">
                <circle r="34" fill="#10b981" fillOpacity="0.12" className="animate-ping" />
                <circle r="22" fill="#047857" stroke="#34d399" strokeWidth="2.5" />
                <path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <text x="0" y="36" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">DESTINATION HOSPITAL</text>
                <text x="0" y="48" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="bold">Trauma & Emergency Bay</text>
              </g>

              {/* Start Depot Marker (At exact curve startpoint P0: 60, 370) */}
              <g transform="translate(60, 370)">
                <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">Origin Corridor (0m)</text>
              </g>

              {/* Highway Road Base Layer (Exact Cubic Bezier to Hospital) */}
              {/* Outer Road Bed */}
              <path
                d={highwayPathString}
                fill="none"
                stroke="#0f172a"
                strokeWidth="80"
                strokeLinecap="round"
              />
              {/* Main Asphalt Pavement */}
              <path
                d={highwayPathString}
                fill="none"
                stroke="#1e293b"
                strokeWidth="72"
                strokeLinecap="round"
              />
              <path
                d={highwayPathString}
                fill="none"
                stroke="#334155"
                strokeWidth="66"
                strokeLinecap="round"
              />

              {/* Green Shoulder Clearance Area (Emergency Pull-over Lane on right side) */}
              <path
                d={`M ${P0.x + 22} ${P0.y + 16} C ${P1.x + 22} ${P1.y + 16}, ${P2.x + 22} ${P2.y + 16}, ${P3.x + 22} ${P3.y + 16}`}
                fill="none"
                stroke="#059669"
                strokeWidth="10"
                strokeDasharray="6,6"
                strokeOpacity="0.45"
              />

              {/* Center Lane Divider Dashes */}
              <path
                d={highwayPathString}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="2"
                strokeDasharray="12,14"
                strokeOpacity="0.75"
              />

              {/* OPPOSITE LANE (Separated, on left side of corridor) */}
              <path
                d={`M ${P0.x - 28} ${P0.y - 20} C ${P1.x - 28} ${P1.y - 20}, ${P2.x - 28} ${P2.y - 20}, ${P3.x - 28} ${P3.y - 20}`}
                fill="none"
                stroke="#1e293b"
                strokeWidth="26"
                strokeOpacity="0.6"
              />

              {/* 500m FORWARD GEOFENCE ZONE (Cone along road towards Hospital) */}
              <g>
                <defs>
                  <linearGradient id="forwardConeGrad500" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Pulsing forward detection corridor towards the destination */}
                <path
                  d={`M ${ambLeft.x} ${ambLeft.y} 
                      Q ${forward250mPoint.x - 30} ${forward250mPoint.y - 20}, ${fwdLeft.x} ${fwdLeft.y} 
                      L ${fwdRight.x} ${fwdRight.y} 
                      Q ${forward250mPoint.x + 30} ${forward250mPoint.y + 20}, ${ambRight.x} ${ambRight.y} Z`}
                  fill="url(#forwardConeGrad500)"
                  className="animate-pulse"
                />

                {/* Range Rings from Ambulance (150m, 300m, 500m ahead) */}
                {[90, 180, 280].map((radius, idx) => (
                  <circle
                    key={idx}
                    cx={ambPoint.x}
                    cy={ambPoint.y}
                    r={radius}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    strokeOpacity={0.45 - idx * 0.1}
                  />
                ))}

                {/* 500m Marker Label */}
                <text
                  x={fwdMid.x}
                  y={fwdMid.y - 14}
                  textAnchor="middle"
                  fill="#f87171"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ⚡FORWARD GEOFENCE BOUNDARY
                </text>
              </g>

              {/* Active High-Priority Red Route Line connecting ambulance directly to Hospital */}
              <path
                d={`M ${ambPoint.x} ${ambPoint.y} C ${P2.x} ${P2.y}, ${P2.x + 100} ${P2.y - 40}, ${P3.x} ${P3.y}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeDasharray="8,6"
                className="animate-pulse"
              />

              {/* Vehicles Rendering */}
              {vehicles.map((veh) => {
                const pt = getRoutePointAndAngle(
                  veh.distanceAlongRoute,
                  veh.isCleared ? 2.3 : veh.lateralOffset // If cleared, move to shoulder (+2.3 offset)
                );
                const isSelected = selectedVehicle?.id === veh.id;
                const isInZone = veh.isIn500mForwardZone || veh.isIn300mForwardZone;

                // Vehicle rotation heading
                const carRotation = veh.direction === 'opposite' ? pt.angleDeg + 180 : pt.angleDeg;

                return (
                  <g
                    key={veh.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    onClick={() => setSelectedVehicle(veh)}
                    className="cursor-pointer transition-all duration-300"
                  >
                    {/* Pulsing warning aura if in 500m zone and not cleared */}
                    {isInZone && !veh.isCleared && (
                      <circle r="22" fill="#ef4444" fillOpacity="0.35" className="animate-ping" />
                    )}

                    {/* Green check halo if cleared */}
                    {veh.isCleared && (
                      <circle r="16" fill="#10b981" fillOpacity="0.25" />
                    )}

                    {/* Rotated Vehicle Body */}
                    <g transform={`rotate(${carRotation})`}>
                      {/* Car Body */}
                      <rect
                        x="-11"
                        y="-7"
                        width="22"
                        height="14"
                        rx="3.5"
                        fill={
                          veh.isCleared
                            ? '#10b981'
                            : isInZone
                              ? '#ef4444'
                              : veh.direction === 'opposite'
                                ? '#64748b'
                                : veh.color
                        }
                        stroke={isSelected ? '#ffffff' : '#0f172a'}
                        strokeWidth={isSelected ? '2.5' : '1'}
                      />

                      {/* Headlights pointing forward */}
                      <circle cx="10" cy="-4" r="1.5" fill="#fef08a" />
                      <circle cx="10" cy="4" r="1.5" fill="#fef08a" />

                      {/* Windshield */}
                      <rect x="2" y="-5" width="5" height="10" rx="1.5" fill="#e2e8f0" opacity="0.85" />
                    </g>

                    {/* Vehicle Plate / Info Tag */}
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fill={isInZone ? (veh.isCleared ? '#34d399' : '#fca5a5') : '#94a3b8'}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {veh.plate.split('-').slice(0, 2).join('-')}
                    </text>

                    {/* Alert Icon Badge if Notified in 500m */}
                    {isInZone && !veh.isCleared && (
                      <text x="14" y="5" fontSize="11">🚨</text>
                    )}
                    {veh.isCleared && (
                      <text x="14" y="5" fontSize="10">✅</text>
                    )}
                  </g>
                );
              })}

              {/* AMBULANCE (AMB-1024) Moving along curve to Hospital */}
              <g transform={`translate(${ambPoint.x}, ${ambPoint.y})`}>
                {/* Siren Wave Pulses */}
                <circle r="42" fill="#ef4444" fillOpacity="0.12" className="animate-ping" />
                <circle r="26" fill="#ef4444" fillOpacity="0.25" />

                {/* Rotated Ambulance Body */}
                <g transform={`rotate(${ambPoint.angleDeg})`}>
                  <rect
                    x="-18"
                    y="-12"
                    width="36"
                    height="24"
                    rx="5"
                    fill="#ffffff"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />

                  {/* Red Cross */}
                  <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />

                  {/* Front Headlights */}
                  <circle cx="17" cy="-7" r="2" fill="#fef08a" />
                  <circle cx="17" cy="7" r="2" fill="#fef08a" />

                  {/* Flashing Siren Lights */}
                  <circle cx="-6" cy="-14" r="3.5" fill="#3b82f6" className="animate-pulse" />
                  <circle cx="6" cy="-14" r="3.5" fill="#ef4444" className="animate-pulse" />
                </g>

                {/* Label */}
                <text x="0" y="-20" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  🚑 AMB-1024
                </text>
                <text x="0" y="26" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                  SPEED: {ambulance.speedKmh} km/h • DEST: DESTINATION HOSPITAL
                </text>
              </g>

            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1 z-10">
              <div className="font-bold text-slate-300 pb-0.5 border-b border-slate-800">Map Legend</div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-600 inline-block"></span>
                <span className="text-slate-300">Vehicle in forward zone (Alerted)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                <span className="text-slate-300">Vehicle cleared / moved to shoulder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-500 inline-block"></span>
                <span className="text-slate-400">Beyond the Range / Opposite Lane (Filtered)</span>
              </div>
            </div>

            {/* Road Clearance Badge on Map */}
            <div className="absolute top-3 right-3 z-10">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-lg ${roadStatus === 'CLEAR'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                : roadStatus === 'CLEARING'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-700 animate-pulse'
                  : 'bg-red-950/90 text-red-300 border-red-700 animate-bounce'
                }`}>
                <ShieldAlert className="w-4 h-4" />
                <span>Road Status: <strong>{roadStatus}</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Strict Filtering Rules Explainer Bar for 500m Range */}
          <div className="mt-4 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Strict 4-Condition Geofence Filter Engine (Zero False Alarms)</span>
              </div>
              <button
                onClick={() => setShowLogicGuide(!showLogicGuide)}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                {showLogicGuide ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showLogicGuide && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <span className="bg-blue-900/60 text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px]">1</span>
                  <div>
                    <span className="text-slate-300 font-semibold">Physically Ahead</span>
                    <p className="text-slate-400 text-[10px]">Vehicles behind are excluded</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <span className="bg-blue-900/60 text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px]">2</span>
                  <div>
                    <span className="text-slate-300 font-semibold">Same Road / Corridor</span>
                    <p className="text-slate-400 text-[10px]">Cross-streets ignored</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <span className="bg-blue-900/60 text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px]">3</span>
                  <div>
                    <span className="text-slate-300 font-semibold">Same Direction</span>
                    <p className="text-slate-400 text-[10px]">Opposite traffic excluded</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <span className="bg-blue-900/60 text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px]">4</span>
                  <div>
                    <span className="text-slate-300 font-semibold">Within ≤ Range</span>
                    <p className="text-slate-400 text-[10px]">Extended safety perimeter</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Telemetry & Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Ambulance Telemetry Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Siren className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ambulance Telemetry</h3>
                  <p className="text-[11px] text-slate-500">ID: <strong className="text-slate-900">{ambulance.id}</strong></p>
                </div>
              </div>
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {ambulance.emergencyPriority} Priority
              </span>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-blue-500" />
                  Estimated Arrival
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">{ambulance.etaMinutes}</div>
                <div className="text-[10px] text-emerald-600 font-medium">To Hospital Trauma Bay</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
                  <Gauge className="w-3 h-3 text-amber-500" />
                  Current Speed
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">{ambulance.speedKmh} km/h</div>
                <div className="text-[10px] text-slate-500">Heading 42° NE</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
                  <Car className="w-3 h-3 text-purple-500" />
                  Vehicles in Range
                </div>
                <div className="text-base font-bold text-purple-700">{vehiclesInZone.length} Detected</div>
                <div className="text-[10px] text-slate-500">{vehiclesNotifiedCount} Notified in Range</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
                  <ShieldAlert className="w-3 h-3 text-red-500" />
                  Road Status
                </div>
                <div className={`text-base font-bold ${roadStatus === 'CLEAR' ? 'text-emerald-600' : roadStatus === 'CLEARING' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                  {roadStatus}
                </div>
                <div className="text-[10px] text-slate-500">{unclearedInZone} pending clearance</div>
              </div>
            </div>

            {/* Destination & Paramedic Details */}
            <div className="text-xs space-y-1.5 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-[10px]">Destination:</span>
                  <p className="font-semibold text-slate-800 text-[11px]">{ambulance.destinationHospital}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-blue-200/50">
                <span>Driver: <strong>{ambulance.driverName}</strong></span>
                <span>Vitals: <strong className="text-red-600">HR {ambulance.patientVitals.heartRate}</strong></span>
              </div>
            </div>
          </div>

          {/* Vehicle Inspector Card */}
          {selectedVehicle && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Vehicle Inspector</h4>
                    <p className="text-[10px] font-mono text-slate-500">{selectedVehicle.plate}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(selectedVehicle.isIn500mForwardZone || selectedVehicle.isIn300mForwardZone)
                  ? selectedVehicle.isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
                  }`}>
                  {(selectedVehicle.isIn500mForwardZone || selectedVehicle.isIn300mForwardZone)
                    ? (selectedVehicle.isCleared ? 'Lane Cleared' : 'In 500m Danger Zone')
                    : 'Outside Warning Zone'}
                </span>
              </div>

              {/* 4 Conditions Verification Checklist for this car */}
              <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-[11px]">1. Ahead of Ambulance:</span>
                  {selectedVehicle.isAhead ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Yes (+{selectedVehicle.distanceToAmbulance}m)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1 text-[10px]">
                      <XCircle className="w-3 h-3" /> No (Behind)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-[11px]">2. Same Road Corridor:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Yes (Janpath Arterial)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-[11px]">3. Travel Direction:</span>
                  {selectedVehicle.direction === 'same' ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Same (Eastbound to Hospital)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1 text-[10px]">
                      <XCircle className="w-3 h-3" /> Opposite Lane
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-[11px]">4. Distance ≤ 500m:</span>
                  {selectedVehicle.distanceToAmbulance <= 500 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {selectedVehicle.distanceToAmbulance}m (Triggered)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1 text-[10px]">
                      <XCircle className="w-3 h-3" /> {selectedVehicle.distanceToAmbulance}m (&gt;500m)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button for Selected Car */}
              {(selectedVehicle.isIn500mForwardZone || selectedVehicle.isIn300mForwardZone) && !selectedVehicle.isCleared && (
                <button
                  onClick={() => handleAcknowledgeVehicle(selectedVehicle.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate: Move Vehicle to Shoulder</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Technology Tags */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Integrated Tech Stack</h5>
            <div className="flex flex-wrap gap-1.5">
              {['GPS / GNSS', 'Geofencing', 'Digital Vector Maps', 'AI Route Prediction', 'IoT / V2V', 'Push Notifications'].map(tech => (
                <span key={tech} className="text-[10px] bg-white text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Vehicle Alerts & Corridor Activity Log Section (Matching User Image) */}
      <CorridorAlertsAndLogs
        vehicles={vehicles}
        setVehicles={setVehicles}
        activityLogs={activityLogs}
        setActivityLogs={setActivityLogs}
        ambulance={ambulance}
        selectedVehicleId={selectedVehicle?.id}
        onSelectVehicle={(veh) => setSelectedVehicle(veh)}
        onOpenDriverHUD={(vehId) => {
          if (onOpenDriverView) onOpenDriverView(vehId);
          else if (setActiveTab) setActiveTab('driver-alert');
        }}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
