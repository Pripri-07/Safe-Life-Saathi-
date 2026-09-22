import React from 'react';
import {
  HeartPulse,
  Siren,
  Bot,
  FileText,
  Users,
  Syringe,
  LayoutDashboard,
  Activity,
  Smartphone,
  Network,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  Building2,
  Car,
  Heart
} from 'lucide-react';
import { AppTab, UserRole } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
  currentRole?: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  isAmbulanceSimulating?: boolean;
  emergencyAlertActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole: propUserRole,
  setUserRole: propSetUserRole,
  currentRole,
  setCurrentRole,
  soundEnabled,
  setSoundEnabled,
  unreadCount = 0,
  onOpenNotifications,
  isAmbulanceSimulating = false,
  emergencyAlertActive = false,
}) => {
  const userRole = currentRole || propUserRole || 'patient';
  const setUserRole = setCurrentRole || propSetUserRole || (() => { });
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    // { id: 'landing', label: 'Home', icon: <HeartPulse className="w-4 h-4" /> },
    {
      id: 'ambulance-clearance',
      label: 'Ambulance Alert',
      icon: <Siren className="w-4 h-4 text-red-500 animate-pulse" />,
      badge: 'Live GPS'
    },
    { id: 'ai-assistant', label: 'ZivaSaathi', icon: <Heart className="w-4 h-4 text-red-600" />, badge: 'AI OPD' },
    { id: 'prescriptions', label: 'Prescription OCR', icon: <FileText className="w-4 h-4 text-blue-600" /> },
    { id: 'queue-system', label: 'OPD Queue', icon: <Users className="w-4 h-4 text-emerald-600" /> },
    { id: 'vaccinations', label: 'Vaccinations', icon: <Syringe className="w-4 h-4 text-teal-600" /> },
  ];

  const rolePortals: { role: UserRole; tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { role: 'patient', tab: 'patient-portal', label: 'Patient Portal', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { role: 'doctor', tab: 'doctor-portal', label: 'Doctor Portal', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { role: 'admin', tab: 'admin-portal', label: 'Admin Analytics', icon: <Building2 className="w-3.5 h-3.5" /> },
    { role: 'emergency', tab: 'emergency-center', label: 'Emergency Hub', icon: <Activity className="w-3.5 h-3.5 text-red-500" /> },
    { role: 'driver', tab: 'driver-alert', label: 'Driver App (500m)', icon: <Car className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top emergency status bar if simulation is active */}
      {isAmbulanceSimulating && (
        <div className="bg-red-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>🚨 <strong>ACTIVE AMBULANCE DISPATCH:</strong> AMB-1024 en route to City Hospital. Forward geofence notification active.</span>
            <button
              onClick={() => setActiveTab('ambulance-clearance')}
              className="ml-auto underline hover:text-red-100 flex items-center text-[11px]"
            >
              View Radar Map <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SafeLife<span className="text-blue-600">Saathi</span></span>
              </div>
              {/* <p className="text-[11px] text-slate-500 hidden sm:block">Real-Time Hospital Management</p> */}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${link.badge === 'Live GPS' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher, Sound, Notifications, Mobile Menu */}
          <div className="flex items-center gap-2">

            {/* Role Dropdown / Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
                Role:
              </span>
              <select
                aria-label="Select User Role"
                value={userRole}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setUserRole(newRole);
                  const matched = rolePortals.find(r => r.role === newRole);
                  if (matched) setActiveTab(matched.tab);
                }}
                className="bg-white text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 shadow-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="patient">👤 Patient Portal</option>
                <option value="doctor">🩺 Doctor Console</option>
                <option value="admin">🏢 Hospital Admin</option>
                <option value="emergency">🚨 Emergency Hub</option>
                <option value="driver">🚗 In-Car Driver View</option>
              </select>
            </div>

            {/* Architecture Link Button */}
            {/* <button
              onClick={() => setActiveTab('architecture')}
              title="System Architecture & Security"
              className={`p-2 rounded-lg text-xs font-medium transition-colors hidden md:flex items-center gap-1 border ${activeTab === 'architecture'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
            >
              <Network className="w-4 h-4 text-indigo-500" />
              <span className="hidden xl:inline">System Architecture</span>
            </button> */}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted'}
              className={`p-2 rounded-lg border text-xs transition-colors ${soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Main Navigation</div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border ${activeTab === link.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
              >
                {link.icon}
                <span className="truncate">{link.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">Role Portals</div>
          <div className="grid grid-cols-2 gap-2">
            {rolePortals.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setUserRole(r.role);
                  setActiveTab(r.tab);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border ${userRole === r.role && activeTab === r.tab
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
              >
                {r.icon}
                <span className="truncate">{r.label}</span>
              </button>
            ))}
          </div>

          {/* <div className="pt-2">
            <button
              onClick={() => {
                setActiveTab('architecture');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Network className="w-4 h-4" />
              <span>View System Architecture & Security</span>
            </button>
          </div> */}
        </div>
      )}
    </header>
  );
};
