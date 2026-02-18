import { useState } from 'react';
import { Filter, X, Search, Calendar, DollarSign, Layers } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../lib/categories';
import type { CategoryId } from '../lib/categories';
import { CustomDropdown, type DropdownOption } from './CustomDropdown';
import { CategoryIcon } from './icons';
import { format, parseISO } from 'date-fns';

export interface ExpenseFilters {
  categoryId: CategoryId | 'all';
  searchQuery: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
  includeSavings: boolean;
  monthFilter: string | 'all'; // Format: 'YYYY-MM' or 'all'
}

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  expenseCount: number;
  totalAmount: number;
  formatCurrency: (n: number) => string;
  availableMonths: string[]; // Array of 'YYYY-MM' strings
}

export function ExpenseFilters({ filters, onFiltersChange, expenseCount, totalAmount, formatCurrency, availableMonths }: ExpenseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.categoryId !== 'all' ||
    filters.searchQuery !== '' ||
    filters.monthFilter !== 'all' ||
    filters.sortBy !== 'date' ||
    filters.sortOrder !== 'desc' ||
    !filters.includeSavings;

  const resetFilters = () => {
    onFiltersChange({
      categoryId: 'all',
      searchQuery: '',
      monthFilter: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      includeSavings: true,
    });
  };

  // Category dropdown options
  const categoryOptions: DropdownOption<CategoryId | 'all'>[] = [
    {
      value: 'all',
      label: 'All Categories',
      icon: <Layers className="h-4 w-4" />,
    },
    ...EXPENSE_CATEGORIES.map((cat) => ({
      value: cat.id as CategoryId,
      label: cat.label,
      icon: <CategoryIcon name={cat.icon} className="h-4 w-4" />,
    })),
  ];

  // Month filter options
  const monthOptions: DropdownOption<string>[] = [
    {
      value: 'all',
      label: 'All Months',
      icon: <Calendar className="h-4 w-4" />,
    },
    ...availableMonths.map((monthStr) => {
      const date = parseISO(`${monthStr}-01`);
      return {
        value: monthStr,
        label: format(date, 'MMMM yyyy'),
        icon: <Calendar className="h-4 w-4" />,
      };
    }),
  ];

  // Sort dropdown options
  const sortOptions: DropdownOption<string>[] = [
    {
      value: 'date-desc',
      label: 'Date (Newest)',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: 'date-asc',
      label: 'Date (Oldest)',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: 'amount-desc',
      label: 'Amount (High to Low)',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      value: 'amount-asc',
      label: 'Amount (Low to High)',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      value: 'category-asc',
      label: 'Category (A-Z)',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      value: 'category-desc',
      label: 'Category (Z-A)',
      icon: <Layers className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              isOpen || hasActiveFilters
                ? 'border-accent bg-accent/10 text-accent dark:bg-accent/20'
                : 'border-surface-200 bg-white text-surface-700 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                {expenseCount}
              </span>
            )}
          </button>

          {/* Category quick filter */}
          <div className="w-[200px]">
            <CustomDropdown
              options={categoryOptions}
              value={filters.categoryId}
              onChange={(value) => updateFilter('categoryId', value)}
            />
          </div>

          {/* Month filter */}
          {availableMonths.length > 0 && (
            <div className="w-[180px]">
              <CustomDropdown
                options={monthOptions}
                value={filters.monthFilter}
                onChange={(value) => updateFilter('monthFilter', value)}
              />
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by note..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full rounded-lg border border-surface-200 bg-white pl-10 pr-3 py-2 text-sm text-surface-700 placeholder:text-surface-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="w-[180px]">
          <CustomDropdown
            options={sortOptions}
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [ExpenseFilters['sortBy'], ExpenseFilters['sortOrder']];
              updateFilter('sortBy', sortBy);
              updateFilter('sortOrder', sortOrder);
            }}
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-600 transition hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {/* Total amount when category filter is applied */}
      {filters.categoryId !== 'all' && expenseCount > 0 && (
        <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 dark:bg-accent/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Total for {categoryOptions.find((opt) => opt.value === filters.categoryId)?.label}:
            </span>
            <span className="text-lg font-bold text-accent dark:text-accent-light">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      )}

      {/* Advanced filters panel */}
      {isOpen && (
        <div className="mt-3 rounded-lg border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
              <input
                type="checkbox"
                checked={filters.includeSavings}
                onChange={(e) => updateFilter('includeSavings', e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-accent focus:ring-accent"
              />
              <span>Include Savings & Investments</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
