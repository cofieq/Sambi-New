
import React from 'react';
import { Ingredient } from '../types';
import { AlertTriangle, Package, ShoppingCart, XCircle, Boxes } from 'lucide-react';

interface DashboardProps {
  ingredients: Ingredient[];
  totalSales: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ ingredients, totalSales }) => {
  const lowStock = ingredients.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold);
  const outOfStock = ingredients.filter(i => i.quantity <= 0);

  const stats = [
    { label: 'Total Bahan Baku', value: ingredients.length, unit: 'Items', icon: Package, color: 'blue' },
    { label: 'Stock Habis', value: outOfStock.length, unit: 'Items', icon: XCircle, color: 'red' },
    { label: 'Stock Menipis', value: lowStock.length, unit: 'Items', icon: AlertTriangle, color: 'orange' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-entry">
      {/* Stats Grid - Adjusts columns based on width and orientation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-[1.75rem] md:rounded-[2.5rem] border border-slate-100 card-shadow group hover:border-blue-200 transition-all cursor-default overflow-hidden relative">
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${
                stat.color === 'red' ? 'bg-red-50 text-red-600' : 
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 
                'bg-blue-50 text-blue-600'
              }`}>
                {/* Fixed: Removed md:size and used className for responsive sizing */}
                <stat.icon size={22} className="md:w-[26px] md:h-[26px]" strokeWidth={2.5} />
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline justify-end gap-1 mt-1">
                   <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</h3>
                   <span className="text-[10px] md:text-xs font-bold text-slate-400">{stat.unit}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <div className={`w-1.5 h-1.5 rounded-full ${
                stat.color === 'red' ? 'bg-red-500 animate-pulse' : 
                stat.color === 'orange' ? 'bg-orange-500 animate-pulse' : 
                'bg-blue-500'
              }`} />
              Real-time update
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Priority List - Adaptive max height */}
        <div className="lg:col-span-2 bg-white rounded-[1.75rem] md:rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg md:rounded-xl flex items-center justify-center text-red-600">
                {/* Fixed: Removed md:size and used className for responsive sizing */}
                <AlertTriangle size={18} className="md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">Prioritas Restock</h3>
                <p className="text-[10px] md:text-xs text-slate-500">Urutkan berdasarkan status kritis</p>
              </div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto max-h-[300px] md:max-h-[400px] overscroll-contain">
            {[...outOfStock, ...lowStock].length === 0 ? (
              <div className="py-12 md:py-20 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  {/* Fixed: Removed md:size and used className for responsive sizing */}
                  <Package size={24} className="md:w-8 md:h-8" />
                </div>
                <p className="text-slate-400 text-sm font-medium italic">Semua stok aman dan terkendali.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...outOfStock, ...lowStock].slice(0, 10).map(item => (
                  <div key={item.id} className="p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl md:rounded-[2rem] transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border shadow-sm font-black text-[10px] md:text-xs shrink-0 ${item.isBatch ? 'bg-orange-50 text-orange-500 border-orange-100' : (item.quantity <= 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-400 border-slate-100')}`}>
                        {/* Fixed: Removed md:size and used className for responsive sizing */}
                        {item.isBatch ? <Boxes size={18} className="md:w-5 md:h-5" /> : item.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-2 truncate">
                          {item.name}
                        </p>
                        <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${item.quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.quantity <= 0 ? 'Habis' : 'Menipis'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs md:text-sm font-black ${item.quantity <= 0 ? 'text-red-600' : 'text-orange-600'}`}>{item.quantity.toLocaleString()} {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Summary - Minimal footprint for landscape rotation */}
        <div className="bg-slate-900 rounded-[1.75rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-blue-900/20 min-h-[200px]">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 leading-tight">Ringkasan <br className="hidden sm:block"/>Penjualan</h3>
            <p className="text-slate-400 text-[10px] md:text-sm font-medium">Monitoring performa hari ini.</p>
          </div>
          <div className="relative z-10 pt-6 md:pt-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Order</span>
                    <span className="text-xl md:text-2xl font-black text-blue-400">{totalSales}</span>
                </div>
            </div>
            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold text-center uppercase tracking-widest">ChefStock Pro System</p>
          </div>
          <div className="absolute -bottom-6 md:-bottom-10 -right-6 md:-right-10 opacity-10">
            {/* Fixed: Removed md:size and used className for responsive sizing */}
            <ShoppingCart size={120} className="md:w-[180px] md:h-[180px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
