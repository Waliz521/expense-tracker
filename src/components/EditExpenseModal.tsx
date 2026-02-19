import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { getCategoriesByGroup } from '../lib/categories';
import { CategoryIcon } from './icons';
import { DatePickerInput } from './DatePickerInput';
import type { ExpenseEntry } from '../lib/db';
import type { CategoryId } from '../lib/categories';

interface EditExpenseModalProps {
  expense: ExpenseEntry;
  onSave: (id: string, updates: { date: string; amount: number; categoryId: CategoryId; note: string }) => Promise<void>;
  onClose: () => void;
}

export function EditExpenseModal({ expense, onSave, onClose }: EditExpenseModalProps) {
  const [date, setDate] = useState(expense.date);
  const [amount, setAmount] = useState(String(expense.amount));
  const [categoryId, setCategoryId] = useState<CategoryId>(expense.categoryId);
  const [note, setNote] = useState(expense.note);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDate(expense.date);
    setAmount(String(expense.amount));
    setCategoryId(expense.categoryId);
    setNote(expense.note);
  }, [expense]);

  const groups = getCategoriesByGroup();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) return;
    setSubmitting(true);
    try {
      await onSave(expense.id, { date, amount: num, categoryId, note: note.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
          <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">Edit expense</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 transition hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Date</label>
              <DatePickerInput value={date} onChange={setDate} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-surface-800 dark:text-surface-200">Category</label>
            <div className="max-h-40 space-y-3 overflow-y-auto rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-800">
              {Object.entries(groups).map(([groupName, cats]) => (
                <div key={groupName}>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-surface-500">
                    {groupName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {cats.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          categoryId === cat.id
                            ? 'border-accent bg-accent/10 text-accent-dark dark:bg-accent/20'
                            : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Lunch at café"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-dark disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-200 bg-white px-5 py-2.5 font-medium text-surface-700 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
