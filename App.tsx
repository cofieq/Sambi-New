
import React, { useState, useEffect, useMemo } from 'react';
import { Ingredient, MenuItem, SalesLog, StockHistory, MovementType, BatchRecipe } from './types';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Recipes } from './components/Recipes';
import { SalesEntry } from './components/SalesEntry';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { 
  LayoutDashboard, 
  Package, 
  ChefHat, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings as SettingsIcon, 
  ArrowLeftRight,
  LogOut,
  User,
  Calendar,
  FilterX,
  Menu
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('chefstock_auth') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('chefstock_user_email') || '';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recipes' | 'sales' | 'history' | 'stock_history' | 'reports' | 'settings'>('dashboard');
  
  // Filtering states
  const [historyStart, setHistoryStart] = useState('');
  const [historyEnd, setHistoryEnd] = useState('');
  const [stockStart, setStockStart] = useState('');
  const [stockEnd, setStockEnd] = useState('');

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('chefstock_categories');
    return saved ? JSON.parse(saved) : ['Vegetables', 'Meat & Poultry', 'Dairy', 'Spices & Herbs', 'Grains & Pasta', 'Oils & Sauces', 'Batches', 'Other'];
  });

  const [units, setUnits] = useState<string[]>(() => {
    const saved = localStorage.getItem('chefstock_units');
    return saved ? JSON.parse(saved) : ['g', 'kg', 'L', 'ml', 'pcs', 'tbsp', 'tsp'];
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
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('chefstock_categories', JSON.stringify(categories));
      localStorage.setItem('chefstock_units', JSON.stringify(units));
      localStorage.setItem('chefstock_ingredients', JSON.stringify(ingredients));
      localStorage.setItem('chefstock_batch_recipes', JSON.stringify(batchRecipes));
      localStorage.setItem('chefstock_menu', JSON.stringify(menuItems));
      localStorage.setItem('chefstock_history', JSON.stringify(salesHistory));
      localStorage.setItem('chefstock_stock_history', JSON.stringify(stockHistory));
    }
  }, [categories, units, ingredients, batchRecipes, menuItems, salesHistory, stockHistory, isAuthenticated]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('chefstock_auth', 'true');
    localStorage.setItem('chefstock_user_email', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chefstock_auth');
    localStorage.removeItem('chefstock_user_email');
  };

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

  const handleProduceBatch = (batchId: string, multiplier: number = 1) => {
    const batch = batchRecipes.find(b => b.id === batchId);
    if (!batch) return;

    setIngredients(prev => {
      let nextIngredients = [...prev];
      const targetIng = nextIngredients.find(i => i.id === batch.targetIngredientId);
      
      batch.recipe.forEach(sub => {
        const idx = nextIngredients.findIndex(i => i.id === sub.ingredientId);
        if (idx !== -1) {
          const deductionAmount = sub.amount * multiplier;
          const newTotal = nextIngredients[idx].quantity - deductionAmount;
          nextIngredients[idx] = { ...nextIngredients[idx], quantity: newTotal };
          addStockLog(sub.ingredientId, nextIngredients[idx].name, 'BATCH_PRODUCTION', deductionAmount, newTotal, `Produksi batch: ${targetIng?.name}`);
        }
      });

      const targetIdx = nextIngredients.findIndex(i => i.id === batch.targetIngredientId);
      if (targetIdx !== -1) {
        const yieldAmount = batch.yieldAmount * multiplier;
        const newTotal = nextIngredients[targetIdx].quantity + yieldAmount;
        nextIngredients[targetIdx] = { ...nextIngredients[targetIdx], quantity: newTotal };
        addStockLog(batch.targetIngredientId, nextIngredients[targetIdx].name, 'RESTOCK', yieldAmount, newTotal, `Hasil produksi batch (Yield)`);
      }

      return nextIngredients;
    });
  };

  const handleRecordSale = (menuId: string, quantity: number) => {
    const menu = menuItems.find(m => m.id === menuId);
    if (!menu) return;

    setIngredients(prev => {
      let nextIngredients = [...prev];

      menu.recipe.forEach(recipePart => {
        const amountToDeduct = recipePart.amount * quantity;
        const idx = nextIngredients.findIndex(i => i.id === recipePart.ingredientId);
        
        if (idx !== -1) {
          const currentIng = nextIngredients[idx];
          const newTotal = currentIng.quantity - amountToDeduct;
          nextIngredients[idx] = { ...currentIng, quantity: newTotal };
          
          addStockLog(
            currentIng.id, 
            currentIng.name, 
            'DEDUCTION', 
            amountToDeduct, 
            newTotal, 
            `Penjualan: ${menu.name} x${quantity}${currentIng.isBatch ? ' (Batch Item)' : ''}`
          );
        }
      });

      return nextIngredients;
    });

    setSalesHistory([{
      id: 'log-' + Date.now(),
      menuId: menu.id,
      menuName: menu.name,
      quantity,
      timestamp: new Date()
    }, ...salesHistory]);
  };

  const filteredSalesHistory = useMemo(() => {
    return salesHistory.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (historyStart && logDate < historyStart) return false;
      if (historyEnd && logDate > historyEnd) return false;
      return true;
    });
  }, [salesHistory, historyStart, historyEnd]);

  const filteredStockHistory = useMemo(() => {
    return stockHistory.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (stockStart && logDate < stockStart) return false;
      if (stockEnd && logDate > stockEnd) return false;
      return true;
    });
  }, [stockHistory, stockStart, stockEnd]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stok', icon: Package },
    { id: 'recipes', label: 'Resep', icon: ChefHat },
    { id: 'sales', label: 'Order', icon: ShoppingCart },
    { id: 'stock_history', label: 'Log Stok', icon: ArrowLeftRight, hideMobile: true },
    { id: 'history', label: 'Log Jual', icon: History, hideMobile: true },
    { id: 'reports', label: 'Insight', icon: BarChart3, hideMobile: true },
    { id: 'settings', label: 'Setup', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Top Bar - Adaptive height */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">ChefStock</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{userEmail.split('@')[0]}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-2">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Desktop/Tablet Sidebar */}
      <nav className="hidden md:flex w-20 lg:w-72 bg-slate-900 text-slate-300 flex-shrink-0 flex-col sticky top-0 h-screen z-50 border-r border-slate-800 shadow-2xl transition-all duration-300">
        <div className="p-6 lg:p-8 flex justify-center lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shrink-0">
              <ChefHat size={22} className="text-white" />
            </div>
            <div className="hidden lg:block overflow-hidden whitespace-nowrap">
              <h1 className="text-xl font-black text-white leading-none tracking-tight">ChefStock</h1>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Kitchen OS</span>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 lg:px-4 py-2 flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              title={item.label}
              className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 lg:px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
              <span className="hidden lg:block truncate">{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 lg:p-6 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <User size={16} />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-black text-white truncate">{userEmail.split('@')[0]}</p>
              <p className="text-[9px] text-slate-500 truncate">{userEmail}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Keluar"
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden lg:block">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Sticky and safe area aware */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center px-4 safe-bottom z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        {navItems.filter(item => !item.hideMobile).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all ${
              activeTab === item.id ? 'text-blue-500' : 'text-slate-500'
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('stock_history')}
          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all ${
            ['history', 'stock_history', 'reports'].includes(activeTab) ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <Menu size={20} />
          <span className="text-[9px] font-black uppercase tracking-tight">Opsi</span>
        </button>
      </nav>

      {/* Main Content - Improved scroll behavior for orientation changes */}
      <main className="flex-1 overflow-y-auto overscroll-contain bg-[#f8fafc] w-full">
        <div className="p-4 md:p-8 lg:p-14 pb-32 md:pb-14 max-w-7xl mx-auto">
          <header className="mb-6 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 capitalize tracking-tighter leading-none mb-2 md:mb-3">
              {activeTab.replace('_', ' ')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">Monitoring operasional dapur secara real-time.</p>
          </header>

          <div className="w-full">
            {activeTab === 'dashboard' && <Dashboard ingredients={ingredients} totalSales={salesHistory.length} />}
            {activeTab === 'inventory' && (
              <Inventory 
                ingredients={ingredients} 
                categories={categories}
                units={units}
                onAdd={(data) => setIngredients([...ingredients, { ...data, id: Date.now().toString() }])} 
                onUpdate={(id, data) => setIngredients(ingredients.map(ing => ing.id === id ? { ...data, id } : ing))}
                onDelete={(id) => setIngredients(ingredients.filter(i => i.id !== id))} 
              />
            )}
            {activeTab === 'recipes' && (
              <Recipes 
                ingredients={ingredients} 
                menuItems={menuItems}
                batchRecipes={batchRecipes}
                onAddMenu={(data) => setMenuItems([...menuItems, { ...data, id: 'm-' + Date.now() }])} 
                onUpdateMenu={(id, data) => setMenuItems(menuItems.map(m => m.id === id ? { ...data, id } : m))}
                onDeleteMenu={(id) => setMenuItems(menuItems.filter(m => m.id !== id))} 
                onAddBatch={(data) => {
                  const id = 'b-' + Date.now();
                  setBatchRecipes([...batchRecipes, { ...data, id }]);
                  setIngredients(ingredients.map(ing => ing.id === data.targetIngredientId ? { ...ing, isBatch: true } : ing));
                }}
                onUpdateBatch={(id, data) => {
                  setBatchRecipes(batchRecipes.map(b => b.id === id ? { ...data, id } : b));
                  setIngredients(ingredients.map(ing => ing.id === data.targetIngredientId ? { ...ing, isBatch: true } : ing));
                }}
                onDeleteBatch={(id) => {
                  const targetId = batchRecipes.find(b => b.id === id)?.targetIngredientId;
                  setBatchRecipes(batchRecipes.filter(b => b.id !== id));
                  if (targetId) setIngredients(ingredients.map(ing => ing.id === targetId ? { ...ing, isBatch: false } : ing));
                }}
                onProduceBatch={handleProduceBatch}
              />
            )}
            {activeTab === 'sales' && (
              <SalesEntry 
                menuItems={menuItems} 
                ingredients={ingredients} 
                batchRecipes={batchRecipes}
                onRecordSale={handleRecordSale} 
              />
            )}
            {activeTab === 'history' && (
               <div className="space-y-4 md:space-y-6">
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex-1">
                     <Calendar size={16} className="text-slate-400" />
                     <div className="flex items-center gap-2 w-full overflow-hidden">
                       <input 
                         type="date" 
                         className="bg-transparent text-[10px] sm:text-[11px] font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight shrink-0"
                         value={historyStart}
                         onChange={(e) => setHistoryStart(e.target.value)}
                       />
                       <span className="text-slate-300 font-bold">/</span>
                       <input 
                         type="date" 
                         className="bg-transparent text-[10px] sm:text-[11px] font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight shrink-0"
                         value={historyEnd}
                         onChange={(e) => setHistoryEnd(e.target.value)}
                       />
                     </div>
                   </div>
                   {(historyStart || historyEnd) && (
                     <button 
                       onClick={() => { setHistoryStart(''); setHistoryEnd(''); }}
                       className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center"
                     >
                       <FilterX size={20} />
                     </button>
                   )}
                 </div>
                 <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] card-shadow border border-slate-100 overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                      <tr><th className="px-6 md:px-8 py-6">Waktu</th><th className="px-6 md:px-8 py-6">Menu</th><th className="px-6 md:px-8 py-6 text-center">Qty</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSalesHistory.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 md:px-8 py-5 text-sm font-medium text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 md:px-8 py-5 font-bold text-slate-900">{log.menuName}</td>
                          <td className="px-6 md:px-8 py-5 text-center font-black text-blue-600">x{log.quantity}</td>
                        </tr>
                      ))}
                      {filteredSalesHistory.length === 0 && (
                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">Tidak ada data penjualan pada periode ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                 </div>
               </div>
            )}
            {activeTab === 'stock_history' && (
               <div className="space-y-4 md:space-y-6">
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex-1">
                     <Calendar size={16} className="text-slate-400" />
                     <div className="flex items-center gap-2 w-full overflow-hidden">
                       <input 
                         type="date" 
                         className="bg-transparent text-[10px] sm:text-[11px] font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight shrink-0"
                         value={stockStart}
                         onChange={(e) => setStockStart(e.target.value)}
                       />
                       <span className="text-slate-300 font-bold">/</span>
                       <input 
                         type="date" 
                         className="bg-transparent text-[10px] sm:text-[11px] font-black text-slate-700 outline-none cursor-pointer uppercase tracking-tight shrink-0"
                         value={stockEnd}
                         onChange={(e) => setStockEnd(e.target.value)}
                       />
                     </div>
                   </div>
                   {(stockStart || stockEnd) && (
                     <button 
                       onClick={() => { setStockStart(''); setStockEnd(''); }}
                       className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center"
                     >
                       <FilterX size={20} />
                     </button>
                   )}
                 </div>
                 <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] card-shadow border border-slate-100 overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
                      <tr><th className="px-6 md:px-8 py-6">Waktu</th><th className="px-6 md:px-8 py-6">Bahan Baku</th><th className="px-6 md:px-8 py-6">Tipe</th><th className="px-6 md:px-8 py-6 text-right">Jumlah</th><th className="px-6 md:px-8 py-6 text-right">Saldo</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredStockHistory.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 md:px-8 py-4 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 md:px-8 py-4 font-bold text-slate-800">{log.ingredientName}</td>
                          <td className="px-6 md:px-8 py-4">
                            <span className={`text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-full whitespace-nowrap ${
                              log.type === 'DEDUCTION' ? 'bg-red-50 text-red-600 border border-red-100' : 
                              log.type === 'RESTOCK' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                              log.type === 'BATCH_PRODUCTION' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100'
                            }`}>{log.type.replace('_', ' ')}</span>
                          </td>
                          <td className={`px-6 md:px-8 py-4 text-right font-black ${log.type === 'DEDUCTION' || log.type === 'BATCH_PRODUCTION' ? 'text-red-500' : 'text-emerald-600'}`}>
                            {log.type === 'DEDUCTION' || log.type === 'BATCH_PRODUCTION' ? '-' : '+'}{log.amount.toLocaleString()}
                          </td>
                          <td className="px-6 md:px-8 py-4 text-right font-mono font-bold text-slate-500">{log.balanceAfter.toLocaleString()}</td>
                        </tr>
                      ))}
                      {filteredStockHistory.length === 0 && (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">Tidak ada pergerakan stok pada periode ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                 </div>
               </div>
            )}
            {activeTab === 'reports' && <Reports ingredients={ingredients} salesHistory={salesHistory} menuItems={menuItems} />}
            {activeTab === 'settings' && (
              <Settings 
                categories={categories}
                units={units}
                onAddCategory={(n) => setCategories([...categories, n])}
                onUpdateCategory={(o, n) => setCategories(categories.map(c => c === o ? n : c))}
                onDeleteCategory={(n) => setCategories(categories.filter(c => c !== n))}
                onAddUnit={(n) => setUnits([...units, n])}
                onUpdateUnit={(o, n) => setUnits(units.map(u => u === o ? n : u))}
                onDeleteUnit={(n) => setUnits(units.filter(u => u !== n))}
                onResetSales={() => setSalesHistory([])}
                onFactoryReset={() => { localStorage.clear(); window.location.reload(); }}
                onImportData={(json) => { /* Logic */ }}
                currentData={{ categories, units, ingredients, menuItems, salesHistory, stockHistory }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
