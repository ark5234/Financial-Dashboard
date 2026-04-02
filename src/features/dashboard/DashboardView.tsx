import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { getMonth, getYear, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { BudgetModal } from './BudgetModal';
import { SlidersIcon } from '@phosphor-icons/react';

// ── percent ───────────────────────────────────────────────────────────────────

function pct(tracked: number, budget: number) {
  return budget > 0 ? Math.round((tracked / budget) * 100) : 0;
}

// ── PctCell ───────────────────────────────────────────────────────────────────

function PctCell({ value, type }: { value: number; type: TransactionType }) {
  const cfg =
    type === 'income'
      ? { bar: 'bg-emerald-500', over: 'bg-amber-400', text: value >= 100 ? 'text-amber-500' : 'text-emerald-500' }
      : type === 'expense'
      ? { bar: 'bg-rose-400',    over: 'bg-rose-600',   text: value >= 100 ? 'text-rose-500'  : 'text-gray-400'   }
      : { bar: 'bg-violet-500',  over: 'bg-violet-700', text: 'text-violet-500' };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 shrink-0">
        <div className={`${value >= 100 ? cfg.over : cfg.bar} h-1.5 rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums shrink-0 w-10 ${cfg.text}`}>{value}%</span>
    </div>
  );
}

// ── Breakdown Table ───────────────────────────────────────────────────────────

interface BreakdownRow { category: string; tracked: number; budget: number; }
interface BreakdownTableProps {
  title: string; type: TransactionType; rows: BreakdownRow[];
  currency: string; headerColor: string;
}

function BreakdownTable({ title, type, rows, currency, headerColor }: BreakdownTableProps) {
  const totalTracked = rows.reduce((s, r) => s + r.tracked, 0);
  const totalBudget  = rows.reduce((s, r) => s + r.budget,  0);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${headerColor} text-white`}>
              <th className="w-8 px-2 py-2.5" />
              <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide">{title}</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide whitespace-nowrap">Tracked</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide whitespace-nowrap">Budget</th>
              <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">% Done</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-5 text-center text-gray-400 italic text-sm">No data for this period</td></tr>
            ) : rows.map((row) => {
              const p = pct(row.tracked, row.budget);
              const Icon = CATEGORY_CONFIG[row.category]?.Icon;
              return (
                <tr key={row.category} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-2 py-3 text-center text-gray-400">{Icon && <Icon className="w-3.5 h-3.5" />}</td>
                  <td className="px-3 py-3 font-medium">{row.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatCurrency(row.tracked, currency)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400 whitespace-nowrap">
                    {row.budget ? formatCurrency(row.budget, currency) : <span className="italic text-xs">–</span>}
                  </td>
                  <td className="px-4 py-3">
                    {row.budget ? <PctCell value={p} type={type} /> : <span className="text-xs text-gray-400">–</span>}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-50 dark:bg-slate-900/50 border-t-2 border-gray-200 dark:border-slate-600 font-bold">
              <td />
              <td className="px-3 py-3 text-xs uppercase tracking-wider">Total</td>
              <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatCurrency(totalTracked, currency)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-400 whitespace-nowrap">{formatCurrency(totalBudget, currency)}</td>
              <td className="px-4 py-3">{totalBudget > 0 && <PctCell value={pct(totalTracked, totalBudget)} type={type} />}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Donut Card ────────────────────────────────────────────────────────────────

interface DonutCardProps {
  title: string; accentClass: string;
  data: { name: string; value: number; fill: string }[];
  total: number; currency: string; emptyMsg: string;
}

function DonutCard({ title, accentClass, data, total, currency, emptyMsg }: DonutCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${accentClass}`}>{title}</h3>
      {data.length > 0 ? (
        <>
          <div className="h-[130px]" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value" stroke="none">
                  {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => v != null ? formatCurrency(Number(v), currency) : ''}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 flex-1">
            {data.map(item => (
              <div key={item.name} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums shrink-0">{formatCurrency(item.value, currency)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-1 mt-1 flex justify-between">
              <span className="text-xs font-bold">Total</span>
              <span className="text-xs font-bold tabular-nums">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic h-32">{emptyMsg}</div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function DashboardView() {
  const { transactions, budgets, currency, currentRole, selectedMonth, selectedYear } = useStore();
  const [budgetOpen, setBudgetOpen] = useState(false);

  const monthlyTx = useMemo(() =>
    transactions.filter(t => getMonth(parseISO(t.date)) === selectedMonth && getYear(parseISO(t.date)) === selectedYear),
    [transactions, selectedMonth, selectedYear]
  );

  const { periodIncome, periodExpenses, periodSavings } = useMemo(() =>
    monthlyTx.reduce(
      (acc, t) => {
        if (t.type === 'income')  acc.periodIncome   += t.amount;
        if (t.type === 'expense') acc.periodExpenses += t.amount;
        if (t.type === 'savings') acc.periodSavings  += t.amount;
        return acc;
      },
      { periodIncome: 0, periodExpenses: 0, periodSavings: 0 }
    ),
    [monthlyTx]
  );

  const netBalance       = periodIncome - periodExpenses - periodSavings;
  const savingsRate      = periodIncome > 0 ? ((periodSavings / periodIncome) * 100).toFixed(1) : '0.0';
  const budgetIncome     = budgets.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
  const incomeTrackedPct = budgetIncome > 0 ? Math.round((periodIncome / budgetIncome) * 100) : 0;

  // Breakdown tables
  const incomeRows = useMemo(() => {
    const grouped: Record<string, number> = {};
    monthlyTx.filter(t => t.type === 'income').forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    const budgetMap: Record<string, number> = {};
    budgets.filter(b => b.type === 'income').forEach(b => { budgetMap[b.category] = b.amount; });
    return [...new Set([...Object.keys(grouped), ...Object.keys(budgetMap)])]
      .map(cat => ({ category: cat, tracked: grouped[cat] || 0, budget: budgetMap[cat] || 0 }))
      .sort((a, b) => b.tracked - a.tracked);
  }, [monthlyTx, budgets]);

  const expenseRows = useMemo(() => {
    const grouped: Record<string, number> = {};
    monthlyTx.filter(t => t.type === 'expense').forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    const budgetMap: Record<string, number> = {};
    budgets.filter(b => b.type === 'expense').forEach(b => { budgetMap[b.category] = b.amount; });
    return [...new Set([...Object.keys(grouped), ...Object.keys(budgetMap)])]
      .map(cat => ({ category: cat, tracked: grouped[cat] || 0, budget: budgetMap[cat] || 0 }))
      .sort((a, b) => b.tracked - a.tracked);
  }, [monthlyTx, budgets]);

  const savingsRows = useMemo(() => {
    const grouped: Record<string, number> = {};
    monthlyTx.filter(t => t.type === 'savings').forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    const budgetMap: Record<string, number> = {};
    budgets.filter(b => b.type === 'savings').forEach(b => { budgetMap[b.category] = b.amount; });
    return [...new Set([...Object.keys(grouped), ...Object.keys(budgetMap)])]
      .map(cat => ({ category: cat, tracked: grouped[cat] || 0, budget: budgetMap[cat] || 0 }))
      .sort((a, b) => b.tracked - a.tracked);
  }, [monthlyTx, budgets]);

  // Donut data
  const makeDonut = (type: TransactionType) =>
    monthlyTx.filter(t => t.type === type).reduce((acc, t) => {
      const e = acc.find(x => x.name === t.category);
      if (e) e.value += t.amount;
      else acc.push({ name: t.category, value: t.amount, fill: CATEGORY_CONFIG[t.category]?.fill || '#94a3b8' });
      return acc;
    }, [] as { name: string; value: number; fill: string }[]).sort((a, b) => b.value - a.value);

  const incomeDonut  = useMemo(() => makeDonut('income'),  [monthlyTx]);  // eslint-disable-line
  const expenseDonut = useMemo(() => makeDonut('expense'), [monthlyTx]);  // eslint-disable-line
  const savingsDonut = useMemo(() => makeDonut('savings'), [monthlyTx]);  // eslint-disable-line

  // Bar chart
  const barData = useMemo(() =>
    SHORT_MONTHS.map((name, i) => {
      let income = 0, expenses = 0, savings = 0;
      transactions
        .filter(t => getMonth(parseISO(t.date)) === i && getYear(parseISO(t.date)) === selectedYear)
        .forEach(t => {
          if (t.type === 'income')  income   += t.amount;
          if (t.type === 'expense') expenses += t.amount;
          if (t.type === 'savings') savings  += t.amount;
        });
      return { name, income, expenses, savings };
    }),
    [transactions, selectedYear]
  );

  const TT = { contentStyle: { backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none' }, itemStyle: { fontSize: '12px' } };

  return (
    <div className="space-y-5">

      {/* Period label */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{MONTHS[selectedMonth]} {selectedYear}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Personal finance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Period Balance</p>
          <p className={`text-3xl font-extrabold tabular-nums ${netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(netBalance, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">income – expenses – savings</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Savings Rate</p>
          <p className="text-3xl font-extrabold text-violet-500 tabular-nums">{savingsRate}%</p>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(savingsRate))}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Income Tracked</p>
          <p className={`text-3xl font-extrabold tabular-nums ${incomeTrackedPct >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{incomeTrackedPct}%</p>
          <p className="text-xs text-gray-400 mt-1">vs {formatCurrency(budgetIncome, currency)} budget</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Breakdown tables */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Breakdown — {MONTHS[selectedMonth].slice(0,3)} {selectedYear}</h2>
            {currentRole === 'Admin' && (
              <button id="set-budgets-btn" onClick={() => setBudgetOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition">
                <SlidersIcon className="w-3.5 h-3.5" /> Set Budgets
              </button>
            )}
          </div>
          <BreakdownTable title="Income"   type="income"  rows={incomeRows}  currency={currency} headerColor="bg-emerald-600" />
          <BreakdownTable title="Expenses" type="expense" rows={expenseRows} currency={currency} headerColor="bg-rose-500"    />
          <BreakdownTable title="Savings"  type="savings" rows={savingsRows} currency={currency} headerColor="bg-violet-600"  />
        </div>

        {/* Charts */}
        <div className="xl:col-span-3 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Summary — {MONTHS[selectedMonth].slice(0,3)} {selectedYear}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DonutCard title="Income"   accentClass="text-emerald-500" data={incomeDonut}  total={periodIncome}   currency={currency} emptyMsg="No income"   />
            <DonutCard title="Expenses" accentClass="text-rose-500"    data={expenseDonut} total={periodExpenses} currency={currency} emptyMsg="No expenses" />
            <DonutCard title="Savings"  accentClass="text-violet-500"  data={savingsDonut} total={periodSavings}  currency={currency} emptyMsg="No savings"  />
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Monthly Overview — {selectedYear}</h3>
            <div className="h-[250px]" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip {...TT} formatter={(v) => v != null ? formatCurrency(Number(v), currency) : ''} cursor={{ fill: 'rgba(148,163,184,0.07)' }} />
                  <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[3,3,0,0]} maxBarSize={22} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[3,3,0,0]} maxBarSize={22} />
                  <Bar dataKey="savings"  name="Savings"  fill="#8b5cf6" radius={[3,3,0,0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {budgetOpen && <BudgetModal onClose={() => setBudgetOpen(false)} />}
    </div>
  );
}
