import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import { getMonth, getYear, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { PencilSimpleIcon, CheckIcon, XIcon as X } from '@phosphor-icons/react';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PLAN_SECTIONS: { type: TransactionType; label: string; headerBg: string; categories: string[] }[] = [
  { type: 'income',  label: 'Income',   headerBg: 'bg-emerald-600', categories: ['Salary', 'Freelance', 'Investment'] },
  { type: 'expense', label: 'Expenses', headerBg: 'bg-rose-500',    categories: ['Housing', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Dining', 'Health'] },
  { type: 'savings', label: 'Savings',  headerBg: 'bg-violet-600',  categories: ['Emergency Fund', 'Retirement', 'Stock Portfolio', 'Sinking Fund'] },
];

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };

export function BudgetPlanningView() {
  const { transactions, budgets, currency, currentRole, setBudget, selectedYear, addToast } = useStore();
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  const now = new Date();
  const currentMonthIdx = now.getMonth();

  const [editing, setEditing] = useState<{ key: string; value: string } | null>(null);

  // Actual spend per category per month
  const monthlyActuals = useMemo(() => {
    const map: Record<string, number[]> = {};
    transactions
      .filter(t => getYear(parseISO(t.date)) === selectedYear)
      .forEach(t => {
        const m = getMonth(parseISO(t.date));
        if (!map[t.category]) map[t.category] = Array(12).fill(0);
        map[t.category][m] += t.amount;
      });
    return map;
  }, [transactions, selectedYear]);

  const getBudget = (type: TransactionType, cat: string) =>
    budgets.find(b => b.category === cat && b.type === type)?.amount ?? 0;

  const startEdit = (type: TransactionType, cat: string) => {
    setEditing({ key: `${type}:${cat}`, value: String(getBudget(type, cat)) });
  };

  const commitEdit = (type: TransactionType, cat: string) => {
    if (!editing) return;
    const v = parseFloat(editing.value);
    if (!isNaN(v) && v >= 0) {
      setBudget(cat, type, v);
      addToast(`Budget updated for ${cat}`, 'success');
    }
    setEditing(null);
  };

  const fmt = (v: number) => v > 0 ? formatCurrency(v, currency) : '—';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Budget Planning</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Annual plan for {selectedYear} · Change year from the sidebar ·{' '}
          {currentRole === 'Admin'
            ? <span className="text-indigo-400">Click any Monthly Budget cell to edit</span>
            : <span>Switch to Admin mode to edit budgets</span>}
        </p>
      </div>

      {PLAN_SECTIONS.map(({ type, label, headerBg, categories }) => {
        const sectionActuals = categories.map(cat => monthlyActuals[cat] ?? Array(12).fill(0));
        const monthTotals    = SHORT_MONTHS.map((_, mi) => sectionActuals.reduce((s, a) => s + a[mi], 0));
        const totalMonthlyBudget = categories.reduce((s, cat) => s + getBudget(type, cat), 0);
        const totalYearBudget    = totalMonthlyBudget * 12;
        const totalYTD           = sectionActuals.reduce((s, a) => s + a.slice(0, currentMonthIdx + 1).reduce((x, y) => x + y, 0), 0);

        return (
          <div key={type} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">

            {/* Section header bar */}
            <div className={`${headerBg} text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3`}>
              <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
              <div className="flex items-center gap-6 text-xs font-medium opacity-90">
                <span>Monthly budget: {formatCurrency(totalMonthlyBudget, currency)}</span>
                <span>Year budget: {formatCurrency(totalYearBudget, currency)}</span>
                <span className="font-bold">YTD actual: {formatCurrency(totalYTD, currency)}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-slate-900/60 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-900/60 px-4 py-2.5 text-left min-w-[160px]">Category</th>
                    <th className="px-4 py-2.5 text-right min-w-[130px]">
                      Monthly Budget
                      {currentRole === 'Admin' && <span className="ml-1 text-indigo-400 normal-case font-normal">(editable)</span>}
                    </th>
                    <th className="px-4 py-2.5 text-right min-w-[110px]">Year Budget</th>
                    {SHORT_MONTHS.map((m, i) => (
                      <th key={m} className={`px-3 py-2.5 text-right min-w-[80px] ${i === currentMonthIdx ? 'text-indigo-400 font-bold' : ''}`}>
                        {m}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-right min-w-[110px]">YTD Total</th>
                    <th className="px-4 py-2.5 text-right min-w-[70px]">% Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {categories.map((cat, ci) => {
                    const actuals    = sectionActuals[ci];
                    const monthly    = getBudget(type, cat);
                    const yearBudget = monthly * 12;
                    const ytd        = actuals.slice(0, currentMonthIdx + 1).reduce((s, v) => s + v, 0);
                    const pctDone    = yearBudget > 0 ? Math.round((ytd / yearBudget) * 100) : 0;
                    const isEditing  = editing?.key === `${type}:${cat}`;

                    return (
                      <tr key={cat} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 group transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700/30 px-4 py-2.5 font-medium">
                          {cat}
                        </td>

                        {/* Monthly budget — editable */}
                        <td className="px-4 py-2.5 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-gray-400 text-sm">{symbol}</span>
                              <input
                                autoFocus
                                type="number" min="0"
                                value={editing!.value}
                                onChange={e => setEditing({ ...editing!, value: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(type, cat); if (e.key === 'Escape') setEditing(null); }}
                                className="w-24 border border-indigo-400 rounded px-2 py-1 text-right text-xs bg-white dark:bg-slate-900 outline-none"
                              />
                              <button onClick={() => commitEdit(type, cat)} className="text-emerald-500 hover:text-emerald-400 p-0.5"><CheckIcon size={14} /></button>
                              <button onClick={() => setEditing(null)}       className="text-gray-400 hover:text-gray-300 p-0.5"><X size={14} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => currentRole === 'Admin' && startEdit(type, cat)}
                              className={`tabular-nums flex items-center gap-1 ml-auto ${currentRole === 'Admin' ? 'hover:text-indigo-400 cursor-pointer' : 'cursor-default'}`}
                              title={currentRole === 'Admin' ? 'Click to edit' : undefined}
                            >
                              {monthly ? formatCurrency(monthly, currency) : <span className="text-gray-400 italic text-xs">Set budget</span>}
                              {currentRole === 'Admin' && <PencilSimpleIcon size={11} className="opacity-0 group-hover:opacity-40 shrink-0" />}
                            </button>
                          )}
                        </td>

                        <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">{yearBudget ? formatCurrency(yearBudget, currency) : '—'}</td>

                        {actuals.map((actual, mi) => (
                          <td
                            key={mi}
                            className={`px-3 py-2.5 text-right tabular-nums ${
                              mi === currentMonthIdx ? 'bg-indigo-50/60 dark:bg-indigo-900/10 font-semibold' : ''
                            } ${actual > 0 ? '' : 'text-gray-300 dark:text-slate-600'}`}
                          >
                            {fmt(actual)}
                          </td>
                        ))}

                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{fmt(ytd)}</td>
                        <td className="px-4 py-2.5 text-right">
                          {yearBudget > 0 ? (
                            <span className={`text-xs font-bold tabular-nums ${
                              pctDone >= 100 ? 'text-rose-500' : pctDone >= 75 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>{pctDone}%</span>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Section total row */}
                  <tr className="bg-gray-50 dark:bg-slate-900/50 font-bold border-t-2 border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                    <td className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-900/50 px-4 py-2.5 text-xs uppercase tracking-wider">Total</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(totalMonthlyBudget, currency)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">{formatCurrency(totalYearBudget, currency)}</td>
                    {monthTotals.map((total, mi) => (
                      <td key={mi} className={`px-3 py-2.5 text-right tabular-nums ${mi === currentMonthIdx ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : ''}`}>
                        {total > 0 ? formatCurrency(total, currency) : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(totalYTD, currency)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
