import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
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
  currentRole: Role;
  theme: Theme;
  currency: Currency;
  toasts: ToastMessage[];
  
  // Actions
  setRole: (role: Role) => void;
  toggleTheme: () => void;
  setCurrency: (currency: Currency) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updated: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-01-05', amount: 4500, category: 'Salary', type: 'income', description: 'January Salary' },
  { id: '2', date: '2026-01-06', amount: 1200, category: 'Housing', type: 'expense', description: 'January Rent' },
  { id: '3', date: '2026-01-10', amount: 150, category: 'Utilities', type: 'expense', description: 'Electric Bill' },
  { id: '4', date: '2026-01-15', amount: 300, category: 'Groceries', type: 'expense', description: 'Trader Joes' },
  { id: '5', date: '2026-01-20', amount: 100, category: 'Entertainment', type: 'expense', description: 'Movie Tickets' },
  { id: '6', date: '2026-02-05', amount: 4500, category: 'Salary', type: 'income', description: 'February Salary' },
  { id: '7', date: '2026-02-06', amount: 1200, category: 'Housing', type: 'expense', description: 'February Rent' },
  { id: '8', date: '2026-02-12', amount: 180, category: 'Utilities', type: 'expense', description: 'Water/Electric' },
  { id: '9', date: '2026-02-15', amount: 600, category: 'Freelance', type: 'income', description: 'Web Design Project' },
  { id: '10', date: '2026-02-18', amount: 350, category: 'Groceries', type: 'expense', description: 'Whole Foods' },
  { id: '11', date: '2026-03-01', amount: 1200, category: 'Housing', type: 'expense', description: 'March Rent' },
  { id: '12', date: '2026-03-05', amount: 4500, category: 'Salary', type: 'income', description: 'March Salary' },
  { id: '13', date: '2026-03-10', amount: 80, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '14', date: '2026-03-15', amount: 280, category: 'Groceries', type: 'expense', description: 'Supermarket' },
  { id: '15', date: '2026-03-25', amount: 90, category: 'Entertainment', type: 'expense', description: 'Concert' },
  { id: '16', date: '2026-04-01', amount: 1200, category: 'Housing', type: 'expense', description: 'April Rent' },
  { id: '17', date: '2026-04-02', amount: 4500, category: 'Salary', type: 'income', description: 'April Salary' },
  { id: '18', date: '2026-04-05', amount: 200, category: 'Utilities', type: 'expense', description: 'Electric' }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: MOCK_TRANSACTIONS,
      currentRole: 'Admin', // Default to Admin for testing
      theme: 'dark', // Default to dark as requested
      currency: 'USD',
      toasts: [],

      setRole: (role) => set({ currentRole: role }),
      setCurrency: (currency) => set({ currency }),
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
    }),
    {
      name: 'finance-dashboard-storage',
      // Ensure theme is applied on rehydration
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
