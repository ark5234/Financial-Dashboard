import React from 'react';
import { useStore } from '../../store/useStore';
import { Currency } from '../../store/useStore';
import { SunIcon as Sun, MoonIcon as Moon, SquaresFourIcon as SquaresFour, WalletIcon as Wallet } from '@phosphor-icons/react';
import { ToastContainer } from '../ui/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentRole, setRole, theme, toggleTheme, currency, setCurrency, addToast } = useStore();

  const handleRoleChange = (role: 'Admin' | 'Viewer') => {
    setRole(role);
    addToast(role === 'Admin' ? 'Admin access enabled' : 'Switched to read-only mode', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden sm:flex flex-col shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-slate-950">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Wallet size={20} className="text-white" />       
          </div>
          <span className="font-bold text-xl tracking-tight">Spendly</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/20 text-indigo-300 rounded-xl font-medium transition-colors">
            <SquaresFour size={22} weight="fill" />
            Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-slate-800/50 p-2 rounded-xl flex items-center relative">
            <div
              className={`absolute inset-y-2 left-2 w-[calc(50%-8px)] bg-indigo-500 rounded-lg transition-transform duration-300 ease-out shadow-md ${
                currentRole === 'Admin' ? 'translate-x-full ml-2' : ''
              }`}
            />
            <button
              onClick={() => handleRoleChange('Viewer')}
              className={`flex-1 flex justify-center py-2 text-sm font-semibold z-10 transition-colors ${
                currentRole === 'Viewer' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Viewer
            </button>
            <button
              onClick={() => handleRoleChange('Admin')}
              className={`flex-1 flex justify-center py-2 text-sm font-semibold z-10 transition-colors ${
                currentRole === 'Admin' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:hidden">
            <Wallet size={24} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-lg block">Spendly</span>
          </div>
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              title="Select Currency"
              aria-label="Select Currency"
            >
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
              <option value="INR">🇮🇳 INR</option>
              <option value="JPY">🇯🇵 JPY</option>
            </select>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}



