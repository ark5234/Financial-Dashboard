import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../store/useStore';
import { XIcon as X } from '@phosphor-icons/react';
import { formatCurrency } from '../../utils/format';

interface BudgetModalProps {
  onClose: () => void;
}

const SECTIONS: { type: TransactionType; label: string; headerColor: string; categories: string[] }[] = [
  { type: 'income',  label: 'Income',   headerColor: 'bg-emerald-600', categories: ['Salary', 'Freelance', 'Investment'] },
  { type: 'expense', label: 'Expenses', headerColor: 'bg-rose-500',    categories: ['Housing', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Dining', 'Health'] },
  { type: 'savings', label: 'Savings',  headerColor: 'bg-violet-600',  categories: ['Emergency Fund', 'Retirement', 'Stock Portfolio', 'Sinking Fund'] },
];

// Currency code → symbol mapping for the input prefix
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
};

export function BudgetModal({ onClose }: BudgetModalProps) {
  const { budgets, setBudget, currency, addToast } = useStore();

  const symbol = CURRENCY_SYMBOL[currency] ?? currency;

  // Local draft — keyed by `${type}:${category}`
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    budgets.forEach(b => { init[`${b.type}:${b.category}`] = b.amount.toString(); });
    return init;
  });

  const getValue = (type: TransactionType, category: string) =>
    draft[`${type}:${category}`] ?? '';

  const handleChange = (type: TransactionType, category: string, val: string) =>
    setDraft(prev => ({ ...prev, [`${type}:${category}`]: val }));

  const handleSave = () => {
    SECTIONS.forEach(({ type, categories }) => {
      categories.forEach(cat => {
        const parsed = parseFloat(draft[`${type}:${cat}`] ?? '0');
        if (!isNaN(parsed) && parsed >= 0) setBudget(cat, type, parsed);
      });
    });
    addToast('Budgets saved', 'success');
    onClose();
  };

  const sectionTotal = (type: TransactionType, categories: string[]) =>
    categories.reduce((sum, cat) => {
      const v = parseFloat(draft[`${type}:${cat}`] ?? '0');
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

  return (
    /* Outer: fills viewport + scrollable so modal content is never clipped */
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-4">

          {/* Header — sticky inside the scroll context */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold">Monthly Budget Targets</h2>
              <p className="text-xs text-gray-400 mt-0.5">Set how much you plan to earn, spend, and save each month</p>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body — naturally expanding, no height constraint */}
          <div className="px-6 py-4 space-y-6">
            {SECTIONS.map(({ type, label, headerColor, categories }) => (
              <div key={type}>
                {/* Section header */}
                <div className={`${headerColor} text-white rounded-lg px-4 py-2 flex justify-between items-center mb-3`}>
                  <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    Total: {formatCurrency(sectionTotal(type, categories), currency)}
                  </span>
                </div>

                {/* Category rows */}
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat} className="flex items-center gap-3">
                      <label htmlFor={`budget-${type}-${cat}`} className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        {cat}
                      </label>
                      <div className="relative w-36 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
                          {symbol}
                        </span>
                        <input
                          id={`budget-${type}-${cat}`}
                          type="number"
                          min="0"
                          step="10"
                          value={getValue(type, cat)}
                          onChange={e => handleChange(type, cat, e.target.value)}
                          placeholder="0"
                          className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums text-right"
                          aria-label={`Budget for ${cat}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer — sticky at the bottom */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-800 rounded-b-2xl px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center gap-3">
            <p className="text-xs text-gray-400">Changes apply to all periods until updated</p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleSave}
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
              >
                Save Budgets
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
