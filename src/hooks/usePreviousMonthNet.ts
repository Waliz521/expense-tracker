import { useState, useEffect, useCallback } from 'react';
import { getExpensesByMonth, getIncomeByMonth } from '../lib/db';
import { isSavingsCategory } from '../lib/categories';
import { format } from 'date-fns';

export function usePreviousMonthNet(year: number, month: number) {
  const [net, setNet] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthLabel = format(new Date(prevYear, prevMonth - 1), 'MMMM yyyy');

  const load = useCallback(async () => {
    setLoading(true);
    try {
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

      const prevNet = prevIncomeTotal - prevTotal - prevSavings;
      setNet(prevNet > 0 ? prevNet : null);
    } catch {
      setNet(null);
    } finally {
      setLoading(false);
    }
  }, [prevYear, prevMonth]);

  useEffect(() => {
    load();
  }, [load]);

  return { net, loading, prevMonthLabel };
}
