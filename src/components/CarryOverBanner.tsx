import { ArrowRightCircle } from 'lucide-react';

interface CarryOverBannerProps {
  /** Positive amount available to carry from previous month (first-time flow only). */
  amount: number;
  fromMonth: string;
  onCarryOver: () => Promise<void>;
  /** When true, first-time banner is hidden — carry-over already recorded for this month. */
  alreadyCarriedOver: boolean;
  formatCurrency: (n: number) => string;
  busy?: boolean;
}

/** Explains carry-over only before the user adds it for the first time this month. */
export function CarryOverBanner({
  amount,
  fromMonth,
  onCarryOver,
  alreadyCarriedOver,
  formatCurrency,
  busy,
}: CarryOverBannerProps) {
  if (alreadyCarriedOver || amount <= 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/50">
            <ArrowRightCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              {formatCurrency(amount)} remaining from {fromMonth}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Carry over to this month&apos;s income? (Not counted as savings)
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onCarryOver()}
          className="rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          Carry over
        </button>
      </div>
    </div>
  );
}
