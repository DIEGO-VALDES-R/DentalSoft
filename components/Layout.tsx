import React from 'react';
import { LayoutDashboard, Calendar, Users, FileText, Package, CreditCard, Settings, LogOut, Activity, GraduationCap, HeartHandshake } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onNavigate, currentView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'records', label: 'Historiales', icon: FileText },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
  ];

  // Role-based Menu Additions
  if (currentUser.role === UserRole.DENTIST || currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.ADMIN) {
    menuItems.push({ id: 'education', label: 'Educación', icon: GraduationCap });
  }

  if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.DENTIST) {
    menuItems.push({ id: 'social', label: 'Servicio Social', icon: HeartHandshake });
  }

  if (currentUser.role === UserRole.ADMIN) {
    menuItems.push({ id: 'admin', label: 'Configuración', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 hidden md:flex">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-700">
          <Activity className="h-8 w-8 text-brand-500" />
          <span className="text-xl font-bold tracking-tight">DentalCore</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={currentUser.avatar} 
              alt="Avatar" 
              className="h-10 w-10 rounded-full border-2 border-brand-500" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role === 'student' ? 'Estudiante' : currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 py-2 rounded-md transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
        <span className="font-bold">DentalCore</span>
        <button onClick={onLogout}><LogOut size={20}/></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
