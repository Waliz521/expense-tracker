import { useMemo } from 'react';
import type { IncomeEntry } from '../lib/db';

export function useIncomeSummary(income: IncomeEntry[]) {
  return useMemo(() => {
    const total = income.reduce((sum, i) => sum + i.amount, 0);

    // Group by source
    const bySourceMap = new Map<string, { total: number; count: number }>();
    for (const entry of income) {
      const current = bySourceMap.get(entry.source) ?? { total: 0, count: 0 };
      current.total += entry.amount;
      current.count += 1;
      bySourceMap.set(entry.source, current);
    }

    const bySource = Array.from(bySourceMap.entries())
      .map(([source, { total: sourceTotal, count }]) => ({
        source,
        total: sourceTotal,
        count,
        percentage: total > 0 ? (sourceTotal / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Daily totals
    const dailyMap = new Map<string, { total: number; count: number }>();
    for (const entry of income) {
      const current = dailyMap.get(entry.date) ?? { total: 0, count: 0 };
      current.total += entry.amount;
      current.count += 1;
      dailyMap.set(entry.date, current);
    }

    const daily = Array.from(dailyMap.entries())
      .map(([date, { total, count }]) => ({ date, total, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, bySource, daily };
  }, [income]);
}
