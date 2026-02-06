import React, { useState } from 'react';
import { Invoice } from '../types';
import { FileCheck, Printer, Send, Plus } from 'lucide-react';

interface BillingProps {
  invoices: Invoice[];
}

const Billing: React.FC<BillingProps> = ({ invoices }) => {
  const [invoicesList, setInvoicesList] = useState(invoices);
  const [toast, setToast] = useState<string | null>(null);

  const handleEmitFactus = (id: string) => {
    // Simulation of API call to Factus via Laravel Backend
    // await api.post('/billing/emit', { invoiceId: id });
    setToast('Conectando con Factus...');
    setTimeout(() => {
        setInvoicesList(prev => prev.map(inv => 
            inv.id === id ? { ...inv, status: 'factus_submitted', electronicInvoiceCode: `CUFE-${Math.random().toString(36).substr(2, 8).toUpperCase()}` } : inv
        ));
        setToast('¡Factura electrónica emitida exitosamente!');
        setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
            {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Facturación y Pagos</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2">
          <Plus size={20} /> <span>Nueva Factura</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Factus (Electrónica)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoicesList.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">#{inv.id}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">${inv.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                     {inv.status === 'paid' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Pagado</span>}
                     {inv.status === 'pending' && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Pendiente</span>}
                     {inv.status === 'factus_submitted' && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Facturada</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {inv.electronicInvoiceCode ? (
                        <div className="flex items-center text-green-600 gap-1">
                            <FileCheck size={16} /> 
                            <span className="truncate w-24">{inv.electronicInvoiceCode}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">No emitida</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        {inv.status !== 'factus_submitted' && inv.amount > 0 && (
                            <button 
                                onClick={() => handleEmitFactus(inv.id)}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Emitir a Factus">
                                <Send size={18} />
                            </button>
                        )}
                        <button className="text-slate-600 hover:bg-slate-100 p-2 rounded" title="Imprimir">
                            <Printer size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Billing;
