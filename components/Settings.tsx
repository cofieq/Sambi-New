
import React, { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Download, ShieldAlert, Database, Tag, Plus, Edit2, Check, Store, Ruler, X } from 'lucide-react';

interface SettingsProps {
  categories: string[];
  units: string[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddUnit: (name: string) => void;
  onUpdateUnit: (oldName: string, newName: string) => void;
  onDeleteUnit: (name: string) => void;
  onResetSales: () => void;
  onFactoryReset: () => void;
  onImportData: (data: string) => void;
  currentData: any;
}

export const Settings: React.FC<SettingsProps> = ({ 
  categories, units, onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddUnit, onUpdateUnit, onDeleteUnit, onFactoryReset, currentData 
}) => {
  const [kitchenName, setKitchenName] = useState(localStorage.getItem('chefstock_kitchen_name') || 'Dapur Utama');
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatValue, setEditCatValue] = useState('');

  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editUnitValue, setEditUnitValue] = useState('');

  const saveGeneralSettings = () => {
    localStorage.setItem('chefstock_kitchen_name', kitchenName);
    alert('Konfigurasi profil berhasil diperbarui!');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `chefstock_pro_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  // Fix: Added handleAddCat to manage category form submission
  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  // Fix: Added handleAddUnit to manage unit form submission
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUnitName.trim()) {
      onAddUnit(newUnitName.trim());
      setNewUnitName('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-entry pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden card-shadow">
          <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem]"><Store size={28} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Profil Operasional</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kitchen Identity</p>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Dapur / Unit Bisnis</label>
              <input className="w-full border-2 border-slate-50 rounded-[1.5rem] p-5 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-bold outline-none" value={kitchenName} onChange={(e) => setKitchenName(e.target.value)} />
            </div>
            <button onClick={saveGeneralSettings} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">Update Profil</button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden card-shadow">
          <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-[1.5rem]"><Database size={28} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Keamanan Data</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Data Retention & Integrity</p>
            </div>
          </div>
          <div className="p-10 space-y-6">
            <button onClick={handleExport} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
              <Download size={20} /> Export Backup (.json)
            </button>
            <button onClick={() => confirm('Hapus semua data? Tindakan ini tidak dapat dibatalkan.') && onFactoryReset()} className="w-full py-5 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95 border-2 border-red-100">
              <ShieldAlert size={20} /> Factory Reset (Clear All)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden card-shadow">
          <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem]"><Tag size={28} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Kategori Bahan</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Classification Matrix</p>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <form onSubmit={handleAddCat} className="flex gap-4">
              <input placeholder="Kategori baru..." className="flex-1 border-2 border-slate-50 rounded-2xl px-5 py-4 bg-slate-50 font-bold outline-none" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <button type="submit" className="bg-emerald-600 text-white px-6 rounded-2xl font-black shadow-lg shadow-emerald-100 active:scale-95"><Plus size={24} /></button>
            </form>
            <div className="grid grid-cols-1 gap-3">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                  {editingCat === cat ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input autoFocus className="flex-1 text-sm bg-white border-2 border-blue-500 rounded-xl px-4 py-2 font-bold outline-none" value={editCatValue} onChange={(e) => setEditCatValue(e.target.value)}/>
                      <button onClick={() => { onUpdateCategory(cat, editCatValue); setEditingCat(null); }} className="p-2 bg-blue-600 text-white rounded-lg"><Check size={18}/></button>
                      <button onClick={() => setEditingCat(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg"><X size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{cat}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingCat(cat); setEditCatValue(cat); }} className="p-2 hover:bg-white text-blue-500 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => confirm(`Hapus kategori ${cat}?`) && onDeleteCategory(cat)} className="p-2 hover:bg-white text-red-500 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden card-shadow">
          <div className="p-10 border-b border-slate-50 flex items-center gap-5 bg-slate-50/30">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-[1.5rem]"><Ruler size={28} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Satuan Pengukuran</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Metrics Configuration</p>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <form onSubmit={handleAddUnit} className="flex gap-4">
              <input placeholder="Satuan baru..." className="flex-1 border-2 border-slate-50 rounded-2xl px-5 py-4 bg-slate-50 font-bold outline-none" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} />
              <button type="submit" className="bg-orange-600 text-white px-6 rounded-2xl font-black shadow-lg shadow-orange-100 active:scale-95"><Plus size={24} /></button>
            </form>
            <div className="grid grid-cols-1 gap-3">
              {units.map(unit => (
                <div key={unit} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                  {editingUnit === unit ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input autoFocus className="flex-1 text-sm bg-white border-2 border-orange-500 rounded-xl px-4 py-2 font-bold outline-none" value={editUnitValue} onChange={(e) => setEditUnitValue(e.target.value)}/>
                      <button onClick={() => { onUpdateUnit(unit, editUnitValue); setEditingUnit(null); }} className="p-2 bg-orange-600 text-white rounded-lg"><Check size={18}/></button>
                      <button onClick={() => setEditingUnit(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg"><X size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-700">{unit}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingUnit(unit); setEditUnitValue(unit); }} className="p-2 hover:bg-white text-blue-500 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => confirm(`Hapus satuan ${unit}?`) && onDeleteUnit(unit)} className="p-2 hover:bg-white text-red-500 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};