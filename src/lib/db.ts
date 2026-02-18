import type { ExpenseEntry, IncomeEntry } from './db.types';
import { isSupabaseConfigured } from './supabase';
import {
  addExpenseSupabase,
  updateExpenseSupabase,
  deleteExpenseSupabase,
  getExpensesByMonthSupabase,
  addIncomeSupabase,
  updateIncomeSupabase,
  deleteIncomeSupabase,
  getIncomeByMonthSupabase,
} from './dbSupabase';
import {
  addExpenseDexie,
  updateExpenseDexie,
  deleteExpenseDexie,
  getExpensesByMonthDexie,
  addIncomeDexie,
  updateIncomeDexie,
  deleteIncomeDexie,
  getIncomeByMonthDexie,
} from './dbDexie';

export type { ExpenseEntry, IncomeEntry } from './db.types';

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

// Income functions
export async function addIncome(entry: Omit<IncomeEntry, 'id' | 'createdAt'>): Promise<IncomeEntry> {
  if (isSupabaseConfigured) return addIncomeSupabase(entry);
  return addIncomeDexie(entry);
}

export async function updateIncome(id: string, updates: Partial<Omit<IncomeEntry, 'id' | 'createdAt'>>): Promise<void> {
  if (isSupabaseConfigured) return updateIncomeSupabase(id, updates);
  return updateIncomeDexie(id, updates);
}

export async function deleteIncome(id: string): Promise<void> {
  if (isSupabaseConfigured) return deleteIncomeSupabase(id);
  return deleteIncomeDexie(id);
}

export async function getIncomeByMonth(year: number, month: number): Promise<IncomeEntry[]> {
  if (isSupabaseConfigured) return getIncomeByMonthSupabase(year, month);
  return getIncomeByMonthDexie(year, month);
}
