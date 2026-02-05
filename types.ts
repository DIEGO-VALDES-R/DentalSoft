export enum UserRole {
  ADMIN = 'admin',
  DENTIST = 'dentist',
  STUDENT = 'student',
  RECEPTIONIST = 'receptionist'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  avatar?: string;
  commissionRate?: number; // Porcentaje de comisión (ej: 0.30 = 30%)
}

export interface Patient {
  id: string;
  name: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  socialService: boolean;
  medicalHistory: string[];
  allergies: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ClinicalEntry {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  procedure: string;
  notes: string;
  teethInvolved?: number[];
  attachments: string[];
  version: number;
  isLocked: boolean;
  status?: 'draft' | 'final';
  diagnosis?: string; // Código CIE-10
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'confirmed';
  type: 'checkup' | 'treatment' | 'emergency' | 'social-service';
  confirmedAt?: string;
  cancelReason?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate?: string;
  supplierId?: string;
  lastRestockDate?: string;
  costPerUnit?: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'factus_submitted' | 'partially_paid';
  items: { description: string; price: number; serviceId?: string }[];
  electronicInvoiceCode?: string;
  paidAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'insurance';
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  name: string;
  totalCost: number;
  status: 'active' | 'completed' | 'draft' | 'cancelled';
  createdDate: string;
  stages: {
    id: string;
    description: string;
    cost: number;
    status: 'pending' | 'in_progress' | 'done';
    teethInvolved?: number[];
    scheduledDate?: string;
  }[];
}

export interface Consent {
  id: string;
  patientId: string;
  title: string;
  content: string;
  signedAt?: string;
  isSigned: boolean;
  dentistId?: string;
  procedure?: string;
}

export interface StudentLog {
  id: string;
  studentId: string;
  tutorId: string;
  patientId: string;
  procedure: string;
  date: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  feedback?: string;
  hours: number;
  grade?: number; // 1-5
}

export interface CommunityEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  responsibleId: string;
  patientsTreated: number;
  status: 'planned' | 'completed';
  volunteers?: string[]; // User IDs
  budget?: number;
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
  duration: number;
  requiresMaterials?: string[]; // Inventory item IDs
}

export interface ConsentTemplate {
  id: string;
  title: string;
  content: string;
}

// ============== NUEVOS TIPOS ==============

export interface Odontogram {
  id: string;
  patientId: string;
  lastUpdated: string;
  teeth: {
    [toothNumber: number]: ToothState;
  };
}

export interface ToothState {
  number: number;
  status: 'healthy' | 'caries' | 'filled' | 'crown' | 'missing' | 'endodontic' | 'implant' | 'fracture' | 'extraction_planned';
  surfaces?: {
    vestibular?: SurfaceCondition;
    lingual?: SurfaceCondition;
    mesial?: SurfaceCondition;
    distal?: SurfaceCondition;
    oclusal?: SurfaceCondition;
  };
  notes?: string;
  history: {
    date: string;
    procedure: string;
    dentistId: string;
  }[];
}

export type SurfaceCondition = 'healthy' | 'caries' | 'filled' | 'fracture';

export interface ClinicalPhoto {
  id: string;
  patientId: string;
  recordId?: string;
  type: 'intraoral' | 'extraoral' | 'radiografia' | 'rx_panoramica' | 'modelo';
  view: 'frontal' | 'lateral_der' | 'lateral_izq' | 'oclusal_sup' | 'oclusal_inf' | 'sonrisa' | 'perfil';
  date: string;
  tags: string[];
  url: string;
  annotations?: {
    type: 'arrow' | 'circle' | 'text';
    x: number;
    y: number;
    text?: string;
  }[];
}

export interface Prescription {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  diagnosis: string;
  medications: {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  isSigned: boolean;
  signedAt?: string;
}

export interface MedicalExcuse {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  diagnosis: string;
  daysOff: number;
  startDate: string;
  endDate: string;
  notes?: string;
  isSigned: boolean;
}

export interface Reminder {
  id: string;
  patientId: string;
  type: 'appointment' | 'payment' | 'follow_up' | 'birthday' | 'treatment_continuation';
  scheduledDate: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  channel: 'email' | 'sms' | 'whatsapp';
  message: string;
  sentAt?: string;
}

export interface PaymentPlan {
  id: string;
  invoiceId: string;
  patientId: string;
  totalAmount: number;
  downPayment: number;
  installments: {
    id: string;
    number: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
    paymentMethod?: string;
  }[];
  interestRate?: number;
}

export interface AccountReceivable {
  patientId: string;
  patientName: string;
  totalDebt: number;
  overdueDebt: number;
  nextPaymentDue: string;
  lastPaymentDate?: string;
  invoices: {
    invoiceId: string;
    amount: number;
    status: string;
  }[];
}

export interface Commission {
  id: string;
  dentistId: string;
  period: string; // 'YYYY-MM'
  services: {
    id: string;
    serviceId: string;
    serviceName: string;
    patientId: string;
    patientName: string;
    date: string;
    basePrice: number;
    commissionRate: number;
    amount: number;
  }[];
  totalCommission: number;
  baseSalary?: number;
  totalPaid: number;
  status: 'pending' | 'paid' | 'processing';
  paidDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  productsSupplied: string[]; // Inventory item IDs
  rating?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled' | 'partially_received';
  orderDate: string;
  expectedDelivery?: string;
  receivedDate?: string;
  notes?: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'low_stock' | 'payment_overdue' | 'appointment_cancelled' | 'student_log_pending' | 'appointment_reminder' | 'new_patient';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DentistSchedule {
  id: string;
  dentistId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isActive: boolean;
  locationId?: string;
  breakTime?: {
    start: string;
    end: string;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'view';
  module: 'patients' | 'appointments' | 'billing' | 'inventory' | 'records' | 'admin';
  recordId: string;
  recordType: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: string;
  ipAddress?: string;
}

export interface KPI {
  period: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  averageTicket: number;
  newPatients: number;
  occupancyRate: number;
  topServices: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }[];
  dentistPerformance: {
    dentistId: string;
    dentistName: string;
    appointmentsCompleted: number;
    revenue: number;
    patientsSeen: number;
  }[];
}
