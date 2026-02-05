import React, { useState, useRef } from 'react';
import { Prescription, Patient, User } from '../types';
import { Plus, FileText, Printer, Trash2, PenTool } from 'lucide-react';

interface PrescriptionsProps {
  patient: Patient;
  currentUser: User;
  prescriptions: Prescription[];
  onAdd: (prescription: Prescription) => void;
}

const COMMON_MEDICATIONS = [
  { name: 'Amoxicilina', defaultDose: '500mg', defaultFrequency: 'Cada 8 horas', defaultDuration: '7 días' },
  { name: 'Ibuprofeno', defaultDose: '400mg', defaultFrequency: 'Cada 6-8 horas', defaultDuration: '3-5 días' },
  { name: 'Acetaminofén', defaultDose: '500mg', defaultFrequency: 'Cada 6 horas', defaultDuration: 'Según dolor' },
  { name: 'Clindamicina', defaultDose: '300mg', defaultFrequency: 'Cada 8 horas', defaultDuration: '7 días' },
  { name: 'Diclofenaco', defaultDose: '50mg', defaultFrequency: 'Cada 12 horas', defaultDuration: '3 días' },
  { name: 'Ketorolaco', defaultDose: '10mg', defaultFrequency: 'Cada 8 horas', defaultDuration: '3 días' },
];

export const PrescriptionsManager: React.FC<PrescriptionsProps> = ({
  patient,
  currentUser,
  prescriptions,
  onAdd
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<Prescription['medications']>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        dose: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ]);
  };

  const updateMedication = (id: string, field: string, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const selectCommonMed = (id: string, medData: typeof COMMON_MEDICATIONS[0]) => {
    setMedications(medications.map(med => 
      med.id === id ? {
        ...med,
        name: medData.name,
        dose: medData.defaultDose,
        frequency: medData.defaultFrequency,
        duration: medData.defaultDuration
      } : med
    ));
  };

  const handleSubmit = () => {
    if (!diagnosis || medications.length === 0) {
      alert('Debe agregar diagnóstico y al menos un medicamento');
      return;
    }

    const newPrescription: Prescription = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: patient.id,
      dentistId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medications: medications.filter(m => m.name),
      isSigned: true,
      signedAt: new Date().toISOString()
    };

    onAdd(newPrescription);
    setShowNewForm(false);
    setDiagnosis('');
    setMedications([]);
  };

  const handlePrint = (prescription: Prescription) => {
    const printContent = generatePrintContent(prescription);
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (prescription: Prescription) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescripción Médica</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #0284c7; }
          .header p { margin: 5px 0; color: #666; }
          .patient-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .patient-info div { margin: 5px 0; }
          .diagnosis { margin: 20px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; }
          .medications { margin: 20px 0; }
          .med-item { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .med-item h3 { margin: 0 0 10px 0; color: #0284c7; }
          .footer { margin-top: 60px; border-top: 2px solid #333; padding-top: 20px; }
          .signature { margin-top: 40px; text-align: right; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DentalCore - Clínica Odontológica</h1>
          <p>Av. Principal #123 | Tel: (601) 555-0001</p>
          <p>Registro Profesional: ${currentUser.id}</p>
        </div>

        <div class="patient-info">
          <h2 style="margin-top: 0;">Datos del Paciente</h2>
          <div><strong>Nombre:</strong> ${patient.name}</div>
          <div><strong>DNI:</strong> ${patient.dni}</div>
          <div><strong>Fecha:</strong> ${new Date(prescription.date).toLocaleDateString('es-ES')}</div>
        </div>

        <div class="diagnosis">
          <strong>Diagnóstico:</strong> ${prescription.diagnosis}
        </div>

        <div class="medications">
          <h2>Prescripción Médica</h2>
          ${prescription.medications.map((med, idx) => `
            <div class="med-item">
              <h3>${idx + 1}. ${med.name}</h3>
              <p><strong>Dosis:</strong> ${med.dose}</p>
              <p><strong>Frecuencia:</strong> ${med.frequency}</p>
              <p><strong>Duración:</strong> ${med.duration}</p>
              ${med.instructions ? `<p><strong>Instrucciones:</strong> ${med.instructions}</p>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p style="color: #666; font-size: 12px;">
            Esta prescripción es válida por 30 días desde la fecha de emisión.
          </p>
        </div>

        <div class="signature">
          <p>_________________________</p>
          <p><strong>${currentUser.name}</strong></p>
          <p>${currentUser.specialty || 'Odontólogo General'}</p>
          <p>Reg. Prof.: ${currentUser.id}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Prescripciones Médicas</h2>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 text-sm"
        >
          <Plus size={18}/> Nueva Prescripción
        </button>
      </div>

      {/* Formulario Nueva Prescripción */}
      {showNewForm && (
        <div className="bg-white border-2 border-brand-200 rounded-xl p-6 shadow-lg animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">Crear Prescripción</h3>
            <button onClick={() => setShowNewForm(false)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          {/* Diagnóstico */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Diagnóstico</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              rows={2}
              placeholder="Diagnóstico odontológico..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Medicamentos */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">Medicamentos</label>
              <button
                onClick={addMedication}
                className="text-brand-600 text-sm flex items-center gap-1 hover:underline"
              >
                <Plus size={14}/> Agregar Medicamento
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <select
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      value={med.name}
                      onChange={(e) => {
                        const selected = COMMON_MEDICATIONS.find(m => m.name === e.target.value);
                        if (selected) {
                          selectCommonMed(med.id, selected);
                        } else {
                          updateMedication(med.id, 'name', e.target.value);
                        }
                      }}
                    >
                      <option value="">Seleccionar o escribir...</option>
                      {COMMON_MEDICATIONS.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                      {med.name && !COMMON_MEDICATIONS.find(m => m.name === med.name) && (
                        <option value={med.name}>{med.name}</option>
                      )}
                    </select>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  {med.name && (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Dosis (ej: 500mg)"
                        className="p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={med.dose}
                        onChange={(e) => updateMedication(med.id, 'dose', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Frecuencia (ej: Cada 8 horas)"
                        className="p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={med.frequency}
                        onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Duración (ej: 7 días)"
                        className="p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={med.duration}
                        onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Instrucciones adicionales"
                        className="p-2 border rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={med.instructions}
                        onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setShowNewForm(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold flex items-center justify-center gap-2"
            >
              <PenTool size={18}/> Firmar y Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Prescripciones */}
      <div className="space-y-3">
        {prescriptions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <FileText size={48} className="mx-auto text-slate-300 mb-2"/>
            <p className="text-slate-500">No hay prescripciones registradas</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={18} className="text-brand-600"/>
                    <span className="font-bold text-slate-800">
                      {new Date(prescription.date).toLocaleDateString('es-ES')}
                    </span>
                    {prescription.isSigned && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Firmada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    <strong>Dx:</strong> {prescription.diagnosis}
                  </p>
                </div>
                <button
                  onClick={() => handlePrint(prescription)}
                  className="text-brand-600 hover:bg-brand-50 p-2 rounded"
                  title="Imprimir"
                >
                  <Printer size={20}/>
                </button>
              </div>

              <div className="space-y-2">
                {prescription.medications.map((med, idx) => (
                  <div key={idx} className="text-sm bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-semibold text-slate-800">{idx + 1}. {med.name}</p>
                    <p className="text-slate-600">
                      {med.dose} - {med.frequency} - {med.duration}
                    </p>
                    {med.instructions && (
                      <p className="text-slate-500 italic text-xs mt-1">{med.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PrescriptionsManager;
