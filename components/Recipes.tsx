
import React, { useState, useMemo } from 'react';
import { Ingredient, MenuItem, RecipeItem, BatchRecipe, IngredientType } from '../types';
import { 
  ChefHat, Plus, Trash2, Utensils, Boxes, Layers, Edit2, X, 
  PlayCircle, CheckCircle, AlertCircle, Sparkles, Filter, 
  Check, XCircle, Search, Info
} from 'lucide-react';

interface RecipesProps {
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  batchRecipes: BatchRecipe[];
  onAddMenu: (menu: Omit<MenuItem, 'id'>) => void;
  onUpdateMenu: (id: string, menu: Omit<MenuItem, 'id'>) => void;
  onDeleteMenu: (id: string) => void;
  onAddBatch: (batch: Omit<BatchRecipe, 'id'>) => void;
  onUpdateBatch: (id: string, batch: Omit<BatchRecipe, 'id'>) => void;
  onDeleteBatch: (id: string) => void;
  onProduceBatch: (id: string, multiplier: number) => void;
  onAddPreparedItem: (item: Omit<Ingredient, 'id'>) => void;
}

export const Recipes: React.FC<RecipesProps> = ({ 
  ingredients, menuItems, batchRecipes, onAddMenu, onUpdateMenu, onDeleteMenu, 
  onAddBatch, onUpdateBatch, onDeleteBatch, onProduceBatch, onAddPreparedItem
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'batch'>('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPreparedModalOpen, setIsNewPreparedModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [targetIngredientName, setTargetIngredientName] = useState('');
  const [yieldAmount, setYieldAmount] = useState(1);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Split ingredients for cleaner selection
  const rawItems = ingredients.filter(i => i.itemType === 'RAW');
  const preparedItems = ingredients.filter(i => i.itemType === 'PREPARED');

  const filteredSuggestions = useMemo(() => {
    if (!targetIngredientName) return preparedItems;
    return preparedItems.filter(i => i.name.toLowerCase().includes(targetIngredientName.toLowerCase()));
  }, [preparedItems, targetIngredientName]);

  const resetForm = () => {
    setName('');
    setPrice(0);
    setTargetIngredientName('');
    setYieldAmount(1);
    setRecipeItems([]);
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const addRecipeItem = () => {
    if (ingredients.length === 0) return;
    setRecipeItems([...recipeItems, { ingredientId: ingredients[0].id, amount: 0 }]);
  };

  const updateRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
    const next = [...recipeItems];
    next[index] = { ...next[index], [field]: value };
    setRecipeItems(next);
  };

  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeItems.length === 0) return alert("Tambahkan bahan!");

    if (activeSubTab === 'menu') {
      if (editingId) onUpdateMenu(editingId, { name, price, recipe: recipeItems });
      else onAddMenu({ name, price, recipe: recipeItems });
    } else {
      if (!targetIngredientName) return alert("Masukkan nama hasil produksi batch!");
      
      // Check if target already exists
      let finalTargetId = '';
      const existing = preparedItems.find(i => i.name.toLowerCase() === targetIngredientName.toLowerCase());
      
      if (existing) {
        finalTargetId = existing.id;
      } else {
        // Create new prepared item on the fly
        const newId = 'ing-' + Date.now();
        onAddPreparedItem({ 
          name: targetIngredientName, 
          unit: 'porsi', 
          category: 'Semi-Finished', 
          quantity: 0, 
          minThreshold: 1, 
          itemType: 'PREPARED' 
        });
        finalTargetId = newId;
      }

      if (editingId) onUpdateBatch(editingId, { targetIngredientId: finalTargetId, yieldAmount, recipe: recipeItems });
      else onAddBatch({ targetIngredientId: finalTargetId, yieldAmount, recipe: recipeItems });
    }
    resetForm();
    setIsModalOpen(false);
  };

  const checkBatchViability = (batch: BatchRecipe) => {
    const missing = batch.recipe.filter(ri => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      return !ing || ing.quantity < ri.amount;
    });
    return missing.length === 0;
  };

  return (
    <div className="space-y-6 animate-entry">
      {/* Tab Switcher */}
      <div className="flex bg-white p-2 rounded-[1.75rem] border border-slate-100 shadow-sm gap-4">
        <div className="flex flex-1 bg-slate-50 rounded-2xl p-1">
          <button onClick={() => setActiveSubTab('menu')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeSubTab === 'menu' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Daftar Menu</button>
          <button onClick={() => setActiveSubTab('batch')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeSubTab === 'batch' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>Bahan Olahan (Batch)</button>
        </div>
        <button onClick={handleOpenCreateModal} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">+ Buat {activeSubTab === 'menu' ? 'Menu' : 'Resep Olahan'}</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSubTab === 'menu' ? menuItems.map(menu => (
          <div key={menu.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow relative group hover:border-blue-100 transition-all">
            <div className="absolute top-6 right-6 flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setActiveSubTab('menu'); setEditingId(menu.id); setName(menu.name); setPrice(menu.price); setRecipeItems([...menu.recipe]); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
              <button onClick={() => onDeleteMenu(menu.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Utensils size={20} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{menu.name}</h3>
                <p className="text-blue-500 font-black text-sm">Rp {menu.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t border-slate-50 pt-4 space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Daftar Komposisi:</p>
              {menu.recipe.map((ri, i) => {
                const ing = ingredients.find(ing => ing.id === ri.ingredientId);
                const isPrepared = ing?.itemType === 'PREPARED';
                return (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${isPrepared ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        {isPrepared ? 'OLAHAN' : 'RAW'}
                      </span>
                      {ing?.name}
                    </span>
                    <span className="font-black text-slate-400">{ri.amount.toLocaleString()} {ing?.unit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <>
            {/* Batch Stock Overview */}
            {batchRecipes.map(batch => {
              const target = ingredients.find(i => i.id === batch.targetIngredientId);
              const isViable = checkBatchViability(batch);
              return (
                <div key={batch.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow relative group flex flex-col hover:border-orange-100 transition-all">
                  <div className="absolute top-6 right-6 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setActiveSubTab('batch'); setEditingId(batch.id); setTargetIngredientName(target?.name || ''); setYieldAmount(batch.yieldAmount); setRecipeItems([...batch.recipe]); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                    <button onClick={() => onDeleteBatch(batch.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Boxes size={20} /></div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{target?.name || 'Item Terhapus'}</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-orange-500 font-black text-sm">{target?.quantity.toLocaleString()} {target?.unit}</span>
                         <span className="text-[8px] font-black uppercase text-slate-300">Stok Sedia</span>
                      </div>
                    </div>
                  </div>

                  <div className={`mb-4 px-4 py-2.5 rounded-xl border flex items-center justify-between ${isViable ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <div className="flex items-center gap-2">
                      {isViable ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                      <span className="text-[10px] font-black uppercase tracking-tight">{isViable ? 'Siap Produksi' : 'Bahan Kurang'}</span>
                    </div>
                    {isViable && <span className="text-[9px] font-bold opacity-60">Ready</span>}
                  </div>

                  <button 
                    disabled={!isViable}
                    onClick={() => onProduceBatch(batch.id, 1)} 
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase mb-4 flex items-center justify-center gap-3 transition-all ${
                      isViable ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <PlayCircle size={16} /> Masak 1 Batch
                  </button>

                  <div className="border-t border-slate-50 pt-4 space-y-2 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Komposisi Resep (+{batch.yieldAmount} {target?.unit}):</p>
                    {batch.recipe.map((ri, i) => {
                      const ing = ingredients.find(ing => ing.id === ri.ingredientId);
                      const isShort = ing && ing.quantity < ri.amount;
                      const isPrepared = ing?.itemType === 'PREPARED';
                      return (
                        <div key={i} className={`flex justify-between items-center text-xs font-bold ${isShort ? 'text-red-500' : 'text-slate-500'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`px-1 py-0.5 rounded-md text-[7px] font-black uppercase ${isPrepared ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                              {isPrepared ? 'OLAHAN' : 'RAW'}
                            </span>
                            <span className="truncate max-w-[100px]">{ing?.name || 'Unknown'}</span>
                          </div>
                          <span>{ri.amount.toLocaleString()} {ing?.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Floating Action for creating Prepared Item directly */}
            <button 
              onClick={() => setIsNewPreparedModalOpen(true)}
              className="border-4 border-dashed border-slate-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:text-slate-400 hover:border-slate-200 transition-all gap-4"
            >
              <Plus size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Daftarkan Jenis Olahan Baru</p>
            </button>
          </>
        )}
      </div>

      {/* Main Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? 'Edit' : 'Buat'} {activeSubTab === 'menu' ? 'Menu Utama' : 'Resep Olahan'}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Konfigurasi Produksi</p>
              </div>
              <button onClick={() => { resetForm(); setIsModalOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              {activeSubTab === 'menu' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Menu</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Ramen Spesial" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Harga Jual</label>
                    <input type="number" required onFocus={(e) => e.target.select()} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-500 outline-none transition-all" value={price || ''} onChange={e => setPrice(e.target.value === '' ? 0 : Number(e.target.value))} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                      Nama Hasil Olahan <Info size={10} className="text-blue-500" title="Ketik nama baru untuk mendaftarkannya otomatis" />
                    </label>
                    <input 
                      required 
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none transition-all" 
                      placeholder="Ketik atau pilih olahan..." 
                      value={targetIngredientName} 
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onChange={e => setTargetIngredientName(e.target.value)} 
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                        {filteredSuggestions.map(i => (
                          <button 
                            key={i.id} 
                            type="button"
                            onClick={() => { setTargetIngredientName(i.name); setShowSuggestions(false); }}
                            className="w-full text-left p-3 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex justify-between"
                          >
                            {i.name} <span className="opacity-50 font-normal">{i.unit}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Yield (Hasil Produksi)</label>
                    <input type="number" required step="0.01" onFocus={(e) => e.target.select()} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-orange-500 outline-none transition-all" value={yieldAmount || ''} onChange={e => setYieldAmount(e.target.value === '' ? 0 : Number(e.target.value))} />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Komposisi Bahan</p>
                  <button type="button" onClick={addRecipeItem} className="text-blue-600 font-black text-[10px] uppercase hover:underline">+ Tambah Bahan</button>
                </div>
                <div className="space-y-3">
                  {recipeItems.map((item, idx) => {
                    const selectedIng = ingredients.find(i => i.id === item.ingredientId);
                    const isPrep = selectedIng?.itemType === 'PREPARED';
                    return (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl group border-2 border-transparent hover:border-slate-100 transition-all">
                        <div className="flex-1">
                          <select className="w-full bg-white p-3 rounded-xl text-xs font-bold border border-slate-200 focus:border-blue-500 outline-none" value={item.ingredientId} onChange={e => updateRecipeItem(idx, 'ingredientId', e.target.value)}>
                            <optgroup label="Bahan Olahan (Batch)">
                              {preparedItems.map(i => <option key={i.id} value={i.id}>[OLAHAN] {i.name}</option>)}
                            </optgroup>
                            <optgroup label="Bahan Mentah Utama">
                              {rawItems.map(i => <option key={i.id} value={i.id}>[RAW] {i.name}</option>)}
                            </optgroup>
                          </select>
                        </div>
                        <div className="w-24">
                          <input type="number" step="0.01" onFocus={(e) => e.target.select()} className="w-full bg-white p-3 rounded-xl text-xs font-black text-center border border-slate-200" value={item.amount || ''} placeholder="Qty" onChange={e => updateRecipeItem(idx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))} />
                        </div>
                        <button type="button" onClick={() => removeRecipeItem(idx)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                    );
                  })}
                  {recipeItems.length === 0 && (
                    <div className="py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">Tambahkan bahan baku untuk memulai resep</div>
                  )}
                </div>
              </div>

              <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 ${activeSubTab === 'menu' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-orange-600 text-white shadow-orange-200'}`}>
                 Simpan Konfigurasi {activeSubTab === 'menu' ? 'Menu' : 'Batch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Prepared Item Registry Modal */}
      {isNewPreparedModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-slate-900">Daftarkan Jenis Olahan</h3>
                <button onClick={() => setIsNewPreparedModalOpen(false)}><X size={24} /></button>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Daftarkan item yang Anda produksi sendiri di dapur (seperti Saus, Adonan, atau Bahan Setengah Jadi).</p>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Olahan</label>
                  <input id="new-prepared-name" required placeholder="Contoh: Saus Teriyaki" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Satuan Hasil</label>
                    <select id="new-prepared-unit" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none">
                       <option value="ml">ml</option>
                       <option value="L">L</option>
                       <option value="g">g</option>
                       <option value="kg">kg</option>
                       <option value="porsi">porsi</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori</label>
                    <select id="new-prepared-cat" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none">
                       <option value="Saus">Saus</option>
                       <option value="Adonan">Adonan</option>
                       <option value="Semi-Finished">Semi-Finished</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const nameInput = document.getElementById('new-prepared-name') as HTMLInputElement;
                  const unitInput = document.getElementById('new-prepared-unit') as HTMLSelectElement;
                  const catInput = document.getElementById('new-prepared-cat') as HTMLSelectElement;
                  if (!nameInput.value) return alert("Isi nama olahan!");
                  onAddPreparedItem({ name: nameInput.value, unit: unitInput.value, category: catInput.value, quantity: 0, minThreshold: 1, itemType: 'PREPARED' });
                  setIsNewPreparedModalOpen(false);
                }}
                className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
              >
                Konfirmasi Daftar
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
