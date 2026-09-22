export type UserRole = 'patient' | 'doctor' | 'staff' | 'admin' | 'emergency' | 'driver';

export type AppTab = 
  | 'landing'
  | 'ambulance-clearance'
  | 'ai-assistant'
  | 'ai-chatbot'
  | 'prescriptions'
  | 'prescription-scanner'
  | 'queue-system'
  | 'vaccinations'
  | 'vaccination-reminder'
  | 'dashboards'
  | 'patient-portal'
  | 'doctor-portal'
  | 'admin-portal'
  | 'emergency-center'
  | 'driver-alert'
  | 'architecture'
  | 'notifications';

export interface Vehicle {
  id: string;
  plate: string;
  type: 'sedan' | 'suv' | 'hatchback' | 'truck' | 'auto' | 'bus' | 'bike';
  color: string;
  lane?: string; // e.g. "Lane 1", "Lane 2", "Lane 3"
  ambulanceId?: string; // e.g. "AMB-047", "AMB-031", "AMB-019", "AMB-1024"
  timeAgo?: string; // e.g. "1m ago", "3m ago"
  status?: 'non-compliant' | 'cleared' | 'notified' | 'pending';
  isNonCompliant?: boolean;
  reminderCount?: number;
  roadName?: string;
  // Position along route (0 to 1000m coordinate system)
  distanceAlongRoute: number; // in meters along the road (0 = start, 1000 = hospital)
  lateralOffset: number; // lane: -1 (left lane), 0 (center lane), 1 (right lane), 2 (emergency shoulder)
  speedKmh: number;
  direction: 'same' | 'opposite';
  isAhead: boolean;
  distanceToAmbulance: number; // meters
  isIn500mForwardZone: boolean;
  isIn300mForwardZone?: boolean; // legacy alias
  isNotified: boolean;
  isCleared: boolean; // moved to shoulder
  acknowledgedAt?: string;
}

export interface CorridorActivityLog {
  id: string;
  type: 'reroute' | 'non-compliant' | 'signal-override' | 'lane-cleared' | 'corridor-activated' | 'signal-fault' | 'reminder-sent';
  message: string;
  timestamp: string;
  source: string; // e.g. 'System', 'AMB-047', 'AMB-031', 'AMB-019', 'Network'
  ambulanceId?: string;
  severity?: 'critical' | 'warning' | 'info' | 'success';
}

export interface Ambulance {
  id: string;
  driverName: string;
  paramedic: string;
  destinationHospital: string;
  currentRoad: string;
  locationCoord: { x: number; y: number; lat: number; lng: number };
  distanceAlongRoute: number; // in meters (0 to 1000)
  speedKmh: number;
  directionHeading: number; // degrees
  emergencyPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  etaMinutes: string;
  vehiclesIn500mZone: number;
  vehiclesIn300mZone?: number; // legacy alias
  vehiclesNotified: number;
  roadStatus: 'CLEAR' | 'CLEARING' | 'CONGESTED';
  patientVitals: {
    condition: string;
    heartRate: string;
    spO2: string;
    bp: string;
    temperature: string;
  };
}

export interface DepartmentSchedule {
  id: string;
  name: string;
  code: string;
  avgConsultationMinutes: number;
  scheduleHours: string;
  roomNumber: string;
  doctorName: string;
  specialty: string;
  floor: string;
  daysActive: string;
}

export interface OPDToken {
  id: string;
  tokenNumber: string; // e.g. "GM-101", "CARD-102"
  patientName: string;
  patientAge: number;
  gender: string;
  department: string;
  doctorName: string;
  roomNumber: string;
  tokenType: 'online' | 'walk-in';
  issueTime: string;
  status: 'waiting' | 'called' | 'consulting' | 'completed' | 'hold' | 'skipped';
  estimatedWaitMinutes: number;
  patientsAhead: number;
  priority: 'Normal' | 'Elderly/Special' | 'Emergency Priority';
}

export interface MedicineItem {
  name: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "Twice daily (1-0-1)"
  duration: string; // e.g. "3 days"
  instruction: string; // e.g. "After food"
  timing: string; // e.g. "Morning & Night"
  purpose: string;
  warnings?: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  medicines: MedicineItem[];
  simpleExplanation: string;
  precautions: string[];
  questionsForDoctor: string[];
  doctorAuthorityNotice: string;
  scannedImageUrl?: string;
  verifiedByDoctor: boolean;
}

export interface VaccinationRecord {
  id: string;
  patientName: string;
  vaccineName: string;
  category: 'COVID-19' | 'Flu' | 'Childhood' | 'Adult Booster' | 'Travel' | 'Maternal';
  doseNumber: number;
  totalDoses: number;
  dueDate: string; // e.g. "2026-09-15"
  administeredDate?: string;
  status: 'upcoming' | 'overdue' | 'completed';
  clinicLocation: string;
  batchNumber?: string;
  reminderChannels: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  recommendedDepartment?: string;
  urgency?: 'Routine' | 'Priority' | 'Emergency';
  recommendedDoctors?: string[];
  suggestedActions?: string[];
  questionsForDoctor?: string[];
  disclaimer?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'ambulance' | 'vaccination' | 'queue' | 'appointment' | 'prescription' | 'hospital-emergency';
  timestamp: string;
  read: boolean;
  priority: 'critical' | 'high' | 'normal';
  actionTab?: AppTab;
}

export interface HospitalStats {
  totalPatientsToday: number;
  opdVisits: number;
  emergencyCases: number;
  activeQueues: number;
  activeAmbulances: number;
  avgWaitTimeMin: number;
  vaccinationsDue: number;
}
