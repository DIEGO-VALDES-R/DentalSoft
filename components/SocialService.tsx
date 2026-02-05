import React from 'react';
import { MOCK_COMMUNITY_EVENTS } from '../constants';
import { MapPin, Calendar, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';

const SocialService: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Servicio Social y Comunitario</h1>
           <p className="text-slate-500">Gestión de jornadas y atención a población vulnerable.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">
            + Nueva Jornada
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-90">
                  <HeartHandshake size={24}/> <span className="font-medium">Impacto Total</span>
              </div>
              <div className="text-4xl font-bold mb-1">1,240</div>
              <div className="text-indigo-100 text-sm">Pacientes atendidos gratuitamente este año</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-slate-500 text-sm font-medium uppercase mb-2">Próxima Jornada</h3>
               <p className="text-xl font-bold text-slate-800">Brigada Escolar Sur</p>
               <p className="text-slate-500 text-sm mt-1">24 de Octubre, 2024</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-slate-500 text-sm font-medium uppercase mb-2">Voluntarios Activos</h3>
               <p className="text-xl font-bold text-slate-800">12 Estudiantes</p>
               <p className="text-slate-500 text-sm mt-1">3 Odontólogos Supervisores</p>
          </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-4">Jornadas Programadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_COMMUNITY_EVENTS.map(event => (
              <div key={event.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  {event.status === 'completed' && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl">Completada</div>
                  )}
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{event.name}</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400"/> {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400"/> {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                          <Users size={16} className="text-slate-400"/> 
                          {event.status === 'completed' ? (
                             <span className="font-semibold text-green-600">{event.patientsTreated} Pacientes Atendidos</span>
                          ) : (
                             <span>Estimado: 50 pacientes</span>
                          )}
                      </div>
                  </div>
                  {event.status === 'planned' && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                          <button className="flex-1 bg-slate-50 text-slate-600 py-2 rounded text-sm font-medium hover:bg-slate-100">Editar Logística</button>
                          <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded text-sm font-medium hover:bg-indigo-100">Gestionar Voluntarios</button>
                      </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};

export default SocialService;
