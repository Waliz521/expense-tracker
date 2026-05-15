import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Pencil } from 'lucide-react';
import { EditIncomeModal } from './EditIncomeModal';
import { isCarriedOverIncome } from '../lib/carryOver';
import type { IncomeEntry } from '../lib/db';

interface IncomeListProps {
  income: IncomeEntry[];
  onEdit: (id: string, updates: { date: string; amount: number; source: string; note: string }) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  formatCurrency: (n: number) => string;
}

export function IncomeList({ income, onEdit, onDelete, formatCurrency }: IncomeListProps) {
  const [editing, setEditing] = useState<IncomeEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IncomeEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await Promise.resolve(onDelete(pendingDelete.id));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }
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
                      onClick={() => setPendingDelete(entry)}
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
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setPendingDelete(null)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-income-title"
            className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900"
          >
            <div className="border-b border-surface-200 px-5 py-4 dark:border-surface-800">
              <h3 id="delete-income-title" className="font-display text-lg font-bold text-surface-900 dark:text-white">
                Delete this income?
              </h3>
              <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                This cannot be undone. Only proceed if you&apos;re sure you want to remove this entry.
              </p>
            </div>
            <div className="space-y-2 border-b border-surface-100 px-5 py-4 dark:border-surface-800">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">Date</span>
                <span className="font-medium text-surface-900 dark:text-white">
                  {format(new Date(pendingDelete.date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="shrink-0 text-surface-500 dark:text-surface-400">Source</span>
                <span className="max-w-[60%] text-right font-medium text-surface-900 dark:text-white">
                  {pendingDelete.source}
                  {isCarriedOverIncome(pendingDelete.source) && (
                    <span className="ml-2 align-middle text-xs font-normal text-amber-600 dark:text-amber-400">
                      (from previous month)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">Amount</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(pendingDelete.amount)}</span>
              </div>
              {pendingDelete.note ? (
                <div className="text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Note</span>
                  <p className="mt-1 rounded-lg bg-surface-50 px-3 py-2 text-surface-800 dark:bg-surface-800 dark:text-surface-200">
                    {pendingDelete.note}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3 px-5 py-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
              >
                {deleting ? 'Deleting…' : 'Yes, delete income'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-surface-200 bg-white px-5 py-2.5 font-medium text-surface-700 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
