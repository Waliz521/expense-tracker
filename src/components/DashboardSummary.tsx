import { useState } from 'react';
import { TrendingUp, Layers, PiggyBank, ChevronDown, X } from 'lucide-react';
import type { CategorySummary } from '../types/expense';
import { getCategoryById } from '../lib/categories';
import { CategoryIcon } from './icons';
import { useYearWealth, type WealthKind } from '../hooks/useYearSavings';

interface DashboardSummaryProps {
  year: number;
  total: number;
  savings: number;
  investments: number;
  income: number;
  carriedOver?: number;
  formatCurrency: (n: number) => string;
}

const WEALTH_META: Record<WealthKind, { title: string; subtitle: string; empty: string; color: string }> = {
  savings: {
    title: 'Savings',
    subtitle: 'Total from Savings expenses this year',
    empty: 'No savings recorded for {year} yet.',
    color: 'text-green-600 dark:text-green-400',
  },
  investments: {
    title: 'Investments',
    subtitle: 'Total from Investments expenses this year',
    empty: 'No investments recorded for {year} yet.',
    color: 'text-blue-600 dark:text-blue-400',
  },
};

function YearWealthModal({
  year,
  kind,
  formatCurrency,
  onClose,
}: {
  year: number;
  kind: WealthKind;
  formatCurrency: (n: number) => string;
  onClose: () => void;
}) {
  const { yearTotal, byMonth, loading } = useYearWealth(year, kind, true);
  const meta = WEALTH_META[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`year-${kind}-title`}
        className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-800 dark:bg-surface-900"
      >
        <div className="flex items-start justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
          <div>
            <h3 id={`year-${kind}-title`} className="font-display text-lg font-bold text-surface-900 dark:text-white">
              {meta.title} in {year}
            </h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{meta.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-surface-500 transition hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">
          {loading ? (
            <p className="py-6 text-center text-sm text-surface-500">Loading…</p>
          ) : (
            <>
              <p className={`font-display text-3xl font-bold ${meta.color}`}>{formatCurrency(yearTotal)}</p>
              {byMonth.length > 0 ? (
                <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
                  {byMonth.map((m) => (
                    <li
                      key={m.month}
                      className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 text-sm dark:bg-surface-800"
                    >
                      <span className="font-medium text-surface-700 dark:text-surface-300">{m.label}</span>
                      <span className={`font-semibold ${meta.color}`}>{formatCurrency(m.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
                  {meta.empty.replace('{year}', String(year))}
                </p>
              )}
            </>
          )}
        </div>
        <div className="border-t border-surface-200 px-5 py-4 dark:border-surface-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-surface-200 bg-white px-5 py-2.5 font-medium text-surface-700 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardSummary({
  year,
  total,
  savings,
  investments,
  income,
  carriedOver = 0,
  formatCurrency,
}: DashboardSummaryProps) {
  const [yearModal, setYearModal] = useState<WealthKind | null>(null);
  const netAmount = income - total - savings - investments;

  const cardClass =
    'min-w-0 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-5';
  const amountClass = 'font-display text-lg font-bold leading-tight sm:text-xl lg:text-2xl';

  return (
    <>
      <div className="space-y-4">
        {/* Primary metrics — 3 columns on large screens */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-green-500/10 p-2.5 dark:bg-green-500/20 sm:p-3">
                <span className="text-lg font-bold text-green-600 dark:text-green-400 sm:text-xl">Rs</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Income</p>
                <p className={`${amountClass} text-green-600 dark:text-green-400`}>{formatCurrency(income)}</p>
                {carriedOver > 0 && (
                  <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                    incl. {formatCurrency(carriedOver)} from previous month
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-accent/10 p-2.5 dark:bg-accent/20 sm:p-3">
                <TrendingUp className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total expenses</p>
                <p className={`${amountClass} text-surface-900 dark:text-white`}>{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
          <div className={`${cardClass} sm:col-span-2 lg:col-span-1`}>
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 rounded-xl p-2.5 sm:p-3 ${netAmount >= 0 ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-red-500/10 dark:bg-red-500/20'}`}
              >
                <Layers
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Net</p>
                <p className={`${amountClass} ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(netAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings & investments — own row so cards are not squeezed */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-green-500/10 p-2.5 dark:bg-green-500/20 sm:p-3">
                <PiggyBank className="h-5 w-5 text-green-600 dark:text-green-400 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Savings</p>
                <p className={`${amountClass} text-green-600 dark:text-green-400`}>{formatCurrency(savings)}</p>
                <button
                  type="button"
                  onClick={() => setYearModal('savings')}
                  className="mt-1 flex items-center gap-0.5 text-xs font-medium text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  View {year} total
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl bg-blue-500/10 p-2.5 dark:bg-blue-500/20 sm:p-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Investments</p>
                <p className={`${amountClass} text-blue-600 dark:text-blue-400`}>{formatCurrency(investments)}</p>
                <button
                  type="button"
                  onClick={() => setYearModal('investments')}
                  className="mt-1 flex items-center gap-0.5 text-xs font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View {year} total
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {yearModal && (
        <YearWealthModal
          year={year}
          kind={yearModal}
          formatCurrency={formatCurrency}
          onClose={() => setYearModal(null)}
        />
      )}
    </>
  );
}

export function CategoryBreakdownTable({
  byCategory,
  formatCurrency,
}: {
  byCategory: CategorySummary[];
  formatCurrency: (n: number) => string;
}) {
  if (byCategory.length === 0) return null;

  return (
    <div className="rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-surface-800 dark:bg-surface-900 overflow-hidden">
      <h3 className="border-b border-surface-200 bg-surface-50 px-4 py-3 font-display text-base font-bold text-surface-900 dark:border-surface-800 dark:bg-surface-800 dark:text-white">
        Category breakdown
      </h3>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50/80 dark:border-surface-800 dark:bg-surface-800/80">
              <th className="px-4 py-2 font-semibold text-surface-700 dark:text-surface-300">Category</th>
              <th className="px-4 py-2 text-right font-semibold text-surface-700 dark:text-surface-300">Amount</th>
              <th className="px-4 py-2 text-right font-semibold text-surface-700 dark:text-surface-300">Share</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map((c) => {
              const cat = getCategoryById(c.categoryId);
              return (
                <tr key={c.categoryId} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} className="h-4 w-4 text-accent" />
                      {cat.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-surface-900 dark:text-white">
                    {formatCurrency(c.total)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-surface-600 dark:text-surface-400">
                    {c.percentage.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
