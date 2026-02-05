import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User, Appointment, Invoice } from '../types';
import { Users, DollarSign, CalendarCheck, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
  appointments: Appointment[];
  invoices: Invoice[];
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, appointments, invoices }) => {
  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;
  
  const data = [
    { name: 'Lun', citas: 4 },
    { name: 'Mar', citas: 7 },
    { name: 'Mie', citas: 5 },
    { name: 'Jue', citas: 8 },
    { name: 'Vie', citas: 6 },
    { name: 'Sab', citas: 3 },
  ];

  const revenueData = [
    { name: 'Ene', ingresos: 1200 },
    { name: 'Feb', ingresos: 1900 },
    { name: 'Mar', ingresos: 1500 },
    { name: 'Abr', ingresos: 2100 },
    { name: 'May', ingresos: totalRevenue },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Bienvenido, {user.name}</h1>
        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingresos Mensuales" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} color="text-green-600" />
        <StatCard title="Citas Pendientes" value={pendingAppointments} icon={CalendarCheck} color="text-brand-600" />
        <StatCard title="Pacientes Activos" value="142" icon={Users} color="text-purple-600" />
        <StatCard title="Alertas Inventario" value="3" icon={AlertCircle} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Citas por Día</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="citas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Tendencia de Ingresos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
