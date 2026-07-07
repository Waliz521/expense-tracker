import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getExpensesByDateRange } from '../lib/db';
import { isInvestmentCategory, isSavingsCategory } from '../lib/categories';

export type WealthKind = 'savings' | 'investments';

export interface MonthlyWealthTotal {
  month: number;
  label: string;
  total: number;
}

function matchesKind(categoryId: string, kind: WealthKind): boolean {
  return kind === 'savings' ? isSavingsCategory(categoryId) : isInvestmentCategory(categoryId);
}

export function useYearWealth(year: number, kind: WealthKind, enabled: boolean) {
  const [yearTotal, setYearTotal] = useState(0);
  const [byMonth, setByMonth] = useState<MonthlyWealthTotal[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const expenses = await getExpensesByDateRange(`${year}-01-01`, `${year}-12-31`);
      const entries = expenses.filter((e) => matchesKind(e.categoryId, kind));

      const monthMap = new Map<number, number>();
      for (let m = 1; m <= 12; m++) monthMap.set(m, 0);

      for (const e of entries) {
        const m = parseInt(e.date.split('-')[1], 10);
        monthMap.set(m, (monthMap.get(m) ?? 0) + e.amount);
      }

      setYearTotal(entries.reduce((s, e) => s + e.amount, 0));
      setByMonth(
        Array.from(monthMap.entries())
          .map(([month, total]) => ({
            month,
            label: format(new Date(year, month - 1), 'MMMM'),
            total,
          }))
          .filter((m) => m.total > 0)
      );
    } finally {
      setLoading(false);
    }
  }, [year, kind]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { yearTotal, byMonth, loading };
}
