import React, { useState } from 'react';
import { Invoice, Patient, ServiceItem } from '../types';
import { Plus, Printer, Send, Edit2, Eye, Download } from 'lucide-react';

interface BillingProps {
  invoices: Invoice[];
  patients: Patient[];
  services: ServiceItem[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (id: string, invoice: Partial<Invoice>) => void;
}

const Billing: React.FC<BillingProps> = ({ invoices, patients, services, onAddInvoice, onUpdateInvoice }) => {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [invoiceData, setInvoiceData] = useState({
    patientId: '',
    items: [] as { serviceId: string; quantity: number; price: number }[],
    discount: 0,
    notes: ''
  });

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { serviceId: '', quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price when service is selected
    if (field === 'serviceId') {
      const service = services.find(s => s.id === value);
      if (service) {
        newItems[index].price = service.price;
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

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - invoiceData.discount;
  };

  const handleSubmit = async () => {
    if (!invoiceData.patientId || invoiceData.items.length === 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: invoiceData.patientId,
      date: new Date().toISOString().split('T')[0],
      items: invoiceData.items.map(item => {
        const service = services.find(s => s.id === item.serviceId);
        return {
          description: service?.name || '',
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity
        };
      }),
      subtotal: calculateSubtotal(),
      discount: invoiceData.discount,
      total: calculateTotal(),
      status: 'pending',
      notes: invoiceData.notes
    };

    onAddInvoice(newInvoice);
    
    // Try to send to Factus
    try {
      await sendToFactus(newInvoice);
      alert('Factura creada y enviada a Factus exitosamente');
    } catch (error) {
      alert('Factura creada localmente. Error al enviar a Factus: ' + error);
    }

    resetForm();
  };

  const sendToFactus = async (invoice: Invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    
    const factusPayload = {
      cliente: {
        nombre: patient?.name,
        identificacion: patient?.dni,
        telefono: patient?.phone,
        email: patient?.email || '',
        direccion: patient?.address
      },
      items: invoice.items.map(item => ({
        descripcion: item.description,
        cantidad: item.quantity,
        precio_unitario: item.unitPrice,
        subtotal: item.total
      })),
      subtotal: invoice.subtotal,
      descuento: invoice.discount,
      total: invoice.total,
      notas: invoice.notes
    };

    const response = await fetch('https://api.factus.com/v1/facturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_FACTUS_API_KEY' // Replace with actual key
      },
      body: JSON.stringify(factusPayload)
    });

    if (!response.ok) {
      throw new Error('Error en la API de Factus');
    }

    return response.json();
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
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #4F46E5;
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
            color: #4F46E5;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #4F46E5;
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
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Factura #${invoice.id}</h3>
            <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString('es-ES')}</p>
            <p><strong>Estado:</strong> ${invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}</p>
          </div>
          <div class="info-box">
            <h3>Cliente</h3>
            <p><strong>${patient?.name || 'N/A'}</strong></p>
            <p>DNI: ${patient?.dni || 'N/A'}</p>
            <p>Tel: ${patient?.phone || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>$${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${invoice.discount > 0 ? `
            <tr>
              <td>Descuento:</td>
              <td>-$${invoice.discount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>TOTAL:</td>
              <td>$${invoice.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        ${invoice.notes ? `<p><strong>Notas:</strong> ${invoice.notes}</p>` : ''}

        <div class="footer">
          <p>Gracias por confiar en DentalCore</p>
          <p>Este documento es una representación impresa de la factura electrónica</p>
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

  const downloadInvoicePDF = async (invoice: Invoice) => {
    // This would require a PDF library like jsPDF
    alert('Función de descarga PDF en desarrollo. Por ahora usa "Imprimir" y selecciona "Guardar como PDF"');
  };

  const resetForm = () => {
    setInvoiceData({
      patientId: '',
      items: [],
      discount: 0,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Facturación</h1>
        <button
          onClick={() => setShowNewInvoice(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center space-x-2"
        >
          <Plus size={20} /> <span>Nueva Factura</span>
        </button>
      </div>

      {/* New Invoice Form */}
      {showNewInvoice && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Nueva Factura</h3>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Paciente *
              </label>
              <select
                value={invoiceData.patientId}
                onChange={(e) => setInvoiceData({ ...invoiceData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
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
                  Servicios
                </label>
                <button
                  onClick={handleAddItem}
                  className="text-brand-600 text-sm flex items-center gap-1 hover:text-brand-700"
                >
                  <Plus size={16} /> Agregar servicio
                </button>
              </div>

              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <select
                    value={item.serviceId}
                    onChange={(e) => updateItem(index, 'serviceId', e.target.value)}
                    className="col-span-6 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Seleccionar servicio...</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Cant."
                    min="1"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                    className="col-span-3 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Precio"
                    step="0.01"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="col-span-1 text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descuento
              </label>
              <input
                type="number"
                value={invoiceData.discount}
                onChange={(e) => setInvoiceData({ ...invoiceData, discount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas
              </label>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg h-20"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Totals */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              {invoiceData.discount > 0 && (
                <div className="flex justify-between mb-2 text-red-600">
                  <span>Descuento:</span>
                  <span>-${invoiceData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                <span>TOTAL:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Crear y Enviar a Factus
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar por paciente o número de factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Factura</th>
                <th className="px-6 py-4 text-left">Paciente</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(invoice => {
                const patient = patients.find(p => p.id === invoice.patientId);
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">#{invoice.id}</td>
                    <td className="px-6 py-4">{patient?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(invoice.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => printInvoice(invoice)}
                          className="text-brand-600 hover:text-brand-800"
                          title="Imprimir"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => downloadInvoicePDF(invoice)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
