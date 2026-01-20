
import React, { useState } from 'react';
import { MenuItem, Ingredient, BatchRecipe } from '../types';
import { ShoppingCart, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface SalesEntryProps {
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  batchRecipes: BatchRecipe[];
  onRecordSale: (menuId: string, quantity: number) => void;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({ menuItems, ingredients, batchRecipes, onRecordSale }) => {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedMenu = menuItems.find(m => m.id === selectedMenuId);

  const getInsufficientIngredients = () => {
    if (!selectedMenu) return [];
    
    // Check direct needs of the menu (treat batch as an ingredient)
    return selectedMenu.recipe.map(ri => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      const required = ri.amount * qty;
      const available = ing ? ing.quantity : 0;
      
      if (available < required) {
        return {
          name: ing ? ing.name : 'Unknown Material',
          required: required.toFixed(2),
          available: available.toFixed(2),
          unit: ing ? ing.unit : '',
          isBatch: ing?.isBatch
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const insufficientItems = getInsufficientIngredients();
  const canSell = selectedMenu && insufficientItems.length === 0;

  const handleSale = () => {
    if (!canSell) return;
    onRecordSale(selectedMenuId, qty);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setQty(1);
    setSelectedMenuId('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-entry">
      <div className="bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl"><ShoppingCart size={24} /></div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none mb-1">Kasir Order Cepat</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Deduction Stock Real-time</p>
          </div>
        </div>
        
        <div className="p-10 space-y-10">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Pilih Menu Hidangan</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menuItems.map(menu => (
                <button
                  key={menu.id}
                  onClick={() => { setSelectedMenuId(menu.id); setQty(1); }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden ${selectedMenuId === menu.id ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-100' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'}`}
                >
                  <p className={`font-black text-sm mb-1 ${selectedMenuId === menu.id ? 'text-blue-700' : 'text-slate-800'}`}>{menu.name}</p>
                  <p className="text-xs font-bold text-slate-400">Rp {menu.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedMenu && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div className="flex-1 w-full">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Jumlah Porsi</p>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xl hover:bg-slate-100">-</button>
                    <input type="number" readOnly className="flex-1 text-center bg-transparent font-black text-2xl" value={qty} />
                    <button onClick={() => setQty(qty + 1)} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xl hover:bg-slate-100">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Harga</p>
                  <p className="text-4xl font-black text-slate-900">Rp {(selectedMenu.price * qty).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Layers size={14}/> Komposisi Pengurangan Stok</p>
                <div className="space-y-2">
                  {selectedMenu.recipe.map(ri => {
                    const ing = ingredients.find(i => i.id === ri.ingredientId);
                    return (
                      <div key={ri.ingredientId} className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600">{ing?.name} {ing?.isBatch ? '(Batch Item)' : ''}</span>
                        <span className="text-slate-400">{(ri.amount * qty).toFixed(2)} {ing?.unit}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {insufficientItems.length > 0 && (
                <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-3 text-red-600"><AlertTriangle size={24} /><h4 className="font-black text-sm uppercase tracking-tight">Peringatan: Stok Tidak Cukup</h4></div>
                  <div className="grid gap-2">
                    {insufficientItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-red-100">
                        <span className="text-sm font-bold text-slate-700">{item.name} {item.isBatch ? '(Batch)' : ''}</span>
                        <p className="text-[10px] font-black text-red-600">Butuh: {item.required} {item.unit} / Sisa: {item.available}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-red-500 font-bold italic">Jika item di atas adalah Batch, silakan buat produksi batch baru terlebih dahulu di menu "Menu & Batch".</p>
                </div>
              )}

              <button
                disabled={!canSell}
                onClick={handleSale}
                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl ${canSell ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {showSuccess ? <div className="flex items-center gap-3"><CheckCircle2 size={24} /><span>Order Berhasil</span></div> : <span>Konfirmasi & Potong Stok</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
