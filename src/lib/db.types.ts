import type { CategoryId } from './categories';

export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  categoryId: CategoryId;
  note: string;
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
