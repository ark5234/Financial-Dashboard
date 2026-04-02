import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense' | 'savings';
export type Page = 'dashboard' | 'tracking' | 'planning';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export interface BudgetEntry {
  category: string;
  type: TransactionType;
  amount: number; // monthly budget
}

export type Role = 'Admin' | 'Viewer';
export type Theme = 'light' | 'dark';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  transactions: Transaction[];
  budgets: BudgetEntry[];
  currentRole: Role;
  theme: Theme;
  currency: Currency;
  toasts: ToastMessage[];
  selectedMonth: number;
  selectedYear: number;
  currentPage: Page;

  // Actions
  setRole: (role: Role) => void;
  toggleTheme: () => void;
  setCurrency: (currency: Currency) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updated: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (category: string, type: TransactionType, amount: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setCurrentPage: (page: Page) => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  // January Income
  { id: '1',  date: '2026-01-05', amount: 4500, category: 'Salary',         type: 'income',  description: 'January Salary' },
  { id: '2',  date: '2026-01-15', amount: 600,  category: 'Freelance',      type: 'income',  description: 'Web Design Project' },
  // January Expenses
  { id: '3',  date: '2026-01-06', amount: 1200, category: 'Housing',        type: 'expense', description: 'January Rent' },
  { id: '4',  date: '2026-01-10', amount: 150,  category: 'Utilities',      type: 'expense', description: 'Electric Bill' },
  { id: '5',  date: '2026-01-15', amount: 300,  category: 'Groceries',      type: 'expense', description: 'Trader Joes' },
  { id: '6',  date: '2026-01-20', amount: 100,  category: 'Entertainment',  type: 'expense', description: 'Movie Tickets' },
  { id: '7',  date: '2026-01-22', amount: 80,   category: 'Transport',      type: 'expense', description: 'Gas Station' },
  { id: '8',  date: '2026-01-28', amount: 120,  category: 'Dining',         type: 'expense', description: 'Eating Out' },
  // January Savings
  { id: '9',  date: '2026-01-25', amount: 1000, category: 'Emergency Fund', type: 'savings', description: 'Emergency Fund Contribution' },
  { id: '10', date: '2026-01-25', amount: 400,  category: 'Retirement',     type: 'savings', description: 'Roth IRA Contribution' },
  { id: '11', date: '2026-01-25', amount: 200,  category: 'Stock Portfolio',type: 'savings', description: 'Index Fund Purchase' },

  // February Income
  { id: '12', date: '2026-02-05', amount: 4500, category: 'Salary',         type: 'income',  description: 'February Salary' },
  // February Expenses
  { id: '13', date: '2026-02-06', amount: 1200, category: 'Housing',        type: 'expense', description: 'February Rent' },
  { id: '14', date: '2026-02-12', amount: 180,  category: 'Utilities',      type: 'expense', description: 'Water/Electric' },
  { id: '15', date: '2026-02-15', amount: 350,  category: 'Groceries',      type: 'expense', description: 'Whole Foods' },
  { id: '16', date: '2026-02-20', amount: 90,   category: 'Transport',      type: 'expense', description: 'Uber' },
  { id: '17', date: '2026-02-24', amount: 60,   category: 'Health',         type: 'expense', description: 'Pharmacy' },
  // February Savings
  { id: '18', date: '2026-02-25', amount: 1000, category: 'Emergency Fund', type: 'savings', description: 'Emergency Fund Contribution' },
  { id: '19', date: '2026-02-25', amount: 400,  category: 'Retirement',     type: 'savings', description: 'Roth IRA Contribution' },
  { id: '20', date: '2026-02-25', amount: 150,  category: 'Sinking Fund',   type: 'savings', description: 'Vacation Sinking Fund' },

  // March Income
  { id: '21', date: '2026-03-05', amount: 4500, category: 'Salary',         type: 'income',  description: 'March Salary' },
  { id: '22', date: '2026-03-18', amount: 150,  category: 'Investment',     type: 'income',  description: 'Dividend Payment' },
  // March Expenses
  { id: '23', date: '2026-03-01', amount: 1200, category: 'Housing',        type: 'expense', description: 'March Rent' },
  { id: '24', date: '2026-03-10', amount: 80,   category: 'Transport',      type: 'expense', description: 'Metro Card' },
  { id: '25', date: '2026-03-14', amount: 280,  category: 'Groceries',      type: 'expense', description: 'Supermarket' },
  { id: '26', date: '2026-03-25', amount: 90,   category: 'Entertainment',  type: 'expense', description: 'Concert' },
  { id: '27', date: '2026-03-28', amount: 70,   category: 'Health',         type: 'expense', description: 'Wellness' },
  // March Savings
  { id: '28', date: '2026-03-25', amount: 1000, category: 'Emergency Fund', type: 'savings', description: 'Emergency Fund Contribution' },
  { id: '29', date: '2026-03-25', amount: 400,  category: 'Retirement',     type: 'savings', description: 'Roth IRA Contribution' },
  { id: '30', date: '2026-03-25', amount: 250,  category: 'Stock Portfolio',type: 'savings', description: 'Buying the Dip' },

  // April Income
  { id: '31', date: '2026-04-02', amount: 4500, category: 'Salary',         type: 'income',  description: 'April Salary' },
  { id: '32', date: '2026-04-10', amount: 1100, category: 'Freelance',      type: 'income',  description: 'Side Hustle Net' },
  // April Expenses
  { id: '33', date: '2026-04-01', amount: 1200, category: 'Housing',        type: 'expense', description: 'April Rent' },
  { id: '34', date: '2026-04-05', amount: 200,  category: 'Utilities',      type: 'expense', description: 'Electric' },
  { id: '35', date: '2026-04-08', amount: 300,  category: 'Groceries',      type: 'expense', description: 'Weekly Shop' },
  { id: '36', date: '2026-04-12', amount: 110,  category: 'Entertainment',  type: 'expense', description: 'Fun & Streaming' },
  // April Savings
  { id: '37', date: '2026-04-20', amount: 750,  category: 'Stock Portfolio',type: 'savings', description: 'Stock Purchase' },
  { id: '38', date: '2026-04-20', amount: 400,  category: 'Retirement',     type: 'savings', description: 'Roth IRA' },
  { id: '39', date: '2026-04-20', amount: 660,  category: 'Emergency Fund', type: 'savings', description: 'Emergency Fund' },
];

const DEFAULT_BUDGETS: BudgetEntry[] = [
  // Income budgets
  { category: 'Salary',         type: 'income',  amount: 4500 },
  { category: 'Freelance',      type: 'income',  amount: 1000 },
  { category: 'Investment',     type: 'income',  amount: 150  },
  // Expense budgets
  { category: 'Housing',        type: 'expense', amount: 1200 },
  { category: 'Utilities',      type: 'expense', amount: 300  },
  { category: 'Groceries',      type: 'expense', amount: 350  },
  { category: 'Transport',      type: 'expense', amount: 150  },
  { category: 'Entertainment',  type: 'expense', amount: 200  },
  { category: 'Dining',         type: 'expense', amount: 150  },
  { category: 'Health',         type: 'expense', amount: 100  },
  // Savings budgets
  { category: 'Emergency Fund', type: 'savings', amount: 1000 },
  { category: 'Retirement',     type: 'savings', amount: 400  },
  { category: 'Stock Portfolio',type: 'savings', amount: 200  },
  { category: 'Sinking Fund',   type: 'savings', amount: 100  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: MOCK_TRANSACTIONS,
      budgets: DEFAULT_BUDGETS,
      currentRole: 'Admin',
      theme: 'dark',
      currency: 'USD',
      toasts: [],
      selectedMonth: 3,
      selectedYear: 2026,
      currentPage: 'dashboard' as Page,


      setRole: (role) => set({ currentRole: role }),
      setCurrency: (currency) => set({ currency }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setCurrentPage: (page) => set({ currentPage: page }),

      addToast: (msg, type) => set((state) => ({ toasts: [...state.toasts, { id: Math.random().toString(), msg, type }] })),
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),

      addTransaction: (tx) => set((state) => ({
        transactions: [
          ...state.transactions,
          { ...tx, id: crypto.randomUUID() }
        ]
      })),

      updateTransaction: (id, updated) => set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === id ? { ...tx, ...updated } : tx
        )
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      })),

      setBudget: (category, type, amount) => set((state) => {
        const existing = state.budgets.findIndex(b => b.category === category && b.type === type);
        if (existing >= 0) {
          const updated = [...state.budgets];
          updated[existing] = { category, type, amount };
          return { budgets: updated };
        }
        return { budgets: [...state.budgets, { category, type, amount }] };
      }),
    }),
    {
      name: 'finance-dashboard-storage-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
