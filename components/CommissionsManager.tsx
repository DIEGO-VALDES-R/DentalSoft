import React, { useMemo, useState } from 'react';
import { Commission, User, Invoice, ServiceItem, Patient } from '../types';
import { DollarSign, TrendingUp, Calendar, Download, Eye } from 'lucide-react';

interface CommissionsProps {
  dentists: User[];
  invoices: Invoice[];
  services: ServiceItem[];
  patients: Patient[];
  currentUser: User;
}

export const CommissionsManager: React.FC<CommissionsProps> = ({
  dentists,
  invoices,
  services,
  patients,
  currentUser
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDentist, setSelectedDentist] = useState<string>(
    currentUser.role === 'dentist' ? currentUser.id : 'all'
  );

  // Generate available periods (last 12 months)
  const availablePeriods = useMemo(() => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      periods.push({ value: period, label });
    }
    return periods;
  }, []);

  // Calculate commissions
  const commissions = useMemo(() => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const commissionsMap = new Map<string, Commission>();

    // Filter invoices for the selected period
    const periodInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getFullYear() === year && 
             invDate.getMonth() + 1 === month &&
             (inv.status === 'paid' || inv.status === 'factus_submitted');
    });

    // For each dentist, calculate their commissions
    dentists.forEach(dentist => {
      if (dentist.role !== 'dentist' && dentist.role !== 'admin') return;

      const dentistInvoices = periodInvoices.filter(inv => {
        // In real scenario, you'd track which dentist performed the service
        // For now, we'll distribute based on assignment logic
        return true; // Placeholder
      });

      const serviceCommissions = dentistInvoices.flatMap(inv => {
        const patient = patients.find(p => p.id === inv.patientId);
        
        return inv.items.map(item => {
          const service = services.find(s => s.id === item.serviceId);
          const commissionRate = dentist.commissionRate || 0.30; // Default 30%
          const commissionAmount = item.price * commissionRate;

          return {
            id: Math.random().toString(36).substr(2, 9),
            serviceId: item.serviceId || 'unknown',
            serviceName: service?.name || item.description,
            patientId: inv.patientId,
            patientName: patient?.name || 'Desconocido',
            date: inv.date,
            basePrice: item.price,
            commissionRate,
            amount: commissionAmount
          };
        });
      });

      const totalCommission = serviceCommissions.reduce((sum, s) => sum + s.amount, 0);
      const baseSalary = 0; // Would come from dentist contract

      commissionsMap.set(dentist.id, {
        id: Math.random().toString(36).substr(2, 9),
        dentistId: dentist.id,
        period: selectedPeriod,
        services: serviceCommissions,
        totalCommission,
        baseSalary,
        totalPaid: totalCommission + baseSalary,
        status: 'pending'
      });
    });

    return Array.from(commissionsMap.values());
  }, [selectedPeriod, invoices, dentists, services, patients]);

  const filteredCommissions = selectedDentist === 'all' 
    ? commissions 
    : commissions.filter(c => c.dentistId === selectedDentist);

  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.totalCommission, 0);

  const exportToCSV = (commission: Commission) => {
    const dentist = dentists.find(d => d.id === commission.dentistId);
    const csvContent = [
      ['Reporte de Comisiones'],
      [`Odontólogo: ${dentist?.name}`],
      [`Período: ${commission.period}`],
      [`Total Comisiones: $${commission.totalCommission.toFixed(2)}`],
      [],
      ['Fecha', 'Paciente', 'Servicio', 'Precio Base', 'Tasa %', 'Comisión'],
      ...commission.services.map(s => [
        s.date,
        s.patientName,
        s.serviceName,
        s.basePrice.toFixed(2),
        `${(s.commissionRate * 100).toFixed(0)}%`,
        s.amount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comisiones_${dentist?.name.replace(' ', '_')}_${commission.period}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sistema de Comisiones</h1>
          <p className="text-slate-500">Gestión de comisiones por servicios prestados</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            {availablePeriods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {currentUser.role === 'admin' && (
            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="all">Todos los Odontólogos</option>
              {dentists.filter(d => d.role === 'dentist').map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Total Comisiones del Período</p>
            <p className="text-4xl font-bold">${totalCommissions.toFixed(2)}</p>
            <p className="text-green-100 text-sm mt-2">
              {filteredCommissions.length} {filteredCommissions.length === 1 ? 'odontólogo' : 'odontólogos'}
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-full">
            <DollarSign size={48}/>
          </div>
        </div>
      </div>

      {/* Commissions List */}
      <div className="space-y-4">
        {filteredCommissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-slate-300 mb-4"/>
            <p className="text-slate-500">No hay comisiones para este período</p>
          </div>
        ) : (
          filteredCommissions.map(commission => {
            const dentist = dentists.find(d => d.id === commission.dentistId);
            const [showDetails, setShowDetails] = useState(false);

            return (
              <div key={commission.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img 
                        src={dentist?.avatar} 
                        alt={dentist?.name}
                        className="w-12 h-12 rounded-full border-2 border-brand-500"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{dentist?.name}</h3>
                        <p className="text-sm text-slate-500">{dentist?.specialty || 'Odontólogo General'}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Tasa de comisión: {((dentist?.commissionRate || 0.30) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Total Comisiones</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${commission.totalCommission.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {commission.services.length} servicios
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white border-b border-slate-100 flex gap-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    <Eye size={16}/>
                    {showDetails ? 'Ocultar' : 'Ver'} Detalles
                  </button>
                  <button
                    onClick={() => exportToCSV(commission)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
                  >
                    <Download size={16}/>
                    Exportar CSV
                  </button>
                  {currentUser.role === 'admin' && commission.status === 'pending' && (
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium ml-auto"
                    >
                      <DollarSign size={16}/>
                      Marcar como Pagado
                    </button>
                  )}
                </div>

                {/* Details Table */}
                {showDetails && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-left">Paciente</th>
                            <th className="px-4 py-3 text-left">Servicio</th>
                            <th className="px-4 py-3 text-right">Precio Base</th>
                            <th className="px-4 py-3 text-right">Tasa</th>
                            <th className="px-4 py-3 text-right">Comisión</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {commission.services.map(service => (
                            <tr key={service.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-600">
                                {new Date(service.date).toLocaleDateString('es-ES')}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {service.patientName}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {service.serviceName}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-700">
                                ${service.basePrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-600">
                                {(service.commissionRate * 100).toFixed(0)}%
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">
                                ${service.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-right font-bold text-slate-700">
                              Total:
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                              ${commission.totalCommission.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="px-6 py-3 bg-slate-50">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                    commission.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    <Calendar size={12}/>
                    {commission.status === 'paid' ? `Pagado el ${commission.paidDate}` :
                     commission.status === 'processing' ? 'En Proceso' :
                     'Pendiente de Pago'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommissionsManager;
