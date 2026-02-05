import { User, UserRole, Patient, Appointment, InventoryItem, Invoice, ClinicalEntry, TreatmentPlan, Consent, StudentLog, CommunityEvent, Location, Diagnosis, ServiceItem, ConsentTemplate } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Admin', email: 'admin@dentalcore.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/100/100' },
  { id: '2', name: 'Dra. Ana Lopez', email: 'ana@dentalcore.com', role: UserRole.DENTIST, specialty: 'Ortodoncia', avatar: 'https://picsum.photos/101/101' },
  { id: '3', name: 'Juan Perez (Est)', email: 'juan@dentalcore.com', role: UserRole.STUDENT, specialty: 'General', avatar: 'https://picsum.photos/102/102' },
  { id: '4', name: 'Maria Recepción', email: 'recepcion@dentalcore.com', role: UserRole.RECEPTIONIST, avatar: 'https://picsum.photos/103/103' },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Carlos Rodriguez', dni: '12345678', birthDate: '1985-05-12', phone: '555-0101', email: 'carlos@email.com', address: 'Calle 123', socialService: false, medicalHistory: ['Hypertension'], allergies: ['Penicillin'] },
  { id: 'p2', name: 'Maria Garcia', dni: '87654321', birthDate: '1992-08-22', phone: '555-0102', email: 'maria@email.com', address: 'Av Principal', socialService: true, medicalHistory: [], allergies: [] },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Anestesia Lidocaína', sku: 'ANES-001', quantity: 50, unit: 'ampollas', minThreshold: 20, expiryDate: '2025-12-01' },
  { id: 'i2', name: 'Guantes Nitrilo M', sku: 'GLOV-M', quantity: 15, unit: 'cajas', minThreshold: 10 },
  { id: 'i3', name: 'Resina Compuesta', sku: 'RES-A2', quantity: 4, unit: 'tubos', minThreshold: 5 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', dentistId: '2', date: new Date().toISOString(), duration: 60, status: 'scheduled', type: 'treatment' },
  { id: 'a2', patientId: 'p2', dentistId: '3', date: new Date(Date.now() + 86400000).toISOString(), duration: 30, status: 'scheduled', type: 'social-service' },
];

export const MOCK_RECORDS: ClinicalEntry[] = [
  { id: 'r1', patientId: 'p1', dentistId: '2', date: '2024-01-15', procedure: 'Limpieza General', notes: 'Paciente con buena higiene. Se recomienda uso de hilo dental.', teethInvolved: [], attachments: [], version: 1, isLocked: true, status: 'final' }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', patientId: 'p1', date: '2024-05-20', amount: 150.00, status: 'paid', items: [{ description: 'Consulta', price: 50 }, { description: 'Limpieza', price: 100 }], electronicInvoiceCode: 'FAC-Electronic-123' },
  { id: 'inv2', patientId: 'p2', date: '2024-05-21', amount: 0.00, status: 'pending', items: [{ description: 'Consulta Social', price: 0 }] } 
];

export const MOCK_PLANS: TreatmentPlan[] = [
  {
    id: 'tp1', patientId: 'p1', name: 'Rehabilitación Oral Completa', totalCost: 1200, status: 'active',
    stages: [
      { id: 's1', description: 'Limpieza y Diagnóstico', cost: 100, status: 'done' },
      { id: 's2', description: 'Blanqueamiento', cost: 300, status: 'in_progress' },
      { id: 's3', description: 'Implante #24', cost: 800, status: 'pending' },
    ]
  }
];

export const MOCK_CONSENTS: Consent[] = [
  { id: 'c1', patientId: 'p1', title: 'Consentimiento Informado General', content: 'Yo, el paciente, autorizo los procedimientos básicos...', isSigned: true, signedAt: '2024-01-10' },
  { id: 'c2', patientId: 'p1', title: 'Consentimiento para Cirugía', content: 'Autorizo la realización de implantes dentales conociendo los riesgos...', isSigned: false }
];

export const MOCK_STUDENT_LOGS: StudentLog[] = [
  { id: 'sl1', studentId: '3', tutorId: '2', patientId: 'p2', procedure: 'Profilaxis', date: '2024-05-22', status: 'pending_approval', hours: 2 },
  { id: 'sl2', studentId: '3', tutorId: '2', patientId: 'p2', procedure: 'Sellantes', date: '2024-05-20', status: 'approved', hours: 1, feedback: 'Buen manejo del paciente.' },
];

export const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
  { id: 'ev1', name: 'Jornada Salud Rural', location: 'Vereda San Juan', date: '2024-06-15', responsibleId: '1', patientsTreated: 0, status: 'planned' },
  { id: 'ev2', name: 'Sonrisas para Todos', location: 'Centro Comunitario Norte', date: '2024-04-10', responsibleId: '2', patientsTreated: 45, status: 'completed' },
];

export const MOCK_LOCATIONS: Location[] = [
  { id: 'l1', name: 'Sede Principal - Centro', address: 'Av. Libertador #45-12', phone: '601-555-0001', status: 'active' },
  { id: 'l2', name: 'Sede Norte - Especialistas', address: 'Calle 100 #15-20', phone: '601-555-0002', status: 'active' },
  { id: 'l3', name: 'Unidad Móvil Rural 1', address: 'Ruta Veredal', phone: '310-555-1234', status: 'inactive' },
];

export const MOCK_DIAGNOSES: Diagnosis[] = [
  { code: 'K02.1', name: 'Caries de la dentina' },
  { code: 'K04.0', name: 'Pulpitis' },
  { code: 'K05.0', name: 'Gingivitis aguda' },
  { code: 'K07.4', name: 'Maloclusión, no especificada' },
  { code: 'K08.1', name: 'Pérdida de dientes debida a accidente, extracción o enfermedad periodontal local' },
];

export const MOCK_SERVICES: ServiceItem[] = [
  { id: 's1', code: 'CONS-001', name: 'Consulta General', category: 'General', basePrice: 50, duration: 30 },
  { id: 's2', code: 'PROF-001', name: 'Profilaxis Adulto', category: 'Prevención', basePrice: 80, duration: 45 },
  { id: 's3', code: 'RES-001', name: 'Resina 1 Superficie', category: 'Restaurativa', basePrice: 120, duration: 45 },
  { id: 's4', code: 'ENDO-UNI', name: 'Endodoncia Uniradicular', category: 'Endodoncia', basePrice: 250, duration: 90 },
];

export const MOCK_CONSENT_TEMPLATES: ConsentTemplate[] = [
  { id: 'ct1', title: 'Consentimiento Informado General', content: 'Yo, [NOMBRE_PACIENTE], declaro que he sido informado sobre los procedimientos básicos, riesgos comunes y alternativas...' },
  { id: 'ct2', title: 'Consentimiento para Cirugía', content: 'Autorizo la realización del procedimiento quirúrgico, habiendo entendido los riesgos específicos de sangrado, infección...' },
  { id: 'ct3', title: 'Consentimiento de Ortodoncia', content: 'Entiendo que el tratamiento de ortodoncia requiere compromiso con la higiene y asistencia a controles...' },
];