import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

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

interface AddIncomeProps {
  defaultDate: string;
  onAdd: (entry: { date: string; amount: number; source: string; note: string }) => Promise<unknown>;
}

export function AddIncome({ defaultDate, onAdd }: AddIncomeProps) {
  const [date, setDate] = useState(defaultDate);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(INCOME_SOURCES[0]);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) return;
    setSubmitting(true);
    try {
      await onAdd({ date, amount: num, source, note: note.trim() });
      setAmount('');
      setNote('');
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-surface-100"
        >
          <Plus className="h-5 w-5" />
          Add income
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up rounded-2xl border border-surface-200 bg-white p-5 shadow-xl dark:border-surface-800 dark:bg-surface-900 sm:p-6"
        >
          <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">New income</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
              />
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
              placeholder="e.g. Monthly salary"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-surface-200 bg-white px-5 py-2.5 font-medium text-surface-700 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
