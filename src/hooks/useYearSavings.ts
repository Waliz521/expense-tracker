import { useState, useEffect, useCallback } from 'react';
import { getExpensesByDateRange } from '../lib/db';
import { isInvestmentCategory, isSavingsCategory } from '../lib/categories';
import { netSavingsFlow, sumSavingsDeposits, sumSavingsWithdrawals } from '../lib/savings';
import { format } from 'date-fns';

export type WealthKind = 'savings' | 'investments';

export interface MonthlyWealthTotal {
  month: number;
  label: string;
  total: number;
}

export function useYearWealth(year: number, kind: WealthKind, enabled: boolean) {
  const [yearTotal, setYearTotal] = useState(0);
  const [byMonth, setByMonth] = useState<MonthlyWealthTotal[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const expenses = await getExpensesByDateRange(`${year}-01-01`, `${year}-12-31`);

      if (kind === 'investments') {
        const entries = expenses.filter((e) => isInvestmentCategory(e.categoryId));
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
        return;
      }

      // Savings: deposits minus paid-from-savings withdrawals
      const monthMap = new Map<number, { deposits: number; withdrawals: number }>();
      for (let m = 1; m <= 12; m++) monthMap.set(m, { deposits: 0, withdrawals: 0 });

      for (const e of expenses) {
        const m = parseInt(e.date.split('-')[1], 10);
        const cur = monthMap.get(m)!;
        if (isSavingsCategory(e.categoryId)) cur.deposits += e.amount;
        if (e.paidFromSavings && !isInvestmentCategory(e.categoryId) && !isSavingsCategory(e.categoryId)) {
          cur.withdrawals += e.amount;
        }
      }

      setYearTotal(netSavingsFlow(expenses));
      setByMonth(
        Array.from(monthMap.entries())
          .map(([month, { deposits, withdrawals }]) => ({
            month,
            label: format(new Date(year, month - 1), 'MMMM'),
            total: deposits - withdrawals,
          }))
          .filter((m) => m.total !== 0)
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

export function useSavingsPool(year: number, month: number) {
  const [pool, setPool] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const expenses = await getExpensesByDateRange('2000-01-01', end);
      setPool(netSavingsFlow(expenses));
    } catch {
      setPool(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  return { pool, loading, refresh: load };
}

// Re-export helpers for year modal subtitles
export { sumSavingsDeposits, sumSavingsWithdrawals };
