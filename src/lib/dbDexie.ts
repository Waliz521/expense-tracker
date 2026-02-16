import Dexie, { type EntityTable } from 'dexie';
import type { ExpenseEntry } from './db.types';

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;

class ExpenseDatabase extends Dexie {
  expenses!: EntityTable<ExpenseEntry, 'id'>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      expenses: 'id, date, categoryId, createdAt',
    });
  }
}

export const db = new ExpenseDatabase();

export async function addExpenseDexie(entry: Omit<ExpenseEntry, 'id' | 'createdAt'>): Promise<ExpenseEntry> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const full: ExpenseEntry = { ...entry, id, createdAt };
  await db.expenses.add(full);
  return full;
}

export async function updateExpenseDexie(id: string, updates: Partial<Omit<ExpenseEntry, 'id' | 'createdAt'>>): Promise<void> {
  await db.expenses.update(id, updates);
}

export async function deleteExpenseDexie(id: string): Promise<void> {
  await db.expenses.delete(id);
}

export async function getExpensesByMonthDexie(year: number, month: number): Promise<ExpenseEntry[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const list = await db.expenses.where('date').between(start, end, true, true).sortBy('date');
  return list.reverse();
}

export async function getAllExpensesDexie(): Promise<ExpenseEntry[]> {
  return db.expenses.orderBy('date').reverse().toArray();
}

export async function clearAllExpensesDexie(): Promise<void> {
  await db.expenses.clear();
}
