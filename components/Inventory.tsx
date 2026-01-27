
import React, { useState, useRef } from 'react';
import { Ingredient } from '../types';
import { Plus, Search, Trash2, Edit2, X, CheckCircle2, RefreshCcw, Package } from 'lucide-react';

interface InventoryProps {
  ingredients: Ingredient[];
  categories: string[];
  units: string[];
  onAdd: (item: Omit<Ingredient, 'id'>) => void;
  onUpdate: (id: string, item: Omit<Ingredient, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ ingredients, categories, units, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>('');
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const thresholdRef = useRef<HTMLInputElement>(null);

  const initialForm: Omit<Ingredient, 'id'> = {
    name: '',
    category: categories[0] || '',
    quantity: 0,
    unit: units[0] || '',
    minThreshold: 10,
    itemType: 'RAW'
  };

  const [formData, setFormData] = useState(initialForm);

  // Filter ONLY RAW materials here
  const rawIngredients = ingredients.filter(i => i.itemType === 'RAW');
  const filtered = rawIngredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ ...initialForm });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdate(editingId, formData);
    else onAdd(formData);
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleInlineThresholdUpdate = (id: string) => {
    const item = ingredients.find(i => i.id === id);
    if (item) {
      const val = parseFloat(thresholdInput);
      if (!isNaN(val) && val >= 0) onUpdate(id, { ...item, minThreshold: val });
    }
    setEditingThresholdId(null);
  };

  return (
    <div className="space-y-8 animate-entry">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari Bahan Baku Utama..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50/50 outline-none transition-all card-shadow font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl">
          <Plus size={18} /> Tambah Bahan Utama
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] card-shadow border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Material Mentah</th>
                <th className="px-6 py-6">Kategori</th>
                <th className="px-6 py-6 text-center">Stok Sisa</th>
                <th className="px-6 py-6 text-center">Ambang Batas</th>
                <th className="px-8 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border shadow-sm bg-slate-50 text-slate-400 border-slate-100">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{item.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200/50">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`font-black text-xl tracking-tighter ${item.quantity <= item.minThreshold ? 'text-orange-500' : 'text-slate-900'}`}>
                      {item.quantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {editingThresholdId === item.id ? (
                      <input 
                        ref={thresholdRef} 
                        autoFocus 
                        type="number" 
                        onFocus={(e) => e.target.select()}
                        className="w-20 text-center font-black bg-blue-50 border-2 border-blue-500 rounded-xl p-2 outline-none text-sm" 
                        value={thresholdInput} 
                        onChange={(e) => setThresholdInput(e.target.value)} 
                        onBlur={() => handleInlineThresholdUpdate(item.id)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleInlineThresholdUpdate(item.id)} 
                      />
                    ) : (
                      <button onClick={() => { setEditingThresholdId(item.id); setThresholdInput(item.minThreshold.toString()); }} className="px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-black text-slate-400 group-hover:text-slate-700 text-sm">
                        {item.minThreshold.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(item.id); setFormData({ ...item }); setIsModalOpen(true); }} className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl"><Edit2 size={18}/></button>
                      <button onClick={() => confirm(`Hapus ${item.name}?`) && onDelete(item.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{editingId ? 'Edit' : 'Tambah'} Bahan Utama</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registry Mentah</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bahan Utama</label>
                <input required placeholder="Contoh: Tepung Terigu, Ayam Fillet" className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold focus:border-blue-500 outline-none text-sm transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan</label>
                  <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold outline-none text-sm" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok Awal</label>
                  <input type="number" step="0.01" onFocus={(e) => e.target.select()} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-black text-2xl focus:border-blue-500 outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit Tipis</label>
                  <input type="number" onFocus={(e) => e.target.select()} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-black text-2xl focus:border-blue-500 outline-none" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mt-4 active:scale-95">
                <CheckCircle2 size={18} /> Simpan Bahan Utama
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
