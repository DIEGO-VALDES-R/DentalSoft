import React, { useState, useRef } from 'react';
import { Patient, ClinicalEntry, User, TreatmentPlan, Consent } from '../types';
import { Search, Plus, FileText, Camera, BrainCircuit, X, ClipboardList, PenTool, ShieldCheck, History } from 'lucide-react';
import { generateClinicalSummary } from '../services/geminiService';
import { MOCK_PLANS, MOCK_CONSENTS } from '../constants';

interface PatientManagerProps {
  patients: Patient[];
  records: ClinicalEntry[];
  currentUser: User;
  onAddRecord: (record: ClinicalEntry) => void;
}

export const PatientManager: React.FC<PatientManagerProps> = ({ patients, records, currentUser, onAddRecord }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'plans' | 'consents'>('history');

  // Clinical Record State
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [newProcedure, setNewProcedure] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<string[]>([]);

  // AI State
  const [aiSummary, setAiSummary] = useState<{resumen: string[], recomendacion: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Data for selected patient
  const patientRecords = selectedPatient ? records.filter(r => r.patientId === selectedPatient.id) : [];
  const [patientPlans, setPatientPlans] = useState<TreatmentPlan[]>([]);
  const [patientConsents, setPatientConsents] = useState<Consent[]>([]);

  // Load mock data when patient is selected
  React.useEffect(() => {
    if (selectedPatient) {
      setPatientPlans(MOCK_PLANS.filter(p => p.patientId === selectedPatient.id));
      setPatientConsents(MOCK_CONSENTS.filter(c => c.patientId === selectedPatient.id));
      setAiSummary(null);
      setActiveTab('history');
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.dni.includes(searchTerm)
  );

  const handleGenerateAiSummary = async () => {
    if (!selectedPatient) return;
    setLoadingAi(true);
    try {
      const resultJson = await generateClinicalSummary(selectedPatient, patientRecords);
      const cleanJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
      setAiSummary(JSON.parse(cleanJson));
    } catch (e) {
      console.error(e);
      alert('Error generando resumen AI');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAttachments([...attachments, url]);
    }
  };

  const submitRecord = () => {
    if(!selectedPatient) return;
    const newRecord: ClinicalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: selectedPatient.id,
      dentistId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      procedure: newProcedure,
      notes: newNotes,
      attachments: attachments,
      version: 1,
      isLocked: true, // Auto-lock for integrity in this demo
      status: 'final'
    };
    onAddRecord(newRecord);
    setShowNewRecord(false);
    setNewProcedure('');
    setNewNotes('');
    setAttachments([]);
  };

  const handleSignConsent = (id: string) => {
    setPatientConsents(prev => prev.map(c => 
      c.id === id ? { ...c, isSigned: true, signedAt: new Date().toISOString().split('T')[0] } : c
    ));
  };

  if (selectedPatient) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={() => setSelectedPatient(null)}
          className="text-sm text-slate-500 hover:text-brand-600 flex items-center mb-4"
        >
          ← Volver al Directorio
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                <span>DNI: {selectedPatient.dni}</span>
                <span>Edad: {new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear()} años</span>
                {selectedPatient.socialService && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">Servicio Social</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}>Historia</button>
               <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'plans' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}>Tratamientos</button>
               <button onClick={() => setActiveTab('consents')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'consents' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}>Consentimientos</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Info Panel */}
            <div className="space-y-6">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">Información Médica</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Alergias:</span> {selectedPatient.allergies.join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Antecedentes:</span> {selectedPatient.medicalHistory.join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Dirección:</span> {selectedPatient.address}</p>
                  </div>
               </div>

               {/* Gemini Widget */}
               <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 relative">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                      <BrainCircuit size={16}/> Gemini Assistant
                    </h4>
                    {!aiSummary && (
                      <button 
                        onClick={handleGenerateAiSummary} 
                        disabled={loadingAi}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loadingAi ? 'Analizando...' : 'Generar Resumen'}
                      </button>
                    )}
                  </div>
                  {aiSummary && (
                    <div className="text-sm text-indigo-800 space-y-2">
                      <ul className="list-disc pl-4 space-y-1">
                        {aiSummary.resumen.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                      <p className="font-medium mt-2">Recomendación:</p>
                      <p className="italic">{aiSummary.recomendacion}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-2">
              
              {/* TAB: CLINICAL HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Evolución Clínica</h3>
                    <button 
                      onClick={() => setShowNewRecord(true)}
                      className="bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 flex items-center space-x-2 text-sm"
                    >
                      <Plus size={16} /> <span>Nueva Evolución</span>
                    </button>
                  </div>

                  {showNewRecord && (
                    <div className="bg-white border border-brand-200 p-4 rounded-lg mb-6 shadow-md ring-1 ring-brand-100">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-brand-700">Nueva Entrada</h4>
                        <button onClick={() => setShowNewRecord(false)}><X size={18} className="text-slate-400"/></button>
                      </div>
                      <input 
                        className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-brand-200 outline-none" 
                        placeholder="Procedimiento (ej. Endodoncia)"
                        value={newProcedure}
                        onChange={e => setNewProcedure(e.target.value)}
                      />
                      <textarea 
                        className="w-full mb-3 p-2 border rounded h-24 focus:ring-2 focus:ring-brand-200 outline-none" 
                        placeholder="Detalles clínicos, observaciones..."
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                      />
                      <div className="flex items-center gap-4 mb-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 bg-slate-50 border px-3 py-1 rounded"
                        >
                            <Camera size={16}/> Adjuntar Rx/Foto
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        <span className="text-xs text-slate-400">{attachments.length} archivos</span>
                      </div>
                      <button 
                        onClick={submitRecord}
                        className="w-full bg-brand-600 text-white py-2 rounded font-medium hover:bg-brand-700"
                      >
                        Guardar y Firmar
                      </button>
                    </div>
                  )}

                  {patientRecords.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-8">No hay registros previos.</p>
                  ) : (
                    patientRecords.map(record => (
                      <div key={record.id} className="relative pl-6 border-l-2 border-slate-200 pb-6 last:border-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-2 border-white shadow-sm"></div>
                        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-slate-800">{record.procedure}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                {record.isLocked && <span title="Firmado y Bloqueado"><ShieldCheck size={12} className="text-green-600" /></span>}
                                {record.date}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm whitespace-pre-wrap mb-2">{record.notes}</p>
                          {record.attachments.length > 0 && (
                            <div className="flex gap-2">
                              {record.attachments.map((img, i) => (
                                <img key={i} src={img} alt="Rx" className="h-16 w-16 object-cover rounded border bg-black" />
                              ))}
                            </div>
                          )}
                          <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                             <span>Dr/a ID: {record.dentistId}</span>
                             <span className="flex items-center gap-1"><History size={10}/> v{record.version}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: TREATMENT PLANS */}
              {activeTab === 'plans' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-slate-800">Planes de Tratamiento</h3>
                     <button className="text-brand-600 text-sm font-medium hover:underline">+ Crear Presupuesto</button>
                  </div>
                  
                  {patientPlans.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                          <ClipboardList className="mx-auto text-slate-300 mb-2" size={32}/>
                          <p className="text-slate-500">No hay planes activos.</p>
                      </div>
                  ) : (
                      patientPlans.map(plan => (
                          <div key={plan.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                              <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                  <h4 className="font-bold text-slate-700">{plan.name}</h4>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold uppercase">{plan.status}</span>
                              </div>
                              <div className="p-4">
                                  <div className="space-y-3">
                                      {plan.stages.map(stage => (
                                          <div key={stage.id} className="flex justify-between items-center text-sm">
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-2 h-2 rounded-full ${stage.status === 'done' ? 'bg-green-500' : stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                  <span className={stage.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}>{stage.description}</span>
                                              </div>
                                              <span className="font-mono">${stage.cost}</span>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center font-bold text-slate-800">
                                      <span>Total Presupuestado</span>
                                      <span>${plan.totalCost}</span>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
                </div>
              )}

              {/* TAB: CONSENTS */}
              {activeTab === 'consents' && (
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-slate-800 mb-4">Consentimientos Informados</h3>
                   <div className="space-y-3">
                       {patientConsents.map(consent => (
                           <div key={consent.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50">
                               <div>
                                   <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                       <FileText size={16} className="text-slate-400"/>
                                       {consent.title}
                                   </h4>
                                   <p className="text-xs text-slate-500 mt-1 max-w-md truncate">{consent.content}</p>
                                   {consent.isSigned ? (
                                       <p className="text-xs text-green-600 mt-1 font-medium">Firmado el {consent.signedAt} (Digital)</p>
                                   ) : (
                                       <p className="text-xs text-orange-600 mt-1">Pendiente de firma</p>
                                   )}
                               </div>
                               {!consent.isSigned ? (
                                   <button 
                                      onClick={() => handleSignConsent(consent.id)}
                                      className="text-brand-600 border border-brand-200 bg-white px-3 py-1 rounded hover:bg-brand-50 text-sm flex items-center gap-2"
                                   >
                                       <PenTool size={14}/> Firmar
                                   </button>
                               ) : (
                                   <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                       <ShieldCheck size={16}/>
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Directorio de Pacientes</h1>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center space-x-2">
          <Plus size={20} /> <span className="hidden sm:inline">Nuevo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o DNI..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                  <td className="px-6 py-4 text-slate-600">{patient.dni}</td>
                  <td className="px-6 py-4 text-slate-600">{patient.phone}</td>
                  <td className="px-6 py-4">
                    {patient.socialService ? (
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                         Servicio Social
                       </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Privado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedPatient(patient)}
                      className="text-brand-600 hover:text-brand-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                    >
                      <FileText size={16} /> Ver Expediente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
};