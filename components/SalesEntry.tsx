
import React, { useState } from 'react';
import { MenuItem, Ingredient, BatchRecipe } from '../types';
import { ShoppingCart, CheckCircle2, AlertTriangle, Layers, UtensilsCrossed, Plus, Minus, ReceiptText, Sparkles, Box } from 'lucide-react';

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
    return selectedMenu.recipe.map(ri => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      const required = ri.amount * qty;
      const available = ing ? ing.quantity : 0;
      if (available < required) {
        return {
          name: ing ? ing.name : 'Unknown',
          required: required.toFixed(2),
          available: available.toFixed(2),
          unit: ing ? ing.unit : '',
          isBatch: ing?.itemType === 'PREPARED'
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
    <div className="max-w-5xl mx-auto space-y-8 animate-entry">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Menu Selection Side */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] card-shadow border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <UtensilsCrossed size={20} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg tracking-tight">Katalog Menu</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Produk</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {menuItems.map(menu => (
                <button
                  key={menu.id}
                  onClick={() => { setSelectedMenuId(menu.id); setQty(1); }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all relative group ${
                    selectedMenuId === menu.id ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="relative z-10">
                    <p className={`font-black text-xs uppercase tracking-tight mb-2 ${selectedMenuId === menu.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {menu.name}
                    </p>
                    <p className={`text-[10px] font-black ${selectedMenuId === menu.id ? 'text-blue-400' : 'text-slate-400'}`}>
                      Rp {menu.price.toLocaleString()}
                    </p>
                  </div>
                  {selectedMenuId === menu.id && (
                    <div className="absolute top-2 right-2 text-blue-500">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              ))}
              {menuItems.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-300 italic text-xs font-bold uppercase tracking-widest">
                  Belum Ada Menu Terdaftar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Side */}
        <div className="lg:col-span-2">
          {selectedMenu ? (
            <div className="bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden sticky top-6">
              <div className="p-8 bg-slate-900 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <ReceiptText size={20} className="text-blue-400" />
                  <h3 className="font-black uppercase tracking-tight text-lg">Detail Pesanan</h3>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Order Preview</p>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah Porsi</p>
                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition-all"><Minus size={16} /></button>
                      <input 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-14 text-center font-black text-xl bg-transparent outline-none appearance-none" 
                        value={qty} 
                        onChange={(e) => setQty(Math.max(1, e.target.value === '' ? 1 : Number(e.target.value)))}
                      />
                      <button onClick={() => setQty(qty + 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition-all"><Plus size={16} /></button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp {(selectedMenu.price * qty).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[1.75rem] space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} /> Ringkasan Potong Stok
                    </p>
                  </div>
                  <div className="space-y-3">
                    {selectedMenu.recipe.map(ri => {
                      const ing = ingredients.find(i => i.id === ri.ingredientId);
                      const isPrepared = ing?.itemType === 'PREPARED';
                      return (
                        <div key={ri.ingredientId} className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-600 truncate mr-2 flex items-center gap-2">
                            {isPrepared ? <Sparkles size={10} className="text-orange-500" /> : <Box size={10} className="text-slate-400" />}
                            {ing?.name}
                          </span>
                          <span className="text-slate-400 shrink-0">{(ri.amount * qty).toFixed(1)} {ing?.unit}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="pt-2 flex items-center gap-4 border-t border-slate-200">
                     <div className="flex items-center gap-1.5"><Sparkles size={10} className="text-orange-500"/><span className="text-[8px] font-black text-slate-400 uppercase">Olahan</span></div>
                     <div className="flex items-center gap-1.5"><Box size={10} className="text-slate-400"/><span className="text-[8px] font-black text-slate-400 uppercase">Utama</span></div>
                  </div>
                </div>

                {insufficientItems.length > 0 && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle size={18} />
                      <h4 className="font-black text-[10px] uppercase tracking-tight">Bahan Tidak Cukup</h4>
                    </div>
                    <div className="space-y-1">
                      {insufficientItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] font-bold text-red-700">
                          <span>{item.name} ({item.isBatch ? 'Batch' : 'Utama'})</span>
                          <span>Kurang {item.required} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled={!canSell}
                  onClick={handleSale}
                  className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                    canSell ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {showSuccess ? <><CheckCircle2 size={18} /> Pesanan Disimpan</> : <><ShoppingCart size={18} /> Konfirmasi Jual</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-8 text-center">
               <div className="p-6 bg-slate-50 rounded-full mb-6">
                 <UtensilsCrossed size={48} className="text-slate-200" />
               </div>
               <p className="font-black text-xs uppercase tracking-widest max-w-[200px]">Pilih menu di samping untuk mulai input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
