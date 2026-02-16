import { useMemo } from 'react';
import type { ExpenseEntry } from '../lib/db';
import type { CategorySummary, DailyTotal } from '../types/expense';
import { CATEGORY_IDS } from '../lib/categories';

export function useMonthSummary(expenses: ExpenseEntry[]) {
  return useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategoryMap = new Map<string, { total: number; count: number }>();
    for (const id of CATEGORY_IDS) {
      byCategoryMap.set(id, { total: 0, count: 0 });
    }
    for (const e of expenses) {
      const cur = byCategoryMap.get(e.categoryId) ?? { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      byCategoryMap.set(e.categoryId, cur);
    }

    const byCategory: CategorySummary[] = CATEGORY_IDS.map((categoryId) => {
      const { total: catTotal, count } = byCategoryMap.get(categoryId) ?? { total: 0, count: 0 };
      return {
        categoryId,
        total: catTotal,
        count,
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const dailyMap = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const cur = dailyMap.get(e.date) ?? { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      dailyMap.set(e.date, cur);
    }
    const daily: DailyTotal[] = Array.from(dailyMap.entries())
      .map(([date, { total, count }]) => ({ date, total, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, byCategory, daily };
  }, [expenses]);
}
