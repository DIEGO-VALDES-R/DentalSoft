import React, { useState } from 'react';
import { User, StudentLog } from '../types';
import { MOCK_STUDENT_LOGS, MOCK_USERS } from '../constants';
import { CheckCircle, XCircle, Clock, GraduationCap } from 'lucide-react';

interface EducationProps {
  currentUser: User;
}

const Education: React.FC<EducationProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<StudentLog[]>(MOCK_STUDENT_LOGS);

  const handleApprove = (id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, status: 'approved' as const } : log));
  };

  const handleReject = (id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, status: 'rejected' as const } : log));
  };

  // Filter logs based on user role
  const visibleLogs = currentUser.role === 'student'
    ? logs.filter(l => l.studentId === currentUser.id)
    : logs.filter(l => l.tutorId === currentUser.id); // For Dentist/Admin

  const totalHours = visibleLogs.reduce((acc, curr) => acc + (curr.status === 'approved' ? curr.hours : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Módulo Académico</h1>
          <p className="text-slate-500 text-sm">
            {currentUser.role === 'student' ? 'Registro de Prácticas y Horas' : 'Aprobación de Procedimientos Clínicos'}
          </p>
        </div>
        <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-100 flex items-center gap-2">
            <Clock size={20}/>
            <span className="font-bold">{totalHours} Hrs</span>
            <span className="text-sm font-normal">Aprobadas</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-slate-600 font-semibold">
            <GraduationCap size={18}/>
            {currentUser.role === 'student' ? 'Mis Registros Clínicos' : 'Solicitudes Pendientes de Estudiantes'}
        </div>
        
        {visibleLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay registros pendientes.</div>
        ) : (
            <div className="divide-y divide-slate-100">
                {visibleLogs.map(log => {
                    const student = MOCK_USERS.find(u => u.id === log.studentId);
                    return (
                        <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800">{log.procedure}</h3>
                                <p className="text-sm text-slate-500">
                                    Paciente ID: {log.patientId} • Fecha: {log.date} • {log.hours} Horas
                                </p>
                                {currentUser.role !== 'student' && (
                                    <p className="text-xs text-brand-600 font-medium mt-1">Estudiante: {student?.name}</p>
                                )}
                                {log.status === 'rejected' && <p className="text-xs text-red-500 mt-1">Rechazado</p>}
                                {log.status === 'approved' && <p className="text-xs text-green-500 mt-1">Aprobado</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                {currentUser.role !== 'student' && log.status === 'pending_approval' ? (
                                    <>
                                        <button onClick={() => handleApprove(log.id)} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 text-sm font-medium transition">
                                            <CheckCircle size={16}/> Aprobar
                                        </button>
                                        <button onClick={() => handleReject(log.id)} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 text-sm font-medium transition">
                                            <XCircle size={16}/> Rechazar
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider
                                        ${log.status === 'pending_approval' ? 'bg-orange-100 text-orange-800' : 
                                          log.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                                    }>
                                        {log.status.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Education;
