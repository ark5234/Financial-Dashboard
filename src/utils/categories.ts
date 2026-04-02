import React from 'react';
import { House, ShoppingCart, Car, Lightning, FilmSlate, Briefcase, Laptop, TrendUp, ForkKnife, FirstAid } from '@phosphor-icons/react';

export const CATEGORY_CONFIG: Record<string, { color: string; fill: string; Icon: React.ElementType }> = {
  Housing:       { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',   fill: '#3b82f6', Icon: House },
  Groceries:     { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', fill: '#22c55e', Icon: ShoppingCart },
  Transport:     { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', fill: '#f59e0b', Icon: Car },
  Utilities:     { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',     fill: '#06b6d4', Icon: Lightning },
  Entertainment: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', fill: '#a855f7', Icon: FilmSlate },
  Salary:        { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', fill: '#10b981', Icon: Briefcase },
  Freelance:     { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',     fill: '#14b8a6', Icon: Laptop },
  Investment:    { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300', fill: '#6366f1', Icon: TrendUp },
  Dining:        { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', fill: '#f97316', Icon: ForkKnife },
  Health:        { color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',     fill: '#f43f5e', Icon: FirstAid },
};
