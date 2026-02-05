export enum UserRole {
  ADMIN = 'admin',
  DENTIST = 'dentist',
  STUDENT = 'student', // For social service/internships
  RECEPTIONIST = 'receptionist'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  socialService: boolean; // Is this a community service case?
  medicalHistory: string[];
  allergies: string[];
}

export interface ClinicalEntry {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  procedure: string;
  notes: string;
  teethInvolved?: number[];
  attachments: string[]; // URLs to Rx/Photos
  version: number; // For auditing changes
  isLocked: boolean; // If true, cannot be edited
  status?: 'draft' | 'final';
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  date: string; // ISO string
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'checkup' | 'treatment' | 'emergency' | 'social-service';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'factus_submitted';
  items: { description: string; price: number }[];
  electronicInvoiceCode?: string; // CUFE from Factus
}

// --- NEW TYPES FOR EXTENDED MODULES ---

export interface TreatmentPlan {
  id: string;
  patientId: string;
  name: string; // e.g. "Ortodoncia Fase 1"
  totalCost: number;
  status: 'active' | 'completed' | 'draft';
  stages: {
    id: string;
    description: string;
    cost: number;
    status: 'pending' | 'in_progress' | 'done';
  }[];
}

export interface Consent {
  id: string;
  patientId: string;
  title: string;
  content: string;
  signedAt?: string;
  isSigned: boolean;
}

export interface StudentLog {
  id: string;
  studentId: string;
  tutorId: string; // The dentist responsible
  patientId: string;
  procedure: string;
  date: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  feedback?: string;
  hours: number;
}

export interface CommunityEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  responsibleId: string;
  patientsTreated: number;
  status: 'planned' | 'completed';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Diagnosis {
  code: string;
  name: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  basePrice: number;
  duration: number; // standard duration in minutes
}

export interface ConsentTemplate {
  id: string;
  title: string;
  content: string;
}