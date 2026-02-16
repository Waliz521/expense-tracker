import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Pencil } from 'lucide-react';
import { getCategoryById } from '../lib/categories';
import { CategoryIcon } from './icons';
import { EditExpenseModal } from './EditExpenseModal';
import type { ExpenseEntry } from '../lib/db';

interface ExpenseListProps {
  expenses: ExpenseEntry[];
  onEdit: (id: string, updates: { date: string; amount: number; categoryId: import('../lib/categories').CategoryId; note: string }) => Promise<void>;
  onDelete: (id: string) => void;
  formatCurrency: (n: number) => string;
}

export function ExpenseList({ expenses, onEdit, onDelete, formatCurrency }: ExpenseListProps) {
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center dark:border-surface-800 dark:bg-surface-900">
        <p className="text-surface-500 dark:text-surface-400">No expenses this month. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-surface-800 dark:bg-surface-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-800">
              <th className="px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">Date</th>
              <th className="px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">Category</th>
              <th className="px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">Note</th>
              <th className="px-4 py-3 text-right font-semibold text-surface-700 dark:text-surface-300">Amount</th>
              <th className="w-24 px-4 py-3 text-right font-semibold text-surface-700 dark:text-surface-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => {
              const cat = getCategoryById(e.categoryId);
              return (
                <tr
                  key={e.id}
                  className="border-b border-surface-100 transition hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50"
                >
                  <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                    {format(new Date(e.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} className="h-4 w-4 text-accent" />
                      {cat.label}
                    </span>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-surface-600 dark:text-surface-400" title={e.note}>
                    {e.note || '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-surface-900 dark:text-white">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(e)}
                        className="rounded-lg p-2 text-surface-400 transition hover:bg-accent/10 hover:text-accent dark:hover:bg-accent/20 dark:hover:text-accent-light"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(e.id)}
                        className="rounded-lg p-2 text-surface-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && (
        <EditExpenseModal
          expense={editing}
          onSave={onEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
