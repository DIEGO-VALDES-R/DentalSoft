import React, { useState, useMemo } from 'react';
import { AccountReceivable, PaymentPlan, Invoice, Patient } from '../types';
import { DollarSign, AlertTriangle, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface AccountsReceivableProps {
  invoices: Invoice[];
  patients: Patient[];
  paymentPlans: PaymentPlan[];
  onCreatePlan: (plan: PaymentPlan) => void;
  onRecordPayment: (installmentId: string, planId: string) => void;
}

export const AccountsReceivable: React.FC<AccountsReceivableProps> = ({
  invoices,
  patients,
  paymentPlans,
  onCreatePlan,
  onRecordPayment
}) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  const [downPayment, setDownPayment] = useState(0);
  const [installmentCount, setInstallmentCount] = useState(3);
  const [interestRate, setInterestRate] = useState(0);

  // Calculate accounts receivable
  const accountsReceivable: AccountReceivable[] = useMemo(() => {
    const patientDebts = new Map<string, AccountReceivable>();

    invoices.forEach(invoice => {
      if (invoice.status === 'pending' || invoice.status === 'partially_paid') {
        const patient = patients.find(p => p.id === invoice.patientId);
        if (!patient) return;

        const remainingAmount = invoice.amount - (invoice.paidAmount || 0);
        const isOverdue = new Date(invoice.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        if (!patientDebts.has(invoice.patientId)) {
          patientDebts.set(invoice.patientId, {
            patientId: invoice.patientId,
            patientName: patient.name,
            totalDebt: 0,
            overdueDebt: 0,
            nextPaymentDue: invoice.date,
            invoices: []
          });
        }

        const account = patientDebts.get(invoice.patientId)!;
        account.totalDebt += remainingAmount;
        if (isOverdue) account.overdueDebt += remainingAmount;
        account.invoices.push({
          invoiceId: invoice.id,
          amount: remainingAmount,
          status: invoice.status
        });
      }
    });

    return Array.from(patientDebts.values()).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [invoices, patients]);

  const totalReceivable = accountsReceivable.reduce((sum, acc) => sum + acc.totalDebt, 0);
  const totalOverdue = accountsReceivable.reduce((sum, acc) => sum + acc.overdueDebt, 0);

  const handleCreatePlan = () => {
    const invoice = invoices.find(inv => inv.id === selectedInvoice);
    if (!invoice) return;

    const remainingAmount = invoice.amount - (invoice.paidAmount || 0);
    const amountToFinance = remainingAmount - downPayment;
    const totalWithInterest = amountToFinance * (1 + interestRate / 100);
    const installmentAmount = totalWithInterest / installmentCount;

    const installments = Array.from({ length: installmentCount }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      number: i + 1,
      amount: installmentAmount,
      dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending' as const
    }));

    const newPlan: PaymentPlan = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      totalAmount: invoice.amount,
      downPayment,
      installments,
      interestRate
    };

    onCreatePlan(newPlan);
    setShowPlanForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedInvoice('');
    setDownPayment(0);
    setInstallmentCount(3);
    setInterestRate(0);
  };

  const renderPatientPlans = (patientId: string) => {
    const plans = paymentPlans.filter(p => p.patientId === patientId);
    if (plans.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Planes de Pago Activos</h4>
        {plans.map(plan => {
          const pendingInstallments = plan.installments.filter(i => i.status === 'pending');
          const paidInstallments = plan.installments.filter(i => i.status === 'paid');
          const progress = (paidInstallments.length / plan.installments.length) * 100;

          return (
            <div key={plan.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-800">Plan de {plan.installments.length} Cuotas</p>
                  <p className="text-xs text-slate-500">Factura #{plan.invoiceId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">
                    {paidInstallments.length} / {plan.installments.length} cuotas pagadas
                  </p>
                  <div className="w-32 bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {plan.installments.map(inst => (
                  <div 
                    key={inst.id} 
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      inst.status === 'paid' ? 'bg-green-100 text-green-800' :
                      inst.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {inst.status === 'paid' ? (
                        <CheckCircle size={14} className="text-green-600"/>
                      ) : inst.status === 'overdue' ? (
                        <AlertTriangle size={14} className="text-red-600"/>
                      ) : (
                        <Clock size={14} className="text-slate-400"/>
                      )}
                      <span>Cuota #{inst.number}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${inst.amount.toFixed(2)}</p>
                      <p className="text-xs">
                        {inst.status === 'paid' ? (
                          `Pagado: ${inst.paidDate}`
                        ) : (
                          `Vence: ${new Date(inst.dueDate).toLocaleDateString('es-ES')}`
                        )}
                      </p>
                    </div>
                    {inst.status === 'pending' && (
                      <button
                        onClick={() => onRecordPayment(inst.id, plan.id)}
                        className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Registrar Pago
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <DollarSign size={24}/>
            <span className="font-medium">Total por Cobrar</span>
          </div>
          <div className="text-4xl font-bold mb-1">${totalReceivable.toFixed(2)}</div>
          <div className="text-blue-100 text-sm">{accountsReceivable.length} pacientes con saldo</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <AlertTriangle size={24}/>
            <span className="font-medium">Deuda Vencida</span>
          </div>
          <div className="text-4xl font-bold mb-1">${totalOverdue.toFixed(2)}</div>
          <div className="text-red-100 text-sm">Requiere atención inmediata</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <TrendingUp size={24}/>
            <span className="font-medium">Planes de Pago</span>
          </div>
          <div className="text-4xl font-bold mb-1">{paymentPlans.length}</div>
          <div className="text-green-100 text-sm">Activos en el sistema</div>
        </div>
      </div>

      {/* Formulario Nuevo Plan */}
      {showPlanForm && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg animate-fade-in">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Crear Plan de Pago</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seleccionar Factura Pendiente
              </label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedInvoice}
                onChange={(e) => setSelectedInvoice(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {invoices
                  .filter(inv => inv.status === 'pending' || inv.status === 'partially_paid')
                  .map(inv => {
                    const patient = patients.find(p => p.id === inv.patientId);
                    const remaining = inv.amount - (inv.paidAmount || 0);
                    return (
                      <option key={inv.id} value={inv.id}>
                        #{inv.id} - {patient?.name} - Saldo: ${remaining.toFixed(2)}
                      </option>
                    );
                  })}
              </select>
            </div>

            {selectedInvoice && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cuota Inicial
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={downPayment}
                      onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Número de Cuotas
                    </label>
                    <select
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(parseInt(e.target.value))}
                    >
                      {[2, 3, 4, 6, 8, 10, 12].map(n => (
                        <option key={n} value={n}>{n} cuotas</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tasa de Interés Mensual (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Resumen del Plan</h4>
                  {(() => {
                    const invoice = invoices.find(inv => inv.id === selectedInvoice)!;
                    const remaining = invoice.amount - (invoice.paidAmount || 0);
                    const toFinance = remaining - downPayment;
                    const totalWithInterest = toFinance * (1 + interestRate / 100);
                    const installmentAmount = totalWithInterest / installmentCount;

                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monto Total:</span>
                          <span className="font-bold">${remaining.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cuota Inicial:</span>
                          <span className="font-bold">- ${downPayment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-slate-600">A Financiar:</span>
                          <span className="font-bold">${toFinance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Interés ({interestRate}%):</span>
                          <span className="font-bold text-orange-600">
                            + ${(totalWithInterest - toFinance).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold text-base">
                          <span>Cuota Mensual:</span>
                          <span className="text-blue-600">${installmentAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <button
              onClick={() => {
                setShowPlanForm(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePlan}
              disabled={!selectedInvoice}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
            >
              Crear Plan
            </button>
          </div>
        </div>
      )}

      {/* Botón Crear Plan */}
      {!showPlanForm && (
        <button
          onClick={() => setShowPlanForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Calendar size={18}/> Crear Plan de Pago
        </button>
      )}

      {/* Lista de Cuentas por Cobrar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Pacientes con Saldo Pendiente</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {accountsReceivable.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              ¡Excelente! No hay cuentas pendientes de cobro.
            </div>
          ) : (
            accountsReceivable.map(account => (
              <div key={account.patientId} className="p-4 hover:bg-slate-50">
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setSelectedPatient(
                    selectedPatient === account.patientId ? null : account.patientId
                  )}
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{account.patientName}</h4>
                    <p className="text-sm text-slate-500">
                      {account.invoices.length} factura(s) pendiente(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      ${account.totalDebt.toFixed(2)}
                    </p>
                    {account.overdueDebt > 0 && (
                      <p className="text-sm text-red-600 font-semibold flex items-center gap-1 justify-end">
                        <AlertTriangle size={14}/>
                        ${account.overdueDebt.toFixed(2)} vencido
                      </p>
                    )}
                  </div>
                </div>

                {selectedPatient === account.patientId && renderPatientPlans(account.patientId)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivable;
