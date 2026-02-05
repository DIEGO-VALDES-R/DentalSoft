import React, { useState, useMemo } from 'react';
import { Appointment, User, UserRole, Patient } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User as UserIcon, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ScheduleProps {
  appointments: Appointment[];
  patients: Patient[];
  dentists: User[];
  currentUser: User;
  onAddAppointment: (appt: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const Schedule: React.FC<ScheduleProps> = ({ 
  appointments, 
  patients, 
  dentists, 
  currentUser,
  onAddAppointment,
  onUpdateStatus
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDentistId, setSelectedDentistId] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Appointment Form State
  const [newApptPatient, setNewApptPatient] = useState('');
  const [newApptDentist, setNewApptDentist] = useState(currentUser.role === UserRole.DENTIST ? currentUser.id : '');
  const [newApptTime, setNewApptTime] = useState('09:00');
  const [newApptDuration, setNewApptDuration] = useState(30);
  const [newApptType, setNewApptType] = useState<Appointment['type']>('checkup');

  // Helpers
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.date);
      const isSameDate = apptDate.getDate() === currentDate.getDate() &&
                         apptDate.getMonth() === currentDate.getMonth() &&
                         apptDate.getFullYear() === currentDate.getFullYear();
      const isSameDentist = selectedDentistId === 'all' || appt.dentistId === selectedDentistId;
      return isSameDate && isSameDentist;
    });
  }, [appointments, currentDate, selectedDentistId]);

  const getAppointmentsForSlot = (time: string) => {
    return filteredAppointments.filter(appt => {
      const apptDate = new Date(appt.date);
      const apptTime = `${apptDate.getHours().toString().padStart(2, '0')}:${apptDate.getMinutes().toString().padStart(2, '0')}`;
      return apptTime === time;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptPatient || !newApptDentist) return;

    // Construct ISO Date
    const [hours, minutes] = newApptTime.split(':');
    const isoDate = new Date(currentDate);
    isoDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: newApptPatient,
      dentistId: newApptDentist,
      date: isoDate.toISOString(),
      duration: newApptDuration,
      status: 'scheduled',
      type: newApptType
    };

    onAddAppointment(newAppt);
    setShowNewModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'completed': return 'bg-green-100 border-green-200 text-green-800';
      case 'cancelled': return 'bg-red-50 border-red-100 text-red-400 line-through';
      case 'no-show': return 'bg-orange-100 border-orange-200 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (type: string) => {
    switch (type) {
      case 'treatment': return 'Tratamiento';
      case 'checkup': return 'Consulta';
      case 'emergency': return 'Urgencia';
      case 'social-service': return 'Social';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-md transition-all shadow-sm"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white rounded-md transition-all">Hoy</button>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-md transition-all shadow-sm"><ChevronRight size={20}/></button>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarIcon size={20} className="text-brand-600"/>
            <span className="text-lg font-bold capitalize">{formatDate(currentDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedDentistId} 
            onChange={(e) => setSelectedDentistId(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="all">Todos los Odontólogos</option>
            {dentists.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowNewModal(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Plus size={18} /> Nueva Cita
          </button>
        </div>
      </div>

      {/* Agenda Grid */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-4">
            {timeSlots.map(time => {
              const slotAppointments = getAppointmentsForSlot(time);
              
              return (
                <div key={time} className="flex group">
                  {/* Time Column */}
                  <div className="w-20 pr-4 text-right text-slate-400 text-sm font-medium pt-2 group-hover:text-brand-600 transition-colors">
                    {time}
                  </div>
                  
                  {/* Events Column */}
                  <div className="flex-1 min-h-[4rem] border-t border-slate-100 relative pl-4 pb-2 group-hover:bg-slate-50 transition-colors rounded-r-lg">
                    {slotAppointments.length === 0 ? (
                       <div className="absolute inset-0 z-0" onClick={() => { setNewApptTime(time); setShowNewModal(true); }}></div>
                    ) : (
                      <div className="flex gap-4 flex-wrap z-10 relative mt-1">
                        {slotAppointments.map(appt => {
                          const patient = patients.find(p => p.id === appt.patientId);
                          const dentist = dentists.find(d => d.id === appt.dentistId);
                          
                          return (
                            <div key={appt.id} className={`flex-1 min-w-[200px] border-l-4 p-3 rounded shadow-sm hover:shadow-md transition-all ${getStatusColor(appt.status)}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-sm truncate">{patient?.name || 'Paciente Desconocido'}</p>
                                  <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
                                    <UserIcon size={10}/> {dentist?.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold uppercase tracking-wide opacity-70">{getStatusLabel(appt.type)}</span>
                                  <div className="flex justify-end gap-1 mt-1">
                                    {appt.status === 'scheduled' && (
                                      <>
                                        <button onClick={() => onUpdateStatus(appt.id, 'completed')} className="p-1 hover:bg-white/50 rounded text-green-700" title="Completar"><CheckCircle size={14}/></button>
                                        <button onClick={() => onUpdateStatus(appt.id, 'cancelled')} className="p-1 hover:bg-white/50 rounded text-red-700" title="Cancelar"><X size={14}/></button>
                                        <button onClick={() => onUpdateStatus(appt.id, 'no-show')} className="p-1 hover:bg-white/50 rounded text-orange-700" title="No Asistió"><AlertCircle size={14}/></button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                                <Clock size={12}/> {appt.duration} min
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold">Agendar Nueva Cita</h3>
                <button onClick={() => setShowNewModal(false)}><X size={20}/></button>
             </div>
             <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                   <select 
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      value={newApptPatient}
                      onChange={e => setNewApptPatient(e.target.value)}
                   >
                      <option value="">Seleccionar Paciente...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.dni})</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                      <input 
                         type="text" 
                         disabled 
                         value={formatDate(currentDate)}
                         className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                      <select 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newApptTime}
                        onChange={e => setNewApptTime(e.target.value)}
                      >
                         {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Odontólogo</label>
                   <select 
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      value={newApptDentist}
                      onChange={e => setNewApptDentist(e.target.value)}
                   >
                      <option value="">Seleccionar...</option>
                      {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                      <select 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newApptType}
                        onChange={e => setNewApptType(e.target.value as Appointment['type'])}
                      >
                         <option value="checkup">Consulta General</option>
                         <option value="treatment">Tratamiento</option>
                         <option value="emergency">Urgencia</option>
                         <option value="social-service">Servicio Social</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duración (min)</label>
                      <input 
                        type="number" 
                        min="15" 
                        step="15"
                        value={newApptDuration}
                        onChange={e => setNewApptDuration(parseInt(e.target.value))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancelar</button>
                   <button type="submit" className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold">Agendar Cita</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
