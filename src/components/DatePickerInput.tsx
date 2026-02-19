import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar, X, CalendarDays } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import 'react-day-picker/style.css';

const inputBase =
  'w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white';
const inputFocusGreen =
  'w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-surface-800 dark:bg-surface-800 dark:text-white';

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  /** Use green focus ring (e.g. for income forms) */
  accentGreen?: boolean;
  id?: string;
}

function toDate(str: string): Date | undefined {
  if (!str) return undefined;
  try {
    const d = parseISO(str);
    return isValid(d) ? d : undefined;
  } catch {
    return undefined;
  }
}

function toValue(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function DatePickerInput({
  value,
  onChange,
  required: isRequired = false,
  accentGreen = false,
  id,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDate = toDate(value);
  const today = new Date();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayValue = value ? format(parseISO(value), 'MM/dd/yyyy') : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 text-left ${accentGreen ? inputFocusGreen : inputBase}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Pick a date"
      >
        <Calendar className="h-4 w-4 shrink-0 text-surface-500" />
        <span className={value ? 'text-surface-900 dark:text-white' : 'text-surface-500'}>
          {displayValue || 'Select date'}
        </span>
      </button>

      {open && (
        <div
          className="date-picker-popover absolute left-0 top-full z-50 mt-2 rounded-2xl border border-surface-200 bg-white p-4 shadow-xl dark:border-surface-800 dark:bg-surface-900"
          role="dialog"
          aria-label="Calendar"
        >
          <div className="rdp-root date-picker-theme">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onChange(toValue(date));
                  setOpen(false);
                }
              }}
              defaultMonth={selectedDate ?? today}
              showOutsideDays
              classNames={{
                root: 'p-0',
                month: 'm-0',
                month_caption: 'flex items-center justify-between mb-3',
                nav: 'flex items-center gap-1',
                button_previous: 'rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
                button_next: 'rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
                caption_label: 'font-display text-base font-semibold text-surface-900 dark:text-white',
                weekdays: 'flex gap-1 mb-2',
                weekday: 'w-9 text-center text-xs font-medium text-surface-500 dark:text-surface-400',
                weeks: 'space-y-1',
                week: 'flex gap-1',
                day: 'w-9 h-9 flex items-center justify-center',
                day_button:
                  'w-9 h-9 rounded-full text-sm font-medium transition hover:bg-surface-100 dark:hover:bg-surface-800',
                selected: '!bg-accent !text-white hover:!bg-accent-dark dark:!bg-accent dark:!text-white',
                today: 'ring-2 ring-accent ring-offset-2 ring-offset-white dark:ring-offset-surface-900',
                outside: 'text-surface-400 dark:text-surface-500 opacity-50',
                disabled: 'opacity-40 cursor-not-allowed',
              }}
            />
          </div>
          <div className={`mt-3 flex items-center border-t border-surface-200 pt-3 dark:border-surface-800 ${isRequired ? 'justify-end' : 'justify-between'}`}>
            {!isRequired && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onChange(toValue(today));
                setOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              <CalendarDays className="h-4 w-4" />
              Today
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
