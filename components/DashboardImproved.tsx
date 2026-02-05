import React, { useMemo } from 'react';
import { User, Appointment, Invoice, Patient, KPI } from '../types';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardProps {
  user: User;
  appointments: Appointment[];
  invoices: Invoice[];
  patients: Patient[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  appointments, 
  invoices,
  patients 
}) => {
  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter current month data
    const monthlyAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyInvoices = invoices.filter(inv => {
      const date = new Date(inv.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const completedAppointments = monthlyAppointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = monthlyAppointments.filter(a => a.status === 'cancelled').length;
    const noShowAppointments = monthlyAppointments.filter(a => a.status === 'no-show').length;

    const totalRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const averageTicket = monthlyInvoices.length > 0 ? totalRevenue / monthlyInvoices.length : 0;

    const noShowRate = monthlyAppointments.length > 0 
      ? (noShowAppointments / monthlyAppointments.length) * 100 
      : 0;

    // New patients this month
    const newPatientsCount = patients.filter(p => {
      // In real scenario, you'd check registration date
      return true; // Placeholder
    }).length;

    // Today's appointments
    const today = now.toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => 
      apt.date.startsWith(today)
    );

    const todayCompleted = todayAppointments.filter(a => a.status === 'completed').length;
    const todayScheduled = todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;

    return {
      totalRevenue,
      totalAppointments: monthlyAppointments.length,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      noShowRate,
      averageTicket,
      newPatients: newPatientsCount,
      todayAppointments: todayAppointments.length,
      todayCompleted,
      todayScheduled
    };
  }, [appointments, invoices, patients]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > now && (apt.status === 'scheduled' || apt.status === 'confirmed');
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [appointments]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [invoices]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente Desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenido, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-brand-100">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={24}/>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Hoy</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kpis.todayAppointments}</p>
          <p className="text-sm text-slate-500 mt-1">
            Citas programadas • {kpis.todayCompleted} completadas
          </p>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${kpis.todayAppointments > 0 ? (kpis.todayCompleted / kpis.todayAppointments) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24}/>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Este Mes</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">${kpis.totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-slate-500 mt-1">
            Ingresos • Ticket promedio: ${kpis.averageTicket.toFixed(0)}
          </p>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1"/>
            <span>+12% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="text-purple-600" size={24}/>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Rendimiento</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kpis.completedAppointments}</p>
          <p className="text-sm text-slate-500 mt-1">
            Citas completadas este mes
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-red-600 flex items-center gap-1">
              <XCircle size={12}/> {kpis.noShowRate.toFixed(1)}% No Show
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-brand-600"/>
              Próximas Citas
            </h3>
            <span className="text-xs text-slate-500">{upcomingAppointments.length} programadas</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No hay citas próximas programadas
              </div>
            ) : (
              upcomingAppointments.map(apt => {
                const aptDate = new Date(apt.date);
                const patient = patients.find(p => p.id === apt.patientId);
                
                return (
                  <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{patient?.name}</p>
                        <p className="text-sm text-slate-500">
                          {apt.type === 'checkup' ? 'Consulta' : 
                           apt.type === 'treatment' ? 'Tratamiento' : 
                           apt.type === 'emergency' ? 'Urgencia' : 'Servicio Social'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">
                          {aptDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {aptDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {apt.status === 'confirmed' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={12}/>
                        <span>Confirmada</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign size={18} className="text-brand-600"/>
              Facturas Recientes
            </h3>
            <span className="text-xs text-slate-500">{invoices.length} total</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No hay facturas registradas
              </div>
            ) : (
              recentInvoices.map(inv => (
                <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {getPatientName(inv.patientId)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(inv.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">
                        ${inv.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'factus_submitted' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {inv.status === 'paid' ? 'Pagada' :
                         inv.status === 'factus_submitted' ? 'Facturada' :
                         inv.status === 'partially_paid' ? 'Parcial' :
                         'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-brand-600"/>
          Métricas del Mes
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <CheckCircle className="text-green-600" size={32}/>
            </div>
            <p className="text-2xl font-bold text-green-700">{kpis.completedAppointments}</p>
            <p className="text-xs text-green-600 font-medium">Completadas</p>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <XCircle className="text-red-600" size={32}/>
            </div>
            <p className="text-2xl font-bold text-red-700">{kpis.cancelledAppointments}</p>
            <p className="text-xs text-red-600 font-medium">Canceladas</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <AlertCircle className="text-orange-600" size={32}/>
            </div>
            <p className="text-2xl font-bold text-orange-700">{kpis.noShowAppointments}</p>
            <p className="text-xs text-orange-600 font-medium">No Show</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Users className="text-blue-600" size={32}/>
            </div>
            <p className="text-2xl font-bold text-blue-700">{patients.length}</p>
            <p className="text-xs text-blue-600 font-medium">Total Pacientes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-brand-50 border-2 border-brand-200 rounded-lg hover:bg-brand-100 transition-colors text-left">
          <Calendar size={24} className="text-brand-600 mb-2"/>
          <p className="font-semibold text-slate-800">Nueva Cita</p>
          <p className="text-xs text-slate-500">Agendar paciente</p>
        </button>

        <button className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
          <Users size={24} className="text-green-600 mb-2"/>
          <p className="font-semibold text-slate-800">Nuevo Paciente</p>
          <p className="text-xs text-slate-500">Registrar datos</p>
        </button>

        <button className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
          <DollarSign size={24} className="text-purple-600 mb-2"/>
          <p className="font-semibold text-slate-800">Cobrar</p>
          <p className="text-xs text-slate-500">Registrar pago</p>
        </button>

        <button className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left">
          <Activity size={24} className="text-orange-600 mb-2"/>
          <p className="font-semibold text-slate-800">Ver Reportes</p>
          <p className="text-xs text-slate-500">Analytics</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
