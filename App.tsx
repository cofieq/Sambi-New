
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
  Menu,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('chefstock_auth') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('chefstock_user_email') || '';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recipes' | 'sales' | 'history' | 'stock_history' | 'reports' | 'settings'>('dashboard');
  
  // States for data persistence
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => JSON.parse(localStorage.getItem('chefstock_ingredients') || '[]'));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => JSON.parse(localStorage.getItem('chefstock_menu') || '[]'));
  const [salesHistory, setSalesHistory] = useState<SalesLog[]>(() => JSON.parse(localStorage.getItem('chefstock_history') || '[]'));
  const [stockHistory, setStockHistory] = useState<StockHistory[]>(() => JSON.parse(localStorage.getItem('chefstock_stock_history') || '[]'));
  const [batchRecipes, setBatchRecipes] = useState<BatchRecipe[]>(() => JSON.parse(localStorage.getItem('chefstock_batch_recipes') || '[]'));

  // Sync with LocalStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem('chefstock_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('chefstock_menu', JSON.stringify(menuItems));
    localStorage.setItem('chefstock_history', JSON.stringify(salesHistory));
    localStorage.setItem('chefstock_stock_history', JSON.stringify(stockHistory));
    localStorage.setItem('chefstock_batch_recipes', JSON.stringify(batchRecipes));
  }, [ingredients, menuItems, salesHistory, stockHistory, batchRecipes, isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chefstock_auth');
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stok', icon: Package },
    { id: 'recipes', label: 'Resep', icon: ChefHat },
    { id: 'sales', label: 'Order', icon: ShoppingCart },
    { id: 'stock_history', label: 'Log Stok', icon: ArrowLeftRight, hideMobile: true },
    { id: 'history', label: 'Log Jual', icon: History, hideMobile: true },
    { id: 'settings', label: 'Setelan', icon: SettingsIcon },
  ];

  if (!isAuthenticated) return <Login onLogin={(email) => { setIsAuthenticated(true); setUserEmail(email); localStorage.setItem('chefstock_auth', 'true'); }} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 pt-[env(safe-area-inset-top)] px-6 pb-4 flex items-center justify-between shadow-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">ChefStock</h1>
        </div>
        <button onClick={handleLogout} className="text-slate-400 p-2 active:scale-90 transition-transform">
          <LogOut size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-20 lg:w-72 bg-slate-900 text-slate-300 flex-col h-screen sticky top-0 z-50">
        <div className="p-8 hidden lg:block">
          <h1 className="text-2xl font-black text-white leading-none">ChefStock</h1>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Kitchen Intelligence</p>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
        {navItems.filter(i => !i.hideMobile || activeTab === i.id).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === item.id ? 'text-blue-500' : 'text-slate-500'
            }`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('stock_history')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500`}
        >
          <Menu size={22} />
          <span className="text-[9px] font-black uppercase tracking-tight">Opsi</span>
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] w-full">
        <div className="p-4 md:p-10 pb-32 max-w-7xl mx-auto">
          <header className="mb-6 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Pengelolaan dapur profesional dalam genggaman.</p>
          </header>

          <div className="animate-entry">
            {activeTab === 'dashboard' && <Dashboard ingredients={ingredients} totalSales={salesHistory.length} />}
            {activeTab === 'inventory' && (
              <Inventory 
                ingredients={ingredients} 
                categories={['Vegetables', 'Meat', 'Dairy', 'Dry Goods']}
                units={['kg', 'g', 'pcs', 'L', 'ml']}
                onAdd={d => setIngredients([...ingredients, { ...d, id: Date.now().toString() }])}
                onUpdate={(id, d) => setIngredients(ingredients.map(i => i.id === id ? { ...d, id } : i))}
                onDelete={id => setIngredients(ingredients.filter(i => i.id !== id))}
              />
            )}
            {activeTab === 'sales' && (
              <SalesEntry 
                menuItems={menuItems} 
                ingredients={ingredients}
                batchRecipes={batchRecipes}
                onRecordSale={(menuId, qty) => {
                  const menu = menuItems.find(m => m.id === menuId);
                  if (!menu) return;
                  setIngredients(prev => {
                    let next = [...prev];
                    menu.recipe.forEach(r => {
                      const idx = next.findIndex(i => i.id === r.ingredientId);
                      if (idx !== -1) next[idx] = { ...next[idx], quantity: next[idx].quantity - (r.amount * qty) };
                    });
                    return next;
                  });
                  setSalesHistory([{ id: Date.now().toString(), menuId, menuName: menu.name, quantity: qty, timestamp: new Date() }, ...salesHistory]);
                }}
              />
            )}
            {/* Other tabs follow similar logic... */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
