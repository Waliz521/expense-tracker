import type { ExpenseEntry } from './db.types';
import { isSupabaseConfigured } from './supabase';
import {
  addExpenseSupabase,
  updateExpenseSupabase,
  deleteExpenseSupabase,
  getExpensesByMonthSupabase,
} from './dbSupabase';
import {
  addExpenseDexie,
  updateExpenseDexie,
  deleteExpenseDexie,
  getExpensesByMonthDexie,
} from './dbDexie';

export type { ExpenseEntry } from './db.types';

export async function addExpense(entry: Omit<ExpenseEntry, 'id' | 'createdAt'>): Promise<ExpenseEntry> {
  if (isSupabaseConfigured) return addExpenseSupabase(entry);
  return addExpenseDexie(entry);
}

export async function updateExpense(id: string, updates: Partial<Omit<ExpenseEntry, 'id' | 'createdAt'>>): Promise<void> {
  if (isSupabaseConfigured) return updateExpenseSupabase(id, updates);
  return updateExpenseDexie(id, updates);
}

export async function deleteExpense(id: string): Promise<void> {
  if (isSupabaseConfigured) return deleteExpenseSupabase(id);
  return deleteExpenseDexie(id);
}

export async function getExpensesByMonth(year: number, month: number): Promise<ExpenseEntry[]> {
  if (isSupabaseConfigured) return getExpensesByMonthSupabase(year, month);
  return getExpensesByMonthDexie(year, month);
}
