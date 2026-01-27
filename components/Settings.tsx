
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
  const [newCat, setNewCat] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `chefstock_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-entry pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
          <h3 className="text-lg font-black mb-6">Profil Dapur</h3>
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Restoran/Dapur</label><input className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={kitchenName} onChange={e => { setKitchenName(e.target.value); localStorage.setItem('chefstock_kitchen_name', e.target.value); }} /></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
          <h3 className="text-lg font-black mb-6">Sistem & Data</h3>
          <div className="space-y-3">
            <button onClick={handleExport} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-3"><Download size={18}/> Export Data (.json)</button>
            <button onClick={() => confirm('Reset seluruh data?') && onFactoryReset()} className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-3"><ShieldAlert size={18}/> Reset Pabrik</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
          <h3 className="text-lg font-black mb-6">Master Kategori</h3>
          <form onSubmit={e => { e.preventDefault(); if(newCat) onAddCategory(newCat); setNewCat(''); }} className="flex gap-2 mb-6">
            <input className="flex-1 p-3 bg-slate-50 rounded-xl font-bold text-xs" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Kategori baru..." />
            <button className="bg-blue-600 text-white px-4 rounded-xl font-black"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-black uppercase text-slate-600">{cat}</span>
                <button onClick={() => onDeleteCategory(cat)} className="text-red-400"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
          <h3 className="text-lg font-black mb-6">Master Satuan</h3>
          <form onSubmit={e => { e.preventDefault(); if(newUnit) onAddUnit(newUnit); setNewUnit(''); }} className="flex gap-2 mb-6">
            <input className="flex-1 p-3 bg-slate-50 rounded-xl font-bold text-xs" value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Satuan baru..." />
            <button className="bg-orange-600 text-white px-4 rounded-xl font-black"><Plus size={18}/></button>
          </form>
          <div className="space-y-2">
            {units.map(u => (
              <div key={u} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-black text-slate-600">{u}</span>
                <button onClick={() => onDeleteUnit(u)} className="text-red-400"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
