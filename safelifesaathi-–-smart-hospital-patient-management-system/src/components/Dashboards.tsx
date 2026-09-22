import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Activity, 
  Siren, 
  FileText, 
  Syringe, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Heart, 
  Stethoscope, 
  BedDouble, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  Sparkles,
  MapPin,
  Plus,
  Trash2,
  Send,
  Check,
  AlertCircle,
  Pill,
  Thermometer,
  Layers,
  DollarSign,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { Ambulance, OPDToken, Prescription, VaccinationRecord, AppTab } from '../types';
import { OPD_TRAFFIC_DATA, DEPT_WAIT_TIMES_DATA } from '../data/mockData';

interface DashboardProps {
  ambulance: Ambulance;
  tokens: OPDToken[];
  prescriptions: Prescription[];
  vaccinations: VaccinationRecord[];
  setActiveTab: (tab: AppTab) => void;
  selectedRole?: 'patient' | 'doctor' | 'admin' | 'emergency';
  userRegisteredTokenId?: string | null;
}

/* =========================================================================
   1. PATIENT DASHBOARD
========================================================================= */
export const PatientDashboard: React.FC<DashboardProps> = ({
  ambulance,
  tokens,
  prescriptions,
  vaccinations,
  setActiveTab,
  userRegisteredTokenId,
}) => {
  const activeTokenId = userRegisteredTokenId || localStorage.getItem('safelife_user_token_id');
  const myToken = activeTokenId ? tokens.find(t => t.id === activeTokenId) || null : null;
  const upcomingVax = vaccinations.find(v => v.status === 'upcoming');
  const latestRx = prescriptions[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-[11px] uppercase font-bold text-blue-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            Patient Portal • ABHA: 91-8891-2309
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome, Rahul Senapati
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your OPD tokens in real-time, review simplified medicine schedules, and manage family vaccination appointments.
          </p>
        </div>

        {/* Emergency SOS Button */}
        <button
          onClick={() => setActiveTab('ambulance-clearance')}
          className="self-start sm:self-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Siren className="w-5 h-5" />
          <span>Emergency Ambulance SOS</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Active Token Card */}
        <div 
          onClick={() => setActiveTab('queue-system')}
          className={`rounded-2xl p-5 border shadow-xs transition-all cursor-pointer group ${
            myToken 
              ? 'bg-blue-50/70 border-blue-200 hover:border-blue-400' 
              : 'bg-white border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Live OPD Token</span>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          {myToken ? (
            <>
              <div className="text-2xl font-bold text-blue-700 font-mono">{myToken.tokenNumber}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                <span>{myToken.department}</span>
                <span className="text-emerald-700 font-bold">~{myToken.estimatedWaitMinutes}m wait</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-bold text-slate-700">No Active Token</div>
              <div className="flex items-center justify-between text-[11px] text-blue-600 font-semibold mt-1">
                <span>Click to Book OPD Token</span>
                <span>→</span>
              </div>
            </>
          )}
        </div>

        {/* Upcoming Vaccination */}
        <div 
          onClick={() => setActiveTab('vaccination-reminder')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Next Vaccination</span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Syringe className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">{upcomingVax?.vaccineName || 'COVID-19 Booster'}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Due: {upcomingVax?.dueDate || '15 Sept'}</span>
            <span className="text-teal-600 font-bold">Reminder Set</span>
          </div>
        </div>

        {/* Prescription Summary */}
        <div 
          onClick={() => setActiveTab('prescription-scanner')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Regimen</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">{latestRx?.medicines[0]?.name || 'Paracetamol'}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>{latestRx?.medicines.length || 3} Medicines Total</span>
            <span className="text-purple-600 font-bold">AI Explained</span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ZivaSaathi Quick Assistant */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Need OPD Clinic Guidance?</h3>
              <p className="text-xs text-slate-500">ZivaSaathi matches your symptoms to the right specialist</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            Tell ZivaSaathi about symptoms like cough, fever, blurry vision, or knee pain, and it will direct you to General Medicine, Ophthalmology, or Orthopedics with zero queue confusion.
          </p>

          <button
            onClick={() => setActiveTab('ai-chatbot')}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ask ZivaSaathi Symptom Navigator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Road Clearance System Tracker */}
        <div className="bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-sm">Emergency Corridor Tracking</h3>
            </div>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-md font-bold">
              500m Active GNSS
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Ambulance Unit:</span>
              <strong className="text-white">{ambulance.id}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Destination:</span>
              <span className="text-emerald-400 font-semibold">{ambulance.destinationHospital}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Arrival:</span>
              <strong className="text-amber-400 font-mono">{ambulance.etaMinutes}</strong>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ambulance-clearance')}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open 500m Road Clearance Radar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. DOCTOR WORKSTATION / CLINICAL CONSOLE (ENHANCED)
========================================================================= */
export const DoctorDashboard: React.FC<DashboardProps> = ({
  tokens,
  setActiveTab,
}) => {
  const [doctorStatus, setDoctorStatus] = useState<'consulting' | 'break' | 'rounds'>('consulting');
  const [activeTokenId, setActiveTokenId] = useState<string>(tokens.find(t => t.status === 'consulting')?.id || tokens[0]?.id || 'tok-120');
  const [rxMedicines, setRxMedicines] = useState<Array<{ name: string; dosage: string; freq: string; duration: string }>>([
    { name: 'Paracetamol 650mg', dosage: '1 Tab', freq: '1-0-1 (Post Meals)', duration: '3 Days' },
    { name: 'Cetirizine 10mg', dosage: '1 Tab', freq: '0-0-1 (Night)', duration: '5 Days' },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('500mg (1 Tab)');
  const [newMedFreq, setNewMedFreq] = useState('1-0-1');
  const [newMedDuration, setNewMedDuration] = useState('5 Days');
  const [clinicalNotes, setClinicalNotes] = useState('Patient reports acute upper respiratory symptoms with fever for 2 days. Clear chest on auscultation. Advised hydration & rest.');
  const [investigations, setInvestigations] = useState<string[]>(['Complete Blood Count (CBC)', 'RBS (Random Blood Sugar)']);
  const [newInvestigation, setNewInvestigation] = useState('');
  const [consultationSuccessMessage, setConsultationSuccessMessage] = useState<string | null>(null);

  const activePatientToken = tokens.find(t => t.id === activeTokenId) || tokens[0];
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const completedTokensCount = tokens.filter(t => t.status === 'completed').length + 8; // realistic simulated baseline

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setRxMedicines(prev => [...prev, {
      name: newMedName.trim(),
      dosage: newMedDosage,
      freq: newMedFreq,
      duration: newMedDuration
    }]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (index: number) => {
    setRxMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddInvestigation = () => {
    if (!newInvestigation.trim()) return;
    setInvestigations(prev => [...prev, newInvestigation.trim()]);
    setNewInvestigation('');
  };

  const handleCompleteEncounter = () => {
    setConsultationSuccessMessage(`Encounter for ${activePatientToken?.patientName} (Token ${activePatientToken?.tokenNumber}) completed & digital Rx synced! Calling next patient.`);
    setTimeout(() => {
      setConsultationSuccessMessage(null);
      // Auto switch to next waiting
      const next = waitingTokens[0];
      if (next) setActiveTokenId(next.id);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Doctor Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">Dr. Alok Sharma, MD</h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-200">
                General &amp; Internal Medicine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Room 204 • Schedule: 09:00 AM – 02:00 PM • OPD Token Counter Active
            </p>
          </div>
        </div>

        {/* Doctor Status & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setDoctorStatus('consulting')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                doctorStatus === 'consulting' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Consultation
            </button>
            <button
              onClick={() => setDoctorStatus('break')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                doctorStatus === 'break' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => setDoctorStatus('rounds')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                doctorStatus === 'rounds' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ward Rounds
            </button>
          </div>

          <button
            onClick={() => setActiveTab('queue-system')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Full Queue Display</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {consultationSuccessMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{consultationSuccessMessage}</span>
          </div>
          <button onClick={() => setConsultationSuccessMessage(null)} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* 4 Doctor Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Patients in Queue</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{waitingTokens.length}</div>
          <span className="text-[10px] text-indigo-600 font-medium">Room 204 Active Line</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Consultations Completed</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{completedTokensCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Avg ~7.5 min / patient</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Priority / Senior Citizens</span>
          <div className="text-2xl font-black text-purple-700 mt-1">2 Flagged</div>
          <span className="text-[10px] text-purple-600 font-medium">Auto-triaged by ZivaSaathi</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Lab Reports</span>
          <div className="text-2xl font-black text-amber-600 mt-1">3 Available</div>
          <span className="text-[10px] text-amber-600 font-medium">Hematology &amp; X-Ray ready</span>
        </div>
      </div>

      {/* Main Clinical Workstation: Left (Queue & Select) + Right (Active Consultation & Rx Writer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Queue Strip (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-950 text-sm">Room 204 OPD Queue</h3>
              </div>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-md">
                Live Turn
              </span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {tokens.map((token) => {
                const isActive = activeTokenId === token.id;
                const isPriority = token.priority !== 'Normal';
                return (
                  <div
                    key={token.id}
                    onClick={() => setActiveTokenId(token.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {token.tokenNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900">{token.patientName}</h4>
                          <p className="text-[10px] text-slate-500">{token.patientAge}y • {token.gender} • {token.tokenType}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          token.status === 'consulting'
                            ? 'bg-emerald-100 text-emerald-800'
                            : token.status === 'completed'
                              ? 'bg-slate-200 text-slate-700'
                              : isPriority
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                          {token.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">~{token.estimatedWaitMinutes}m</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Patient Consultation & Digital Rx (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Patient Header Card */}
          <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="font-bold text-slate-950 text-base">
                    Active Encounter: {activePatientToken.patientName}
                  </h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                    Token {activePatientToken.tokenNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ABDM Patient ID: SLS-PT-{activePatientToken.id.replace('tok-', '88')} • Check-in Time: {activePatientToken.issueTime}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-semibold">
                  Priority: <strong className="text-purple-700">{activePatientToken.priority}</strong>
                </span>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" /> Blood Pressure
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">120/80 mmHg</p>
                <span className="text-[9px] text-emerald-600">Normotensive</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-500" /> SpO2 &amp; Pulse
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">98% • 76 bpm</p>
                <span className="text-[9px] text-emerald-600">Optimal</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-500" /> Body Temp
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">98.6 °F</p>
                <span className="text-[9px] text-emerald-600">Afebrile</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-purple-500" /> Allergies
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">Penicillin (Mild)</p>
                <span className="text-[9px] text-purple-600 font-semibold">Caution</span>
              </div>
            </div>

            {/* ZivaSaathi AI Pre-Consultation Summary */}
            <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>ZivaSaathi Pre-Triage Assessment</span>
              </div>
              <p className="text-purple-950 text-[11px] leading-relaxed">
                Patient initiated triage 20 minutes prior complaining of runny nose, mild throat irritation, and low-grade evening chills for 48 hours. No shortness of breath or chest pain reported. Recommended routing: General Medicine.
              </p>
            </div>

            {/* Doctor Clinical Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Clinical Examination &amp; Diagnosis Notes:</label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-indigo-500"
                placeholder="Enter physical examination findings, differential diagnosis, and clinical recommendations..."
              />
            </div>

            {/* Digital Prescription & Medication Orders */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-blue-600" />
                  Prescribed Medications ({rxMedicines.length})
                </h4>
                <span className="text-[11px] text-slate-500">Auto-translated to plain-language patient view</span>
              </div>

              {/* Medicines Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rxMedicines.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                        <td className="p-2.5 text-slate-700">{med.dosage}</td>
                        <td className="p-2.5 text-slate-700 font-medium">{med.freq}</td>
                        <td className="p-2.5 text-slate-700">{med.duration}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveMedicine(idx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Medicine Mini-Form */}
              <form onSubmit={handleAddMedicine} className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Amoxicillin 500mg)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="sm:col-span-2 bg-white border border-slate-300 rounded-lg p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Dosage (1 Tab)"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                />
                <select
                  value={newMedFreq}
                  onChange={(e) => setNewMedFreq(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="1-0-1">1-0-1 (Twice Daily)</option>
                  <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                  <option value="1-0-0">1-0-0 (Morning Only)</option>
                  <option value="0-0-1">0-0-1 (Night Only)</option>
                  <option value="SOS">SOS (As Needed)</option>
                </select>
                <button
                  type="submit"
                  className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rx</span>
                </button>
              </form>
            </div>

            {/* Diagnostic Orders & Lab Investigations */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Ordered Diagnostic Tests:</span>
              <div className="flex flex-wrap gap-2">
                {investigations.map((inv, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                    <span>{inv}</span>
                    <button onClick={() => setInvestigations(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-600">✕</button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add lab order (e.g. Chest X-Ray PA View, Lipid Profile, Urine Routine)..."
                  value={newInvestigation}
                  onChange={(e) => setNewInvestigation(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInvestigation(); } }}
                  className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
                <button
                  onClick={handleAddInvestigation}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  + Add Test
                </button>
              </div>
            </div>

            {/* Complete Encounter Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Encounter for ${activePatientToken.patientName} put on hold pending lab results.`)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 cursor-pointer"
                >
                  Hold for Lab Results
                </button>
                <button
                  onClick={() => setActiveTab('prescription-scanner')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer"
                >
                  Review AI Explainer
                </button>
              </div>

              <button
                onClick={handleCompleteEncounter}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Sign &amp; Complete Encounter (Call Next)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. HOSPITAL EXECUTIVE ADMIN DASHBOARD (ENHANCED)
========================================================================= */
export const HospitalAdminDashboard: React.FC<DashboardProps> = ({
  ambulance,
  setActiveTab,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const bedCategories = [
    { name: 'ICU & Critical Care', occupied: 38, total: 40, color: 'bg-red-500', alert: '95% Full - Alert' },
    { name: 'Emergency Trauma Bay', occupied: 12, total: 15, color: 'bg-amber-500', alert: '3 Available' },
    { name: 'General Inpatient Wards', occupied: 242, total: 280, color: 'bg-blue-600', alert: '86% Occupancy' },
    { name: 'Pediatric & Neonatal (NICU)', occupied: 32, total: 40, color: 'bg-teal-500', alert: 'Normal' },
    { name: 'Maternity & Post-Op', occupied: 22, total: 25, color: 'bg-purple-600', alert: 'Normal' },
    { name: 'Day Care Surgery Suites', occupied: 14, total: 20, color: 'bg-indigo-600', alert: '6 Available' },
  ];

  const onDutySpecialists = [
    { name: 'Dr. Alok Sharma', dept: 'General Medicine', room: 'OPD 204', status: 'Active (8 in queue)', color: 'text-emerald-700' },
    { name: 'Dr. Suniti Rao', dept: 'Orthopedics & Trauma', room: 'OPD 108', status: 'Active (5 in queue)', color: 'text-emerald-700' },
    { name: 'Dr. Vikramaditya Das', dept: 'Cardiology', room: 'Cath Lab #2', status: 'In Procedure', color: 'text-amber-700' },
    { name: 'Dr. Meera Iyer', dept: 'Pediatrics', room: 'OPD 302', status: 'Active (6 in queue)', color: 'text-emerald-700' },
    { name: 'Dr. Rajesh Patel', dept: 'ENT & Head Neck', room: 'OPD 215', status: 'Rounds', color: 'text-blue-700' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">SafeLifeSaathi Central Hospital Operations</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                NABH Level-1 Certified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Command Overview: Real-time bed occupancy, OPD traffic, emergency transit corridors, and clinical staffing.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (Live)
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bed Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Overall Bed Occupancy</span>
            <BedDouble className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">85.3%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '85.3%' }}></div>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1.5 font-medium">360 / 420 Total Beds Occupied</span>
        </div>

        {/* OPD Footfall */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Today's OPD Footfall</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">1,482</div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1.5">
            +18% via ZivaSaathi Pre-Bookings
          </span>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Average OPD Wait Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">14.2 min</div>
          <span className="text-[11px] text-purple-600 font-semibold block mt-1.5">
            Down from 38m (Smart Queue)
          </span>
        </div>

        {/* Emergency Ambulance Corridors */}
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs bg-red-50/10">
          <div className="flex items-center justify-between text-xs font-semibold text-red-600 mb-1">
            <span>Active Emergency Ambulances</span>
            <Siren className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700 font-mono">4 In Transit</div>
          <span className="text-[11px] text-red-700 font-semibold block mt-1.5">
            500m V2X Clearance Active
          </span>
        </div>
      </div>

      {/* Bed Capacity Detailed Matrix & Live On-Duty Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Multi-Department Bed Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Departmental Bed Utilization &amp; ICU Reserve</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
              Real-Time Telemetry
            </span>
          </div>

          <div className="space-y-3">
            {bedCategories.map((bed, idx) => {
              const pct = Math.round((bed.occupied / bed.total) * 100);
              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{bed.name}</span>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {bed.occupied} / {bed.total} Beds ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`${bed.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Available: {bed.total - bed.occupied} units</span>
                    <span className="font-bold text-slate-700">{bed.alert}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: On-Duty Medical Specialists & Room Roster (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">On-Duty Doctors &amp; OPD Rooms</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">5 Specialists Active</span>
          </div>

          <div className="space-y-2.5">
            {onDutySpecialists.map((doc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs transition-colors flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500">{doc.dept} • <strong className="text-slate-700">{doc.room}</strong></p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 ${doc.color}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Dispatch Link */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('ambulance-clearance')}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Siren className="w-4 h-4" />
              <span>Track Emergency Inflow (500m Radar)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly OPD Traffic Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hourly OPD Traffic Distribution</h3>
              <p className="text-xs text-slate-500">Walk-in Kiosks vs Online Pre-booked Tokens</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">Today</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={OPD_TRAFFIC_DATA}>
                <defs>
                  <linearGradient id="colorWalkin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="walkIn" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWalkin)" name="Walk-In Patients" />
                <Area type="monotone" dataKey="online" stroke="#10b981" fillOpacity={1} fill="url(#colorOnline)" name="Online Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Wait Times Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Average Wait Times by Department</h3>
              <p className="text-xs text-slate-500">Minutes per patient consultation</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">Real-Time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_WAIT_TIMES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgWait" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Wait (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. EMERGENCY CONTROL CENTER DASHBOARD
========================================================================= */
export const EmergencyControlCenterDashboard: React.FC<DashboardProps> = ({
  ambulance,
  setActiveTab,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-950 text-red-500 border border-red-800 flex items-center justify-center font-bold">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">EMERGENCY TRAUMA DISPATCH HQ</h2>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  CODE RED
                </span>
              </div>
              <p className="text-xs text-slate-400">Coordinating smart 500m green corridors with City Traffic Command</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ambulance-clearance')}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Open Radar Geofence Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Bed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">ICU Beds Available</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">12 / 40</div>
            <span className="text-[10px] text-emerald-300">Ready for admission</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Trauma OT Theatres</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">2 Free</div>
            <span className="text-[10px] text-amber-300">OT #1 &amp; OT #3 on standby</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Incoming Ambulance ETA</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{ambulance.etaMinutes}</div>
            <span className="text-[10px] text-red-300">{ambulance.id} (STEMI Heart Attack)</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">O2 &amp; Blood Bank</span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">O-ve (18 Units)</div>
            <span className="text-[10px] text-blue-300">100% Reserve Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
