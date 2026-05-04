import { useState, useEffect, useCallback } from 'react';
import { getExpensesByMonth, getIncomeByMonth } from '../lib/db';
import { isSavingsCategory } from '../lib/categories';
import { format } from 'date-fns';

/** Previous calendar month relative to the dashboard month being viewed. */
export async function fetchPreviousMonthClosingBalance(viewYear: number, viewMonth: number): Promise<number> {
  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;

  const [prevIncome, prevExpenses] = await Promise.all([
    getIncomeByMonth(prevYear, prevMonth),
    getExpensesByMonth(prevYear, prevMonth),
  ]);

  const prevIncomeTotal = prevIncome.reduce((s, i) => s + i.amount, 0);
  const prevExpenseEntries = prevExpenses.filter((e) => !isSavingsCategory(e.categoryId));
  const prevSavings = prevExpenses
    .filter((e) => isSavingsCategory(e.categoryId))
    .reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenseEntries.reduce((s, e) => s + e.amount, 0);

  return prevIncomeTotal - prevTotal - prevSavings;
}

export function usePreviousMonthNet(year: number, month: number) {
  const [computedNet, setComputedNet] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthLabel = format(new Date(prevYear, prevMonth - 1), 'MMMM yyyy');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const prevNet = await fetchPreviousMonthClosingBalance(year, month);
      setComputedNet(prevNet);
    } catch {
      setComputedNet(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const net = computedNet !== null && computedNet > 0 ? computedNet : null;

  return { net, computedNet, loading, prevMonthLabel, refresh: load };
}
