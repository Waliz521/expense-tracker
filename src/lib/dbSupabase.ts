import { supabase } from './supabase';
import type { ExpenseEntry } from './db.types';
import type { CategoryId } from './categories';

const TABLE = 'expenses';

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
    .from(TABLE)
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

  const { error } = await supabase.from(TABLE).update(body).eq('id', id);
  if (error) throw error;
}

export async function deleteExpenseSupabase(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
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
    .from(TABLE)
    .select('id, date, amount, category_id, note, created_at')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toEntry);
}
