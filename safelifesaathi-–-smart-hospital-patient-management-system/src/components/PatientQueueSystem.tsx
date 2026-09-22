import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowRight,
  PlusCircle,
  UserCheck,
  SkipForward,
  PauseCircle,
  Tv,
  Smartphone,
  Sparkles,
  Stethoscope,
  Building,
  History,
  Calendar,
  Printer,
  QrCode,
  RefreshCw,
  X,
  ChevronRight,
  Info,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
import { OPDToken, DepartmentSchedule } from '../types';
import { DEPARTMENT_SCHEDULES } from '../data/mockData';
import { speakTokenAnnouncement, playHospitalChime } from '../utils/audio';

interface PatientQueueSystemProps {
  tokens: OPDToken[];
  setTokens: React.Dispatch<React.SetStateAction<OPDToken[]>>;
  selectedDept?: string;
  soundEnabled: boolean;
  userRegisteredTokenId?: string | null;
  setUserRegisteredTokenId?: (id: string | null) => void;
}

export const PatientQueueSystem: React.FC<PatientQueueSystemProps> = ({
  tokens,
  setTokens,
  selectedDept = 'General Medicine',
  soundEnabled,
  userRegisteredTokenId,
  setUserRegisteredTokenId,
}) => {
  // Local state for registered user token if parent state not provided
  const [localTokenId, setLocalTokenId] = useState<string | null>(() => {
    return userRegisteredTokenId || localStorage.getItem('safelife_user_token_id') || null;
  });

  const activeUserTokenId = userRegisteredTokenId !== undefined ? userRegisteredTokenId : localTokenId;

  const setRegisteredToken = (id: string | null) => {
    if (id) {
      localStorage.setItem('safelife_user_token_id', id);
    } else {
      localStorage.removeItem('safelife_user_token_id');
    }
    setLocalTokenId(id);
    if (setUserRegisteredTokenId) {
      setUserRegisteredTokenId(id);
    }
  };

  const [activeDept, setActiveDept] = useState<string>(selectedDept);
  const [activeDoctor, setActiveDoctor] = useState<string>(() => {
    const deptObj = DEPARTMENT_SCHEDULES.find(d => d.name === selectedDept) || DEPARTMENT_SCHEDULES[0];
    return deptObj.doctorName;
  });
  const [tokenType, setTokenType] = useState<'online' | 'walk-in'>('online');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientAgeInput, setPatientAgeInput] = useState(34);
  const [genderInput, setGenderInput] = useState('Male');
  const [phoneInput, setPhoneInput] = useState('+91 ');
  const [priorityInput, setPriorityInput] = useState<'Normal' | 'Elderly/Special' | 'Emergency Priority'>('Normal');
  const [showDisplayBoardModal, setShowDisplayBoardModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlipToken, setSelectedSlipToken] = useState<OPDToken | null>(null);
  const [consoleDeptFilter, setConsoleDeptFilter] = useState<string>('All');
  const [activeViewTab, setActiveViewTab] = useState<'tracker' | 'schedules'>('tracker');

  // Find user's active token if registered
  const myToken = activeUserTokenId ? tokens.find(t => t.id === activeUserTokenId) || null : null;

  // Department schedule for active selected department
  const currentDeptSchedule = DEPARTMENT_SCHEDULES.find(d => d.name === activeDept) || DEPARTMENT_SCHEDULES[0];

  // Department schedule for user's registered department
  const myDeptSchedule = myToken
    ? DEPARTMENT_SCHEDULES.find(d => d.name === myToken.department) || DEPARTMENT_SCHEDULES[0]
    : currentDeptSchedule;

  // Department-specific tokens for the user's department
  const userDeptTokens = myToken
    ? tokens.filter(t => t.department === myToken.department)
    : tokens.filter(t => t.department === activeDept);

  const currentlyServingInDept = userDeptTokens.find(t => t.status === 'consulting') || userDeptTokens.find(t => t.status === 'called');

  // Calculate patients ahead in the user's specific department
  let myPatientsAheadCount = 0;
  let myEstimatedWaitMinutes = 0;

  if (myToken) {
    if (myToken.status === 'consulting') {
      myPatientsAheadCount = 0;
      myEstimatedWaitMinutes = 0;
    } else if (myToken.status === 'completed') {
      myPatientsAheadCount = 0;
      myEstimatedWaitMinutes = 0;
    } else {
      // Count waiting/called tokens in the same department that appear before the user's token
      const sameDeptTokens = tokens.filter(t => t.department === myToken.department);
      const myIndexInDept = sameDeptTokens.findIndex(t => t.id === myToken.id);

      const aheadTokens = sameDeptTokens.filter((t, idx) => {
        return idx < myIndexInDept && (t.status === 'waiting' || t.status === 'called' || t.status === 'consulting');
      });

      myPatientsAheadCount = aheadTokens.length;
      myEstimatedWaitMinutes = myPatientsAheadCount * myDeptSchedule.avgConsultationMinutes;
    }
  }

  // Calculate dynamic call time
  const getEstimatedCallTime = (waitMinutes: number) => {
    const callTime = new Date(Date.now() + waitMinutes * 60000);
    return callTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Doctor & Clinic Controls - Department specific queue advancement
  const handleCallNext = (targetDept?: string) => {
    const deptToAdvance = targetDept && targetDept !== 'All' ? targetDept : activeDept;
    const deptSched = DEPARTMENT_SCHEDULES.find(d => d.name === deptToAdvance) || DEPARTMENT_SCHEDULES[0];

    setTokens(prev => {
      // Find current consulting token in this department
      const currentConsultingIdx = prev.findIndex(t => t.department === deptToAdvance && t.status === 'consulting');

      // Find next waiting or called token in this department
      const nextWaitingIdx = prev.findIndex((t, idx) =>
        t.department === deptToAdvance && (t.status === 'waiting' || t.status === 'called') && (currentConsultingIdx === -1 || idx > currentConsultingIdx)
      );

      if (nextWaitingIdx === -1) {
        // If no one waiting after, check if there's any waiting token in this department
        const anyWaitingIdx = prev.findIndex(t => t.department === deptToAdvance && (t.status === 'waiting' || t.status === 'called'));
        if (anyWaitingIdx === -1) return prev;
      }

      const targetIdx = nextWaitingIdx !== -1
        ? nextWaitingIdx
        : prev.findIndex(t => t.department === deptToAdvance && (t.status === 'waiting' || t.status === 'called'));

      // Count waiting tokens in this department to recalculate wait times
      let deptWaitingCount = 0;

      const updated = prev.map((t, idx) => {
        if (idx === currentConsultingIdx) {
          return { ...t, status: 'completed' as const, estimatedWaitMinutes: 0, patientsAhead: 0 };
        }
        if (idx === targetIdx) {
          if (soundEnabled) {
            speakTokenAnnouncement(t.tokenNumber, t.roomNumber);
          }
          return { ...t, status: 'consulting' as const, estimatedWaitMinutes: 0, patientsAhead: 0 };
        }
        if (t.department === deptToAdvance && (t.status === 'waiting' || t.status === 'called') && idx > targetIdx) {
          deptWaitingCount++;
          return {
            ...t,
            patientsAhead: deptWaitingCount,
            estimatedWaitMinutes: deptWaitingCount * deptSched.avgConsultationMinutes,
          };
        }
        return t;
      });

      return updated;
    });
  };

  const handleHoldCurrent = (targetDept?: string) => {
    const deptToTarget = targetDept && targetDept !== 'All' ? targetDept : activeDept;
    setTokens(prev => prev.map(t =>
      t.department === deptToTarget && t.status === 'consulting' ? { ...t, status: 'hold' as const } : t
    ));
  };

  const handleSkipCurrent = (targetDept?: string) => {
    const deptToTarget = targetDept && targetDept !== 'All' ? targetDept : activeDept;
    setTokens(prev => prev.map(t =>
      t.department === deptToTarget && t.status === 'consulting' ? { ...t, status: 'skipped' as const } : t
    ));
    handleCallNext(deptToTarget);
  };

  // Dynamic calculation for next universal sequential token number (strictly increasing hospital-wide)
  const nextGlobalTokenNumber = (() => {
    let maxGlobalNum = 100;
    tokens.forEach(t => {
      const match = t.tokenNumber.match(/\d+/g);
      if (match && match.length > 0) {
        const num = parseInt(match[match.length - 1], 10);
        if (!isNaN(num) && num > maxGlobalNum) {
          maxGlobalNum = num;
        }
      }
    });
    return `TK-${maxGlobalNum + 1}`;
  })();

  // 2. Generate New Token with Globally Sequential Token Number & Department-Specific Waiting Time
  const handleGenerateNewToken = (e: React.FormEvent) => {
    e.preventDefault();

    const deptSchedule = DEPARTMENT_SCHEDULES.find(d => d.name === activeDept) || DEPARTMENT_SCHEDULES[0];

    // Calculate next global increasing token number (independent of department)
    let maxGlobalNum = 100;
    tokens.forEach(t => {
      const match = t.tokenNumber.match(/\d+/g);
      if (match && match.length > 0) {
        const num = parseInt(match[match.length - 1], 10);
        if (!isNaN(num) && num > maxGlobalNum) {
          maxGlobalNum = num;
        }
      }
    });

    const nextTokenNumber = `TK-${maxGlobalNum + 1}`;

    // Count how many patients in this specific department are currently waiting/called/consulting
    const waitingInDept = tokens.filter(t => t.department === activeDept && (t.status === 'waiting' || t.status === 'called' || t.status === 'consulting'));
    const patientsAhead = waitingInDept.length;
    // Patient waiting time is specific to the selected department's consultation duration benchmark!
    const estWaitMinutes = patientsAhead * deptSchedule.avgConsultationMinutes;

    const patientName = patientNameInput.trim() || 'Patient ' + nextTokenNumber;

    const newToken: OPDToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: nextTokenNumber,
      patientName: patientName,
      patientAge: Number(patientAgeInput) || 30,
      gender: genderInput,
      department: activeDept,
      doctorName: activeDoctor || deptSchedule.doctorName,
      roomNumber: deptSchedule.roomNumber,
      tokenType: tokenType,
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'waiting',
      estimatedWaitMinutes: estWaitMinutes,
      patientsAhead: patientsAhead,
      priority: priorityInput,
    };

    setTokens(prev => [...prev, newToken]);
    setRegisteredToken(newToken.id);
    setSelectedSlipToken(newToken);
    setPatientNameInput('');

    if (soundEnabled) {
      playHospitalChime();
    }
  };

  // Cancel registered user token
  const handleCancelMyToken = () => {
    if (window.confirm('Are you sure you want to cancel your registered token?')) {
      if (myToken) {
        setTokens(prev => prev.filter(t => t.id !== myToken.id));
      }
      setRegisteredToken(null);
    }
  };

  // Filter and sort tokens in strictly increasing token number sequence
  const consoleTokens = (consoleDeptFilter === 'All'
    ? tokens
    : tokens.filter(t => t.department === consoleDeptFilter)
  ).slice().sort((a, b) => {
    const getNum = (str: string) => {
      const match = str.match(/\d+/g);
      return match ? parseInt(match[match.length - 1], 10) : 0;
    };
    return getNum(a.tokenNumber) - getNum(b.tokenNumber);
  });

  return (
    <div className="space-y-6">

      {/* Top Banner & Navigation Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Smart OPD Patient Queue & Token System</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Zero-Wait Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Department-specific consultation schedules, incrementing token sequences, and real-time live turn forecasts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher: Tracker vs Department Schedules */}
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveViewTab('tracker')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${activeViewTab === 'tracker' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Queue Tracker
            </button>
            <button
              onClick={() => setActiveViewTab('schedules')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${activeViewTab === 'schedules' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Dept Schedules ({DEPARTMENT_SCHEDULES.length})
            </button>
          </div>

          {/* Digital Waiting Hall Display Board Button */}
          <button
            onClick={() => setShowDisplayBoardModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Open Hospital Waiting Hall Display Board"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Waiting Hall Screen</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION: DYNAMIC STATE
          CASE A: USER HAS REGISTERED A TOKEN -> SHOW "YOUR REGISTERED TOKEN" CARD
          CASE B: USER HAS NOT REGISTERED YET -> SHOW CLEAN "NO ACTIVE TOKEN" OVERVIEW
      ========================================================================= */}
      {myToken ? (
        /* ACTIVE USER TOKEN CARD */
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Users className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                    YOUR ACTIVE OPD TOKEN
                  </span>
                  <span className="text-[11px] font-semibold text-blue-200 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-700/40">
                    {myToken.tokenType === 'online' ? '📱 Online Registered' : '🏥 Walk-in Kiosk'}
                  </span>
                  {myToken.priority !== 'Normal' && (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-600/40">
                      ⚡ {myToken.priority}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {myToken.department} — {myToken.doctorName}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                  <span>Room: <strong className="text-white">{myToken.roomNumber}</strong></span>
                  <span>•</span>
                  <span>Floor: <strong className="text-white">{myDeptSchedule.floor}</strong></span>
                  <span>•</span>
                  <span>Patient: <strong className="text-white">{myToken.patientName}</strong> ({myToken.patientAge}y, {myToken.gender})</span>
                </p>
              </div>

              {/* Action Buttons for User Token */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setSelectedSlipToken(myToken);
                    setShowSlipModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-colors border border-white/10"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-300" />
                  <span>OPD Slip</span>
                </button>

                <button
                  onClick={() => {
                    if (currentlyServingInDept) {
                      speakTokenAnnouncement(currentlyServingInDept.tokenNumber, currentlyServingInDept.roomNumber);
                    } else {
                      speakTokenAnnouncement(myToken.tokenNumber, myToken.roomNumber);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-colors border border-white/10"
                  title="Audio Voice Announcement"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Voice Call</span>
                </button>

                <button
                  onClick={handleCancelMyToken}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-colors border border-red-800/40"
                  title="Cancel this token registration"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel / Change</span>
                </button>
              </div>
            </div>

            {/* Key Queue Stats 4-Card Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Your Token */}
              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15">
                <span className="text-[11px] text-slate-300 font-semibold block mb-1">Your Token Number</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {myToken.tokenNumber}
                </div>
                <span className="text-[10px] text-slate-300 mt-1 block font-medium">
                  Issued: {myToken.issueTime}
                </span>
              </div>

              {/* Currently Serving in This Dept */}
              <div className="bg-emerald-950/70 backdrop-blur p-4 rounded-2xl border border-emerald-500/40">
                <span className="text-[11px] text-emerald-300 font-semibold block mb-1">Now Serving in {myToken.department}</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  {currentlyServingInDept?.tokenNumber || 'Opening'}
                </div>
                <span className="text-[10px] text-emerald-200 mt-1 block">
                  {currentlyServingInDept?.patientName ? `Patient: ${currentlyServingInDept.patientName}` : 'Doctor Ready'}
                </span>
              </div>

              {/* Patients Ahead in This Dept */}
              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15">
                <span className="text-[11px] text-slate-300 font-semibold block mb-1">Patients Ahead (In Queue)</span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {myPatientsAheadCount}
                </div>
                <span className="text-[10px] text-slate-300 mt-1 block">
                  {myPatientsAheadCount === 0 ? '🎉 You are next in line!' : `${myPatientsAheadCount} patients in waiting lounge`}
                </span>
              </div>

              {/* Department Specific Estimated Wait Time */}
              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-semibold">Estimated Wait Time</span>
                  <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                    {myDeptSchedule.avgConsultationMinutes}m/pt
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-blue-400 font-mono tracking-tight">
                  {myEstimatedWaitMinutes} <span className="text-lg font-bold">mins</span>
                </div>
                <span className="text-[10px] text-slate-300 mt-1 block">
                  Est. Doctor Call: <strong>{getEstimatedCallTime(myEstimatedWaitMinutes)}</strong>
                </span>
              </div>
            </div>

            {/* Live Queue Progress Bar */}
            <div className="space-y-2 bg-black/25 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{myToken.department} OPD Progress</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                    Schedule: {myDeptSchedule.scheduleHours}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  {myToken.status === 'consulting'
                    ? '🔔 NOW INSIDE CONSULTATION ROOM'
                    : myPatientsAheadCount === 0
                      ? '👉 NEXT PATIENT TO BE CALLED'
                      : `Turn #${myPatientsAheadCount + 1}`}
                </span>
              </div>

              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: myToken.status === 'consulting'
                      ? '100%'
                      : `${Math.max(10, Math.min(100, ((userDeptTokens.length - myPatientsAheadCount) / Math.max(1, userDeptTokens.length)) * 100))}%`
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Serving: {currentlyServingInDept?.tokenNumber || 'N/A'}</span>
                <span className="text-amber-300 font-bold">Your Turn: {myToken.tokenNumber}</span>
                <span>Dept Queue Count: {userDeptTokens.length} patients</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BEFORE REGISTRATION: INTUITIVE OVERVIEW & REGISTRATION PROMPT */
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-700">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-700/60">
                  LIVE OPD QUEUE FORECAST
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  No Active Token Registered
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Select your department below to generate an instant OPD Token with zero-wait predictive schedule. Once registered, your live token number and countdown will appear here.
                </p>
              </div>

              {/* Department Quick Switcher in Header */}
              <div className="bg-white/10 p-1.5 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold px-2">Viewing Department:</span>
                <select
                  value={activeDept}
                  onChange={(e) => {
                    setActiveDept(e.target.value);
                    const sched = DEPARTMENT_SCHEDULES.find(d => d.name === e.target.value);
                    if (sched) setActiveDoctor(sched.doctorName);
                  }}
                  className="bg-slate-900 text-white font-bold text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-400"
                >
                  {DEPARTMENT_SCHEDULES.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Live Stats Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 font-semibold block mb-1">Selected Department</span>
                <div className="text-lg sm:text-xl font-bold text-white truncate">{currentDeptSchedule.name}</div>
                <span className="text-[10px] text-blue-300 mt-1 block">{currentDeptSchedule.roomNumber}</span>
              </div>

              <div className="bg-emerald-950/60 backdrop-blur p-4 rounded-2xl border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 font-semibold block mb-1">Currently Serving</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {currentlyServingInDept?.tokenNumber || 'TK-101'}
                </div>
                <span className="text-[10px] text-emerald-200 mt-1 block">In Doctor's Room</span>
              </div>

              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 font-semibold block mb-1">Waiting in Lounge</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {userDeptTokens.filter(t => t.status === 'waiting').length}
                </div>
                <span className="text-[10px] text-slate-300 mt-1 block">Patients in queue</span>
              </div>

              <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-semibold">New Token Est. Wait</span>
                  <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                    {currentDeptSchedule.avgConsultationMinutes}m/pt
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                  {userDeptTokens.filter(t => t.status === 'waiting').length * currentDeptSchedule.avgConsultationMinutes} mins
                </div>
                <span className="text-[10px] text-slate-300 mt-1 block">
                  Schedule: {currentDeptSchedule.scheduleHours}
                </span>
              </div>
            </div>

            {/* Quick Register CTA bar */}
            <div className="bg-blue-950/70 border border-blue-600/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Generate an OPD Token to get your Live Token Number &amp; Wait Time</h4>
                  <p className="text-xs text-blue-200">Fill the booking form below to instantly secure your position in queue.</p>
                </div>
              </div>

              <a
                href="#token-booking-form"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Book Token Below</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB CONTENT 1: DEPARTMENT SCHEDULES & WAITING TIME DIRECTORY
      ========================================================================= */}
      {activeViewTab === 'schedules' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Department Consultation Schedules &amp; Average Wait Times</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Each specialty operates on a tailored consultation duration benchmark to ensure clinical quality and accurate patient queue forecasting.
              </p>
            </div>

            <button
              onClick={() => setActiveViewTab('tracker')}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors self-start"
            >
              Back to Queue Tracker
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENT_SCHEDULES.map((dept) => {
              const deptTokens = tokens.filter(t => t.department === dept.name);
              const serving = deptTokens.find(t => t.status === 'consulting') || deptTokens.find(t => t.status === 'called');
              const waitingCount = deptTokens.filter(t => t.status === 'waiting').length;
              const estWait = waitingCount * dept.avgConsultationMinutes;
              const isSelected = activeDept === dept.name;

              return (
                <div
                  key={dept.id}
                  onClick={() => {
                    setActiveDept(dept.name);
                    setActiveDoctor(dept.doctorName);
                    setActiveViewTab('tracker');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{dept.doctorName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full block">
                        ~{dept.avgConsultationMinutes}m/pt
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{dept.daysActive}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Room &amp; Floor:</span>
                      <span className="font-semibold text-slate-800">{dept.roomNumber} ({dept.floor})</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>OPD Shift Hours:</span>
                      <span className="font-semibold text-slate-800">{dept.scheduleHours}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                      <span>Now Serving:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {serving?.tokenNumber || 'Ready'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>In Queue &amp; Est. Wait:</span>
                      <span className="font-bold text-slate-800">
                        {waitingCount} waiting • <span className="text-blue-600">~{estWait} mins</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 pt-1">
                    <span>{isSelected ? '✓ Currently Selected' : 'Select for Booking'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          DEPARTMENT CONSULTATION SCHEDULES & LIVE WAITING TIME MATRIX
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Department Consultation Time Schedules &amp; Live Waiting Forecasts
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Token numbers increment universally • Waiting times vary by specialty consultation rate
          </span>
        </div>

        {/* Scrollable Department Schedules Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
          {DEPARTMENT_SCHEDULES.map((dept) => {
            const deptTokens = tokens.filter(t => t.department === dept.name);
            const serving = deptTokens.find(t => t.status === 'consulting') || deptTokens.find(t => t.status === 'called');
            const waitingCount = deptTokens.filter(t => t.status === 'waiting').length;
            const estWait = waitingCount * dept.avgConsultationMinutes;
            const isSelected = activeDept === dept.name;

            return (
              <div
                key={dept.id}
                onClick={() => {
                  setActiveDept(dept.name);
                  setActiveDoctor(dept.doctorName);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${isSelected
                  ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded">
                        {dept.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-[140px]">{dept.name}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{dept.roomNumber}</span>
                  </div>

                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    ~{dept.avgConsultationMinutes}m/pt
                  </span>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Shift Hours:</span>
                    <span className="font-medium text-slate-700">{dept.scheduleHours}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Now Serving:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {serving?.tokenNumber || 'Ready'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-0.5 border-t border-slate-100">
                    <span>Queue &amp; Est. Wait:</span>
                    <span className="font-bold text-slate-900">
                      {waitingCount} waiting • <span className="text-blue-600 font-mono">~{estWait}m</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-blue-600">
                  <span>{isSelected ? '✓ Selected Department' : 'Click to Select'}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN SECTION:
          LEFT: GENERATE / BOOK OPD TOKEN (Form)
          RIGHT: CLINICAL DOCTOR & STAFF QUEUE CONSOLE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Book / Generate OPD Token (5 Cols) */}
        <div id="token-booking-form" className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Generate OPD Token Number</h3>
                <p className="text-[11px] text-slate-500">Auto-incrementing sequential token generator</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveViewTab('schedules')}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
            >
              View Schedules →
            </button>
          </div>

          <form onSubmit={handleGenerateNewToken} className="space-y-3 text-xs">
            {/* Token Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTokenType('online')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${tokenType === 'online' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
              >
                📱 Online Token
              </button>
              <button
                type="button"
                onClick={() => setTokenType('walk-in')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${tokenType === 'walk-in' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
              >
                🏥 Walk-in Kiosk Token
              </button>
            </div>

            {/* Department Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Select OPD Department:</label>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Avg: {currentDeptSchedule.avgConsultationMinutes}m/pt
                </span>
              </div>
              <select
                value={activeDept}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setActiveDept(newDept);
                  const sched = DEPARTMENT_SCHEDULES.find(d => d.name === newDept);
                  if (sched) setActiveDoctor(sched.doctorName);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {DEPARTMENT_SCHEDULES.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code}) — {d.scheduleHours}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor and Room Display */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Doctor on Duty:</span>
                <span className="font-bold text-slate-900">{currentDeptSchedule.doctorName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Clinic Room:</span>
                <span className="font-semibold text-slate-800">{currentDeptSchedule.roomNumber} ({currentDeptSchedule.floor})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Specialty Focus:</span>
                <span className="text-slate-500 truncate max-w-[200px]">{currentDeptSchedule.specialty}</span>
              </div>
            </div>

            {/* Patient Name */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Full Name:</label>
              <input
                type="text"
                placeholder="e.g. Rahul Senapati"
                value={patientNameInput}
                onChange={(e) => setPatientNameInput(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years):</label>
                <input
                  type="number"
                  min="1"
                  max="115"
                  value={patientAgeInput}
                  onChange={(e) => setPatientAgeInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender:</label>
                <select
                  value={genderInput}
                  onChange={(e) => setGenderInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone & Priority */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile (SMS Alert):</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Queue Priority:</label>
                <select
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="Normal">Normal Walk-in</option>
                  <option value="Elderly/Special">Elderly / Senior Citizen</option>
                </select>
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-600">Next Hospital Token Number:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded text-xs">
                  {nextGlobalTokenNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>{currentDeptSchedule.name} Benchmark:</span>
                <span className="font-bold text-slate-800">~{currentDeptSchedule.avgConsultationMinutes} mins / patient</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Patients in {currentDeptSchedule.name} Queue:</span>
                <span className="font-semibold text-slate-900">
                  {userDeptTokens.filter(t => t.status === 'waiting' || t.status === 'called').length} patients waiting
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-900 pt-1.5 border-t border-blue-200">
                <span>Estimated Wait for {currentDeptSchedule.name}:</span>
                <span className="text-blue-700 font-mono text-sm">
                  ~{userDeptTokens.filter(t => t.status === 'waiting' || t.status === 'called').length * currentDeptSchedule.avgConsultationMinutes} mins
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate My OPD Token Number</span>
            </button>
          </form>
        </div>

        {/* Right: Doctor / Staff Queue Controller (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Doctor &amp; Clinic Queue Console</h3>
                <p className="text-[11px] text-slate-500">Advance, hold, or call next patient token</p>
              </div>
            </div>

            {/* Department Filter & Action Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={consoleDeptFilter}
                onChange={(e) => setConsoleDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="All">All Departments ({tokens.length})</option>
                {DEPARTMENT_SCHEDULES.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <button
                onClick={() => handleCallNext(consoleDeptFilter)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Call next patient in queue"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Call Next</span>
              </button>

              <button
                onClick={() => handleHoldCurrent(consoleDeptFilter)}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Put patient on hold (lab investigation)"
              >
                <PauseCircle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleSkipCurrent(consoleDeptFilter)}
                className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Skip to next patient"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-y border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Department &amp; Room</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Est. Wait</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consoleTokens.map((tok) => {
                  const isServing = tok.status === 'consulting';
                  const isCalled = tok.status === 'called';
                  const isMyToken = tok.id === activeUserTokenId;

                  return (
                    <tr
                      key={tok.id}
                      className={`transition-colors ${isMyToken
                        ? 'bg-blue-50/80 font-medium'
                        : isServing
                          ? 'bg-emerald-50/70 font-semibold'
                          : isCalled
                            ? 'bg-amber-50/70'
                            : 'hover:bg-slate-50'
                        }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${isServing
                            ? 'bg-emerald-600 text-white'
                            : isMyToken
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                            }`}>
                            {tok.tokenNumber}
                          </span>
                          {isMyToken && (
                            <span className="text-[9px] bg-blue-200 text-blue-800 font-bold px-1 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 font-medium">{tok.patientName}</span>
                        <span className="text-[10px] text-slate-400 block">{tok.patientAge}y • {tok.gender}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-700 font-medium">{tok.department}</span>
                        <span className="text-[10px] text-slate-400 block">{tok.roomNumber}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tok.status === 'consulting'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tok.status === 'called'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : tok.status === 'completed'
                              ? 'bg-slate-100 text-slate-500'
                              : tok.status === 'hold'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-50 text-blue-700'
                          }`}>
                          {tok.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {tok.status === 'completed' ? 'Done' : `${tok.estimatedWaitMinutes}m`}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSlipToken(tok);
                            setShowSlipModal(true);
                          }}
                          className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold p-1 hover:bg-slate-100 rounded"
                          title="View Token Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: OPD TOKEN SLIP / PRINTABLE RECEIPT
      ========================================================================= */}
      {showSlipModal && selectedSlipToken && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">SafeLife City Hospital</h3>
                  <p className="text-[10px] text-slate-500">Official OPD Registration &amp; Token Slip</p>
                </div>
              </div>

              <button
                onClick={() => setShowSlipModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Token Big Display Slip */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-300 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {selectedSlipToken.department} OPD TOKEN
              </span>
              <div className="text-4xl font-black font-mono text-blue-700 tracking-tight">
                {selectedSlipToken.tokenNumber}
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {selectedSlipToken.doctorName}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedSlipToken.roomNumber}
              </div>
            </div>

            {/* Patient & Booking Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-bold text-slate-900">{selectedSlipToken.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Age / Gender:</span>
                <span className="font-medium text-slate-800">{selectedSlipToken.patientAge} Yrs • {selectedSlipToken.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Issue Time:</span>
                <span className="font-mono text-slate-800">{selectedSlipToken.issueTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Token Type:</span>
                <span className="font-medium text-slate-800 capitalize">{selectedSlipToken.tokenType} Token</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Est. Consultation:</span>
                <span className="font-bold text-blue-600">
                  ~{selectedSlipToken.estimatedWaitMinutes} mins wait ({getEstimatedCallTime(selectedSlipToken.estimatedWaitMinutes)})
                </span>
              </div>
            </div>

            {/* Barcode / QR Simulation */}
            <div className="bg-slate-100 rounded-xl p-3 text-center space-y-1">
              <div className="font-mono text-[10px] text-slate-500 tracking-widest">
                ||||| | |||| ||| |||||| || ||||||||| ||| ||||
              </div>
              <span className="text-[10px] font-mono text-slate-600 font-bold block">
                SLS-OPD-{selectedSlipToken.tokenNumber}-2026
              </span>
            </div>

            {/* Print & Close Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print OPD Slip</span>
              </button>

              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FULL-SCREEN WAITING HALL ELECTRONIC DISPLAY BOARD
      ========================================================================= */}
      {showDisplayBoardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-6xl text-white p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">SAFELIFE OPD WAITING LOUNGE DISPLAY</h2>
                  <p className="text-xs text-slate-400">Live Electronic Token Board • Department Schedules Synchronized</p>
                </div>
              </div>

              {/* Department Selector for Big Screen */}
              <div className="flex items-center gap-3">
                <select
                  value={activeDept}
                  onChange={(e) => setActiveDept(e.target.value)}
                  className="bg-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2 border border-slate-700"
                >
                  {DEPARTMENT_SCHEDULES.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowDisplayBoardModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  ✕ Close Screen
                </button>
              </div>
            </div>

            {/* Giant Token Cards for Active Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {userDeptTokens.slice(0, 3).map((tok, idx) => (
                <div
                  key={tok.id}
                  className={`p-6 rounded-2xl border text-center space-y-2 ${idx === 0
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500 shadow-lg shadow-emerald-900/20'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                >
                  <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
                    {idx === 0 ? 'NOW CONSULTING' : `NEXT IN LINE #${idx}`}
                  </span>
                  <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white py-2">
                    {tok.tokenNumber}
                  </div>
                  <div className="text-sm font-semibold text-emerald-400">{tok.roomNumber}</div>
                  <div className="text-xs text-slate-400">{tok.doctorName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Patient: {tok.patientName}</div>
                </div>
              ))}
            </div>

            {/* Upcoming token ticker */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400 font-bold uppercase">Upcoming {activeDept} Tokens:</span>
              <div className="flex flex-wrap gap-2 font-mono font-bold text-amber-400">
                {userDeptTokens.slice(3).map(t => (
                  <span key={t.id} className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {t.tokenNumber}
                  </span>
                ))}
                {userDeptTokens.length <= 3 && (
                  <span className="text-slate-500 italic">No further waiting tokens</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

