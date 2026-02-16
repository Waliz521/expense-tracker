import { useCallback, useEffect, useState } from 'react';
import {
  addExpense as dbAdd,
  deleteExpense as dbDelete,
  getExpensesByMonth,
  updateExpense as dbUpdate,
} from '../lib/db';
import type { ExpenseEntry } from '../lib/db';
import type { CategoryId } from '../lib/categories';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function useExpenses(year: number, month: number) {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getExpensesByMonth(year, month);
    setExpenses(list);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = useCallback(
    async (entry: { date: string; amount: number; categoryId: CategoryId; note: string }) => {
      const created = await dbAdd(entry);
      const [y, m] = entry.date.split('-').map(Number);
      if (y === year && m === month) {
        setExpenses((prev) => [created, ...prev]);
      }
      return created;
    },
    [year, month]
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<Pick<ExpenseEntry, 'amount' | 'categoryId' | 'note' | 'date'>>) => {
      await dbUpdate(id, updates);
      await load();
    },
    [load]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await dbDelete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    []
  );

  return { expenses, loading, addExpense, updateExpense, deleteExpense, refresh: load };
}

export function useMonthRange() {
  const [range, setRange] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const setMonth = useCallback((year: number, month: number) => {
    setRange({ year, month });
  }, []);

  const start = startOfMonth(new Date(range.year, range.month - 1));
  const end = endOfMonth(new Date(range.year, range.month - 1));
  const label = format(start, 'MMMM yyyy');

  return { ...range, setMonth, start, end, label };
}
