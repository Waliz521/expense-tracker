import { useState } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { DatePickerInput } from './DatePickerInput';
import { format, subMonths } from 'date-fns';
import { getExpensesByDateRange, getIncomeByDateRange } from '../lib/db';
import { generateReportPdf } from '../lib/reportPdf';

interface ReportModalProps {
  onClose: () => void;
  formatCurrency: (n: number) => string;
}

export function ReportModal({ onClose, formatCurrency }: ReportModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultFrom = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (from > to) {
      setError('From date must be before or equal to To date');
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const [income, expenses] = await Promise.all([
        getIncomeByDateRange(from, to),
        getExpensesByDateRange(from, to),
      ]);
      await generateReportPdf(from, to, income, expenses, formatCurrency);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative my-auto w-full max-w-md animate-slide-up rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">Generate Report</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 transition hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="mb-4 text-sm text-surface-600 dark:text-surface-400">
            Select a date range for your report. Dates are not limited to month boundaries.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">From</label>
              <DatePickerInput value={from} onChange={setFrom} required placement="top" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-800 dark:text-surface-200">To</label>
              <DatePickerInput value={to} onChange={setTo} required placement="top" />
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-dark disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 font-medium text-surface-700 transition hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
