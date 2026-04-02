import React from 'react';
import { useStore, type Currency, type Page } from '../../store/useStore';
import {
  SunIcon as Sun, MoonIcon as Moon, WalletIcon as Wallet,
  ChartPieIcon, ListBulletsIcon, CalendarBlankIcon,
} from '@phosphor-icons/react';
import { ToastContainer } from '../ui/ToastContainer';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS = [2026, 2025, 2024];

const NAV_ITEMS: { page: Page; label: string; Icon: React.ElementType; sub: string }[] = [
  { page: 'dashboard', label: 'Budget Dashboard',  Icon: ChartPieIcon,      sub: 'KPIs & Charts'       },
  { page: 'tracking',  label: 'Budget Tracking',   Icon: ListBulletsIcon,   sub: 'All Transactions'    },
  { page: 'planning',  label: 'Budget Planning',   Icon: CalendarBlankIcon, sub: 'Annual Plan'         },
];

interface AppLayoutProps { children: React.ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const {
    currentRole, setRole, theme, toggleTheme, currency, setCurrency, addToast,
    selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
    currentPage, setCurrentPage,
  } = useStore();

  const handleRoleChange = (role: 'Admin' | 'Viewer') => {
    setRole(role);
    addToast(role === 'Admin' ? 'Admin access enabled' : 'Switched to read-only mode', 'info');
  };

  const SELECT_CLS =
    'w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 text-white hidden sm:flex flex-col shadow-xl shrink-0">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-slate-950">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Spendly</span>
        </div>

        {/* Nav links */}
        <nav className="p-3 space-y-1 mt-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 pt-1 pb-0.5">Navigation</p>
          {NAV_ITEMS.map(({ page, label, Icon, sub }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">{label}</p>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400 leading-tight">{sub}</p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Period Selector ── */}
        <div className="px-3 mt-3">
          <div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">View Period</p>
            <div className="relative">
              <select
                id="sidebar-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={SELECT_CLS}
                aria-label="Select year"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="relative">
              <select
                id="sidebar-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={SELECT_CLS}
                aria-label="Select month"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Role toggle */}
        <div className="p-3 border-t border-white/10">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Access Mode</p>
          <div className="bg-slate-800/50 p-1.5 rounded-xl flex items-center relative">
            <div
              className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-indigo-500 rounded-lg transition-transform duration-300 ease-out shadow ${
                currentRole === 'Admin' ? 'translate-x-full' : ''
              }`}
            />
            {(['Viewer', 'Admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-2 text-sm font-semibold z-10 relative transition-colors ${
                  currentRole === role ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 sm:hidden">
            <Wallet size={22} className="text-indigo-500" />
            <span className="font-bold">Spendly</span>
          </div>
          {/* Desktop: breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {NAV_ITEMS.find(n => n.page === currentPage)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Select Currency"
            >
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
              <option value="INR">🇮🇳 INR</option>
              <option value="JPY">🇯🇵 JPY</option>
            </select>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
