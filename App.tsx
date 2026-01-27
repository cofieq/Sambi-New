
import React, { useState, useEffect } from 'react';
import { Ingredient, MenuItem, SalesLog, StockHistory, MovementType, BatchRecipe, IngredientType } from './types';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Recipes } from './components/Recipes';
import { SalesEntry } from './components/SalesEntry';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { 
  LayoutDashboard, 
  Package, 
  ChefHat, 
  ShoppingCart, 
  ArrowLeftRight,
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Store,
  Box,
  Flame
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recipes' | 'sales' | 'history' | 'stock_history' | 'reports' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('chefstock_categories');
    return saved ? JSON.parse(saved) : ['Sayur', 'Daging', 'Dairy', 'Bumbu', 'Saus', 'Adonan', 'Lainnya'];
  });

  const [units, setUnits] = useState<string[]>(() => {
    const saved = localStorage.getItem('chefstock_units');
    return saved ? JSON.parse(saved) : ['g', 'kg', 'L', 'ml', 'pcs', 'porsi', 'tray'];
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('chefstock_ingredients');
    return saved ? JSON.parse(saved) : [];
  });

  const [batchRecipes, setBatchRecipes] = useState<BatchRecipe[]>(() => {
    const saved = localStorage.getItem('chefstock_batch_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('chefstock_menu');
    return saved ? JSON.parse(saved) : [];
  });

  const [salesHistory, setSalesHistory] = useState<SalesLog[]>(() => {
    const saved = localStorage.getItem('chefstock_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockHistory, setStockHistory] = useState<StockHistory[]>(() => {
    const saved = localStorage.getItem('chefstock_stock_history');
    const logs = saved ? JSON.parse(saved) : [];
    return logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
  });

  const kitchenName = localStorage.getItem('chefstock_kitchen_name') || 'Dapur Utama';

  useEffect(() => {
    localStorage.setItem('chefstock_categories', JSON.stringify(categories));
    localStorage.setItem('chefstock_units', JSON.stringify(units));
    localStorage.setItem('chefstock_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('chefstock_batch_recipes', JSON.stringify(batchRecipes));
    localStorage.setItem('chefstock_menu', JSON.stringify(menuItems));
    localStorage.setItem('chefstock_history', JSON.stringify(salesHistory));
    localStorage.setItem('chefstock_stock_history', JSON.stringify(stockHistory));
  }, [categories, units, ingredients, batchRecipes, menuItems, salesHistory, stockHistory]);

  const addStockLog = (ingredientId: string, name: string, type: MovementType, amount: number, balance: number, note?: string) => {
    const log: StockHistory = {
      id: 'stk-' + Date.now() + Math.random(),
      ingredientId,
      ingredientName: name,
      type,
      amount,
      balanceAfter: balance,
      timestamp: new Date(),
      note
    };
    setStockHistory(prev => [log, ...prev]);
  };

  const handleRecordSale = (menuId: string, quantity: number) => {
    const menu = menuItems.find(m => m.id === menuId);
    if (!menu) return;

    setIngredients(prev => {
      let next = [...prev];
      menu.recipe.forEach(ri => {
        const idx = next.findIndex(i => i.id === ri.ingredientId);
        if (idx !== -1) {
          const deductionAmount = ri.amount * quantity;
          const newQty = next[idx].quantity - deductionAmount;
          const isPrepared = next[idx].itemType === 'PREPARED';
          addStockLog(
            next[idx].id, 
            next[idx].name, 
            'DEDUCTION', 
            deductionAmount, 
            newQty, 
            `Jual Menu: ${menu.name} (${isPrepared ? 'Potong Stok Batch' : 'Potong Stok Utama'})`
          );
          next[idx] = { ...next[idx], quantity: newQty };
        }
      });
      return next;
    });

    setSalesHistory(prev => [{
      id: 'log-' + Date.now(),
      menuId: menu.id,
      menuName: menu.name,
      quantity,
      timestamp: new Date()
    }, ...prev]);
  };

  const handleProduceBatch = (batchId: string, multiplier: number = 1) => {
    const batch = batchRecipes.find(b => b.id === batchId);
    if (!batch) return;

    setIngredients(prev => {
      let next = [...prev];
      // Reduce the materials used to make this batch (usually RAW materials)
      batch.recipe.forEach(sub => {
        const idx = next.findIndex(i => i.id === sub.ingredientId);
        if (idx !== -1) {
          const deductionAmount = sub.amount * multiplier;
          const newQty = next[idx].quantity - deductionAmount;
          addStockLog(next[idx].id, next[idx].name, 'BATCH_PRODUCTION', deductionAmount, newQty, `Bahan produksi batch`);
          next[idx] = { ...next[idx], quantity: newQty };
        }
      });

      // Increase the Prepared Item stock
      const targetIdx = next.findIndex(i => i.id === batch.targetIngredientId);
      if (targetIdx !== -1) {
        const addAmount = batch.yieldAmount * multiplier;
        const newQty = next[targetIdx].quantity + addAmount;
        next[targetIdx] = { ...next[targetIdx], quantity: newQty, itemType: 'PREPARED' };
        addStockLog(next[targetIdx].id, next[targetIdx].name, 'RESTOCK', addAmount, newQty, `Hasil Produksi Batch`);
      }
      return next;
    });
  };

  const handleAddIngredient = (data: Omit<Ingredient, 'id'>) => {
    const newIngredient = { ...data, id: 'ing-' + Date.now() };
    setIngredients([...ingredients, newIngredient]);
    addStockLog(newIngredient.id, newIngredient.name, 'INITIAL', newIngredient.quantity, newIngredient.quantity, 'Saldo awal');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Bahan Utama', icon: Package },
    { id: 'recipes', label: 'Resep & Batch', icon: ChefHat },
    { id: 'sales', label: 'Kasir', icon: ShoppingCart },
    { id: 'stock_history', label: 'Log Stok', icon: ArrowLeftRight, hideMobile: true },
    { id: 'history', label: 'Log Jual', icon: History, hideMobile: true },
    { id: 'reports', label: 'Laporan', icon: BarChart3, hideMobile: true },
    { id: 'settings', label: 'Setting', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-lg shrink-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ChefHat size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">ChefStock</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
          <Store size={12} className="text-blue-400" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{kitchenName}</span>
        </div>
      </div>

      {/* Desktop Sleek Sidebar */}
      <nav className={`hidden md:flex bg-slate-900 text-slate-300 flex-col sticky top-0 h-screen z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <div className={`p-8 mb-4 transition-all duration-300 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed ? (
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">ChefStock</h1>
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Kitchen OS</p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ChefHat size={24} className="text-white" />
            </div>
          )}
        </div>

        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-20 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors z-50">
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all relative group ${activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 active-nav-glow' : 'hover:bg-slate-800/50 hover:text-white'}`}>
              <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all z-[100] border border-white/5">{item.label}</div>
              )}
            </button>
          ))}
        </div>

        <div className={`p-6 border-t border-white/5 transition-all duration-300 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-4 p-3 bg-white/5 rounded-[1.25rem] border border-white/5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5"><Store size={18} className="text-blue-400" /></div>
             {!isSidebarCollapsed && (
               <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Kitchen Profile</p>
                 <p className="text-xs font-bold text-white truncate">{kitchenName}</p>
               </div>
             )}
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] w-full relative">
        <div className="p-4 md:p-10 pb-32 max-w-7xl mx-auto">
          <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('_', ' ')}</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">Operational Intelligence Dashboard</p>
            </div>
          </header>

          <div className="relative">
            {activeTab === 'dashboard' && <Dashboard ingredients={ingredients} totalSales={salesHistory.length} />}
            {activeTab === 'inventory' && <Inventory ingredients={ingredients} categories={categories} units={units} onAdd={handleAddIngredient} onUpdate={(id, d) => setIngredients(ingredients.map(i => i.id === id ? { ...d, id } : i))} onDelete={id => setIngredients(ingredients.filter(i => i.id !== id))} />}
            {activeTab === 'recipes' && <Recipes ingredients={ingredients} menuItems={menuItems} batchRecipes={batchRecipes} onAddMenu={d => setMenuItems([...menuItems, { ...d, id: 'm-' + Date.now() }])} onUpdateMenu={(id, d) => setMenuItems(menuItems.map(m => m.id === id ? { ...d, id } : m))} onDeleteMenu={id => setMenuItems(menuItems.filter(m => m.id !== id))} onAddBatch={d => setBatchRecipes([...batchRecipes, { ...d, id: 'b-' + Date.now() }])} onUpdateBatch={(id, d) => setBatchRecipes(batchRecipes.map(b => b.id === id ? { ...d, id } : b))} onDeleteBatch={id => setBatchRecipes(batchRecipes.filter(b => b.id !== id))} onProduceBatch={handleProduceBatch} onAddPreparedItem={(d) => setIngredients([...ingredients, { ...d, id: 'ing-' + Date.now(), itemType: 'PREPARED' }])} />}
            {activeTab === 'sales' && <SalesEntry menuItems={menuItems} ingredients={ingredients} batchRecipes={batchRecipes} onRecordSale={handleRecordSale} />}
            {activeTab === 'stock_history' && (
              <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-slate-100 overflow-x-auto animate-entry">
                <table className="w-full text-left min-w-[600px]"><thead className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-50"><tr><th className="pb-6">Timestamp</th><th className="pb-6">Material</th><th className="pb-6">Operation</th><th className="pb-6 text-right">Volume</th><th className="pb-6 text-right">Balance</th></tr></thead><tbody className="text-sm divide-y divide-slate-50">{stockHistory.map(log => (<tr key={log.id} className="hover:bg-slate-50/50 transition-colors"><td className="py-5 text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</td><td className="py-5 font-bold text-slate-800">{log.ingredientName}</td><td className="py-5"><span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${log.type === 'DEDUCTION' || log.type === 'BATCH_PRODUCTION' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{log.type}</span></td><td className={`py-5 text-right font-black ${log.type === 'DEDUCTION' || log.type === 'BATCH_PRODUCTION' ? 'text-red-500' : 'text-emerald-500'}`}>{log.amount.toLocaleString()}</td><td className="py-5 text-right font-mono text-slate-500 font-bold">{log.balanceAfter.toLocaleString()}</td></tr>))}</tbody></table>
                {stockHistory.length === 0 && <div className="py-24 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em]">No operations recorded</div>}
              </div>
            )}
            {activeTab === 'history' && (
               <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-slate-100 overflow-x-auto animate-entry">
                 <table className="w-full text-left min-w-[600px]"><thead className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-50"><tr><th className="pb-6">Timestamp</th><th className="pb-6">Product</th><th className="pb-6 text-right">Quantity</th><th className="pb-6 text-right">Operation ID</th></tr></thead><tbody className="text-sm divide-y divide-slate-50">{salesHistory.map(log => (<tr key={log.id} className="hover:bg-slate-50/50 transition-colors"><td className="py-5 text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</td><td className="py-5 font-bold text-slate-800">{log.menuName}</td><td className="py-5 text-right font-black text-blue-600">{log.quantity}</td><td className="py-5 text-right font-mono text-[10px] text-slate-300">{log.id}</td></tr>))}</tbody></table>
                 {salesHistory.length === 0 && <div className="py-24 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em]">No sales logged</div>}
               </div>
            )}
            {activeTab === 'reports' && <Reports ingredients={ingredients} salesHistory={salesHistory} menuItems={menuItems} />}
            {activeTab === 'settings' && <Settings categories={categories} units={units} onAddCategory={c => setCategories([...categories, c])} onUpdateCategory={(o, n) => setCategories(categories.map(c => c === o ? n : c))} onDeleteCategory={c => setCategories(categories.filter(cat => cat !== c))} onAddUnit={u => setUnits([...units, u])} onUpdateUnit={(o, n) => setUnits(units.map(u => u === o ? n : u))} onDeleteUnit={u => setUnits(units.filter(unit => unit !== u))} onResetSales={() => setSalesHistory([])} onFactoryReset={() => { localStorage.clear(); window.location.reload(); }} currentData={{ ingredients, menuItems, batchRecipes, salesHistory }} onImportData={d => { /* logic */ }} />}
          </div>
        </div>
      </main>
      
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-3 pb-8 z-50">
        {navItems.filter(i => !i.hideMobile).map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`}>
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <div className="w-1 h-1 bg-blue-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
