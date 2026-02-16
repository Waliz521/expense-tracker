import type { CategoryId } from '../lib/categories';
import type { ExpenseEntry } from '../lib/db';

export type { ExpenseEntry, CategoryId };

export interface CategorySummary {
  categoryId: CategoryId;
  total: number;
  count: number;
  percentage: number;
}

export interface DailyTotal {
  date: string;
  total: number;
  count: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  total: number;
  byCategory: CategorySummary[];
  daily: DailyTotal[];
}
