
import React, { useState } from 'react';
import { Ingredient, MenuItem, RecipeItem, BatchRecipe } from '../types';
import { ChefHat, Plus, Trash2, Utensils, Boxes, Layers, Edit2, X, PlayCircle, CheckCircle } from 'lucide-react';

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
}

export const Recipes: React.FC<RecipesProps> = ({ 
  ingredients, menuItems, batchRecipes, onAddMenu, onUpdateMenu, onDeleteMenu, 
  onAddBatch, onUpdateBatch, onDeleteBatch, onProduceBatch 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'batch'>('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [targetIngredientId, setTargetIngredientId] = useState('');
  const [yieldAmount, setYieldAmount] = useState(1);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);

  const resetForm = () => {
    setName('');
    setPrice(0);
    setTargetIngredientId('');
    setYieldAmount(1);
    setRecipeItems([]);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEditMenu = (menu: MenuItem) => {
    setActiveSubTab('menu');
    setEditingId(menu.id);
    setName(menu.name);
    setPrice(menu.price);
    setRecipeItems(menu.recipe);
    setIsModalOpen(true);
  };

  const handleEditBatch = (batch: BatchRecipe) => {
    setActiveSubTab('batch');
    setEditingId(batch.id);
    setTargetIngredientId(batch.targetIngredientId);
    setYieldAmount(batch.yieldAmount);
    setRecipeItems(batch.recipe);
    setIsModalOpen(true);
  };

  const addRecipeItem = () => {
    if (ingredients.length === 0) return;
    setRecipeItems([...recipeItems, { ingredientId: ingredients[0].id, amount: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubTab === 'menu') {
      if (editingId) onUpdateMenu(editingId, { name, price, recipe: recipeItems });
      else onAddMenu({ name, price, recipe: recipeItems });
    } else {
      if (editingId) onUpdateBatch(editingId, { targetIngredientId, yieldAmount, recipe: recipeItems });
      else onAddBatch({ targetIngredientId, yieldAmount, recipe: recipeItems });
    }
    resetForm();
  };

  const checkBatchStock = (batch: BatchRecipe) => {
    return batch.recipe.every(sub => {
      const ing = ingredients.find(i => i.id === sub.ingredientId);
      return ing && ing.quantity >= sub.amount;
    });
  };

  return (
    <div className="space-y-8 animate-entry">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
        <div className="flex flex-1 p-1">
          <button onClick={() => setActiveSubTab('menu')} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'menu' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Utensils size={18} /> Menu Hidangan
          </button>
          <button onClick={() => setActiveSubTab('batch')} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'batch' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Boxes size={18} /> Resep Batch
          </button>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="mr-2 px-8 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest active:scale-95">
          <Plus size={18} /> Buat {activeSubTab === 'menu' ? 'Menu' : 'Batch'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeSubTab === 'menu' ? (
          menuItems.map(menu => (
            <div key={menu.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-shadow group relative overflow-hidden transition-all hover:-translate-y-1">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEditMenu(menu)} className="p-2 text-blue-400 hover:text-blue-600"><Edit2 size={18}/></button>
                <button onClick={() => onDeleteMenu(menu.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner"><ChefHat size={32} /></div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{menu.name}</h3>
              <p className="text-2xl font-black text-blue-600 mb-8">Rp {menu.price.toLocaleString()}</p>
              <div className="space-y-3 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Komposisi Resep</p>
                {menu.recipe.map((ri, idx) => {
                  const ing = ingredients.find(i => i.id === ri.ingredientId);
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-600 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${ing?.isBatch ? 'bg-orange-400' : 'bg-blue-400'}`} />
                        {ing?.name}
                      </span>
                      <span className="text-slate-400 font-mono">{ri.amount} {ing?.unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          batchRecipes.map(batch => {
            const target = ingredients.find(i => i.id === batch.targetIngredientId);
            const canProduce = checkBatchStock(batch);
            return (
              <div key={batch.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 card-shadow group relative overflow-hidden transition-all hover:-translate-y-1">
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleEditBatch(batch)} className="p-2 text-blue-400 hover:text-blue-600"><Edit2 size={18}/></button>
                  <button onClick={() => onDeleteBatch(batch.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner"><Boxes size={32} /></div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{target?.name}</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Yield: {batch.yieldAmount} {target?.unit}</p>
                
                <button 
                  disabled={!canProduce}
                  onClick={() => onProduceBatch(batch.id, 1)}
                  className={`w-full mb-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    canProduce ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <PlayCircle size={16} /> Produce 1 Batch
                </button>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Formula Batch</p>
                  {batch.recipe.map((ri, idx) => {
                    const ing = ingredients.find(i => i.id === ri.ingredientId);
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-600">{ing?.name}</span>
                        <span className="text-slate-400 font-mono">{ri.amount} {ing?.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className={`p-10 text-white flex justify-between items-center ${activeSubTab === 'menu' ? 'bg-blue-600' : 'bg-orange-600'}`}>
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 rounded-3xl"><Layers size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{editingId ? 'Edit' : 'Buat'} {activeSubTab === 'menu' ? 'Menu' : 'Batch'}</h3>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Configuration Matrix</p>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 overflow-y-auto max-h-[70vh] space-y-8 text-slate-900">
              {activeSubTab === 'menu' ? (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Menu</label>
                    <input required className="w-full border-2 border-slate-100 rounded-3xl p-5 bg-slate-50 font-bold" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                    <input type="number" required className="w-full border-2 border-slate-100 rounded-3xl p-5 bg-slate-50 font-black text-xl" value={price} onChange={e => setPrice(Number(e.target.value))} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasil Produksi</label>
                    <select required className="w-full border-2 border-slate-100 rounded-3xl p-5 bg-slate-50 font-bold" value={targetIngredientId} onChange={e => setTargetIngredientId(e.target.value)}>
                      <option value="">-- Pilih Bahan Baku --</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Yield Amount</label>
                    <input type="number" step="0.01" required className="w-full border-2 border-slate-100 rounded-3xl p-5 bg-slate-50 font-black text-xl" value={yieldAmount} onChange={e => setYieldAmount(Number(e.target.value))} />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b-2 border-slate-50 pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Komposisi Bahan</p>
                  <button type="button" onClick={addRecipeItem} className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${activeSubTab === 'menu' ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50'}`}>+ Tambah Bahan</button>
                </div>
                
                {recipeItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex-1 space-y-2">
                      <select className="w-full border-2 border-white rounded-2xl p-4 bg-white font-bold text-sm shadow-sm" value={item.ingredientId} onChange={e => {
                        const next = [...recipeItems];
                        next[index].ingredientId = e.target.value;
                        setRecipeItems(next);
                      }}>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit}) {ing.isBatch ? '★' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32 space-y-2">
                      <input type="number" step="0.01" className="w-full border-2 border-white rounded-2xl p-4 bg-white font-black text-center shadow-sm" value={item.amount || ''} placeholder="0" onChange={e => {
                        const next = [...recipeItems];
                        next[index].amount = Number(e.target.value);
                        setRecipeItems(next);
                      }} />
                    </div>
                    <button type="button" onClick={() => setRecipeItems(recipeItems.filter((_, i) => i !== index))} className="p-4 text-red-400 hover:bg-red-50 rounded-2xl"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>

              <button type="submit" className={`w-full text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${activeSubTab === 'menu' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                <CheckCircle size={24} /> {editingId ? 'Simpan Perubahan' : 'Daftarkan Resep'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
