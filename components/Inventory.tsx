
import React, { useState, useEffect, useRef } from 'react';
import { Ingredient } from '../types';
import { Plus, Search, Trash2, Edit2, X, CheckSquare, Square, CheckCircle2, ShoppingBag, RefreshCcw, Boxes } from 'lucide-react';

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
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>('');
  const thresholdRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adjustmentData, setAdjustmentData] = useState({ id: '', newQuantity: 0, reason: '' });

  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || 'Other',
    quantity: 0,
    unit: units[0] || 'pcs',
    minThreshold: 100
  });

  useEffect(() => {
    if (!formData.category && categories.length > 0) setFormData(prev => ({ ...prev, category: categories[0] }));
    if (!formData.unit && units.length > 0) setFormData(prev => ({ ...prev, unit: units[0] }));
  }, [categories, units]);

  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(i => i.id));

  const handleInlineThresholdUpdate = (id: string) => {
    const item = ingredients.find(i => i.id === id);
    if (item) {
      const val = parseFloat(thresholdInput);
      if (!isNaN(val) && val >= 0) onUpdate(id, { ...item, minThreshold: val });
    }
    setEditingThresholdId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onUpdate(editingId, formData);
    else onAdd(formData);
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-entry">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari bahan..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-50/50 outline-none transition-all card-shadow font-medium text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => setIsAdjustmentOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest shadow-sm"><RefreshCcw size={16} /> <span className="hidden sm:inline">Update</span></button>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex-[2] lg:flex-none flex items-center justify-center gap-2 px-6 md:px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-blue-200"><Plus size={18} /> <span className="hidden sm:inline">Tambah Bahan</span><span className="sm:hidden">Tambah</span></button>
        </div>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[3rem] card-shadow border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-6 py-8 w-12 text-center"><button onClick={toggleSelectAll}>{selectedIds.length === filtered.length ? <CheckSquare size={18} /> : <Square size={18} />}</button></th>
                <th className="px-4 py-8">Bahan Baku</th>
                <th className="px-6 py-8">Kategori</th>
                <th className="px-6 py-8 text-center">Stok</th>
                <th className="px-6 py-8 text-center">Batas</th>
                <th className="px-6 py-8">Satuan</th>
                <th className="px-8 py-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-6 text-center"><button onClick={() => toggleSelect(item.id)} className={selectedIds.includes(item.id) ? 'text-blue-600' : 'text-slate-200'}>{selectedIds.includes(item.id) ? <CheckSquare size={18} /> : <Square size={18} />}</button></td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm border flex-shrink-0 ${item.isBatch ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {item.isBatch ? <Boxes size={18} /> : item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-xs md:text-sm flex items-center gap-2">
                          {item.name}
                        </p>
                        {item.isBatch && <span className="text-[7px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Batch</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6"><span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-black uppercase tracking-tight border border-slate-100">{item.category}</span></td>
                  <td className="px-6 py-6 text-center"><span className={`font-mono font-black text-lg md:text-xl ${item.quantity <= item.minThreshold ? 'text-orange-500' : 'text-slate-900'}`}>{item.quantity.toLocaleString()}</span></td>
                  <td className="px-6 py-6 text-center">
                    {editingThresholdId === item.id ? (
                      <input ref={thresholdRef} type="number" className="w-16 text-center font-mono font-black bg-blue-50 border border-blue-200 rounded-lg p-1 outline-none text-sm" value={thresholdInput} onChange={(e) => setThresholdInput(e.target.value)} onBlur={() => handleInlineThresholdUpdate(item.id)} onKeyDown={(e) => e.key === 'Enter' && handleInlineThresholdUpdate(item.id)} />
                    ) : (
                      <button onClick={() => { setEditingThresholdId(item.id); setThresholdInput(item.minThreshold.toString()); }} className="px-3 py-1 rounded-lg hover:bg-slate-50 transition-all font-mono font-black text-slate-400 group-hover:text-slate-600 text-sm">
                        {item.minThreshold.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-6 text-slate-400 font-black text-[9px] uppercase tracking-widest">{item.unit}</td>
                  <td className="px-8 py-6 text-right flex justify-end gap-1">
                    <button onClick={() => { setEditingId(item.id); setFormData({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minThreshold: item.minThreshold }); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 size={18} /></button>
                    <button onClick={() => confirm(`Hapus ${item.name}?`) && onDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-8 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">{editingId ? 'Edit' : 'Tambah'} Material</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventory Management</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Material</label>
                <input required className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan</label>
                  <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 outline-none text-sm" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok Awal</label>
                  <input type="number" step="0.01" className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-black text-xl text-slate-800 focus:border-blue-500 outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Minimum</label>
                  <input type="number" className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-black text-xl text-slate-800 focus:border-blue-500 outline-none" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm md:text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl active:scale-95 mt-4"><CheckCircle2 size={20} /> {editingId ? 'Simpan Perubahan' : 'Daftarkan Material'}</button>
            </form>
          </div>
        </div>
      )}

      {isAdjustmentOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl md:text-2xl font-black mb-1 tracking-tight">Adjustment Center</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Manual Overwrite Stock</p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bahan</label>
                <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold text-sm" onChange={(e) => setAdjustmentData({...adjustmentData, id: e.target.value})}>
                  <option value="">Pilih Material...</option>
                  {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.quantity} {i.unit})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Baru</label>
                <input type="number" placeholder="Set level stok..." className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-black text-xl" onChange={(e) => setAdjustmentData({...adjustmentData, newQuantity: Number(e.target.value)})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</label>
                <textarea placeholder="Alasan penyesuaian..." className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 font-bold h-24 text-sm" onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAdjustmentOpen(false)} className="flex-1 py-4 rounded-xl font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-slate-50 border border-transparent">Batal</button>
                <button onClick={() => {
                  const item = ingredients.find(i => i.id === adjustmentData.id);
                  if (item) onUpdate(item.id, {...item, quantity: adjustmentData.newQuantity});
                  setIsAdjustmentOpen(false);
                }} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
