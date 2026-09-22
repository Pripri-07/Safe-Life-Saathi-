import React from 'react';
import {
  Siren,
  FileText,
  Users,
  Syringe,
  ShieldCheck,
  ArrowRight,
  Play,
  Sparkles,
  Clock,
  CheckCircle2,
  Activity,
  Radio,
  Building2,
  ChevronRight,
  Heart
} from 'lucide-react';
import { AppTab, Ambulance, OPDToken } from '../types';

interface LandingPageProps {
  setActiveTab: (tab: AppTab) => void;
  ambulance: Ambulance;
  tokens: OPDToken[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActiveTab,
  ambulance,
  tokens,
}) => {
  const currentServingToken = tokens.find(t => t.status === 'consulting') || tokens[0];

  return (
    <div className="space-y-16 py-4">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:py-12">
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold tracking-normal shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Comprehensive Hospital Operations & Emergency Medical Mobility</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Precision Healthcare Delivery &amp; Real-Time Emergency Transit.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            A unified clinical operations system connecting ZivaSaathi AI symptom triage, dynamic zero-wait OPD queues, instant prescription translation, scheduled family immunization, and directional emergency corridor clearance.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('ambulance-clearance')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Siren className="w-4 h-4" />
              <span>Emergency Radar Simulation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('ai-chatbot')}
              className="px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              <span>ZivaSaathi Clinical Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('queue-system')}
              className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Live OPD Queue Dashboard</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive Mini-Showcase Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: 500m Ambulance Alert */}
          <div
            onClick={() => setActiveTab('ambulance-clearance')}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-red-300 hover:bg-red-50/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                <Siren className="w-5 h-5" />
              </span>
              <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200">
                GEOFENCE⚡
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Ambulance Notifier</h3>
            <p className="text-xs text-slate-500 mt-1">
              Directional V2V spatial geofence alerting forward vehicles to yield the right-of-way.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-red-600">
              <span>View Radar Map</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI Symptom OPD Triage */}
          <div
            onClick={() => setActiveTab('ai-chatbot')}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 hover:bg-purple-50/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                <Heart className="w-5 h-5" />
              </span>
              <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                ZIVASAATHI AI❤️‍🩹
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Smart OPD Triage</h3>
            <p className="text-xs text-slate-500 mt-1">
              Conversational symptom evaluation routing patients to General Medicine, Ortho, or ENT.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Consult ZivaSaathi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Prescription Scanner */}
          <div
            onClick={() => setActiveTab('prescription-scanner')}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:bg-blue-50/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                OCR VISION🔍
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Prescription Explainer</h3>
            <p className="text-xs text-slate-500 mt-1">
              Converts doctor handwriting and dosages into easy, scheduled daily routines.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Upload Prescription</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Smart Patient Queue */}
          <div
            onClick={() => setActiveTab('queue-system')}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                TOKEN {currentServingToken.tokenNumber} 📃
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Live Token Queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              Zero-wait queue forecasts, doctor call consoles, and hospital audio announcements.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Track Queue Live</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CORE 6 INTEGRATED MODULES */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Integrated Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            A Complete Hospital Management Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Siren className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Ambulance Road Clearance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time GNSS positioning combined with forward directional geofencing. Only vehicles ahead on the same route and same direction receive emergency alerts, ensuring zero false alarms for opposite traffic.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Dynamic forward cone boundary
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                In-car mobile driver notifications & beeps
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ZivaSaathi Clinical OPD Triage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by clinical reasoning, ZivaSaathi interviews patients about their symptoms in natural language, maps clinical complaints to the correct hospital department, and prepares consultation notes for their doctor.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                Direct token pre-fill and booking
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                Transparent medical disclaimer protocols
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Intelligent Prescription Explainer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Translates medical abbreviations and doctor dosages into plain-language schedules with precautions, timings, and dietary warnings.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Extracts drug, dose, frequency, and duration
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Clear doctor authority preservation
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <Syringe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Vaccination Reminder Hub
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-channel notification engine (SMS, WhatsApp, Push, Email) computing exact due dates with family member profile isolation for childhood vaccines, flu shots, and adult boosters.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                ABDM CoWIN/U-WIN certificate integration
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Individual family member profiles
              </li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Intelligent OPD Queue & Token System
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminates crowded waiting halls through live progress indicators, department-wise priority queues, doctor call consoles, and electronic display board modes.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Real-time estimated wait time calculation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Voice chime synthesis for patient calls
              </li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Command Dashboards &amp; Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored operational workstations for Patients, Consulting Doctors, Hospital Administrators, and Emergency Trauma Dispatch Teams.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                ICU/OT bed availability counters
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                OPD traffic charts and department trends
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
