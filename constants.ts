import { 
  User, UserRole, Patient, Appointment, InventoryItem, Invoice, ClinicalEntry, 
  TreatmentPlan, Consent, StudentLog, CommunityEvent, Location, Diagnosis, 
  ServiceItem, ConsentTemplate, Prescription, MedicalExcuse, PaymentPlan,
  Odontogram, ClinicalPhoto, Supplier, PurchaseOrder, Notification, DentistSchedule
} from './types';

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Dr. Admin', 
    email: 'admin@dentalcore.com', 
    role: UserRole.ADMIN, 
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0284c7',
    commissionRate: 0.20
  },
  { 
    id: '2', 
    name: 'Dra. Ana Lopez', 
    email: 'ana@dentalcore.com', 
    role: UserRole.DENTIST, 
    specialty: 'Ortodoncia', 
    avatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=10b981',
    commissionRate: 0.35
  },
  { 
    id: '3', 
    name: 'Juan Perez (Est)', 
    email: 'juan@dentalcore.com', 
    role: UserRole.STUDENT, 
    specialty: 'General', 
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=f59e0b',
    commissionRate: 0.15
  },
  { 
    id: '4', 
    name: 'Maria Recepción', 
    email: 'recepcion@dentalcore.com', 
    role: UserRole.RECEPTIONIST, 
    avatar: 'https://ui-avatars.com/api/?name=Maria&background=8b5cf6'
  },
  { 
    id: '5', 
    name: 'Dr. Carlos Mendez', 
    email: 'carlos@dentalcore.com', 
    role: UserRole.DENTIST, 
    specialty: 'Endodoncia', 
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendez&background=ec4899',
    commissionRate: 0.40
  },
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'p1', 
    name: 'Carlos Rodriguez', 
    dni: '12345678', 
    birthDate: '1985-05-12', 
    phone: '555-0101', 
    email: 'carlos@email.com', 
    address: 'Calle 123 #45-67', 
    socialService: false, 
    medicalHistory: ['Hypertension'], 
    allergies: ['Penicillin'],
    emergencyContact: { name: 'Laura Rodriguez', phone: '555-0102', relationship: 'Esposa' }
  },
  { 
    id: 'p2', 
    name: 'Maria Garcia', 
    dni: '87654321', 
    birthDate: '1992-08-22', 
    phone: '555-0102', 
    email: 'maria@email.com', 
    address: 'Av Principal #12-34', 
    socialService: true, 
    medicalHistory: [], 
    allergies: []
  },
  { 
    id: 'p3', 
    name: 'Pedro Martinez', 
    dni: '11223344', 
    birthDate: '1978-03-15', 
    phone: '555-0103', 
    email: 'pedro@email.com', 
    address: 'Carrera 7 #89-01', 
    socialService: false, 
    medicalHistory: ['Diabetes Type 2'], 
    allergies: ['Latex']
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: 'i1', 
    name: 'Anestesia Lidocaína', 
    sku: 'ANES-001', 
    quantity: 50, 
    unit: 'ampollas', 
    minThreshold: 20, 
    expiryDate: '2025-12-01',
    supplierId: 's1',
    costPerUnit: 2.50
  },
  { 
    id: 'i2', 
    name: 'Guantes Nitrilo M', 
    sku: 'GLOV-M', 
    quantity: 15, 
    unit: 'cajas', 
    minThreshold: 10,
    supplierId: 's2',
    costPerUnit: 15.00
  },
  { 
    id: 'i3', 
    name: 'Resina Compuesta', 
    sku: 'RES-A2', 
    quantity: 4, 
    unit: 'tubos', 
    minThreshold: 5,
    supplierId: 's1',
    costPerUnit: 45.00
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'a1', 
    patientId: 'p1', 
    dentistId: '2', 
    date: new Date().toISOString(), 
    duration: 60, 
    status: 'confirmed', 
    type: 'treatment',
    confirmedAt: new Date().toISOString()
  },
  { 
    id: 'a2', 
    patientId: 'p2', 
    dentistId: '3', 
    date: new Date(Date.now() + 86400000).toISOString(), 
    duration: 30, 
    status: 'scheduled', 
    type: 'social-service'
  },
  { 
    id: 'a3', 
    patientId: 'p3', 
    dentistId: '5', 
    date: new Date(Date.now() + 172800000).toISOString(), 
    duration: 90, 
    status: 'scheduled', 
    type: 'treatment'
  },
];

export const MOCK_RECORDS: ClinicalEntry[] = [
  { 
    id: 'r1', 
    patientId: 'p1', 
    dentistId: '2', 
    date: '2024-01-15', 
    procedure: 'Limpieza General', 
    notes: 'Paciente con buena higiene. Se recomienda uso de hilo dental.', 
    teethInvolved: [11, 12, 13], 
    attachments: [], 
    version: 1, 
    isLocked: true, 
    status: 'final',
    diagnosis: 'K05.0'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv1', 
    patientId: 'p1', 
    date: '2024-05-20', 
    amount: 150.00, 
    status: 'paid', 
    items: [
      { description: 'Consulta', price: 50, serviceId: 's1' }, 
      { description: 'Limpieza', price: 100, serviceId: 's2' }
    ], 
    electronicInvoiceCode: 'CUFE-ABC123XYZ',
    paidAmount: 150.00,
    paymentMethod: 'card'
  },
  { 
    id: 'inv2', 
    patientId: 'p2', 
    date: '2024-05-21', 
    amount: 0.00, 
    status: 'paid', 
    items: [{ description: 'Consulta Social', price: 0, serviceId: 's1' }],
    paidAmount: 0,
    paymentMethod: 'cash'
  },
  { 
    id: 'inv3', 
    patientId: 'p3', 
    date: '2024-05-25', 
    amount: 250.00, 
    status: 'pending', 
    items: [{ description: 'Endodoncia', price: 250, serviceId: 's4' }],
    paidAmount: 0
  },
];

export const MOCK_PLANS: TreatmentPlan[] = [
  {
    id: 'tp1', 
    patientId: 'p1', 
    name: 'Rehabilitación Oral Completa', 
    totalCost: 1200, 
    status: 'active',
    createdDate: '2024-05-01',
    stages: [
      { id: 's1', description: 'Limpieza y Diagnóstico', cost: 100, status: 'done', teethInvolved: [11, 12] },
      { id: 's2', description: 'Blanqueamiento', cost: 300, status: 'in_progress' },
      { id: 's3', description: 'Implante #24', cost: 800, status: 'pending', teethInvolved: [24] },
    ]
  }
];

export const MOCK_CONSENTS: Consent[] = [
  { 
    id: 'c1', 
    patientId: 'p1', 
    title: 'Consentimiento Informado General', 
    content: 'Yo, el paciente, autorizo los procedimientos básicos...', 
    isSigned: true, 
    signedAt: '2024-01-10',
    dentistId: '2',
    procedure: 'Tratamiento General'
  },
  { 
    id: 'c2', 
    patientId: 'p1', 
    title: 'Consentimiento para Cirugía', 
    content: 'Autorizo la realización de implantes dentales conociendo los riesgos...', 
    isSigned: false,
    dentistId: '5',
    procedure: 'Implante Dental'
  }
];

export const MOCK_STUDENT_LOGS: StudentLog[] = [
  { 
    id: 'sl1', 
    studentId: '3', 
    tutorId: '2', 
    patientId: 'p2', 
    procedure: 'Profilaxis', 
    date: '2024-05-22', 
    status: 'pending_approval', 
    hours: 2
  },
  { 
    id: 'sl2', 
    studentId: '3', 
    tutorId: '2', 
    patientId: 'p2', 
    procedure: 'Sellantes', 
    date: '2024-05-20', 
    status: 'approved', 
    hours: 1, 
    feedback: 'Buen manejo del paciente.',
    grade: 4.5
  },
];

export const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
  { 
    id: 'ev1', 
    name: 'Jornada Salud Rural', 
    location: 'Vereda San Juan', 
    date: '2024-06-15', 
    responsibleId: '1', 
    patientsTreated: 0, 
    status: 'planned',
    volunteers: ['3'],
    budget: 500
  },
  { 
    id: 'ev2', 
    name: 'Sonrisas para Todos', 
    location: 'Centro Comunitario Norte', 
    date: '2024-04-10', 
    responsibleId: '2', 
    patientsTreated: 45, 
    status: 'completed',
    volunteers: ['2', '3'],
    budget: 800
  },
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
  { code: 'K03.6', name: 'Depósitos (acreciones) en los dientes' },
];

export const MOCK_SERVICES: ServiceItem[] = [
  { id: 's1', code: 'CONS-001', name: 'Consulta General', category: 'General', basePrice: 50, duration: 30 },
  { id: 's2', code: 'PROF-001', name: 'Profilaxis Adulto', category: 'Prevención', basePrice: 80, duration: 45 },
  { id: 's3', code: 'RES-001', name: 'Resina 1 Superficie', category: 'Restaurativa', basePrice: 120, duration: 45, requiresMaterials: ['i3'] },
  { id: 's4', code: 'ENDO-UNI', name: 'Endodoncia Uniradicular', category: 'Endodoncia', basePrice: 250, duration: 90 },
  { id: 's5', code: 'BLAN-001', name: 'Blanqueamiento Dental', category: 'Estética', basePrice: 300, duration: 60 },
];

export const MOCK_CONSENT_TEMPLATES: ConsentTemplate[] = [
  { id: 'ct1', title: 'Consentimiento Informado General', content: 'Yo, [NOMBRE_PACIENTE], declaro que he sido informado sobre los procedimientos básicos, riesgos comunes y alternativas...' },
  { id: 'ct2', title: 'Consentimiento para Cirugía', content: 'Autorizo la realización del procedimiento quirúrgico, habiendo entendido los riesgos específicos de sangrado, infección...' },
  { id: 'ct3', title: 'Consentimiento de Ortodoncia', content: 'Entiendo que el tratamiento de ortodoncia requiere compromiso con la higiene y asistencia a controles...' },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx1',
    patientId: 'p1',
    dentistId: '2',
    date: '2024-05-20',
    diagnosis: 'Proceso infeccioso dental',
    medications: [
      {
        id: 'm1',
        name: 'Amoxicilina',
        dose: '500mg',
        frequency: 'Cada 8 horas',
        duration: '7 días',
        instructions: 'Tomar con alimentos'
      },
      {
        id: 'm2',
        name: 'Ibuprofeno',
        dose: '400mg',
        frequency: 'Cada 6 horas',
        duration: '3 días',
        instructions: 'En caso de dolor'
      }
    ],
    isSigned: true,
    signedAt: '2024-05-20'
  }
];

export const MOCK_MEDICAL_EXCUSES: MedicalExcuse[] = [
  {
    id: 'exc1',
    patientId: 'p3',
    dentistId: '5',
    date: '2024-05-25',
    diagnosis: 'Procedimiento de endodoncia compleja',
    daysOff: 2,
    startDate: '2024-05-25',
    endDate: '2024-05-26',
    notes: 'Reposo relativo. Evitar esfuerzos físicos.',
    isSigned: true
  }
];

export const MOCK_PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'pp1',
    invoiceId: 'inv3',
    patientId: 'p3',
    totalAmount: 250,
    downPayment: 50,
    installments: [
      { id: 'inst1', number: 1, amount: 66.67, dueDate: '2024-06-25', status: 'pending' },
      { id: 'inst2', number: 2, amount: 66.67, dueDate: '2024-07-25', status: 'pending' },
      { id: 'inst3', number: 3, amount: 66.66, dueDate: '2024-08-25', status: 'pending' },
    ],
    interestRate: 0
  }
];

export const MOCK_ODONTOGRAMS: Odontogram[] = [
  {
    id: 'og1',
    patientId: 'p1',
    lastUpdated: '2024-05-20',
    teeth: {
      11: { number: 11, status: 'filled', history: [{ date: '2024-01-15', procedure: 'Resina', dentistId: '2' }] },
      12: { number: 12, status: 'healthy', history: [] },
      24: { number: 24, status: 'missing', history: [{ date: '2023-12-10', procedure: 'Extracción', dentistId: '5' }] },
    }
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'DentalSupply Co.',
    contactPerson: 'Roberto Gomez',
    phone: '555-1000',
    email: 'ventas@dentalsupply.com',
    address: 'Zona Industrial Norte',
    productsSupplied: ['i1', 'i3'],
    rating: 4.5
  },
  {
    id: 's2',
    name: 'MedEquip Ltda',
    contactPerson: 'Sofia Martinez',
    phone: '555-2000',
    email: 'contacto@medequip.com',
    productsSupplied: ['i2'],
    rating: 4.8
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    type: 'low_stock',
    title: 'Inventario Bajo',
    message: 'Resina Compuesta tiene stock por debajo del mínimo',
    isRead: false,
    createdAt: new Date().toISOString(),
    priority: 'high'
  },
  {
    id: 'n2',
    userId: '2',
    type: 'student_log_pending',
    title: 'Aprobación Pendiente',
    message: 'Juan Perez tiene 1 procedimiento pendiente de aprobación',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    priority: 'medium'
  }
];
