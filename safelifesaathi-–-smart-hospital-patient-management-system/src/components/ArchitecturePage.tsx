// import React from 'react';
// import {
//   Layers,
//   Cpu,
//   Database,
//   ShieldCheck,
//   Radio,
//   Bot,
//   FileText,
//   Users,
//   Syringe,
//   Siren,
//   Activity,
//   Lock,
//   Server,
//   Zap,
//   ArrowRight,
//   CheckCircle2
// } from 'lucide-react';

// export const ArchitecturePage: React.FC = () => {
//   return (
//     <div className="max-w-6xl mx-auto space-y-8 py-4">

//       {/* Header Banner */}
//       <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-3">
//         <div className="flex items-center gap-2">
//           <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
//             <Cpu className="w-5 h-5" />
//           </span>
//           <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
//             Enterprise System Architecture & Data Flow
//           </span>
//         </div>
//         <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
//           SafeLifeSaathi Full-Stack System Topology
//         </h1>
//         <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
//           High-throughput, event-driven healthcare infrastructure combining real-time GNSS telemetry, forward spatial geofencing algorithms, and multimodal clinical reasoning.
//         </p>
//       </div>

//       {/* 3-Tier Layer Architecture Visualization */}
//       <div className="space-y-6">

//         {/* Layer 1: Client Edge & Ingress */}
//         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
//           <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//             <div className="flex items-center gap-2">
//               <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
//                 01
//               </span>
//               <h3 className="font-bold text-slate-900 text-sm">Edge Clients & Ingress Layer</h3>
//             </div>
//             <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
//               Mobile PWA / Web / V2X Devices
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
//               <span className="font-bold text-slate-900 block mb-1">Patient Portal PWA</span>
//               <p className="text-[11px] text-slate-500">Live queue token tracking, symptom triage, prescription explanations.</p>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
//               <span className="font-bold text-slate-900 block mb-1">Driver In-Car HUD</span>
//               <p className="text-[11px] text-slate-500">V2X low-latency emergency alerts, 500m forward cone notifications.</p>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
//               <span className="font-bold text-slate-900 block mb-1">Doctor OPD Console</span>
//               <p className="text-[11px] text-slate-500">One-click token calling, patient records, electronic prescriptions.</p>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
//               <span className="font-bold text-slate-900 block mb-1">Waiting Lounge TV</span>
//               <p className="text-[11px] text-slate-500">Electronic LED token display board with synthesized audio voice chimes.</p>
//             </div>
//           </div>
//         </div>

//         {/* Layer 2: Real-time Microservices & AI Processing Core */}
//         <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 text-white shadow-xl space-y-4">
//           <div className="flex items-center justify-between border-b border-slate-800 pb-3">
//             <div className="flex items-center gap-2">
//               <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
//                 02
//               </span>
//               <h3 className="font-bold text-white text-sm">Real-Time Core & AI Microservices</h3>
//             </div>
//             <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2 py-0.5 rounded-full">
//               Node.js + Express + SDK
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
//             {/* 500m Geofence Engine */}
//             <div className="bg-slate-900 p-4 rounded-2xl border border-red-900/50 space-y-2">
//               <div className="flex items-center gap-2 text-red-400 font-bold">
//                 <Siren className="w-4 h-4" />
//                 <span>Geofence Engine</span>
//               </div>
//               <p className="text-[11px] text-slate-300">
//                 Spatial vector arithmetic filtering out vehicles behind or in opposite lanes with extended 500m radar cone. 0.0% false alarms.
//               </p>
//             </div>

//             {/* MediAI Triage */}
//             <div className="bg-slate-900 p-4 rounded-2xl border border-purple-900/50 space-y-2">
//               <div className="flex items-center gap-2 text-purple-400 font-bold">
//                 <Bot className="w-4 h-4" />
//                 <span>Multimodal Triage</span>
//               </div>
//               <p className="text-[11px] text-slate-300">
//                 Clinical symptom NLP semantic matching to 12+ hospital OPD departments and specialty clinics.
//               </p>
//             </div>

//             {/* OCR Vision Explainer */}
//             <div className="bg-slate-900 p-4 rounded-2xl border border-blue-900/50 space-y-2">
//               <div className="flex items-center gap-2 text-blue-400 font-bold">
//                 <FileText className="w-4 h-4" />
//                 <span>Prescription OCR Engine</span>
//               </div>
//               <p className="text-[11px] text-slate-300">
//                 Structured medicine dosage extraction with plain-language patient translation and warning alerts.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Layer 3: Persistence & National Health Integration */}
//         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
//           <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//             <div className="flex items-center gap-2">
//               <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
//                 03
//               </span>
//               <h3 className="font-bold text-slate-900 text-sm">Persistence, ABDM & Security Framework</h3>
//             </div>
//             <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
//               HIPAA Compliant & ABDM M1/M2/M3
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2">
//               <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
//               <div>
//                 <strong className="text-slate-800 block">End-to-End Encryption</strong>
//                 <p className="text-[11px] text-slate-500">AES-256 at rest, TLS 1.3 in transit for all PHI patient health records.</p>
//               </div>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2">
//               <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
//               <div>
//                 <strong className="text-slate-800 block">ABDM Health Locker</strong>
//                 <p className="text-[11px] text-slate-500">Instant synchronization with Ayushman Bharat Digital Mission (ABHA) IDs.</p>
//               </div>
//             </div>

//             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2">
//               <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
//               <div>
//                 <strong className="text-slate-800 block">Role-Based Access (RBAC)</strong>
//                 <p className="text-[11px] text-slate-500">Isolated clearance levels for patients, consulting physicians, and hospital admins.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
