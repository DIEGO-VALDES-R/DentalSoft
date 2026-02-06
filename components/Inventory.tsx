import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { AlertTriangle, Package, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onUpdateItem: (id: string, item: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    unit: 'unidad',
    minThreshold: 10,
    cost: 0,
    supplier: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      quantity: 0,
      unit: 'unidad',
      minThreshold: 10,
      cost: 0,
      supplier: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (editingId) {
      onUpdateItem(editingId, formData);
    } else {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      onAddItem(newItem);
    }
    resetForm();
  };

  const startEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
      cost: item.cost || 0,
      supplier: item.supplier || ''
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar "${name}" del inventario?`)) {
      onDeleteItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Control de Inventario</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center space-x-2"
        >
          <Plus size={20} /> <span>Agregar Material</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Editar Material' : 'Nuevo Material'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Material *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Ej: Guantes de látex"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU / Código *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Ej: GLV-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cantidad Actual
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidad
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="unidad">Unidad</option>
                <option value="caja">Caja</option>
                <option value="paquete">Paquete</option>
                <option value="ml">ml</option>
                <option value="gr">gr</option>
                <option value="kg">kg</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Costo Unitario
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editingId ? 'Guardar Cambios' : 'Agregar Material'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Package className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 mb-4">No hay materiales en el inventario</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Agregar el primero
            </button>
          </div>
        ) : (
          items.map(item => {
            const isLow = item.quantity <= item.minThreshold;
            return (
              <div
                key={item.id}
                className={`bg-white p-6 rounded-xl border ${
                  isLow ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'
                } shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-full ${isLow ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Package size={24} />
                  </div>
                  {isLow && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                      <AlertTriangle size={12} /> Stock Bajo
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h3>
                <p className="text-slate-500 text-sm mb-4">SKU: {item.sku}</p>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Disponible</p>
                    <p className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Min. Requerido</p>
                    <p className="text-sm font-medium">{item.minThreshold} {item.unit}</p>
                  </div>
                </div>

                {item.cost && (
                  <div className="mb-4 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Costo unitario</p>
                    <p className="text-sm font-medium text-slate-700">${item.cost.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="flex-1 text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Inventory;
