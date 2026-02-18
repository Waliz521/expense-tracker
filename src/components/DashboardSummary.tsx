import { TrendingUp, Calendar, Layers, PiggyBank } from 'lucide-react';
import type { CategorySummary } from '../types/expense';
import { getCategoryById } from '../lib/categories';
import { CategoryIcon } from './icons';

interface DashboardSummaryProps {
  total: number;
  savings: number;
  byCategory: CategorySummary[];
  monthLabel: string;
  formatCurrency: (n: number) => string;
}

export function DashboardSummary({ total, savings, byCategory, monthLabel, formatCurrency }: DashboardSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-3 dark:bg-accent/20">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total expenses</p>
            <p className="font-display text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
      {savings > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/10 p-3 dark:bg-green-500/20">
              <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Savings</p>
              <p className="font-display text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(savings)}</p>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-3 dark:bg-accent/20">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Period</p>
            <p className="font-display text-xl font-bold capitalize text-surface-900 dark:text-white">{monthLabel}</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-3 dark:bg-accent/20">
            <Layers className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Categories used</p>
            <p className="font-display text-2xl font-bold text-surface-900 dark:text-white">{byCategory.length}</p>
          </div>
        </div>
      </div>
    </div>
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
