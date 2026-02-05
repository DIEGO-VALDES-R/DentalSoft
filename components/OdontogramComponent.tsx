import React, { useState } from 'react';
import { Odontogram, ToothState, User } from '../types';
import { Info, History, AlertCircle } from 'lucide-react';

interface OdontogramProps {
  patientId: string;
  odontogram: Odontogram | null;
  currentUser: User;
  onUpdate: (odontogram: Odontogram) => void;
}

const TOOTH_POSITIONS = {
  // Permanent teeth (32)
  permanent: {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  },
  // Deciduous teeth (20) - optional
  deciduous: {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [71, 72, 73, 74, 75],
    lowerRight: [85, 84, 83, 82, 81],
  }
};

const STATUS_COLORS: Record<ToothState['status'], string> = {
  healthy: 'bg-white border-slate-300',
  caries: 'bg-red-100 border-red-400',
  filled: 'bg-blue-100 border-blue-400',
  crown: 'bg-yellow-100 border-yellow-500',
  missing: 'bg-slate-200 border-slate-400 opacity-50',
  endodontic: 'bg-purple-100 border-purple-400',
  implant: 'bg-green-100 border-green-400',
  fracture: 'bg-orange-100 border-orange-400',
  extraction_planned: 'bg-red-200 border-red-500',
};

const STATUS_LABELS: Record<ToothState['status'], string> = {
  healthy: 'Sano',
  caries: 'Caries',
  filled: 'Obturado',
  crown: 'Corona',
  missing: 'Ausente',
  endodontic: 'Endodoncia',
  implant: 'Implante',
  fracture: 'Fractura',
  extraction_planned: 'Extracción Planificada',
};

export const OdontogramComponent: React.FC<OdontogramProps> = ({
  patientId,
  odontogram,
  currentUser,
  onUpdate
}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'permanent' | 'deciduous'>('permanent');

  const initializeOdontogram = (): Odontogram => {
    const teeth: { [key: number]: ToothState } = {};
    
    Object.values(TOOTH_POSITIONS[viewMode]).flat().forEach(toothNum => {
      teeth[toothNum] = {
        number: toothNum,
        status: 'healthy',
        history: []
      };
    });

    return {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      lastUpdated: new Date().toISOString(),
      teeth
    };
  };

  const currentOdontogram = odontogram || initializeOdontogram();

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
  };

  const updateToothStatus = (toothNumber: number, status: ToothState['status']) => {
    const updatedTeeth = { ...currentOdontogram.teeth };
    const tooth = updatedTeeth[toothNumber];
    
    updatedTeeth[toothNumber] = {
      ...tooth,
      status,
      history: [
        ...tooth.history,
        {
          date: new Date().toISOString().split('T')[0],
          procedure: `Cambio de estado a: ${STATUS_LABELS[status]}`,
          dentistId: currentUser.id
        }
      ]
    };

    onUpdate({
      ...currentOdontogram,
      teeth: updatedTeeth,
      lastUpdated: new Date().toISOString()
    });

    setSelectedTooth(null);
  };

  const renderTooth = (toothNumber: number) => {
    const tooth = currentOdontogram.teeth[toothNumber];
    if (!tooth) return null;

    return (
      <div
        key={toothNumber}
        onClick={() => handleToothClick(toothNumber)}
        className={`
          relative w-12 h-14 border-2 rounded-lg cursor-pointer
          transition-all hover:scale-110 hover:shadow-lg
          ${STATUS_COLORS[tooth.status]}
          ${selectedTooth === toothNumber ? 'ring-4 ring-brand-500 scale-110' : ''}
        `}
        title={`Diente ${toothNumber} - ${STATUS_LABELS[tooth.status]}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">{toothNumber}</span>
        </div>
        {tooth.status === 'missing' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl text-slate-400">×</span>
          </div>
        )}
      </div>
    );
  };

  const renderQuadrant = (teeth: number[], label: string) => (
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-500 font-medium mb-2">{label}</span>
      <div className="flex gap-1">
        {teeth.map(tooth => renderTooth(tooth))}
      </div>
    </div>
  );

  const selectedToothData = selectedTooth ? currentOdontogram.teeth[selectedTooth] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Odontograma Digital</h2>
          <p className="text-sm text-slate-500">
            Última actualización: {new Date(currentOdontogram.lastUpdated).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('permanent')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              viewMode === 'permanent' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Permanente (32)
          </button>
          <button
            onClick={() => setViewMode('deciduous')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              viewMode === 'deciduous' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Temporal (20)
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Info size={16}/> Leyenda de Estados
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-6 h-6 border-2 rounded ${STATUS_COLORS[status as ToothState['status']]}`}></div>
              <span className="text-xs text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Odontograma Visual */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-8">
          {/* Arcada Superior */}
          <div className="border-b-4 border-slate-300 pb-6">
            <p className="text-center text-sm font-semibold text-slate-600 mb-4">ARCADA SUPERIOR</p>
            <div className="flex justify-center gap-8">
              {renderQuadrant(TOOTH_POSITIONS[viewMode].upperRight, 'Cuadrante 1')}
              {renderQuadrant(TOOTH_POSITIONS[viewMode].upperLeft, 'Cuadrante 2')}
            </div>
          </div>

          {/* Arcada Inferior */}
          <div>
            <p className="text-center text-sm font-semibold text-slate-600 mb-4">ARCADA INFERIOR</p>
            <div className="flex justify-center gap-8">
              {renderQuadrant(TOOTH_POSITIONS[viewMode].lowerLeft, 'Cuadrante 3')}
              {renderQuadrant(TOOTH_POSITIONS[viewMode].lowerRight, 'Cuadrante 4')}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Edición */}
      {selectedToothData && (
        <div className="bg-white p-6 rounded-xl border-2 border-brand-200 shadow-lg animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Diente #{selectedToothData.number}
              </h3>
              <p className="text-sm text-slate-500">
                Estado actual: <span className="font-semibold">{STATUS_LABELS[selectedToothData.status]}</span>
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-brand-600 text-sm flex items-center gap-1 hover:underline"
            >
              <History size={14}/> Historial
            </button>
          </div>

          {/* Botones de Estado */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => updateToothStatus(selectedToothData.number, status as ToothState['status'])}
                className={`
                  p-2 text-xs font-medium rounded border-2 transition-all
                  ${selectedToothData.status === status 
                    ? 'ring-2 ring-brand-500' 
                    : 'hover:scale-105'}
                  ${STATUS_COLORS[status as ToothState['status']]}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Historial */}
          {showHistory && selectedToothData.history.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Historial de Procedimientos</h4>
              <div className="space-y-2">
                {selectedToothData.history.map((record, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex justify-between">
                      <span className="font-medium">{record.procedure}</span>
                      <span className="text-slate-500">{record.date}</span>
                    </div>
                    <span className="text-slate-500">Dr. ID: {record.dentistId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedToothData.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5"/>
                <div>
                  <p className="text-xs font-semibold text-yellow-800">Nota Clínica:</p>
                  <p className="text-xs text-yellow-700">{selectedToothData.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OdontogramComponent;
