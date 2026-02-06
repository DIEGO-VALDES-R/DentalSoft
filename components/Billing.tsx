import React, { useState } from 'react';
import { Invoice, Patient, ServiceItem } from '../types';
import { Plus, Printer, Send, FileCheck } from 'lucide-react';

interface BillingProps {
  invoices: Invoice[];
  patients: Patient[];
  services: ServiceItem[];
  onAddInvoice?: (invoice: Invoice) => void;
  onUpdateInvoice?: (id: string, invoice: Partial<Invoice>) => void;
}

const Billing: React.FC<BillingProps> = ({ 
  invoices, 
  patients, 
  services,
  onAddInvoice,
  onUpdateInvoice
}) => {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [invoiceData, setInvoiceData] = useState({
    patientId: '',
    items: [] as { serviceId: string; description: string; price: number }[],
    notes: ''
  });

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { serviceId: '', description: '', price: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price and description when service is selected
    if (field === 'serviceId') {
      const service = services.find(s => s.id === value);
      if (service) {
        newItems[index].price = service.basePrice;
        newItems[index].description = service.name;
      }
    }
    
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const removeItem = (index: number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmit = async () => {
    if (!invoiceData.patientId || invoiceData.items.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const total = calculateTotal();

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: invoiceData.patientId,
      date: new Date().toISOString().split('T')[0],
      amount: total,
      status: 'pending',
      items: invoiceData.items.map(item => ({
        description: item.description,
        price: item.price,
        serviceId: item.serviceId
      })),
      paidAmount: 0
    };

    if (onAddInvoice) {
      onAddInvoice(newInvoice);
    }

    setToast('Factura creada exitosamente');
    setTimeout(() => setToast(null), 3000);

    resetForm();
  };

  const handleEmitFactus = (id: string) => {
    setToast('Conectando con Factus...');
    setTimeout(() => {
      if (onUpdateInvoice) {
        onUpdateInvoice(id, { 
          status: 'factus_submitted', 
          electronicInvoiceCode: `CUFE-${Math.random().toString(36).substr(2, 8).toUpperCase()}` 
        });
      }
      setToast('¡Factura electrónica emitida exitosamente!');
      setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  const printInvoice = (invoice: Invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${invoice.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0284c7;
            margin: 0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-box {
            flex: 1;
          }
          .info-box h3 {
            color: #0284c7;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #0284c7;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .totals table {
            width: 300px;
            margin-left: auto;
          }
          .total-row {
            font-weight: bold;
            font-size: 1.2em;
            background-color: #f0f0f0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DentalCore</h1>
          <p>Clínica Dental Profesional</p>
          <p>Tel: (601) 555-0001 | info@dentalcore.com</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Factura #${invoice.id}</h3>
            <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString('es-ES')}</p>
            <p><strong>Estado:</strong> ${
              invoice.status === 'paid' ? 'Pagada' : 
              invoice.status === 'factus_submitted' ? 'Facturada Electrónicamente' : 
              'Pendiente'
            }</p>
            ${invoice.electronicInvoiceCode ? `<p><strong>CUFE:</strong> ${invoice.electronicInvoiceCode}</p>` : ''}
          </div>
          <div class="info-box">
            <h3>Cliente</h3>
            <p><strong>${patient?.name || 'N/A'}</strong></p>
            <p>DNI: ${patient?.dni || 'N/A'}</p>
            <p>Tel: ${patient?.phone || 'N/A'}</p>
            <p>Email: ${patient?.email || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: right;">$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td>$${invoice.amount.toFixed(2)}</td>
            </tr>
            ${invoice.paidAmount && invoice.paidAmount > 0 ? `
            <tr>
              <td>Pagado:</td>
              <td>$${invoice.paidAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Saldo:</td>
              <td>$${(invoice.amount - invoice.paidAmount).toFixed(2)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="footer">
          <p>Gracias por confiar en DentalCore</p>
          ${invoice.electronicInvoiceCode ? 
            '<p><strong>Factura Electrónica - Documento Válido ante DIAN</strong></p>' : 
            '<p>Este documento es una representación impresa de la factura</p>'
          }
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const resetForm = () => {
    setInvoiceData({
      patientId: '',
      items: [],
      notes: ''
    });
    setShowNewInvoice(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const patient = patients.find(p => p.id === inv.patientId);
    return patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           inv.id.includes(searchTerm);
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Facturación</h1>
        <button
          onClick={() => setShowNewInvoice(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
        >
          <Plus size={20} /> <span>Nueva Factura</span>
        </button>
      </div>

      {/* New Invoice Form */}
      {showNewInvoice && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Nueva Factura</h3>
            <button 
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Paciente *
              </label>
              <select
                value={invoiceData.patientId}
                onChange={(e) => setInvoiceData({ ...invoiceData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Seleccionar paciente...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.dni}
                  </option>
                ))}
              </select>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Servicios *
                </label>
                <button
                  onClick={handleAddItem}
                  className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700 font-medium"
                >
                  <Plus size={16} /> Agregar servicio
                </button>
              </div>

              {invoiceData.items.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">No hay servicios agregados</p>
                  <button
                    onClick={handleAddItem}
                    className="mt-2 text-emerald-600 text-sm hover:underline"
                  >
                    Agregar primer servicio
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <select
                        value={item.serviceId}
                        onChange={(e) => updateItem(index, 'serviceId', e.target.value)}
                        className="col-span-8 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      >
                        <option value="">Seleccionar servicio...</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} - ${service.basePrice.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                        className="col-span-3 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Precio"
                        step="0.01"
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="col-span-1 text-red-600 hover:text-red-700 flex items-center justify-center"
                        title="Eliminar"
                      >
                        <span className="text-xl">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Observaciones, descuentos especiales, etc..."
              />
            </div>

            {/* Total Preview */}
            {invoiceData.items.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg font-bold text-emerald-800">
                  <span>TOTAL:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={!invoiceData.patientId || invoiceData.items.length === 0}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Send size={18} />
                Crear Factura
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <input
            type="text"
            placeholder="Buscar por paciente o número de factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Factus</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => {
                  const patient = patients.find(p => p.id === invoice.patientId);
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">#{invoice.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{patient?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(invoice.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {invoice.status === 'paid' && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Pagado
                          </span>
                        )}
                        {invoice.status === 'pending' && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                            Pendiente
                          </span>
                        )}
                        {invoice.status === 'factus_submitted' && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            Facturada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {invoice.electronicInvoiceCode ? (
                          <div className="flex items-center text-green-600 gap-1">
                            <FileCheck size={16} />
                            <span className="truncate w-24 font-mono text-xs">
                              {invoice.electronicInvoiceCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No emitida</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status !== 'factus_submitted' && invoice.amount > 0 && (
                            <button
                              onClick={() => handleEmitFactus(invoice.id)}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                              title="Emitir a Factus"
                            >
                              <Send size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => printInvoice(invoice)}
                            className="text-slate-600 hover:bg-slate-100 p-2 rounded"
                            title="Imprimir"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;