import { supabase } from './supabase';
import type { ExpenseEntry, IncomeEntry } from './db.types';
import type { CategoryId } from './categories';

const EXPENSES_TABLE = 'expenses';
const INCOME_TABLE = 'income';

function toEntry(row: {
  id: string;
  date: string;
  amount: number;
  category_id: string;
  note: string;
  created_at: string;
}): ExpenseEntry {
  return {
    id: row.id,
    date: row.date,
    amount: Number(row.amount),
    categoryId: row.category_id as CategoryId,
    note: row.note ?? '',
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function addExpenseSupabase(
  entry: Omit<ExpenseEntry, 'id' | 'createdAt'>
): Promise<ExpenseEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .insert({
      user_id: user.id,
      date: entry.date,
      amount: entry.amount,
      category_id: entry.categoryId,
      note: entry.note,
    })
    .select('id, date, amount, category_id, note, created_at')
    .single();

  if (error) throw error;
  return toEntry(data);
}

export async function updateExpenseSupabase(
  id: string,
  updates: Partial<Omit<ExpenseEntry, 'id' | 'createdAt'>>
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (updates.date != null) body.date = updates.date;
  if (updates.amount != null) body.amount = updates.amount;
  if (updates.categoryId != null) body.category_id = updates.categoryId;
  if (updates.note != null) body.note = updates.note;

  const { error } = await supabase.from(EXPENSES_TABLE).update(body).eq('id', id);
  if (error) throw error;
}

export async function deleteExpenseSupabase(id: string): Promise<void> {
  const { error } = await supabase.from(EXPENSES_TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function getExpensesByMonthSupabase(
  year: number,
  month: number
): Promise<ExpenseEntry[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .select('id, date, amount, category_id, note, created_at')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toEntry);
}

export async function getExpensesByDateRangeSupabase(from: string, to: string): Promise<ExpenseEntry[]> {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .select('id, date, amount, category_id, note, created_at')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toEntry);
}

// Income functions
function toIncomeEntry(row: {
  id: string;
  date: string;
  amount: number;
  source: string;
  note: string;
  created_at: string;
}): IncomeEntry {
  return {
    id: row.id,
    date: row.date,
    amount: Number(row.amount),
    source: row.source,
    note: row.note ?? '',
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function addIncomeSupabase(
  entry: Omit<IncomeEntry, 'id' | 'createdAt'>
): Promise<IncomeEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from(INCOME_TABLE)
    .insert({
      user_id: user.id,
      date: entry.date,
      amount: entry.amount,
      source: entry.source,
      note: entry.note,
    })
    .select('id, date, amount, source, note, created_at')
    .single();

  if (error) throw error;
  return toIncomeEntry(data);
}

export async function updateIncomeSupabase(
  id: string,
  updates: Partial<Omit<IncomeEntry, 'id' | 'createdAt'>>
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (updates.date != null) body.date = updates.date;
  if (updates.amount != null) body.amount = updates.amount;
  if (updates.source != null) body.source = updates.source;
  if (updates.note != null) body.note = updates.note;

  const { error } = await supabase.from(INCOME_TABLE).update(body).eq('id', id);
  if (error) throw error;
}

export async function deleteIncomeSupabase(id: string): Promise<void> {
  const { error } = await supabase.from(INCOME_TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function getIncomeByMonthSupabase(
  year: number,
  month: number
): Promise<IncomeEntry[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from(INCOME_TABLE)
    .select('id, date, amount, source, note, created_at')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toIncomeEntry);
}

export async function getIncomeByDateRangeSupabase(from: string, to: string): Promise<IncomeEntry[]> {
  const { data, error } = await supabase
    .from(INCOME_TABLE)
    .select('id, date, amount, source, note, created_at')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toIncomeEntry);
}
