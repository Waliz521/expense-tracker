import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Pencil } from 'lucide-react';
import { EditIncomeModal } from './EditIncomeModal';
import { isCarriedOverIncome } from '../lib/carryOver';
import type { IncomeEntry } from '../lib/db';

interface IncomeListProps {
  income: IncomeEntry[];
  onEdit: (id: string, updates: { date: string; amount: number; source: string; note: string }) => Promise<void>;
  onDelete: (id: string) => void;
  formatCurrency: (n: number) => string;
}

export function IncomeList({ income, onEdit, onDelete, formatCurrency }: IncomeListProps) {
  const [editing, setEditing] = useState<IncomeEntry | null>(null);
  if (income.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center dark:border-surface-800 dark:bg-surface-900">
        <p className="text-surface-500 dark:text-surface-400">
          No income entries this month. Add one above.
        </p>
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
              <th className="px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">Source</th>
              <th className="px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">Note</th>
              <th className="px-4 py-3 text-right font-semibold text-surface-700 dark:text-surface-300">Amount</th>
              <th className="w-24 px-4 py-3 text-right font-semibold text-surface-700 dark:text-surface-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {income.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-surface-100 transition hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50"
              >
                <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">Rs</span>
                    {entry.source}
                    {isCarriedOverIncome(entry.source) && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        From previous month
                      </span>
                    )}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-surface-600 dark:text-surface-400" title={entry.note}>
                  {entry.note || '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(entry)}
                      className="rounded-lg p-2 text-surface-400 transition hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="rounded-lg p-2 text-surface-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <EditIncomeModal
          income={editing}
          onSave={onEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
