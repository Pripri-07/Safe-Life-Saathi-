import React, { useState } from 'react';
import { 
  Syringe, 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  FileCheck, 
  PlusCircle, 
  Download,
  Baby,
  User,
  Users,
  ShieldCheck,
  Sparkles,
  Filter
} from 'lucide-react';
import { VaccinationRecord } from '../types';

interface VaccinationReminderProps {
  vaccinations: VaccinationRecord[];
  setVaccinations: React.Dispatch<React.SetStateAction<VaccinationRecord[]>>;
  onTriggerNotification?: (title: string, message: string) => void;
}

export const VaccinationReminder: React.FC<VaccinationReminderProps> = ({
  vaccinations,
  setVaccinations,
  onTriggerNotification,
}) => {
  // Family Profile Switcher to isolate records per individual patient
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('Rahul Senapati');
  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(null);
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newCategory, setNewCategory] = useState<VaccinationRecord['category']>('Adult Booster');
  const [newDueDate, setNewDueDate] = useState('2026-10-15');
  const [newPatientName, setNewPatientName] = useState('Rahul Senapati');
  const [notificationSentMessage, setNotificationSentMessage] = useState<string | null>(null);

  // Available Family Profiles in the Patient's Account
  const familyProfiles = [
    { id: 'Rahul Senapati', name: 'Rahul Senapati', relation: 'Primary (Self) • ABHA: 91-8891-2309', count: vaccinations.filter(v => v.patientName.includes('Rahul')).length },
    { id: 'Aarav Senapati', name: 'Aarav Senapati', relation: 'Son (5 yrs) • Pediatric Immunization', count: vaccinations.filter(v => v.patientName.includes('Aarav')).length },
    { id: 'Sunita Senapati', name: 'Sunita Senapati', relation: 'Spouse • Wellness & Boosters', count: vaccinations.filter(v => v.patientName.includes('Sunita')).length },
    { id: 'all', name: 'All Family Members', relation: 'Combined Family View', count: vaccinations.length },
  ];

  // Filtered vaccinations based on active patient profile
  const filteredVaccinations = selectedPatientFilter === 'all'
    ? vaccinations
    : vaccinations.filter(v => v.patientName.toLowerCase().includes(selectedPatientFilter.toLowerCase().split(' ')[0]));

  // Auto-select first vaccine when filter changes or maintain selected
  const activeVaccine = filteredVaccinations.find(v => v.id === selectedVaccineId) || filteredVaccinations[0] || null;

  const upcomingCount = filteredVaccinations.filter(v => v.status === 'upcoming').length;
  const overdueCount = filteredVaccinations.filter(v => v.status === 'overdue').length;
  const completedCount = filteredVaccinations.filter(v => v.status === 'completed').length;

  const handleSimulateReminderDispatch = (channel: 'sms' | 'email' | 'push' | 'whatsapp', vax: VaccinationRecord) => {
    const channelNames = {
      sms: '📱 SMS Gateway',
      email: '✉️ Email Service',
      push: '🔔 Mobile Push Notification',
      whatsapp: '💬 WhatsApp Business API',
    };

    const text = `Vaccination Reminder: ${vax.patientName}'s ${vax.vaccineName} (Dose ${vax.doseNumber}/${vax.totalDoses}) is due on ${vax.dueDate}. Zero-wait slot reserved at ${vax.clinicLocation}.`;
    
    setNotificationSentMessage(`Dispatched via ${channelNames[channel]} to patient contact: "${text}"`);
    
    if (onTriggerNotification) {
      onTriggerNotification(
        `Vaccination Alert (${channel.toUpperCase()})`,
        `${vax.vaccineName} due on ${vax.dueDate} for ${vax.patientName}`
      );
    }

    setTimeout(() => {
      setNotificationSentMessage(null);
    }, 6000);
  };

  const handleAddVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;

    const assignedName = selectedPatientFilter !== 'all' ? selectedPatientFilter : newPatientName;
    const newVax: VaccinationRecord = {
      id: `vax-${Date.now()}`,
      patientName: assignedName,
      vaccineName: newVaccineName.trim(),
      category: newCategory,
      doseNumber: 1,
      totalDoses: 1,
      dueDate: newDueDate,
      status: new Date(newDueDate) < new Date('2026-08-27') ? 'overdue' : 'upcoming',
      clinicLocation: 'SafeLife City Hospital - Main Immunization Wing',
      reminderChannels: { sms: true, email: true, push: true, whatsapp: true },
      notes: 'Scheduled via Patient Portal',
    };

    setVaccinations(prev => [newVax, ...prev]);
    setSelectedVaccineId(newVax.id);
    setNewVaccineName('');
    setNotificationSentMessage(`Vaccine record "${newVax.vaccineName}" registered for ${assignedName}!`);
    setTimeout(() => setNotificationSentMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-xs">
            <Syringe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">Patient Immunization &amp; Vaccination Hub</h2>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                ABDM Verified
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Personalized immunization tracking with single-patient profile isolation and automated multi-channel alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Profile Selector / Family Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <User className="w-4 h-4 text-teal-600" />
            <span>Select Patient Profile:</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Viewing immunization schedule for active profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {familyProfiles.map(profile => {
            const isSelected = selectedPatientFilter === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => {
                  setSelectedPatientFilter(profile.id);
                  if (profile.id !== 'all') setNewPatientName(profile.name);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 text-slate-950 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {profile.id.includes('Aarav') ? <Baby className="w-3.5 h-3.5 text-teal-600" /> : <User className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{profile.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{profile.relation}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {profile.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder Dispatch Success Banner */}
      {notificationSentMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notificationSentMessage}</span>
          </div>
          <button 
            onClick={() => setNotificationSentMessage(null)}
            className="text-emerald-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Metric Cards for Active Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Next Upcoming */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Upcoming Doses</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{upcomingCount} Doses</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {upcomingCount > 0 ? 'Reminders active via SMS & WhatsApp' : 'No upcoming doses pending'}
          </p>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs bg-red-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600">Overdue / Priority Action</span>
            <span className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700">{overdueCount} Overdue</div>
          <p className="text-[11px] text-red-600 font-medium mt-1">
            {overdueCount > 0 ? 'Immediate slot reservation recommended' : 'All schedules up to date'}
          </p>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed &amp; Verified</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{completedCount} Immunizations</div>
          <p className="text-[11px] text-slate-500 mt-1">Synced with ABDM Digital Locker</p>
        </div>
      </div>

      {/* Main Content Grid: Left List + Right Detail & Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Vaccination Records List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedPatientFilter === 'all' ? 'Family Vaccination Records' : `${selectedPatientFilter}'s Vaccination Schedule`}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredVaccinations.length} record{filteredVaccinations.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredVaccinations.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-2">
              <Syringe className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No vaccination records found for this profile.</p>
              <p className="text-xs text-slate-500">Use the form below to register a scheduled vaccination or booster dose.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVaccinations.map((vax) => {
                const isSelected = activeVaccine?.id === vax.id;
                const isOverdue = vax.status === 'overdue';
                const isUpcoming = vax.status === 'upcoming';

                return (
                  <div
                    key={vax.id}
                    onClick={() => setSelectedVaccineId(vax.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          isOverdue ? 'bg-red-100 text-red-700' : isUpcoming ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {vax.category === 'Childhood' ? <Baby className="w-4 h-4" /> : <Syringe className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{vax.vaccineName}</h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            <span className="font-semibold text-slate-800">{vax.patientName}</span> • Dose {vax.doseNumber} of {vax.totalDoses}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                        isOverdue 
                          ? 'bg-red-100 text-red-800' 
                          : isUpcoming 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {vax.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                      <div>
                        <span className="text-slate-400 text-[10px]">Due Date:</span>
                        <p className="font-semibold text-slate-800">{vax.dueDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Clinic Location:</span>
                        <p className="font-semibold text-slate-800 truncate">{vax.clinicLocation}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Category:</span>
                        <p className="font-semibold text-teal-700">{vax.category}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add New Vaccine Record Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-teal-600" />
              Register New Vaccination Record
            </h4>

            <form onSubmit={handleAddVaccination} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Vaccine Name:</label>
                <input
                  type="text"
                  placeholder="e.g. HPV Booster / Typhoid / Tetanus..."
                  value={newVaccineName}
                  onChange={(e) => setNewVaccineName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Patient Name:</label>
                <input
                  type="text"
                  value={selectedPatientFilter !== 'all' ? selectedPatientFilter : newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                >
                  <option value="COVID-19">COVID-19 Booster</option>
                  <option value="Childhood">Childhood Immunization</option>
                  <option value="Flu">Annual Flu Shot</option>
                  <option value="Adult Booster">Adult Booster</option>
                  <option value="Travel">Travel Vaccination</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">Due Date:</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Record &amp; Schedule Multi-Channel Reminders
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Selected Vaccine Detail Card & Dispatch Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeVaccine ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Vaccination Certificate &amp; Details</h3>
                </div>
                <button
                  onClick={() => alert(`Official digital immunization certificate for "${activeVaccine.vaccineName}" generated with ABDM QR verification.`)}
                  className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-teal-700">Selected Vaccine</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{activeVaccine.vaccineName}</h4>
                  <p className="text-slate-600 text-[11px] mt-1 font-medium">
                    Patient: <strong className="text-slate-900">{activeVaccine.patientName}</strong> • Dose {activeVaccine.doseNumber} of {activeVaccine.totalDoses}
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <strong className={`uppercase ${
                      activeVaccine.status === 'overdue' ? 'text-red-600' : activeVaccine.status === 'upcoming' ? 'text-blue-600' : 'text-emerald-600'
                    }`}>{activeVaccine.status}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Due Date:</span>
                    <span className="font-semibold text-slate-800">{activeVaccine.dueDate}</span>
                  </div>
                  {activeVaccine.administeredDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Administered On:</span>
                      <span className="font-semibold text-emerald-700">{activeVaccine.administeredDate}</span>
                    </div>
                  )}
                  {activeVaccine.batchNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch / Lot Number:</span>
                      <span className="font-mono text-slate-800">{activeVaccine.batchNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Center:</span>
                    <span className="text-slate-800 font-semibold truncate max-w-[180px] text-right">{activeVaccine.clinicLocation}</span>
                  </div>
                </div>

                {activeVaccine.notes && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    <strong>Clinical Note:</strong> {activeVaccine.notes}
                  </div>
                )}
              </div>

              {/* Multi-Channel Reminder Dispatcher */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-teal-600" />
                    Automated Reminder Dispatch
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Simulate Delivery</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateReminderDispatch('sms', activeVaccine)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Send SMS</span>
                  </button>

                  <button
                    onClick={() => handleSimulateReminderDispatch('whatsapp', activeVaccine)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleSimulateReminderDispatch('push', activeVaccine)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Bell className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Push Notification</span>
                  </button>

                  <button
                    onClick={() => handleSimulateReminderDispatch('email', activeVaccine)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Email Digest</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
              Select a vaccination record from the list to view certificates and dispatch reminders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
