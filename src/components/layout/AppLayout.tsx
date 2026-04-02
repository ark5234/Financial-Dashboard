import React from 'react';
import { useStore, type Currency, type Page } from '../../store/useStore';
import {
  SunIcon as Sun, MoonIcon as Moon, WalletIcon as Wallet,
  ChartPieIcon, ListBulletsIcon, CalendarBlankIcon, SlidersIcon,
} from '@phosphor-icons/react';
import { ToastContainer } from '../ui/ToastContainer';
import { BudgetModal } from '../../features/dashboard/BudgetModal';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS = [2026, 2025, 2024];

const NAV_ITEMS: { page: Page; label: string; Icon: React.ElementType; sub: string }[] = [
  { page: 'dashboard', label: 'Budget Dashboard', Icon: ChartPieIcon,      sub: 'KPIs & Charts'    },
  { page: 'tracking',  label: 'Budget Tracking',  Icon: ListBulletsIcon,   sub: 'All Transactions' },
  { page: 'planning',  label: 'Budget Planning',  Icon: CalendarBlankIcon, sub: 'Annual Plan'      },
];

const NAV_H  = 'h-[60px]';
const SIDE_W = 'w-56';

interface AppLayoutProps { children: React.ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const {
    currentRole, setRole, theme, toggleTheme, currency, setCurrency, addToast,
    selectedMonth, selectedYear, setSelectedMonth, setSelectedYear,
    currentPage, setCurrentPage,
    budgetModalOpen, openBudgetModal, closeBudgetModal,
  } = useStore();

  const isLight = theme === 'light';

  const activeNav = NAV_ITEMS.find(n => n.page === currentPage);

  const handleRoleChange = (role: 'Admin' | 'Viewer') => {
    setRole(role);
    addToast(role === 'Admin' ? 'Admin access enabled' : 'Switched to read-only', 'info');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>

      {/* ────────────────────── SIDEBAR ────────────────────────────────── */}
      <aside
        className={`${SIDE_W} hidden sm:flex flex-col shrink-0 transition-colors duration-300 ${
          isLight
            ? 'bg-white border-r border-gray-200'
            : 'bg-slate-900 border-r border-white/10'
        }`}
        style={!isLight ? { boxShadow: '4px 0 24px rgba(0,0,0,0.35)' } : undefined}
      >
        {/* Logo */}
        <div className={`${NAV_H} px-4 flex items-center gap-3 shrink-0 border-b ${
          isLight ? 'border-gray-100' : 'border-white/10'
        }`}>
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-400/40">
            <Wallet size={18} weight="fill" className="text-white" />
          </div>
          <span className={`font-extrabold text-lg tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Spendly
          </span>
        </div>

        {/* Nav */}
        <nav className="px-2 pt-4 pb-2 space-y-0.5">
          <p className={`text-[10px] font-bold uppercase tracking-[0.14em] px-3 pb-1.5 ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Navigation
          </p>
          {NAV_ITEMS.map(({ page, label, Icon, sub }) => {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                id={`nav-${page}`}
                onClick={() => setCurrentPage(page)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                  ${isActive
                    ? isLight
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white/10 text-white'
                    : isLight
                      ? 'text-slate-500 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
                `}
              >
                <Icon size={17} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate">{label}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 ${
                    isActive
                      ? isLight ? 'text-slate-500' : 'text-slate-400'
                      : isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}>{sub}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className={`mx-3 border-t my-2 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

        {/* Period Selector */}
        <div className="px-3">
          <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-2 ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            View Period
          </p>
          <div className="space-y-1.5">
            {[
              { id: 'sidebar-year',  value: selectedYear,  onChange: (v: number) => setSelectedYear(v),  options: YEARS.map(y => ({ v: y, l: String(y) })) },
              { id: 'sidebar-month', value: selectedMonth, onChange: (v: number) => setSelectedMonth(v), options: MONTHS.map((m, i) => ({ v: i, l: m })) },
            ].map(sel => (
              <select
                key={sel.id}
                id={sel.id}
                value={sel.value}
                onChange={e => sel.onChange(Number(e.target.value))}
                aria-label={sel.id}
                className={`w-full appearance-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer transition ${
                  isLight
                    ? 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300'
                    : 'bg-slate-700/70 border border-slate-600/60 text-white'
                }`}
              >
                {sel.options.map(o => (
                  <option
                    key={o.v} value={o.v}
                    style={{
                      backgroundColor: isLight ? '#ffffff' : '#1e293b',
                      color: isLight ? '#111827' : '#f1f5f9',
                    }}
                  >{o.l}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        <div className="flex-1" />
        <div className={`px-4 py-3 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
          <p className={`text-[10px] text-center ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>
            All data stored locally
          </p>
        </div>
      </aside>

      {/* ────────────────────── MAIN COLUMN ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* HEADER — mode responsive (white / dark-slate) */}
        <header className={`
          ${NAV_H} shrink-0 flex items-center px-4 sm:px-5 gap-3 transition-colors duration-300
          ${isLight
            ? 'bg-white border-b border-gray-200 shadow-sm'
            : 'bg-slate-900 border-b border-white/10 shadow-lg'}
        `}>

          {/* Mobile logo */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <Wallet size={15} weight="fill" className="text-white" />
            </div>
            <span className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Spendly</span>
          </div>

          {/* Page label */}
          <div className="hidden sm:block">
            <p className={`font-bold text-sm leading-none ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>
              {activeNav?.label}
            </p>
            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {activeNav?.sub}
            </p>
          </div>

          <div className="flex-1" />

          {/* Set Budgets — orange accent button */}
          {currentPage === 'dashboard' && currentRole === 'Admin' && (
            <button
              id="header-set-budgets"
              onClick={openBudgetModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isLight
                  ? 'text-gray-600 bg-white border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-slate-300 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <SlidersIcon size={13} />
              Set Budgets
            </button>
          )}

          {/* Access Mode toggle */}
          <div
            className={`flex p-0.5 rounded-lg border ${
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800 border-slate-700'
            }`}
            role="group" aria-label="Access mode"
          >
            {(['Viewer', 'Admin'] as const).map(role => (
              <button
                key={role}
                id={`role-toggle-${role.toLowerCase()}`}
                onClick={() => handleRoleChange(role)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === role
                    ? 'bg-gray-900 text-white shadow-sm'
                    : isLight
                      ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Currency */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isLight
              ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'opacity-50'}`}>
              in
            </span>
            <select
              id="currency-select"
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className={`bg-transparent border-none outline-none cursor-pointer text-xs font-bold ${
                isLight ? 'text-gray-900' : 'text-slate-100'
              }`}
            >
              {(['USD','EUR','GBP','INR','JPY'] as Currency[]).map(c => (
                <option
                  key={c} value={c}
                  style={{
                    backgroundColor: isLight ? '#ffffff' : '#1e293b',
                    color: isLight ? '#111827' : '#f1f5f9',
                  }}
                >{c}</option>
              ))}
            </select>
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
            className={`p-2 rounded-lg border transition-all ${
              isLight
                ? 'text-slate-500 bg-white border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                : 'text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-auto p-5 sm:p-7 lg:p-8 ${
          isLight ? 'bg-slate-50' : 'bg-slate-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* FOOTER — mode responsive */}
        <footer className={`
          shrink-0 py-3 flex items-center justify-between px-5 text-[11px] border-t transition-colors duration-300
          ${isLight
            ? 'bg-white border-gray-200 text-slate-400'
            : 'bg-slate-900 border-white/10 text-slate-500'}
        `}>
          <span className="font-medium">Spendly · Personal Finance Dashboard</span>
          <span className="hidden sm:block">All data stored locally · Built with React &amp; Recharts</span>
        </footer>
      </div>

      {budgetModalOpen && <BudgetModal onClose={closeBudgetModal} />}
      <ToastContainer />
    </div>
  );
}
