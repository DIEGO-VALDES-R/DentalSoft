import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { PatientManager } from './components/PatientManager';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Education from './components/Education';
import SocialService from './components/SocialService';
import { Schedule } from './components/Schedule';
import AdminConfig from './components/AdminConfig';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_RECORDS, MOCK_INVOICES, MOCK_INVENTORY } from './constants';
import { User, ClinicalEntry, Appointment, UserRole } from './types';
import { Lock } from 'lucide-react';

// Simple Hash Router Implementation for constraints
const App: React.FC = () => {
  // Global State (Simulating DB)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  
  // Data State
  const [records, setRecords] = useState<ClinicalEntry[]>(MOCK_RECORDS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  
  // Login State
  const [email, setEmail] = useState('admin@dentalcore.com');
  const [password, setPassword] = useState('password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      alert("Credenciales inválidas. Usa admin@dentalcore.com");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleAddRecord = (record: ClinicalEntry) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleAddAppointment = (appt: Appointment) => {
    setAppointments(prev => [...prev, appt]);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Get Dentists and Students for Schedule filtering
  const staff = MOCK_USERS.filter(u => u.role === UserRole.DENTIST || u.role === UserRole.STUDENT || u.role === UserRole.ADMIN);

  // Render View based on state
  const renderContent = () => {
    if (!currentUser) return null;

    switch (view) {
      case 'dashboard':
        return <Dashboard user={currentUser} appointments={appointments} invoices={MOCK_INVOICES} />;
      case 'patients':
      case 'records': 
        return <PatientManager 
                  patients={MOCK_PATIENTS} 
                  records={records} 
                  currentUser={currentUser}
                  onAddRecord={handleAddRecord} 
                />;
      case 'billing':
        return <Billing invoices={MOCK_INVOICES} />;
      case 'inventory':
        return <Inventory items={MOCK_INVENTORY} />;
      case 'education':
        return <Education currentUser={currentUser} />;
      case 'social':
        return <SocialService />;
      case 'schedule':
        return <Schedule 
                  appointments={appointments} 
                  patients={MOCK_PATIENTS}
                  dentists={staff}
                  currentUser={currentUser}
                  onAddAppointment={handleAddAppointment}
                  onUpdateStatus={handleUpdateStatus}
                />;
      case 'admin':
         return <AdminConfig />;
      default:
        return <Dashboard user={currentUser} appointments={appointments} invoices={MOCK_INVOICES} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">DentalCore</h1>
            <p className="text-slate-500">Gestión Clínica Integral</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition flex justify-center items-center gap-2">
              <Lock size={18} /> Iniciar Sesión
            </button>
          </form>
          <div className="mt-6 text-xs text-center text-slate-400">
            <p>Demo: admin@dentalcore.com (Admin)</p>
            <p>juan@dentalcore.com (Estudiante)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={view} 
      onNavigate={setView} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;