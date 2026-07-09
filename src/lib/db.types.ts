import type { CategoryId } from './categories';

export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  categoryId: CategoryId;
  note: string;
  /** When true, paid from savings pool — shown as expense but does not reduce net twice. */
  paidFromSavings?: boolean;
  /** When true, omitted from the daily spending bar chart (still in totals & breakdown). */
  excludeFromDailyChart?: boolean;
  createdAt: number;
}

export interface IncomeEntry {
  id: string;
  date: string;
  amount: number;
  source: string; // e.g., "Salary", "Freelance", "Investment", etc.
  note: string;
  createdAt: number;
}
