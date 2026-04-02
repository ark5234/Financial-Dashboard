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

interface AppState {
  transactions: Transaction[];
  currentRole: Role;
  theme: Theme;
  
  // Actions
  setRole: (role: Role) => void;
  toggleTheme: () => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updated: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-03-25', amount: 4500, category: 'Salary', type: 'income', description: 'March Salary' },
  { id: '2', date: '2026-03-26', amount: 150, category: 'Groceries', type: 'expense', description: 'Whole Foods' },
  { id: '3', date: '2026-03-28', amount: 60, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '4', date: '2026-03-29', amount: 1200, category: 'Housing', type: 'expense', description: 'Rent' },
  { id: '5', date: '2026-04-01', amount: 200, category: 'Utilities', type: 'expense', description: 'Electricity Bill' },
  { id: '6', date: '2026-04-02', amount: 45, category: 'Entertainment', type: 'expense', description: 'Movie Tickets' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: MOCK_TRANSACTIONS,
      currentRole: 'Admin', // Default to Admin for testing
      theme: 'dark', // Default to dark as requested

      setRole: (role) => set({ currentRole: role }),
      
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
