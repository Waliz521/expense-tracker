import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { getCategoryById } from '../lib/categories';
import { isSavingsWithdrawal } from '../lib/savings';
import { CategoryIcon } from './icons';
import { EditExpenseModal } from './EditExpenseModal';
import type { ExpenseEntry } from '../lib/db';
import type { ExpenseFilters } from './ExpenseFilters';

interface ExpenseListProps {
  expenses: ExpenseEntry[];
  onEdit: (
    id: string,
    updates: {
      date: string;
      amount: number;
      categoryId: import('../lib/categories').CategoryId;
      note: string;
      paidFromSavings?: boolean;
      excludeFromDailyChart?: boolean;
    }
  ) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  formatCurrency: (n: number) => string;
  sortBy: ExpenseFilters['sortBy'];
  sortOrder: ExpenseFilters['sortOrder'];
  onSortChange: (column: ExpenseFilters['sortBy']) => void;
}

function SortHeader({
  label,
  column,
  active,
  order,
  onSort,
  align,
}: {
  label: string;
  column: ExpenseFilters['sortBy'];
  active: boolean;
  order: 'asc' | 'desc';
  onSort: (column: ExpenseFilters['sortBy']) => void;
  align?: 'right';
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-semibold text-surface-700 dark:text-surface-300 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 rounded-lg px-1 py-0.5 transition hover:bg-surface-100 dark:hover:bg-surface-700/80 ${align === 'right' ? 'ml-auto' : ''}`}
        aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{label}</span>
        {active ? (
          order === 'asc' ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          )
        ) : (
          <span className="inline-flex flex-col opacity-40" aria-hidden>
            <ChevronUp className="-mb-1.5 h-3 w-3" />
            <ChevronDown className="h-3 w-3" />
          </span>
        )}
      </button>
    </th>
  );
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  formatCurrency,
  sortBy,
  sortOrder,
  onSortChange,
}: ExpenseListProps) {
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ExpenseEntry | null>(null);
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

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center dark:border-surface-800 dark:bg-surface-900">
        <p className="text-surface-500 dark:text-surface-400">
          No expenses match your filters. Try adjusting your search or filter criteria.
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
              <SortHeader
                label="Date"
                column="date"
                active={sortBy === 'date'}
                order={sortOrder}
                onSort={onSortChange}
              />
              <SortHeader
                label="Category"
                column="category"
                active={sortBy === 'category'}
                order={sortOrder}
                onSort={onSortChange}
              />
              <SortHeader
                label="Note"
                column="note"
                active={sortBy === 'note'}
                order={sortOrder}
                onSort={onSortChange}
              />
              <SortHeader
                label="Amount"
                column="amount"
                active={sortBy === 'amount'}
                order={sortOrder}
                onSort={onSortChange}
                align="right"
              />
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
                    <span className="flex flex-wrap items-center gap-2">
                      <CategoryIcon name={cat.icon} className="h-4 w-4 text-accent" />
                      {cat.label}
                      {isSavingsWithdrawal(e) && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          From savings
                        </span>
                      )}
                      {e.excludeFromDailyChart && (
                        <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">
                          Hidden from chart
                        </span>
                      )}
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
                        onClick={() => setPendingDelete(e)}
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
        <EditExpenseModal expense={editing} onSave={onEdit} onClose={() => setEditing(null)} />
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setPendingDelete(null)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-expense-title"
            className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900"
          >
            <div className="border-b border-surface-200 px-5 py-4 dark:border-surface-800">
              <h3 id="delete-expense-title" className="font-display text-lg font-bold text-surface-900 dark:text-white">
                Delete this expense?
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
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">Category</span>
                <span className="font-medium text-surface-900 dark:text-white">{getCategoryById(pendingDelete.categoryId).label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">Amount</span>
                <span className="font-semibold text-surface-900 dark:text-white">{formatCurrency(pendingDelete.amount)}</span>
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
                {deleting ? 'Deleting…' : 'Yes, delete expense'}
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
