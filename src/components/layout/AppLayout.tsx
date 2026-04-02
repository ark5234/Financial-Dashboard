import React from 'react';
import { useStore } from '../../store/useStore';
import { SunIcon as Sun, MoonIcon as Moon, SquaresFourIcon as SquaresFour, WalletIcon as Wallet } from '@phosphor-icons/react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentRole, setRole, theme, toggleTheme } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden sm:flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Wallet size={24} className="text-blue-600 dark:text-blue-400" />       
          <span className="font-bold text-lg">FinanceDash</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
            <SquaresFour size={20} />
            Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm">
          Logged in as: <span className="font-semibold">{currentRole}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:hidden">
            <Wallet size={24} className="text-blue-600 dark:text-blue-400" /><span className="font-bold text-lg block">FinanceDash</span></div><div className="flex-1"></div><div className="flex items-center gap-4">
            {/* Role Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Viewer')}
                className="bg-gray-100 dark:bg-gray-700 border-none rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                title="Select User Role"
                aria-label="Select User Role"
              >
                <option value="Viewer">Viewer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

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
    </div>
  );
}



