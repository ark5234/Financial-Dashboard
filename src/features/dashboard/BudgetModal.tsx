import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import { XIcon as X, ArrowUpIcon, ArrowDownIcon, PiggyBankIcon } from '@phosphor-icons/react';
import { formatCurrency } from '../../utils/format';

interface BudgetModalProps { onClose: () => void; }

const SECTIONS: { type: TransactionType; label: string; bg: string; light: string; categories: string[] }[] = [
  {
    type: 'income', label: 'Income',
    bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200',
    categories: ['Salary', 'Freelance', 'Investment'],
  },
  {
    type: 'expense', label: 'Expenses',
    bg: 'bg-rose-500', light: 'bg-rose-50 border-rose-200',
    categories: ['Housing', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Dining', 'Health'],
  },
  {
    type: 'savings', label: 'Savings',
    bg: 'bg-violet-600', light: 'bg-violet-50 border-violet-200',
    categories: ['Emergency Fund', 'Retirement', 'Stock Portfolio', 'Sinking Fund'],
  },
];

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };

export function BudgetModal({ onClose }: BudgetModalProps) {
  const { budgets, setBudget, currency, addToast } = useStore();
  const sym = CURRENCY_SYMBOL[currency] ?? currency;

  // Local draft — keyed `${type}:${category}`
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    budgets.forEach(b => { init[`${b.type}:${b.category}`] = b.amount.toString(); });
    return init;
  });

  const handleChange = (type: TransactionType, cat: string, val: string) =>
    setDraft(prev => ({ ...prev, [`${type}:${cat}`]: val }));

  const sectionTotal = (type: TransactionType, cats: string[]) =>
    cats.reduce((s, cat) => {
      const v = parseFloat(draft[`${type}:${cat}`] ?? '0');
      return s + (isNaN(v) ? 0 : v);
    }, 0);

  // ── Allocation summary ──────────────────────────────────────────────────────
  const incomeSection  = SECTIONS[0];
  const expenseSection = SECTIONS[1];
  const savingsSection = SECTIONS[2];

  const { totalIncome, totalExpenses, totalSavings, moneyLeft, pctAllocated } = useMemo(() => {
    const totalIncome   = sectionTotal('income',  incomeSection.categories);
    const totalExpenses = sectionTotal('expense', expenseSection.categories);
    const totalSavings  = sectionTotal('savings', savingsSection.categories);
    const totalOut      = totalExpenses + totalSavings;
    const moneyLeft     = totalIncome - totalOut;
    const pctAllocated  = totalIncome > 0 ? Math.round((totalOut / totalIncome) * 100) : 0;
    return { totalIncome, totalExpenses, totalSavings, moneyLeft, pctAllocated };
  }, [draft]); // eslint-disable-line

  const isOver      = moneyLeft < 0;
  const isBalanced  = moneyLeft === 0;

  const handleSave = () => {
    SECTIONS.forEach(({ type, categories }) => {
      categories.forEach(cat => {
        const parsed = parseFloat(draft[`${type}:${cat}`] ?? '0');
        if (!isNaN(parsed) && parsed >= 0) setBudget(cat, type, parsed);
      });
    });
    addToast('Budgets saved successfully', 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-4 flex flex-col">

          {/* ── Modal Header ─────────────────────────────────────────────── */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10 flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Budget Targets</h2>
              <p className="text-xs text-gray-400 mt-0.5">Set how much you plan to earn, spend, and save each month</p>
            </div>
            <button aria-label="Close" onClick={onClose}
              className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Allocation Health Bar ─────────────────────────────────────── */}
          <div className={`mx-6 mt-5 rounded-xl border-2 p-4 ${
            isOver
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700'
              : isBalanced
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
          }`}>
            {/* Row 1: Income / Expenses / Savings */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <ArrowUpIcon size={11} weight="bold" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
                </div>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">{formatCurrency(totalIncome, currency)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-rose-500 dark:text-rose-400 mb-0.5">
                  <ArrowDownIcon size={11} weight="bold" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Expenses</span>
                </div>
                <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">{formatCurrency(totalExpenses, currency)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-violet-600 dark:text-violet-400 mb-0.5">
                  <PiggyBankIcon size={11} weight="bold" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Savings</span>
                </div>
                <p className="text-sm font-extrabold text-violet-700 dark:text-violet-400 tabular-nums">{formatCurrency(totalSavings, currency)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
              {totalIncome > 0 && (
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : isBalanced ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(pctAllocated, 100)}%` }}
                />
              )}
            </div>

            {/* Row 2: Remaining label */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {pctAllocated}% of income allocated
              </span>
              <span className={`text-sm font-extrabold tabular-nums ${
                isOver ? 'text-rose-600 dark:text-rose-400' : isBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {isOver
                  ? `⚠ Over by ${formatCurrency(Math.abs(moneyLeft), currency)}`
                  : isBalanced
                  ? `✓ Perfectly balanced`
                  : `${formatCurrency(moneyLeft, currency)} unallocated`}
              </span>
            </div>
          </div>

          {/* ── Body ─────────────────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-6">
            {SECTIONS.map(({ type, label, bg, light, categories }) => (
              <div key={type}>
                {/* Section header */}
                <div className={`${bg} text-white rounded-xl px-4 py-2.5 flex justify-between items-center mb-3`}>
                  <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(sectionTotal(type, categories), currency)}
                  </span>
                </div>

                {/* Rows */}
                <div className="space-y-2">
                  {categories.map(cat => {
                    const raw = draft[`${type}:${cat}`] ?? '';
                    const v   = parseFloat(raw);
                    const hasValue = !isNaN(v) && v > 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <label htmlFor={`budget-${type}-${cat}`}
                          className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {cat}
                        </label>
                        <div className="relative w-36 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
                            {sym}
                          </span>
                          <input
                            id={`budget-${type}-${cat}`}
                            type="number" min="0" step="50"
                            value={raw}
                            onChange={e => handleChange(type, cat, e.target.value)}
                            placeholder="0"
                            className={`w-full pl-7 pr-3 py-2 text-sm rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums text-right transition border ${
                              hasValue
                                ? `${light} dark:bg-slate-700 dark:border-slate-500 font-semibold text-gray-800 dark:text-gray-100`
                                : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-400'
                            }`}
                            aria-label={`Budget for ${cat}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Sticky Footer ─────────────────────────────────────────────── */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-2xl px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400 hidden sm:block">Changes apply to all periods until updated</p>
            <div className="flex gap-2 shrink-0 ml-auto">
              <button onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition border border-gray-200 dark:border-slate-600">
                Cancel
              </button>
              <button onClick={handleSave}
                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 transition">
                Save Budgets
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
