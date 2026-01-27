
import React from 'react';
import { Ingredient } from '../types';
import { AlertTriangle, Package, ShoppingCart, XCircle, Boxes, ArrowUpRight, Activity } from 'lucide-react';

interface DashboardProps {
  ingredients: Ingredient[];
  totalSales: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ ingredients, totalSales }) => {
  const lowStock = ingredients.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold);
  const outOfStock = ingredients.filter(i => i.quantity <= 0);

  const stats = [
    { label: 'Total Inventory', value: ingredients.length, unit: 'Items', icon: Package, color: 'blue', trend: 'In-Sync' },
    { label: 'Out of Stock', value: outOfStock.length, unit: 'Items', icon: XCircle, color: 'red', trend: 'Critical' },
    { label: 'Low Stock', value: lowStock.length, unit: 'Items', icon: AlertTriangle, color: 'orange', trend: 'Attention' },
  ];

  return (
    <div className="space-y-8 animate-entry">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow relative overflow-hidden group hover:border-blue-100 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${
                stat.color === 'red' ? 'bg-red-50 text-red-500' : 
                stat.color === 'orange' ? 'bg-orange-50 text-orange-500' : 
                'bg-blue-50 text-blue-500'
              }`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                stat.color === 'red' ? 'bg-red-100 text-red-600' : 
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
               <stat.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restock Priority */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">System Priority</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Restock Intelligence</p>
              </div>
            </div>
          </div>
          <div className="p-2 overflow-y-auto max-h-[440px]">
            {[...outOfStock, ...lowStock].length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <Package size={32} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All Inventory Levels Healthy</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                {[...outOfStock, ...lowStock].slice(0, 10).map(item => (
                  <div key={item.id} className="p-5 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border shadow-sm shrink-0 ${
                        item.isBatch ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                        (item.quantity <= 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-400 border-slate-100')
                      }`}>
                        {item.isBatch ? <Boxes size={20} /> : item.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-slate-800 text-sm truncate">{item.name}</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                          item.quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.quantity <= 0 ? 'Exhausted' : 'Low Level'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${item.quantity <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.quantity.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2 tracking-tight">Market <br/>Performance</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Order Statistics</p>
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Successful Orders</span>
                    <span className="text-3xl font-black text-blue-400">{totalSales}</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div className="bg-blue-400 h-full w-[65%]" />
                </div>
            </div>
            
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
               Order Report <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-[0.05] rotate-12">
            <ShoppingCart size={240} />
          </div>
        </div>
      </div>
    </div>
  );
};
