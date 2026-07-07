import { useMemo } from 'react';
import type { ExpenseEntry } from '../lib/db';
import type { CategorySummary, DailyTotal } from '../types/expense';
import {
  CATEGORY_IDS,
  isInvestmentCategory,
  isSavingsCategory,
  isWealthCategory,
  isExcludedFromDailySpendingChart,
  isExcludedFromDashboardExpenseTotal,
  type CategoryId,
} from '../lib/categories';

export function useMonthSummary(expenses: ExpenseEntry[]) {
  return useMemo(() => {
    const expenseEntries = expenses.filter((e) => !isWealthCategory(e.categoryId));
    const savingsEntries = expenses.filter((e) => isSavingsCategory(e.categoryId));
    const investmentEntries = expenses.filter((e) => isInvestmentCategory(e.categoryId));

    const expenseTotalAll = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
    const total = expenseEntries
      .filter((e) => !isExcludedFromDashboardExpenseTotal(e.categoryId))
      .reduce((sum, e) => sum + e.amount, 0);
    const savings = savingsEntries.reduce((sum, e) => sum + e.amount, 0);
    const investments = investmentEntries.reduce((sum, e) => sum + e.amount, 0);

    const byCategoryMap = new Map<string, { total: number; count: number }>();
    for (const id of CATEGORY_IDS) {
      if (!isWealthCategory(id)) {
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
        percentage: expenseTotalAll > 0 ? (catTotal / expenseTotalAll) * 100 : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const dailyMap = new Map<string, { total: number; count: number }>();
    for (const e of expenseEntries) {
      if (isExcludedFromDailySpendingChart(e.categoryId)) continue;
      const cur = dailyMap.get(e.date) ?? { total: 0, count: 0 };
      cur.total += e.amount;
      cur.count += 1;
      dailyMap.set(e.date, cur);
    }
    const daily: DailyTotal[] = Array.from(dailyMap.entries())
      .map(([date, { total, count }]) => ({ date, total, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, savings, investments, byCategory, daily };
  }, [expenses]);
}
