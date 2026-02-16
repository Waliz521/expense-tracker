import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';

interface MonthPickerProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function MonthPicker({ year, month, onMonthChange }: MonthPickerProps) {
  const current = new Date(year, month - 1);
  const prev = subMonths(current, 1);
  const next = addMonths(current, 1);
  const isCurrentMonth =
    current.getFullYear() === new Date().getFullYear() && current.getMonth() === new Date().getMonth();

  return (
    <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-2 py-1.5 dark:border-surface-800 dark:bg-surface-900">
      <button
        type="button"
        onClick={() => onMonthChange(prev.getFullYear(), prev.getMonth() + 1)}
        className="rounded-lg p-2 text-surface-600 transition hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="min-w-[140px] text-center font-display font-semibold text-surface-900 dark:text-white">
        {format(current, 'MMMM yyyy')}
      </span>
      <button
        type="button"
        onClick={() => onMonthChange(next.getFullYear(), next.getMonth() + 1)}
        disabled={isCurrentMonth}
        className="rounded-lg p-2 text-surface-600 transition hover:bg-surface-100 hover:text-surface-900 disabled:opacity-50 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
