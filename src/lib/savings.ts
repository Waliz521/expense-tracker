import type { ExpenseEntry } from './db.types';
import { isInvestmentCategory, isSavingsCategory, isWealthCategory } from './categories';

/** Expense paid from previously saved money (not from current income). */
export function isSavingsWithdrawal(e: Pick<ExpenseEntry, 'paidFromSavings' | 'categoryId'>): boolean {
  return !!e.paidFromSavings && !isWealthCategory(e.categoryId);
}

export function sumSavingsDeposits(expenses: ExpenseEntry[]): number {
  return expenses.filter((e) => isSavingsCategory(e.categoryId)).reduce((s, e) => s + e.amount, 0);
}

export function sumSavingsWithdrawals(expenses: ExpenseEntry[]): number {
  return expenses.filter(isSavingsWithdrawal).reduce((s, e) => s + e.amount, 0);
}

/** Net savings movement: deposits minus withdrawals. */
export function netSavingsFlow(expenses: ExpenseEntry[]): number {
  return sumSavingsDeposits(expenses) - sumSavingsWithdrawals(expenses);
}

/** Regular expenses that reduce net (excludes wealth moves and paid-from-savings). */
export function sumExpensesForNet(expenses: ExpenseEntry[]): number {
  return expenses
    .filter((e) => !isWealthCategory(e.categoryId) && !isSavingsWithdrawal(e))
    .reduce((s, e) => s + e.amount, 0);
}

export function computeMonthNet(incomeTotal: number, expenses: ExpenseEntry[]): number {
  const investments = expenses
    .filter((e) => isInvestmentCategory(e.categoryId))
    .reduce((s, e) => s + e.amount, 0);
  return incomeTotal - sumExpensesForNet(expenses) - sumSavingsDeposits(expenses) - investments;
}
