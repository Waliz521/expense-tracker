import { useState, useCallback, useEffect } from 'react';
import {
  addIncome as dbAdd,
  deleteIncome as dbDelete,
  getIncomeByMonth,
  updateIncome as dbUpdate,
} from '../lib/db';
import type { IncomeEntry } from '../lib/db';

export function useIncome(year: number, month: number) {
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getIncomeByMonth(year, month);
    setIncome(list);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const addIncome = useCallback(
    async (entry: { date: string; amount: number; source: string; note: string }) => {
      const created = await dbAdd(entry);
      const [y, m] = entry.date.split('-').map(Number);
      if (y === year && m === month) {
        setIncome((prev) => [created, ...prev]);
      }
      return created;
    },
    [year, month]
  );

  const updateIncome = useCallback(
    async (id: string, updates: Partial<Pick<IncomeEntry, 'amount' | 'source' | 'note' | 'date'>>) => {
      await dbUpdate(id, updates);
      await load();
    },
    [load]
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      await dbDelete(id);
      setIncome((prev) => prev.filter((i) => i.id !== id));
    },
    []
  );

  return { income, loading, addIncome, updateIncome, deleteIncome, refresh: load };
}
