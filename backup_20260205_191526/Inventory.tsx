import React from 'react';
import { InventoryItem } from '../types';
import { AlertTriangle, Package } from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
}

const Inventory: React.FC<InventoryProps> = ({ items }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Control de Inventario</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => {
            const isLow = item.quantity <= item.minThreshold;
            return (
                <div key={item.id} className={`bg-white p-6 rounded-xl border ${isLow ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-full ${isLow ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Package size={24} />
                        </div>
                        {isLow && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                                <AlertTriangle size={12}/> Stock Bajo
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">SKU: {item.sku}</p>
                    
                    <div className="flex justify-between items-end">
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
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Inventory;
