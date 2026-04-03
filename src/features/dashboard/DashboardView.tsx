import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { getMonth, getYear, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { ArrowUpIcon, ArrowDownIcon, PiggyBankIcon, TrendUpIcon } from '@phosphor-icons/react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pct(tracked: number, budget: number) {
  return budget > 0 ? Math.round((tracked / budget) * 100) : 0;
}
function pctBarColor(p: number) {
  if (p >= 100) return 'bg-rose-400';
  if (p >= 80)  return 'bg-warning';
  return 'bg-emerald-400';
}
function pctTextColor(p: number, type: TransactionType) {
  if (type === 'income') return p >= 100 ? 'text-success' : 'text-amber-600';
  if (p >= 100) return 'text-rose-600';
  if (p >= 80)  return 'text-amber-600';
  return 'text-stone-400';
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string; value: string; sub?: string; isLight: boolean;
  Icon: React.ElementType;
  iconBg: string; iconColor: string; valueColor?: string;
  children?: React.ReactNode;
}
function KpiCard({ label, value, sub, isLight, Icon, iconBg, iconColor, valueColor, children }: KpiProps) {
  return (
    <div className={`
      card-lift rounded-2xl p-6 relative overflow-hidden select-none
      ${isLight
        ? 'bg-light-card border border-light-border shadow-sm dark:shadow-elite'
        : 'bg-dark-card border border-dark-border'}
    `}>
      <div className="flex items-start justify-between mb-4 relative">
        <p className={`text-xs font-semibold uppercase tracking-widest ${isLight ? 'text-light-secondary' : 'text-light-secondary'}`}>
          {label}
        </p>
        <div className={`p-2 rounded-lg ${isLight ? iconBg : 'bg-slate-700'}`}>
          <Icon size={14} className={isLight ? iconColor : 'text-light-secondary'} weight="bold" />
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums tracking-tight relative ${
        valueColor || (isLight ? 'text-light-primary' : 'text-gray-100')
      }`}>{value}</p>
      {sub && <p className={`text-sm mt-1 relative ${isLight ? 'text-light-secondary' : 'text-light-secondary'}`}>{sub}</p>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Breakdown Table
// ─────────────────────────────────────────────────────────────────────────────

interface BreakdownRow { category: string; tracked: number; budget: number; }

function BreakdownTable({ title, type, rows, currency, accent, isLight }:
  { title: string; type: TransactionType; rows: BreakdownRow[]; currency: string; accent: string; isLight: boolean }) {
  const totalTracked = rows.reduce((s, r) => s + r.tracked, 0);
  const totalBudget  = rows.reduce((s, r) => s + r.budget,  0);

  const cardCls = isLight
    ? 'bg-light-card border border-light-border shadow-sm dark:shadow-elite'
    : 'bg-dark-card border border-dark-border';
  const hdCls   = isLight ? 'text-light-secondary bg-light-bg' : 'text-light-secondary bg-dark/40';
  const rowHov  = isLight ? 'hover:bg-gray-50' : 'hover:bg-slate-700/20';
  const divCls  = isLight ? 'divide-gray-100' : 'divide-slate-700/50';
  const foot    = isLight ? 'bg-light-bg border-t-2 border-light-border' : 'bg-dark/30 border-t-2 border-dark-border';

  return (
    <div className={`rounded-2xl overflow-hidden ${cardCls}`}>
      {/* Ribbon header */}
      <div className={`px-4 py-3 flex items-center justify-between ${accent}`}>
        <span className="text-xs font-bold uppercase tracking-wider text-white">{title}</span>
        <span className="text-xs font-semibold text-white/90 tabular-nums">
          {formatCurrency(totalTracked, currency)}
          {totalBudget > 0 && (
            <span className="text-white/60 ml-1">/ {formatCurrency(totalBudget, currency)}</span>
          )}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className={`text-xs font-bold uppercase tracking-wide ${hdCls}`}>
            <th className="w-8 px-3 py-2.5" />
            <th className="px-3 py-2.5 text-left">Category</th>
            <th className="px-4 py-2.5 text-right whitespace-nowrap">Tracked</th>
            <th className="px-4 py-2.5 text-right whitespace-nowrap">Budget</th>
            <th className="px-4 py-2.5 text-left whitespace-nowrap">Progress</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${divCls}`}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className={`px-4 py-6 text-center italic text-sm ${isLight ? 'text-slate-400' : 'text-light-secondary'}`}>
                No data for this period
              </td>
            </tr>
          ) : rows.map(row => {
            const p = pct(row.tracked, row.budget);
            const Icon = CATEGORY_CONFIG[row.category]?.Icon;
            return (
              <tr key={row.category} className={`transition-colors ${rowHov}`}>
                <td className="px-3 py-4 text-center">
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-light-secondary'}`} />}
                </td>
                <td className={`px-3 py-4 font-medium text-sm ${isLight ? 'text-stone-800' : 'text-gray-200'}`}>
                  {row.category}
                </td>
                <td className={`px-4 py-4 text-right tabular-nums font-bold text-sm ${isLight ? 'text-stone-900' : 'text-gray-100'}`}>
                  {formatCurrency(row.tracked, currency)}
                </td>
                <td className={`px-4 py-4 text-right tabular-nums text-sm ${isLight ? 'text-light-secondary' : 'text-light-secondary'}`}>
                  {row.budget ? formatCurrency(row.budget, currency) : <span className="italic">–</span>}
                </td>
                <td className="px-4 py-4 w-[25%] sm:w-[30%]">
                  {row.budget > 0 ? (
                    <div className="flex items-center gap-2 w-full min-w-[110px]">
                      <div className={`flex-1 rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-slate-700'}`}>
                        <div className={`${pctBarColor(p)} h-2 rounded-full transition-all`}
                          style={{ width: `${Math.min(p, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold tabular-nums w-10 text-right shrink-0 ${pctTextColor(p, type)}`}>
                        {p}%
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-light-secondary'}`}>–</span>
                  )}
                </td>
              </tr>
            );
          })}
          {/* Footer row */}
          <tr className={foot}>
            <td />
            <td className={`px-3 py-3 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-light-secondary' : 'text-light-secondary'}`}>
              Total
            </td>
            <td className={`px-4 py-3 text-right tabular-nums text-sm font-bold ${isLight ? 'text-light-primary' : 'text-gray-200'}`}>
              {formatCurrency(totalTracked, currency)}
            </td>
            <td className={`px-4 py-3 text-right tabular-nums text-sm ${isLight ? 'text-light-secondary' : 'text-light-secondary'}`}>
              {formatCurrency(totalBudget, currency)}
            </td>
            <td className="px-4 py-3 w-[25%] sm:w-[30%]">
              {totalBudget > 0 && (() => {
                const p = pct(totalTracked, totalBudget);
                return (
                  <div className="flex items-center gap-2 w-full min-w-[110px]">
                    <div className={`flex-1 rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-slate-700'}`}>
                      <div className={`${pctBarColor(p)} h-2 rounded-full`} style={{ width: `${Math.min(p, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold tabular-nums w-10 text-right shrink-0 ${pctTextColor(p, type)}`}>
                      {p}%
                    </span>
                  </div>
                );
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TT_STYLE     = {
  backgroundColor: '#0f172a', color: '#f8fafc',
  borderRadius: '10px', border: '1px solid rgba(148,163,184,0.2)',
  fontSize: '12px', padding: '8px 12px',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { transactions, budgets, currency, selectedMonth, selectedYear, theme } = useStore();
  const isLight = theme === 'light';

  // ── Filtered transactions ──────────────────────────────────────────────────
  const monthlyTx = useMemo(() =>
    transactions.filter(t =>
      getMonth(parseISO(t.date)) === selectedMonth &&
      getYear(parseISO(t.date)) === selectedYear
    ),
    [transactions, selectedMonth, selectedYear]
  );

  // ── KPI numbers ───────────────────────────────────────────────────────────
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

  // ── Breakdown data ─────────────────────────────────────────────────────────
  const makeBreakdown = (type: TransactionType): BreakdownRow[] => {
    const grouped: Record<string, number> = {};
    monthlyTx.filter(t => t.type === type).forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    const bMap: Record<string, number> = {};
    budgets.filter(b => b.type === type).forEach(b => { bMap[b.category] = b.amount; });
    return [...new Set([...Object.keys(grouped), ...Object.keys(bMap)])]
      .map(cat => ({ category: cat, tracked: grouped[cat] || 0, budget: bMap[cat] || 0 }))
      .sort((a, b) => b.tracked - a.tracked);
  };

  const incomeRows  = useMemo(() => makeBreakdown('income'),  [monthlyTx, budgets]);  // eslint-disable-line
  const expenseRows = useMemo(() => makeBreakdown('expense'), [monthlyTx, budgets]);  // eslint-disable-line
  const savingsRows = useMemo(() => makeBreakdown('savings'), [monthlyTx, budgets]);  // eslint-disable-line

  // ── Spending donut (expenses) ─────────────────────────────────────────────
  const spendingDonut = useMemo(() =>
    expenseRows
      .filter(r => r.tracked > 0)
      .map(r => ({ name: r.category, value: r.tracked, fill: CATEGORY_CONFIG[r.category]?.fill || '#94a3b8' }))
      .sort((a, b) => b.value - a.value),
    [expenseRows]
  );

  // ── Budget vs Actual bars ─────────────────────────────────────────────────
  const budgetBars = useMemo(() =>
    expenseRows
      .filter(r => r.budget > 0)
      .map(r => ({ name: r.category, tracked: r.tracked, budget: r.budget, p: pct(r.tracked, r.budget) }))
      .sort((a, b) => b.p - a.p),
    [expenseRows]
  );

  // ── Monthly bar data ──────────────────────────────────────────────────────
  const monthData = useMemo(() =>
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

  // ── YTD ───────────────────────────────────────────────────────────────────
  const ytd = useMemo(() => {
    const now = new Date();
    const cutoff = selectedYear < now.getFullYear() ? 11 : now.getMonth();
    const ytdTx = transactions.filter(t => {
      const d = parseISO(t.date);
      return getYear(d) === selectedYear && getMonth(d) <= cutoff;
    });
    const income   = ytdTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = ytdTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings  = ytdTx.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings, rate: income > 0 ? ((savings / income) * 100).toFixed(1) : '0.0' };
  }, [transactions, selectedYear]);

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const card      = isLight ? 'bg-light-card border border-light-border shadow-sm dark:shadow-elite rounded-2xl' : 'bg-dark-card border border-dark-border rounded-2xl';
  const label     = isLight ? 'text-light-secondary'    : 'text-light-secondary';
  const labelMini = isLight ? 'text-light-secondary'    : 'text-light-secondary';
  const heading   = isLight ? 'text-light-primary'     : 'text-gray-100';
  

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${heading}`}>
          {MONTHS[selectedMonth]} {selectedYear}
        </h1>
        <p className={`text-sm mt-0.5 ${labelMini}`}>Personal finance overview</p>
      </div>

      {/* ── 3 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <KpiCard
          label="Period Balance"
          value={formatCurrency(netBalance, currency)}
          sub="income – expenses – savings"
          isLight={isLight}
          Icon={netBalance >= 0 ? TrendUpIcon : ArrowDownIcon}
          iconBg={netBalance >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}
          iconColor={netBalance >= 0 ? 'text-success' : 'text-rose-600'}
          valueColor={
            netBalance >= 0
              ? (isLight ? 'text-success' : 'text-emerald-400')
              : (isLight ? 'text-rose-600'    : 'text-rose-400')
          }
        />

        <KpiCard
          label="Savings Rate"
          value={`${savingsRate}%`}
          isLight={isLight}
          Icon={PiggyBankIcon}
          iconBg="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
          valueColor={isLight ? 'text-amber-600' : 'text-amber-400'}
        >
          <div className={`w-full rounded-full h-2 mt-3 ${isLight ? 'bg-gray-200' : 'bg-slate-700'}`}>
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, parseFloat(savingsRate))}%` }}
            />
          </div>
        </KpiCard>

        <KpiCard
          label="Income Tracked"
          value={`${incomeTrackedPct}%`}
          sub={`vs ${formatCurrency(budgetIncome, currency)} budget`}
          isLight={isLight}
          Icon={ArrowUpIcon}
          iconBg={incomeTrackedPct >= 100 ? 'bg-success-soft text-success' : 'bg-blue-50 text-blue-600'}
          iconColor={incomeTrackedPct >= 100 ? 'text-success' : 'text-blue-600'}
          valueColor={
            incomeTrackedPct >= 100
              ? (isLight ? 'text-success' : 'text-emerald-400')
              : (isLight ? 'text-blue-700'   : 'text-blue-400')
          }
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

        {/* LEFT: Breakdown Tables */}
        <div className="xl:col-span-2 space-y-4">
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${label}`}>
            Breakdown — {MONTHS[selectedMonth].slice(0, 3)} {selectedYear}
          </p>
          <BreakdownTable title="Income"   type="income"  accent="bg-success" rows={incomeRows}  currency={currency} isLight={isLight} />
          <BreakdownTable title="Expenses" type="expense" accent="bg-danger"    rows={expenseRows} currency={currency} isLight={isLight} />
          <BreakdownTable title="Savings"  type="savings" accent="bg-blue-600"   rows={savingsRows} currency={currency} isLight={isLight} />
        </div>

        {/* RIGHT: Charts */}
        <div className="xl:col-span-3 space-y-5">
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${label}`}>
            Summary — {MONTHS[selectedMonth].slice(0, 3)} {selectedYear}
          </p>

          {/* Spending Breakdown Donut */}
          <div className={`${card} p-5`}>
            <h3 className={`text-xs font-bold uppercase tracking-[0.14em] mb-4 ${label}`}>
              Monthly Spending Breakdown
            </h3>
            <div className="flex gap-5 items-center">
              {/* Donut chart */}
              <div className="shrink-0 w-[150px] h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingDonut.length > 0 ? spendingDonut : [{ name: 'None', value: 1, fill: isLight ? '#E2E8F0' : '#1e293b' }]}
                      cx="50%" cy="50%"
                      innerRadius={44} outerRadius={68}
                      paddingAngle={spendingDonut.length > 1 ? 2 : 0}
                      dataKey="value" stroke="none"
                    >
                      {(spendingDonut.length > 0
                        ? spendingDonut
                        : [{ name: 'None', value: 1, fill: isLight ? '#E2E8F0' : '#1e293b' }]
                      ).map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => v != null ? formatCurrency(Number(v), currency) : ''}
                      contentStyle={TT_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2 min-w-0">
                {spendingDonut.length === 0 ? (
                  <p className={`text-sm italic ${labelMini}`}>No expense data</p>
                ) : spendingDonut.slice(0, 6).map(item => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className={`text-xs truncate ${isLight ? 'text-stone-600' : 'text-light-secondary'}`}>{item.name}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums shrink-0 ${isLight ? 'text-stone-900' : 'text-gray-200'}`}>
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                ))}
                <div className={`pt-2 mt-1 border-t ${isLight ? 'border-amber-100' : 'border-dark-border'} flex items-center justify-between`}>
                  <span className={`text-xs font-bold ${label}`}>Total Expenses</span>
                  <span className={`text-xs font-bold tabular-nums ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                    {formatCurrency(periodExpenses, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget vs. Actual Progress Bars */}
          <div className={`${card} p-5`}>
            <h3 className={`text-xs font-bold uppercase tracking-[0.14em] mb-4 ${label}`}>
              Budget vs. Actual — Expenses
            </h3>
            {budgetBars.length === 0 ? (
              <p className={`text-sm italic ${labelMini}`}>
                No budget set — click "Set Budgets" to add one
              </p>
            ) : (
              <div className="space-y-4">
                {budgetBars.map(row => (
                  <div key={row.name}>
                    {/* Label row */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className={`text-xs font-semibold truncate min-w-0 ${isLight ? 'text-stone-700' : 'text-light-secondary'}`}>
                        {row.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs tabular-nums ${labelMini}`}>
                          {formatCurrency(row.tracked, currency)} / {formatCurrency(row.budget, currency)}
                        </span>
                        <span className={`text-xs font-bold tabular-nums w-10 text-right ${
                          row.p >= 100 ? 'text-rose-600' : row.p >= 80 ? 'text-amber-600' : 'text-success'
                        }`}>{row.p}%</span>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className={`w-full rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-slate-700'}`}>
                      <div
                        className={`${pctBarColor(row.p)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(row.p, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Overview Bar Chart */}
          <div className={`${card} p-5`}>
            <h3 className={`text-xs font-bold uppercase tracking-[0.14em] mb-4 ${label}`}>
              Monthly Overview — {selectedYear}
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip contentStyle={TT_STYLE} cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                    formatter={(v) => v != null ? formatCurrency(Number(v), currency) : ''} />
                  <Bar dataKey="income"   name="Income"   fill="#16A34A" maxBarSize={16} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#DC2626" maxBarSize={16} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="savings"  name="Savings"  fill="#2563EB" maxBarSize={16} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YTD Stats */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.14em] mb-3 ${label}`}>
              Year-to-Date — {selectedYear}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'income',   lbl: 'YTD Income',   val: formatCurrency(ytd.income,   currency), vc: isLight ? 'text-emerald-700' : 'text-emerald-400' },
                { key: 'expenses', lbl: 'YTD Expenses', val: formatCurrency(ytd.expenses, currency), vc: isLight ? 'text-rose-700'    : 'text-rose-400'    },
                { key: 'savings',  lbl: 'YTD Savings',  val: formatCurrency(ytd.savings,  currency), vc: isLight ? 'text-blue-700'    : 'text-blue-400'    },
                { key: 'rate',     lbl: 'Savings Rate', val: `${ytd.rate}%`,                         vc: isLight ? 'text-amber-600'   : 'text-amber-400'   },
              ].map(s => (
                <div key={s.key} className={`card-lift ${card} p-4`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-2 ${labelMini}`}>{s.lbl}</p>
                  <p className={`text-base font-bold tabular-nums ${s.vc}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
