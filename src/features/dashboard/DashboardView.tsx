import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendUp, TrendDown, CurrencyDollar, ChartLineUp } from '@phosphor-icons/react';
import { format, parseISO, subMonths, isAfter } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#f43f5e'];

export function DashboardView() {
  const { transactions } = useStore();

  // Summary Metrics
  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') {
          acc.totalIncome += curr.amount;
          acc.totalBalance += curr.amount;
        } else {
          acc.totalExpenses += curr.amount;
          acc.totalBalance -= curr.amount;
        }
        return acc;
      },
      { totalBalance: 0, totalIncome: 0, totalExpenses: 0 }
    );
  }, [transactions]);

  // Balance Trend Data (Cumulative)
  const balanceTrendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    
    // Group by date to avoid multiple points on same day
    const grouped = sorted.reduce((acc, curr) => {
      const dateStr = format(parseISO(curr.date), 'MMM dd');
      if (curr.type === 'income') runningBalance += curr.amount;
      else runningBalance -= curr.amount;
      
      const existing = acc.find(item => item.date === dateStr);
      if (existing) {
        existing.balance = runningBalance;
      } else {
        acc.push({ date: dateStr, balance: runningBalance });
      }
      return acc;
    }, [] as any[]);

    return grouped;
  }, [transactions]);

  // Spending Breakdown
  const spendingBreakdown = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Insights
  const highestCategory = spendingBreakdown[0];
  
  const lastMonthIncome = useMemo(() => {
    const oneMonthAgo = subMonths(new Date(), 1);
    return transactions
      .filter(t => t.type === 'income' && isAfter(parseISO(t.date), oneMonthAgo))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Formatting utils
  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Balance</h3>
            <CurrencyDollar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Income</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{formatCurrency(totalIncome)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Expenses</h3>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <TrendDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Balance Trend</h3>
          <div className="h-[300px] w-full">
            {balanceTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="h-[300px] w-full">
            {spendingBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendingBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}        
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No expenses recorded</div>
            )}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-4">
          <ChartLineUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Highest Spending Category</p>
            <p className="text-lg font-medium mt-1">
              {highestCategory ? `${highestCategory.name} (${formatCurrency(highestCategory.value)})` : 'None'}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent Income (Last 30 Days)</p>
            <p className="text-lg font-medium mt-1 text-green-600 dark:text-green-400">
              {formatCurrency(lastMonthIncome)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
