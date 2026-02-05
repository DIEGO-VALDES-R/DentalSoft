import React, { useState } from 'react';
import { MedicalExcuse, Patient, User } from '../types';
import { FileText, Plus, Printer, Calendar, Clock } from 'lucide-react';

interface MedicalExcusesProps {
  patient: Patient;
  currentUser: User;
  excuses: MedicalExcuse[];
  onAdd: (excuse: MedicalExcuse) => void;
}

export const MedicalExcusesManager: React.FC<MedicalExcusesProps> = ({
  patient,
  currentUser,
  excuses,
  onAdd
}) => {
  const [showForm, setShowForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [daysOff, setDaysOff] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const calculateEndDate = (start: string, days: number): string => {
    const date = new Date(start);
    date.setDate(date.getDate() + days - 1);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = () => {
    if (!diagnosis || daysOff < 1) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    const endDate = calculateEndDate(startDate, daysOff);

    const newExcuse: MedicalExcuse = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: patient.id,
      dentistId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      daysOff,
      startDate,
      endDate,
      notes,
      isSigned: true
    };

    onAdd(newExcuse);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setDiagnosis('');
    setDaysOff(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handlePrint = (excuse: MedicalExcuse) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Incapacidad Médica Odontológica</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #0284c7; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { 
            margin: 0; 
            color: #0284c7; 
            font-size: 28px;
          }
          .header p { 
            margin: 5px 0; 
            color: #666; 
          }
          .document-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
            color: #333;
          }
          .content {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            background: #f9fafb;
          }
          .content p {
            margin: 15px 0;
            font-size: 14px;
          }
          .highlight {
            background: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
          .dates-box {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            padding: 20px;
            background: #e0f2fe;
            border-radius: 8px;
          }
          .date-item {
            text-align: center;
          }
          .date-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .date-item .value {
            font-size: 18px;
            font-weight: bold;
            color: #0284c7;
            margin-top: 5px;
          }
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .signature-section {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 45%;
          }
          .signature-line {
            border-top: 2px solid #333;
            margin-top: 60px;
            padding-top: 10px;
          }
          @media print { 
            button { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DentalCore - Clínica Odontológica</h1>
          <p>Av. Principal #123 | Tel: (601) 555-0001</p>
          <p>NIT: 900.123.456-7</p>
        </div>

        <div class="document-title">
          INCAPACIDAD MÉDICA ODONTOLÓGICA
        </div>

        <div class="content">
          <p><strong>Fecha de Expedición:</strong> ${new Date(excuse.date).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          
          <p style="margin-top: 30px;">
            El suscrito <strong>${currentUser.name}</strong>, 
            ${currentUser.specialty || 'Odontólogo General'}, 
            con Registro Profesional <strong>${currentUser.id}</strong>,
          </p>

          <p style="font-size: 16px; font-weight: bold; margin: 20px 0;">CERTIFICA QUE:</p>

          <p>
            El(la) paciente <strong style="font-size: 16px;">${patient.name.toUpperCase()}</strong>, 
            identificado(a) con documento <strong>${patient.dni}</strong>, 
            fue atendido(a) en esta institución y presenta el siguiente diagnóstico odontológico:
          </p>

          <div class="highlight">
            <strong>DIAGNÓSTICO:</strong> ${excuse.diagnosis}
          </div>

          <p>
            Por lo anterior, se recomienda <strong>INCAPACIDAD LABORAL/ACADÉMICA</strong> 
            por un período de:
          </p>
        </div>

        <div class="dates-box">
          <div class="date-item">
            <div class="label">Inicio</div>
            <div class="value">${new Date(excuse.startDate).toLocaleDateString('es-ES')}</div>
          </div>
          <div class="date-item">
            <div class="label">Días de Incapacidad</div>
            <div class="value">${excuse.daysOff} ${excuse.daysOff === 1 ? 'DÍA' : 'DÍAS'}</div>
          </div>
          <div class="date-item">
            <div class="label">Finalización</div>
            <div class="value">${new Date(excuse.endDate).toLocaleDateString('es-ES')}</div>
          </div>
        </div>

        ${excuse.notes ? `
          <div style="margin: 20px 0; padding: 15px; border: 1px dashed #666; background: #fff;">
            <strong>Observaciones Adicionales:</strong>
            <p style="margin-top: 10px;">${excuse.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p style="font-size: 12px; color: #666;">
            Este documento es válido únicamente con firma y sello del profesional. 
            No tiene validez si presenta tachones o enmendaduras.
          </p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              <strong>${currentUser.name}</strong><br>
              ${currentUser.specialty || 'Odontólogo General'}<br>
              Reg. Prof.: ${currentUser.id}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const endDate = calculateEndDate(startDate, daysOff);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Incapacidades Médicas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
        >
          <Plus size={18}/> Nueva Incapacidad
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">Emitir Incapacidad Médica</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diagnóstico Odontológico *
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                rows={3}
                placeholder="Describir el diagnóstico que justifica la incapacidad..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Días de Incapacidad *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={daysOff}
                  onChange={(e) => setDaysOff(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Preview de fechas */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-orange-600"/>
                <span className="text-sm font-semibold text-orange-800">Vista Previa del Período</span>
              </div>
              <div className="flex justify-around text-sm">
                <div>
                  <p className="text-slate-500">Inicio</p>
                  <p className="font-bold text-slate-800">
                    {new Date(startDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-slate-400"/>
                  <span className="ml-2 font-bold text-orange-600">{daysOff} días</span>
                </div>
                <div>
                  <p className="text-slate-500">Finalización</p>
                  <p className="font-bold text-slate-800">
                    {new Date(endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observaciones Adicionales (Opcional)
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                rows={2}
                placeholder="Recomendaciones, restricciones específicas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold"
            >
              Emitir Incapacidad
            </button>
          </div>
        </div>
      )}

      {/* Lista de Incapacidades */}
      <div className="space-y-3">
        {excuses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <FileText size={48} className="mx-auto text-slate-300 mb-2"/>
            <p className="text-slate-500">No hay incapacidades registradas</p>
          </div>
        ) : (
          excuses.map((excuse) => (
            <div 
              key={excuse.id} 
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-orange-600"/>
                    <span className="font-bold text-slate-800">
                      Incapacidad - {new Date(excuse.date).toLocaleDateString('es-ES')}
                    </span>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {excuse.daysOff} {excuse.daysOff === 1 ? 'día' : 'días'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      <strong>Dx:</strong> {excuse.diagnosis}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>
                        <strong>Desde:</strong> {new Date(excuse.startDate).toLocaleDateString('es-ES')}
                      </span>
                      <span>
                        <strong>Hasta:</strong> {new Date(excuse.endDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {excuse.notes && (
                      <p className="text-slate-500 italic text-xs mt-2">
                        <strong>Obs:</strong> {excuse.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePrint(excuse)}
                  className="text-orange-600 hover:bg-orange-50 p-2 rounded ml-4"
                  title="Imprimir"
                >
                  <Printer size={20}/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalExcusesManager;
