import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import { getMonth, getYear, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { PencilSimpleIcon, CheckIcon, XIcon as X } from '@phosphor-icons/react';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PLAN_SECTIONS: { type: TransactionType; label: string; headerBg: string; categories: string[] }[] = [
  { type: 'income',  label: 'Income',   headerBg: 'bg-success', categories: ['Salary', 'Freelance', 'Investment'] },
  { type: 'expense', label: 'Expenses', headerBg: 'bg-danger',    categories: ['Housing', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Dining', 'Health'] },
  { type: 'savings', label: 'Savings',  headerBg: 'bg-accent',  categories: ['Emergency Fund', 'Retirement', 'Stock Portfolio', 'Sinking Fund'] },
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
        <p className="text-sm text-light-secondary mt-0.5">
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
          <div key={type} className="bg-light-card dark:bg-dark-card border border-light-border shadow-sm hover:shadow-md transition-shadow dark:border-dark-border overflow-hidden">

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
                <thead className="bg-light-bg dark:bg-dark/60 text-xs text-light-secondary dark:text-gray-400 uppercase tracking-wider border-b border-light-border dark:border-dark-border">
                  <tr>
                    <th className="sticky left-0 top-0 z-30 bg-light-bg dark:bg-dark-card px-4 py-2.5 text-left min-w-[160px] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">Category</th>
                    <th className="px-4 py-2.5 text-right min-w-[130px] sticky top-0 bg-light-bg dark:bg-dark-card z-20">
                      Monthly Budget
                      {currentRole === 'Admin' && <span className="ml-1 text-indigo-400 normal-case font-normal">(editable)</span>}
                    </th>
                    <th className="px-4 py-2.5 text-right min-w-[110px] sticky top-0 bg-light-bg dark:bg-dark-card z-20">Year Budget</th>
                    {SHORT_MONTHS.map((m, i) => (
                      <th key={m} className={`px-3 py-2.5 text-right min-w-[80px] sticky top-0 bg-light-bg dark:bg-dark-card z-20 ${i === currentMonthIdx ? 'text-indigo-400 font-bold' : ''}`}>
                        {m}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-right min-w-[110px] sticky top-0 bg-light-bg dark:bg-dark-card z-20">YTD Total</th>
                    <th className="px-4 py-2.5 text-right min-w-[70px] sticky top-0 bg-light-bg dark:bg-dark-card z-20">% Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-light-primary dark:text-gray-300">
                  {categories.map((cat, ci) => {
                    const actuals    = sectionActuals[ci];
                    const monthly    = getBudget(type, cat);
                    
                    const bgHover = 'hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors duration-150';

                    const yearBudget = monthly * 12;
                    const ytd        = actuals.slice(0, currentMonthIdx + 1).reduce((s, v) => s + v, 0);
                    const pctDone    = yearBudget > 0 ? Math.round((ytd / yearBudget) * 100) : 0;
                    const isEditing  = editing?.key === `${type}:${cat}`;

                    return (
                      <tr key={cat} className={`group ${bgHover}`}>
                        <td className="sticky left-0 z-10 bg-white dark:bg-dark-card px-4 py-3 font-medium text-light-primary dark:text-gray-100 shadow-[2px_0_4px_rgba(0,0,0,0.02)] transition-colors group-hover:bg-gray-50/70 dark:group-hover:bg-slate-700/50">
                          {cat}
                        </td>

                        {/* Monthly budget — editable */}
                        <td className="px-4 py-3 text-right transition-colors">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-light-secondary text-sm">{symbol}</span>
                              <input
                                autoFocus
                                type="number" min="0"
                                value={editing!.value}
                                onChange={e => setEditing({ ...editing!, value: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(type, cat); if (e.key === 'Escape') setEditing(null); }}
                                aria-label={`Budget for ${cat}`}
                                title={`Edit ${cat} budget`}
                                placeholder="0"
                                className="w-24 border border-indigo-400 rounded px-2 py-1 text-right text-xs bg-light-card dark:bg-dark outline-none"
                              />
                              <button type="button" aria-label="Confirm edit" onClick={() => commitEdit(type, cat)} className="text-success hover:text-emerald-400 p-0.5"><CheckIcon size={14} /></button>
                              <button type="button" aria-label="Cancel edit" onClick={() => setEditing(null)}       className="text-light-secondary hover:text-light-secondary p-0.5"><X size={14} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => currentRole === 'Admin' && startEdit(type, cat)}
                              className={`tabular-nums flex items-center gap-1 ml-auto ${currentRole === 'Admin' ? 'hover:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer' : 'cursor-default'}`}
                              title={currentRole === 'Admin' ? 'Click to edit' : undefined}
                            >
                              {monthly ? formatCurrency(monthly, currency) : <span className="text-light-secondary dark:text-gray-500 italic text-xs">Set budget</span>}
                              {currentRole === 'Admin' && <PencilSimpleIcon size={11} className="opacity-0 group-hover:opacity-40 shrink-0" />}
                            </button>
                          )}
                        </td>

                        <td className="px-4 py-2.5 text-right tabular-nums text-light-secondary dark:text-gray-400">{yearBudget ? formatCurrency(yearBudget, currency) : '—'}</td>

                        {actuals.map((actual, mi) => (
                          <td
                            key={mi}
                            className={`px-3 py-2.5 text-right tabular-nums ${
                              mi === currentMonthIdx ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold text-indigo-700 dark:text-indigo-300' : ''
                            } ${actual > 0 ? '' : 'text-light-secondary dark:text-gray-500'}`}
                          >
                            {fmt(actual)}
                          </td>
                        ))}

                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{fmt(ytd)}</td>
                        <td className="px-4 py-2.5 text-right">
                          {yearBudget > 0 ? (
                            <span className={`text-xs font-bold tabular-nums ${
                              pctDone >= 100 ? 'text-rose-500' : pctDone >= 75 ? 'text-amber-500' : 'text-success'
                            }`}>{pctDone}%</span>
                          ) : <span className="text-light-secondary dark:text-gray-500 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Section total row */}
                  <tr className="bg-light-bg dark:bg-dark/50 font-bold border-t-2 border-light-border dark:border-dark-border text-light-secondary dark:text-gray-200">
                    <td className="sticky left-0 z-10 bg-light-bg dark:bg-dark/50 px-4 py-2.5 text-xs uppercase tracking-wider">Total</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(totalMonthlyBudget, currency)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-light-secondary dark:text-gray-400">{formatCurrency(totalYearBudget, currency)}</td>
                    {monthTotals.map((total, mi) => (
                      <td key={mi} className={`px-3 py-2.5 text-right tabular-nums ${mi === currentMonthIdx ? 'bg-blue-50 dark:bg-blue-900/20 text-indigo-700 dark:text-indigo-300' : ''}`}>
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
