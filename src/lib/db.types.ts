import type { CategoryId } from './categories';

export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  categoryId: CategoryId;
  note: string;
  createdAt: number;
}
