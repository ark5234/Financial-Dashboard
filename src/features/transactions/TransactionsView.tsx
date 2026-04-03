import { useState, useMemo } from 'react';
import React from 'react';
import { useStore } from '../../store/useStore';
import type { Transaction } from '../../store/useStore';
import { format, parseISO } from 'date-fns';
import {
  MagnifyingGlassIcon as Search,
  DownloadSimpleIcon as Download,
  PlusIcon as Plus,
  FunnelIcon as FilterIcon,
  TrashIcon as Trash,
  PencilSimpleIcon as Edit2,
} from '@phosphor-icons/react';
import { TransactionForm } from './TransactionForm';
import { formatCurrency } from '../../utils/format';
import { CATEGORY_CONFIG } from '../../utils/categories';

const TYPE_BADGE: Record<string, string> = {
  income:  'bg-success-soft text-success text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  expense: 'bg-danger-soft text-danger text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  savings: 'bg-accent-soft text-accent text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

const AMOUNT_COLOR: Record<string, string> = {
  income:  'text-success dark:text-emerald-400',
  expense: 'text-rose-600 dark:text-rose-400',
  savings: 'text-violet-600 dark:text-violet-400',
};

const AMOUNT_PREFIX: Record<string, string> = {
  income: '+', expense: '-', savings: '→',
};

export function TransactionsView() {
  const { transactions, currentRole, deleteTransaction, currency, addToast } = useStore();
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState<'all' | 'income' | 'expense' | 'savings'>('all');
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingTx, setEditingTx]     = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              tx.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx =>
        [tx.date, `"${tx.description}"`, `"${tx.category}"`, tx.type, tx.amount].join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">All Transactions</h2>
        <div className="flex items-center gap-2">
          {currentRole === 'Admin' && (
            <button
              id="add-transaction-btn"
              onClick={() => { setEditingTx(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          )}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-sm dark:shadow-elite border border-light-border dark:border-dark-border">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary" />
          <input
            id="tx-search"
            type="text"
            placeholder="Search by description or category..."
            aria-label="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-light-bg dark:bg-gray-900 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-light-bg dark:bg-gray-900 border border-light-border dark:border-dark-border rounded-lg px-3">
          <FilterIcon className="w-4 h-4 text-light-secondary shrink-0" />
          <select
            id="tx-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="bg-transparent border-none py-2 text-sm outline-none cursor-pointer"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
            <option value="savings">Savings</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-light-card border border-light-border shadow-sm hover:shadow-md transition-shadow dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-light-bg text-light-secondary dark:bg-dark-card/80 dark:text-light-secondary uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Description</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amount</th>
                {currentRole === 'Admin' && <th className="px-5 py-3.5 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-light-bg dark: hover:bg-gray-50/50 dark: hover:bg-gray-50/50 dark:hover:bg-slate-800/50-slate-800/50-gray-700/40 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap text-light-secondary">
                      {format(parseISO(tx.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium">{tx.description}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_CONFIG[tx.category]?.color || 'bg-gray-100 text-light-secondary'}`}>
                        {CATEGORY_CONFIG[tx.category]?.Icon && React.createElement(CATEGORY_CONFIG[tx.category].Icon, { className: 'w-3.5 h-3.5' })}
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${TYPE_BADGE[tx.type]}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className={`font-semibold tabular-nums ${AMOUNT_COLOR[tx.type]}`}>
                        {AMOUNT_PREFIX[tx.type]}{formatCurrency(tx.amount, currency)}
                      </span>
                    </td>
                    {currentRole === 'Admin' && (
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction?')) {
                              deleteTransaction(tx.id);
                              addToast('Transaction deleted', 'error');
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1.5 rounded-lg hover:bg-danger-soft text-danger dark:hover:bg-rose-900/20 transition"
                          title="Delete transaction"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentRole === 'Admin' ? 6 : 5} className="px-5 py-14 text-center text-light-secondary italic">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 0 && (
          <div className="px-5 py-3 border-t border-light-border dark:border-dark-border text-xs text-light-secondary">
            Showing {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isFormOpen && (
        <TransactionForm
          onClose={() => setIsFormOpen(false)}
          initialData={editingTx || undefined}
        />
      )}
    </div>
  );
}
