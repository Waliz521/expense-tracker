import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { IncomeEntry } from '../lib/db';

const INCOME_SOURCES = [
  'Salary',
  'Office',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Gift',
  'Bonus',
  'Other',
];

interface EditIncomeModalProps {
  income: IncomeEntry;
  onSave: (id: string, updates: { date: string; amount: number; source: string; note: string }) => Promise<void>;
  onClose: () => void;
}

export function EditIncomeModal({ income, onSave, onClose }: EditIncomeModalProps) {
  const [date, setDate] = useState(income.date);
  const [amount, setAmount] = useState(income.amount.toString());
  const [source, setSource] = useState(income.source);
  const [note, setNote] = useState(income.note);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(income.date);
    setAmount(income.amount.toString());
    setSource(income.source);
    setNote(income.note);
  }, [income]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) return;
    setSaving(true);
    try {
      await onSave(income.id, { date, amount: num, source, note: note.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4 dark:border-surface-800">
          <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">Edit income</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-surface-400 transition hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-surface-800 dark:bg-surface-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-surface-800 dark:bg-surface-800 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-surface-800 dark:text-surface-200">Source</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INCOME_SOURCES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSource(src)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    source === src
                      ? 'border-green-600 bg-green-600/10 text-green-600 dark:bg-green-600/20'
                      : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300'
                  }`}
                >
                  <span className="text-xs font-semibold">Rs</span>
                  <span>{src}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-surface-800 dark:bg-surface-800 dark:text-white"
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving || !amount || parseFloat(amount) <= 0}
              className="flex-1 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
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
