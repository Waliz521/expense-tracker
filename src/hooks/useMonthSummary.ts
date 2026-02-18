import { useMemo } from 'react';
import type { ExpenseEntry } from '../lib/db';
import type { CategorySummary, DailyTotal } from '../types/expense';
import { CATEGORY_IDS, isSavingsCategory, type CategoryId } from '../lib/categories';

export function useMonthSummary(expenses: ExpenseEntry[]) {
  return useMemo(() => {
    // Separate expenses from savings
    const expenseEntries = expenses.filter((e) => !isSavingsCategory(e.categoryId));
    const savingsEntries = expenses.filter((e) => isSavingsCategory(e.categoryId));

    // Calculate total expenses (excluding savings)
    const total = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate total savings
    const savings = savingsEntries.reduce((sum, e) => sum + e.amount, 0);

    // Calculate by category (excluding savings)
    const byCategoryMap = new Map<string, { total: number; count: number }>();
    for (const id of CATEGORY_IDS) {
      if (!isSavingsCategory(id)) {
        byCategoryMap.set(id, { total: 0, count: 0 });
      }
    }
    for (const e of expenseEntries) {
      const cur = byCategoryMap.get(e.categoryId) ?? { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      byCategoryMap.set(e.categoryId, cur);
    }

    const byCategory: CategorySummary[] = Array.from(byCategoryMap.entries())
      .map(([categoryId, { total: catTotal, count }]) => ({
        categoryId: categoryId as CategoryId,
        total: catTotal,
        count,
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    // Calculate daily totals (excluding savings)
    const dailyMap = new Map<string, { total: number; count: number }>();
    for (const e of expenseEntries) {
      const cur = dailyMap.get(e.date) ?? { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      dailyMap.set(e.date, cur);
    }
    const daily: DailyTotal[] = Array.from(dailyMap.entries())
      .map(([date, { total, count }]) => ({ date, total, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, savings, byCategory, daily };
  }, [expenses]);
}
