import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { getCategoriesByGroup, isWealthCategory } from '../lib/categories';
import { CategoryIcon } from './icons';
import { DatePickerInput } from './DatePickerInput';
import type { CategoryId } from '../lib/categories';

interface AddExpenseProps {
  defaultDate: string;
  onAdd: (entry: {
    date: string;
    amount: number;
    categoryId: CategoryId;
    note: string;
    paidFromSavings?: boolean;
    excludeFromDailyChart?: boolean;
  }) => Promise<unknown>;
}

export function AddExpense({ defaultDate, onAdd }: AddExpenseProps) {
  const [date, setDate] = useState(defaultDate);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('food_dining');
  const [note, setNote] = useState('');
  const [paidFromSavings, setPaidFromSavings] = useState(false);
  const [excludeFromDailyChart, setExcludeFromDailyChart] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const groups = getCategoriesByGroup();
  const wealthCategory = isWealthCategory(categoryId);

  useEffect(() => {
    if (wealthCategory) {
      setPaidFromSavings(false);
      setExcludeFromDailyChart(false);
    }
  }, [wealthCategory]);

  function handlePaidFromSavingsChange(checked: boolean) {
    setPaidFromSavings(checked);
    if (checked) setExcludeFromDailyChart(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) return;
    setSubmitting(true);
    try {
      await onAdd({
        date,
        amount: num,
        categoryId,
        note: note.trim(),
        paidFromSavings: wealthCategory ? false : paidFromSavings,
        excludeFromDailyChart: wealthCategory ? false : excludeFromDailyChart,
      });
      setAmount('');
      setNote('');
      setPaidFromSavings(false);
      setExcludeFromDailyChart(false);
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
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-100"
        >
          <Plus className="h-5 w-5" />
          Add expense
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up rounded-2xl border border-surface-200 bg-white p-5 shadow-xl dark:border-surface-800 dark:bg-surface-900 sm:p-6"
        >
          <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">New expense</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <div className="max-h-48 space-y-3 overflow-y-auto rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-800 dark:bg-surface-800">
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
          {!wealthCategory && (
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 px-3 py-3 dark:border-surface-800 dark:bg-surface-800">
                <input
                  type="checkbox"
                  checked={paidFromSavings}
                  onChange={(e) => handlePaidFromSavingsChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-surface-300 text-accent focus:ring-accent"
                />
                <span>
                  <span className="block text-sm font-medium text-surface-800 dark:text-surface-200">Paid from savings</span>
                  <span className="mt-0.5 block text-xs text-surface-500 dark:text-surface-400">
                    Counts in your spending but won&apos;t reduce net again — it comes from your savings pool.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 px-3 py-3 dark:border-surface-800 dark:bg-surface-800">
                <input
                  type="checkbox"
                  checked={excludeFromDailyChart}
                  onChange={(e) => setExcludeFromDailyChart(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-surface-300 text-accent focus:ring-accent"
                />
                <span>
                  <span className="block text-sm font-medium text-surface-800 dark:text-surface-200">Exclude from daily chart</span>
                  <span className="mt-0.5 block text-xs text-surface-500 dark:text-surface-400">
                    Still counts in totals and category breakdown — hidden from the daily bar chart only.
                  </span>
                </span>
              </label>
            </div>
          )}
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
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark disabled:opacity-50"
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
