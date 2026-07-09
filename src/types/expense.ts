import type { CategoryId } from '../lib/categories';
import type { ExpenseEntry } from '../lib/db';

export type { ExpenseEntry, CategoryId };

export interface CategorySummary {
  categoryId: CategoryId;
  total: number;
  count: number;
  percentage: number;
}

export interface DailyCategoryTotal {
  categoryId: CategoryId;
  total: number;
  percentage: number;
}

export interface DailyTotal {
  date: string;
  total: number;
  count: number;
  byCategory: DailyCategoryTotal[];
}

export interface MonthSummary {
  year: number;
  month: number;
  total: number; // Total expenses (excluding savings)
  savings: number;
  investments: number;
  byCategory: CategorySummary[]; // Categories excluding savings
  daily: DailyTotal[]; // Daily totals for chart: excludes savings and tax/debt/donations bars
}
