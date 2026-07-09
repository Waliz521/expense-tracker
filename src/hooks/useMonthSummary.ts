import { useMemo } from 'react';
import type { ExpenseEntry } from '../lib/db';
import type { CategorySummary, DailyTotal } from '../types/expense';
import {
  CATEGORY_IDS,
  isInvestmentCategory,
  isWealthCategory,
  isExpenseExcludedFromDailyChart,
  type CategoryId,
} from '../lib/categories';
import { netSavingsFlow, sumSavingsDeposits, sumSavingsWithdrawals } from '../lib/savings';

export function useMonthSummary(expenses: ExpenseEntry[]) {
  return useMemo(() => {
    const expenseEntries = expenses.filter((e) => !isWealthCategory(e.categoryId));
    const investmentEntries = expenses.filter((e) => isInvestmentCategory(e.categoryId));

    const total = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
    const savings = netSavingsFlow(expenses);
    const savingsDeposits = sumSavingsDeposits(expenses);
    const savingsWithdrawals = sumSavingsWithdrawals(expenses);
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
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const dailyMap = new Map<string, { total: number; count: number; categories: Map<string, number> }>();
    for (const e of expenseEntries) {
      if (isExpenseExcludedFromDailyChart(e)) continue;
      const cur = dailyMap.get(e.date) ?? { total: 0, count: 0, categories: new Map() };
      cur.total += e.amount;
      cur.count += 1;
      cur.categories.set(e.categoryId, (cur.categories.get(e.categoryId) ?? 0) + e.amount);
      dailyMap.set(e.date, cur);
    }
    const daily: DailyTotal[] = Array.from(dailyMap.entries())
      .map(([date, { total: dayTotal, count, categories }]) => ({
        date,
        total: dayTotal,
        count,
        byCategory: Array.from(categories.entries())
          .map(([categoryId, catTotal]) => ({
            categoryId: categoryId as CategoryId,
            total: catTotal,
            percentage: dayTotal > 0 ? (catTotal / dayTotal) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, savings, savingsDeposits, savingsWithdrawals, investments, byCategory, daily };
  }, [expenses]);
}
