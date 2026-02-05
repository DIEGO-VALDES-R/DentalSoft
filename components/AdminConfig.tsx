import React, { useState } from 'react';
import { Building2, Stethoscope, Users, Plus, Edit2, Trash2, Check, Shield, FileText, Tag } from 'lucide-react';
import { Location, Diagnosis, User, UserRole, ServiceItem, ConsentTemplate } from '../types';
import { MOCK_LOCATIONS, MOCK_DIAGNOSES, MOCK_USERS, MOCK_SERVICES, MOCK_CONSENT_TEMPLATES } from '../constants';

const AdminConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'locations' | 'diagnoses' | 'roles' | 'services' | 'consents'>('locations');
  
  // State for Locations
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [newLoc, setNewLoc] = useState<Partial<Location>>({ name: '', address: '', phone: '' });

  // State for Diagnoses
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(MOCK_DIAGNOSES);
  const [newDiag, setNewDiag] = useState({ code: '', name: '' });
  const [diagSearch, setDiagSearch] = useState('');

  // State for Users
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: UserRole.DENTIST });

  // State for Services (Tarifario)
  const [services, setServices] = useState<ServiceItem[]>(MOCK_SERVICES);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({ code: '', name: '', category: 'General', basePrice: 0, duration: 30 });

  // State for Consents
  const [templates, setTemplates] = useState<ConsentTemplate[]>(MOCK_CONSENT_TEMPLATES);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '' });

  // --- HANDLERS ---

  const addLocation = () => {
    if (!newLoc.name || !newLoc.address) return;
    setLocations([...locations, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: newLoc.name!, 
      address: newLoc.address!, 
      phone: newLoc.phone || '', 
      status: 'active' 
    }]);
    setNewLoc({ name: '', address: '', phone: '' });
  };

  const toggleLocationStatus = (id: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, status: l.status === 'active' ? 'inactive' : 'active' } : l));
  };

  const addDiagnosis = () => {
    if (!newDiag.code || !newDiag.name) return;
    setDiagnoses([...diagnoses, newDiag]);
    setNewDiag({ code: '', name: '' });
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: newUser.name!, 
      email: newUser.email!, 
      role: newUser.role as UserRole,
      avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`
    }]);
    setNewUser({ name: '', email: '', role: UserRole.DENTIST });
  };

  const updateUserRole = (id: string, role: UserRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  const addService = () => {
    if (!newService.name || !newService.basePrice) return;
    setServices([...services, {
      id: Math.random().toString(36).substr(2, 9),
      code: newService.code || 'SERV-NEW',
      name: newService.name!,
      category: newService.category || 'General',
      basePrice: Number(newService.basePrice),
      duration: Number(newService.duration)
    }]);
    setNewService({ code: '', name: '', category: 'General', basePrice: 0, duration: 30 });
  };

  const addTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) return;
    setTemplates([...templates, {
      id: Math.random().toString(36).substr(2, 9),
      title: newTemplate.title,
      content: newTemplate.content
    }]);
    setNewTemplate({ title: '', content: '' });
  };

  const filteredDiagnoses = diagnoses.filter(d => 
    d.code.toLowerCase().includes(diagSearch.toLowerCase()) || 
    d.name.toLowerCase().includes(diagSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>
           <p className="text-slate-500">Gestión de parámetros globales y accesos.</p>
        </div>
        
        <div className="flex flex-wrap bg-white p-1 rounded-lg border border-slate-200 gap-1">
           <button onClick={() => setActiveTab('locations')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'locations' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-brand-600'}`}>
             <Building2 size={16}/> Sedes
           </button>
           <button onClick={() => setActiveTab('services')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'services' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-brand-600'}`}>
             <Tag size={16}/> Servicios
           </button>
           <button onClick={() => setActiveTab('diagnoses')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'diagnoses' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-brand-600'}`}>
             <Stethoscope size={16}/> CIE-10
           </button>
           <button onClick={() => setActiveTab('consents')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'consents' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-brand-600'}`}>
             <FileText size={16}/> Consentimientos
           </button>
           <button onClick={() => setActiveTab('roles')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'roles' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-brand-600'}`}>
             <Users size={16}/> Roles
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        
        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input placeholder="Nombre de Sede" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})}/>
                <input placeholder="Dirección" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newLoc.address} onChange={e => setNewLoc({...newLoc, address: e.target.value})}/>
                <input placeholder="Teléfono" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newLoc.phone} onChange={e => setNewLoc({...newLoc, phone: e.target.value})}/>
                <button onClick={addLocation} className="bg-brand-600 text-white rounded font-medium hover:bg-brand-700 flex justify-center items-center gap-2">
                   <Plus size={18}/> Agregar Sede
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                         <th className="px-4 py-3">Nombre</th>
                         <th className="px-4 py-3">Dirección</th>
                         <th className="px-4 py-3">Teléfono</th>
                         <th className="px-4 py-3">Estado</th>
                         <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {locations.map(loc => (
                         <tr key={loc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{loc.name}</td>
                            <td className="px-4 py-3 text-slate-600">{loc.address}</td>
                            <td className="px-4 py-3 text-slate-600">{loc.phone}</td>
                            <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded text-xs font-semibold ${loc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {loc.status === 'active' ? 'Activa' : 'Inactiva'}
                               </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <button onClick={() => toggleLocationStatus(loc.id)} className="text-sm text-brand-600 hover:underline">
                                  {loc.status === 'active' ? 'Desactivar' : 'Activar'}
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 items-end">
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500">Código</label>
                    <input placeholder="EJ: CONS-001" className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newService.code} onChange={e => setNewService({...newService, code: e.target.value})}/>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500">Nombre del Servicio</label>
                    <input placeholder="Descripción" className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}/>
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500">Precio Base</label>
                    <input type="number" placeholder="0.00" className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newService.basePrice} onChange={e => setNewService({...newService, basePrice: parseFloat(e.target.value)})}/>
                </div>
                <button onClick={addService} className="h-[42px] bg-brand-600 text-white rounded font-medium hover:bg-brand-700 flex justify-center items-center gap-2">
                   <Plus size={18}/> Agregar
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                         <th className="px-4 py-3">Código</th>
                         <th className="px-4 py-3">Nombre</th>
                         <th className="px-4 py-3">Categoría</th>
                         <th className="px-4 py-3">Duración</th>
                         <th className="px-4 py-3 text-right">Precio Base</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {services.map(srv => (
                         <tr key={srv.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-sm text-slate-600">{srv.code}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{srv.name}</td>
                            <td className="px-4 py-3 text-slate-600 text-sm">{srv.category}</td>
                            <td className="px-4 py-3 text-slate-600 text-sm">{srv.duration} min</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-700">${srv.basePrice.toFixed(2)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* CONSENTS TAB */}
        {activeTab === 'consents' && (
          <div className="space-y-6 animate-fade-in">
             <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input 
                  placeholder="Título del Documento Legal" 
                  className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newTemplate.title}
                  onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
                />
                <textarea 
                  placeholder="Contenido del consentimiento..." 
                  className="w-full mb-3 p-2 border rounded h-32 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newTemplate.content}
                  onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                />
                <button onClick={addTemplate} className="bg-brand-600 text-white px-4 py-2 rounded font-medium hover:bg-brand-700 flex items-center gap-2">
                   <Plus size={18}/> Guardar Plantilla
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tmp => (
                    <div key={tmp.id} className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-brand-500"/> {tmp.title}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-3">{tmp.content}</p>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* DIAGNOSES TAB */}
        {activeTab === 'diagnoses' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex gap-4 mb-4">
                 <input placeholder="Buscar CIE-10..." className="flex-1 p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={diagSearch} onChange={e => setDiagSearch(e.target.value)}/>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input placeholder="Código (ej. K02.1)" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newDiag.code} onChange={e => setNewDiag({...newDiag, code: e.target.value})}/>
                <input placeholder="Descripción del Diagnóstico" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newDiag.name} onChange={e => setNewDiag({...newDiag, name: e.target.value})}/>
                <button onClick={addDiagnosis} className="bg-brand-600 text-white rounded font-medium hover:bg-brand-700 flex justify-center items-center gap-2">
                   <Plus size={18}/> Agregar
                </button>
             </div>
             <div className="overflow-y-auto max-h-96 border border-slate-100 rounded-lg">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
                      <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Descripción</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredDiagnoses.map((diag, idx) => (
                         <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-bold text-slate-700 w-32">{diag.code}</td>
                            <td className="px-4 py-3 text-slate-600">{diag.name}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* ROLES TAB */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input placeholder="Nombre Completo" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}/>
                <input placeholder="Email Corporativo" className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}/>
                <select className="p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                   <option value={UserRole.ADMIN}>Gerencia (Admin)</option>
                   <option value={UserRole.DENTIST}>Odontólogo</option>
                   <option value={UserRole.RECEPTIONIST}>Recepción</option>
                   <option value={UserRole.STUDENT}>Estudiante</option>
                </select>
                <button onClick={addUser} className="bg-brand-600 text-white rounded font-medium hover:bg-brand-700 flex justify-center items-center gap-2">
                   <Plus size={18}/> Crear
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                         <th className="px-4 py-3">Usuario</th>
                         <th className="px-4 py-3">Email</th>
                         <th className="px-4 py-3">Rol Actual</th>
                         <th className="px-4 py-3 text-right">Cambiar Rol</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                         <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 flex items-center gap-3">
                               <img src={u.avatar} alt="av" className="w-8 h-8 rounded-full border border-slate-200"/>
                               <span className="font-medium text-slate-800">{u.name}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{u.email}</td>
                            <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                  ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                                    u.role === UserRole.DENTIST ? 'bg-blue-100 text-blue-700' :
                                    u.role === UserRole.STUDENT ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'}`
                               }>
                                  {u.role === UserRole.ADMIN ? 'Gerencia' : 
                                   u.role === UserRole.DENTIST ? 'Odontólogo' : 
                                   u.role === UserRole.STUDENT ? 'Estudiante' : 'Recepción'}
                               </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <select 
                                  className="text-sm border border-slate-200 rounded p-1 bg-white outline-none"
                                  value={u.role}
                                  onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                               >
                                  <option value={UserRole.ADMIN}>Gerencia</option>
                                  <option value={UserRole.DENTIST}>Odontólogo</option>
                                  <option value={UserRole.RECEPTIONIST}>Recepción</option>
                                  <option value={UserRole.STUDENT}>Estudiante</option>
                               </select>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;