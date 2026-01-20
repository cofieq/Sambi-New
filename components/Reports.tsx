
import React, { useState, useMemo } from 'react';
import { Ingredient, SalesLog, MenuItem } from '../types';
import { Download, BarChart3, PieChart, ShoppingCart, ArrowRight, Calendar, Check, Copy, MessageCircle, AlertTriangle, TrendingDown, XCircle } from 'lucide-react';

interface ReportsProps {
  ingredients: Ingredient[];
  salesHistory: SalesLog[];
  menuItems: MenuItem[];
}

export const Reports: React.FC<ReportsProps> = ({ ingredients, salesHistory, menuItems }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const filteredHistory = useMemo(() => {
    return salesHistory.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      return true;
    });
  }, [salesHistory, startDate, endDate]);

  // System Stock States
  const lowStock = ingredients.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold);
  const outOfStock = ingredients.filter(i => i.quantity <= 0);
  const criticalItems = [...outOfStock, ...lowStock];
  
  const ingredientUsage: Record<string, number> = useMemo(() => {
    const usage: Record<string, number> = {};
    filteredHistory.forEach(log => {
      const menu = menuItems.find(m => m.id === log.menuId);
      if (menu) {
        menu.recipe.forEach(ri => {
          usage[ri.ingredientId] = (usage[ri.ingredientId] || 0) + (ri.amount * log.quantity);
        });
      }
    });
    return usage;
  }, [filteredHistory, menuItems]);

  const generateWAMessage = () => {
    const kitchenName = localStorage.getItem('chefstock_kitchen_name') || 'Dapur Utama';
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let text = `*LAPORAN BELANJA DAPUR - ${kitchenName.toUpperCase()}*\n`;
    text += `_Tanggal: ${date}_\n\n`;

    if (outOfStock.length > 0) {
        text += `🔴 *STOCK HABIS (URGENT):*\n`;
        outOfStock.forEach((item) => {
            const buyAmount = Math.ceil(item.minThreshold * 2);
            text += `- ${item.name}: Pesan *${buyAmount} ${item.unit}*\n`;
        });
        text += `\n`;
    }

    if (lowStock.length > 0) {
        text += `⚠️ *STOCK MENIPIS:*\n`;
        lowStock.forEach((item) => {
            const buyAmount = Math.ceil((item.minThreshold * 2) - item.quantity);
            text += `- ${item.name}: Pesan *${buyAmount} ${item.unit}* (Sisa: ${item.quantity})\n`;
        });
        text += `\n`;
    }

    text += `_Mohon segera diproses. Terima kasih!_`;
    return text;
  };

  const handleWhatsAppShare = () => {
    if (criticalItems.length === 0) return;
    const message = encodeURIComponent(generateWAMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCopyText = () => {
    if (criticalItems.length === 0) return;
    const message = generateWAMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToCSV = () => {
    const header = "ID,Nama,Kategori,Stok,Satuan,Status\n";
    const rows = ingredients.map(i => {
      const status = i.quantity <= 0 ? "HABIS" : (i.quantity <= i.minThreshold ? "MENIPIS" : "AMAN");
      return `${i.id},${i.name},${i.category},${i.quantity},${i.unit},${status}`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Laporan_Stok_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-10 animate-entry pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Keseluruhan</h2>
          <p className="text-slate-500 font-medium mt-1">Analisis performa inventori dan status bahan baku secara menyeluruh.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.75rem] border border-slate-100 shadow-sm w-full lg:w-auto">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-300 font-bold mx-1">/</span>
            <input 
              type="date" 
              className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Health Score', value: `${ingredients.length > 0 ? Math.round(((ingredients.length - criticalItems.length) / ingredients.length) * 100) : 100}%`, icon: Check, color: 'emerald' },
           { label: 'Stok Habis', value: outOfStock.length, icon: XCircle, color: 'red' },
           { label: 'Stok Menipis', value: lowStock.length, icon: AlertTriangle, color: 'orange' },
           { label: 'Volume Keluar', value: Object.values(ingredientUsage).reduce((a, b) => a + b, 0).toLocaleString(), icon: TrendingDown, color: 'blue' },
         ].map((card, idx) => (
           <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4 mb-4">
               <div className={`p-3 rounded-2xl ${
                 card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                 card.color === 'red' ? 'bg-red-50 text-red-600' :
                 card.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                 'bg-blue-50 text-blue-600'
               }`}>
                 <card.icon size={20} />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
             </div>
             <p className="text-3xl font-black text-slate-900">{card.value}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 card-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                <BarChart3 size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-none">Pemakaian Tertinggi</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Volume Bahan Keluar</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {Object.entries(ingredientUsage)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([id, amount]) => {
                const ing = ingredients.find(i => i.id === id);
                const maxUsage = Math.max(...Object.values(ingredientUsage), 1);
                return (
                  <div key={id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="font-black text-slate-800 text-base block">{ing?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ing?.category}</span>
                      </div>
                      <span className="text-slate-900 font-mono font-black text-lg">{amount.toLocaleString()} {ing?.unit}</span>
                    </div>
                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000 ease-out rounded-full" 
                        style={{ width: `${(amount / maxUsage) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            {Object.keys(ingredientUsage).length === 0 && (
              <div className="text-center py-20 text-slate-300 italic font-medium">Data pemakaian belum tersedia.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 card-shadow flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
              <PieChart size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-900 leading-none">Distribusi Kondisi</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Status Inventori Real-time</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-12">
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-3xl">
                    <p className="text-2xl font-black text-emerald-600">{ingredients.length - criticalItems.length}</p>
                    <p className="text-[8px] font-black uppercase text-emerald-700 tracking-tighter">Aman</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-3xl">
                    <p className="text-2xl font-black text-orange-600">{lowStock.length}</p>
                    <p className="text-[8px] font-black uppercase text-orange-700 tracking-tighter">Menipis</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-3xl">
                    <p className="text-2xl font-black text-red-600">{outOfStock.length}</p>
                    <p className="text-[8px] font-black uppercase text-red-700 tracking-tighter">Habis</p>
                </div>
            </div>
            <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden flex shadow-inner p-1">
                <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${ingredients.length > 0 ? ((ingredients.length - criticalItems.length) / ingredients.length) * 100 : 0}%` }} />
                <div className="bg-orange-400 h-full" style={{ width: `${ingredients.length > 0 ? (lowStock.length / ingredients.length) * 100 : 0}%` }} />
                <div className="bg-red-500 h-full rounded-r-full" style={{ width: `${ingredients.length > 0 ? (outOfStock.length / ingredients.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/10 shadow-inner">
              <ShoppingCart size={40} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight leading-none mb-3">Daftar Belanja Pintar</h3>
              <p className="text-slate-400 font-medium max-w-md">Otomatisasi pengadaan berdasarkan stok habis dan menipis.</p>
            </div>
          </div>
          
          {criticalItems.length > 0 && (
            <div className="flex items-center gap-3 relative z-10">
              <button 
                onClick={handleCopyText}
                className={`flex items-center gap-3 px-8 py-4 border-2 rounded-[1.75rem] transition-all font-black text-xs uppercase tracking-widest active:scale-95 ${
                  copied ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copied' : 'Copy List'}
              </button>
              <button 
                onClick={handleWhatsAppShare}
                className="flex items-center gap-3 px-10 py-4 bg-emerald-500 text-white rounded-[1.75rem] hover:bg-emerald-400 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                <MessageCircle size={22} fill="currentColor" /> Forward WA
              </button>
            </div>
          )}
        </div>

        {criticalItems.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-100 card-shadow">
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Check size={56} strokeWidth={3} />
            </div>
            <h4 className="text-3xl font-black text-slate-900">Stok Sempurna</h4>
            <p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed">Seluruh bahan tersedia di atas ambang batas kritis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {criticalItems.map(item => {
              const isOut = item.quantity <= 0;
              const buyAmount = Math.ceil((item.minThreshold * 2) - item.quantity);
              return (
                <div key={item.id} className={`bg-white rounded-[2.5rem] border-2 p-8 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden ${isOut ? 'border-red-100' : 'border-orange-50'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-5 rounded-3xl transition-all shadow-sm ${isOut ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      {isOut ? <XCircle size={28} strokeWidth={2.5} /> : <AlertTriangle size={28} strokeWidth={2.5} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl border ${isOut ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                      {isOut ? 'Habis' : 'Menipis'}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2 truncate">{item.name}</h4>
                  <div className="flex items-baseline gap-2 mb-10">
                    <span className={`text-4xl font-black tracking-tighter ${isOut ? 'text-red-600' : 'text-slate-900'}`}>{item.quantity}</span>
                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{item.unit} Sisa</span>
                  </div>
                  <div className={`rounded-[1.75rem] p-5 flex items-center justify-between transition-all duration-300 ${isOut ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <div className="flex items-center gap-3">
                      <ArrowRight size={16} strokeWidth={3} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Saran Belanja</span>
                    </div>
                    <span className="text-xl font-black">+{buyAmount} {item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
