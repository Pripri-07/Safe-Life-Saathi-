import React, { useState } from 'react';
import {
  AppTab,
  UserRole,
  Ambulance,
  Vehicle,
  OPDToken,
  Prescription,
  VaccinationRecord,
  CorridorActivityLog
} from './types';
import {
  INITIAL_AMBULANCE,
  INITIAL_VEHICLES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_OPD_TOKENS as INITIAL_TOKENS,
  INITIAL_PRESCRIPTION,
  INITIAL_VACCINATIONS
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AmbulanceRoadClearance } from './components/AmbulanceRoadClearance';
import { DriverMobileAlert } from './components/DriverMobileAlert';
import { MediAIChatbot } from './components/MediAIChatbot';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { PatientQueueSystem } from './components/PatientQueueSystem';
import { VaccinationReminder } from './components/VaccinationReminder';
import {
  PatientDashboard,
  DoctorDashboard,
  HospitalAdminDashboard,
  EmergencyControlCenterDashboard
} from './components/Dashboards';
// import { ArchitecturePage } from './components/ArchitecturePage';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Global Interactive Data State
  const [ambulance, setAmbulance] = useState<Ambulance>(INITIAL_AMBULANCE);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [activityLogs, setActivityLogs] = useState<CorridorActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [selectedDriverVehicleId, setSelectedDriverVehicleId] = useState<string>('veh-ka-1');
  const [isSimulatingAmbulance, setIsSimulatingAmbulance] = useState<boolean>(false);
  const [tokens, setTokens] = useState<OPDToken[]>(INITIAL_TOKENS);
  const [userRegisteredTokenId, setUserRegisteredTokenId] = useState<string | null>(() => {
    return localStorage.getItem('safelife_user_token_id') || null;
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([INITIAL_PRESCRIPTION]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(INITIAL_VACCINATIONS);
  const [selectedDeptForBooking, setSelectedDeptForBooking] = useState<string>('General Medicine');

  // Active uncleared vehicles in 500m forward zone
  const activeAlertCount = vehicles.filter(v => (v.isIn500mForwardZone || v.isIn300mForwardZone) && !v.isCleared).length;

  const handleSelectDepartmentForBooking = (dept: string) => {
    setSelectedDeptForBooking(dept);
  };

  const handlePrescriptionSaved = (newRx: Prescription) => {
    setPrescriptions(prev => [newRx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">

      {/* Universal Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        emergencyAlertActive={activeAlertCount > 0}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* 1. Landing Page */}
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            ambulance={ambulance}
            tokens={tokens}
          />
        )}

        {/* 2. Flagship: 500m Smart Ambulance Road Clearance Radar Map */}
        {activeTab === 'ambulance-clearance' && (
          <AmbulanceRoadClearance
            ambulance={ambulance}
            setAmbulance={setAmbulance}
            vehicles={vehicles}
            setVehicles={setVehicles}
            activityLogs={activityLogs}
            setActivityLogs={setActivityLogs}
            isSimulating={isSimulatingAmbulance}
            setIsSimulating={setIsSimulatingAmbulance}
            setActiveTab={setActiveTab}
            soundEnabled={soundEnabled}
            onOpenDriverView={(vehId) => {
              if (vehId) setSelectedDriverVehicleId(vehId);
              setActiveTab('driver-alert');
            }}
          />
        )}

        {/* 3. In-Car Driver Warning Alert Screen */}
        {activeTab === 'driver-alert' && (
          <DriverMobileAlert
            ambulance={ambulance}
            vehicles={vehicles}
            setVehicles={setVehicles}
            activityLogs={activityLogs}
            setActivityLogs={setActivityLogs}
            selectedVehicleId={selectedDriverVehicleId}
            setSelectedVehicleId={setSelectedDriverVehicleId}
            setActiveTab={setActiveTab}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        )}

        {/* 4. MediAI Patient Symptom OPD Chatbot */}
        {(activeTab === 'ai-chatbot' || activeTab === 'ai-assistant') && (
          <MediAIChatbot
            onSelectDepartmentForBooking={handleSelectDepartmentForBooking}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 5. AI Prescription OCR & Plain-Language Explainer */}
        {(activeTab === 'prescription-scanner' || activeTab === 'prescriptions') && (
          <PrescriptionScanner
            onPrescriptionSaved={handlePrescriptionSaved}
          />
        )}

        {/* 6. Smart Patient Queue & Digital Token System */}
        {activeTab === 'queue-system' && (
          <PatientQueueSystem
            tokens={tokens}
            setTokens={setTokens}
            selectedDept={selectedDeptForBooking}
            soundEnabled={soundEnabled}
            userRegisteredTokenId={userRegisteredTokenId}
            setUserRegisteredTokenId={setUserRegisteredTokenId}
          />
        )}

        {/* 7. Smart Vaccination Reminder & Immunization Hub */}
        {(activeTab === 'vaccination-reminder' || activeTab === 'vaccinations') && (
          <VaccinationReminder
            vaccinations={vaccinations}
            setVaccinations={setVaccinations}
          />
        )}

        {/* 8. Role-Based Dashboards */}
        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            {/* Role Sub-Navigation Switcher */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentRole('patient')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentRole === 'patient'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                👤 Patient Portal
              </button>

              <button
                onClick={() => setCurrentRole('doctor')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentRole === 'doctor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                🩺 Doctor Console
              </button>

              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                🏢 Hospital Admin
              </button>

              <button
                onClick={() => setCurrentRole('emergency')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentRole === 'emergency'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                🚨 Emergency Control HQ
              </button>
            </div>

            {/* Render Role-Specific Component */}
            {currentRole === 'patient' && (
              <PatientDashboard
                ambulance={ambulance}
                tokens={tokens}
                prescriptions={prescriptions}
                vaccinations={vaccinations}
                setActiveTab={setActiveTab}
                userRegisteredTokenId={userRegisteredTokenId}
              />
            )}

            {currentRole === 'doctor' && (
              <DoctorDashboard
                ambulance={ambulance}
                tokens={tokens}
                prescriptions={prescriptions}
                vaccinations={vaccinations}
                setActiveTab={setActiveTab}
              />
            )}

            {currentRole === 'admin' && (
              <HospitalAdminDashboard
                ambulance={ambulance}
                tokens={tokens}
                prescriptions={prescriptions}
                vaccinations={vaccinations}
                setActiveTab={setActiveTab}
              />
            )}

            {currentRole === 'emergency' && (
              <EmergencyControlCenterDashboard
                ambulance={ambulance}
                tokens={tokens}
                prescriptions={prescriptions}
                vaccinations={vaccinations}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        )}

        {/* 9. System Architecture & Topology View */}
        {/* {activeTab === 'architecture' && (
          <ArchitecturePage />
        )} */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SafeLifeSaathi</span>
            <span>– Smart System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Aadhaar / ABHA Ready</span>
            <span>•</span>
            <span>V2V Geofencing</span>
            <span>•</span>
            <span>SafeLifeSaathi Healthcare</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
