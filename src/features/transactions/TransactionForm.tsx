import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Transaction, TransactionType } from '../../store/useStore';
import { XIcon as X } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: Transaction;
}

const EXPENSE_CATEGORIES = ['Housing', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Dining', 'Health', 'Other'];
const INCOME_CATEGORIES  = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const SAVINGS_CATEGORIES = ['Emergency Fund', 'Retirement', 'Stock Portfolio', 'Sinking Fund'];

export function TransactionForm({ onClose, initialData }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useStore();

  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount]           = useState(initialData?.amount.toString() || '');
  const [type, setType]               = useState<TransactionType>(initialData?.type || 'expense');
  const [category, setCategory]       = useState(initialData?.category || '');
  const [date, setDate]               = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));

  const getCategoriesForType = (t: TransactionType) => {
    if (t === 'income')  return INCOME_CATEGORIES;
    if (t === 'savings') return SAVINGS_CATEGORIES;
    return EXPENSE_CATEGORIES;
  };

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(''); // reset category when type changes
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const data = { description, amount: parsedAmount, type, category, date };

    if (initialData) {
      updateTransaction(initialData.id, data);
      useStore.getState().addToast('Transaction updated successfully', 'success');
    } else {
      addTransaction(data);
      useStore.getState().addToast('Transaction added successfully', 'success');
    }
    onClose();
  };

  const typeConfig: Record<TransactionType, { label: string; activeClass: string }> = {
    income:  { label: 'Income',  activeClass: 'bg-emerald-600 text-white shadow-sm' },
    expense: { label: 'Expense', activeClass: 'bg-rose-600 text-white shadow-sm' },
    savings: { label: 'Savings', activeClass: 'bg-violet-600 text-white shadow-sm' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button type="button" aria-label="Close" title="Close" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Type Toggle — 3 buttons */}
          <div>
            <label className="block text-sm font-medium mb-1">Transaction Type</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {(['income', 'expense', 'savings'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 text-sm font-semibold transition ${
                    type === t ? typeConfig[t].activeClass : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {typeConfig[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="tx-amount" className="block text-sm font-medium mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                required
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 font-medium"
                placeholder="0.00"
                title="Amount"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tx-description" className="block text-sm font-medium mb-1">Description</label>
            <input
              id="tx-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="e.g. Grocery run, Freelance work..."
              title="Description"
            />
          </div>

          {/* Date + Category */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="tx-date" className="block text-sm font-medium mb-1">Date</label>
              <input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-sm"
                title="Date"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="tx-category" className="block text-sm font-medium mb-1">Category</label>
              <select
                id="tx-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-sm"
                title="Category"
                aria-label="Category"
              >
                <option value="" disabled>Select category</option>
                {getCategoriesForType(type).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg transition"
            >
              {initialData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
