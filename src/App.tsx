import { useState, useMemo } from 'react';
import { useExpenses, useMonthRange } from './hooks/useExpenses';
import { useIncome } from './hooks/useIncome';
import { useIncomeSummary } from './hooks/useIncomeSummary';
import { useMonthSummary } from './hooks/useMonthSummary';
import { useAuthOptional } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { Layout } from './components/Layout';
import { AddExpense } from './components/AddExpense';
import { AddIncome } from './components/AddIncome';
import { ExpenseList } from './components/ExpenseList';
import { IncomeList } from './components/IncomeList';
import { DashboardSummary, CategoryBreakdownTable } from './components/DashboardSummary';
import { DashboardCharts } from './components/DashboardCharts';
import { AuthScreen } from './components/AuthScreen';
import { MigrateLocalBanner } from './components/MigrateLocalBanner';
import { ExpenseFilters, type ExpenseFilters as ExpenseFiltersType } from './components/ExpenseFilters';
import { isSavingsCategory, getCategoryById } from './lib/categories';
import { format } from 'date-fns';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function App() {
  const auth = useAuthOptional();
  const { year, month, setMonth } = useMonthRange();
  const { expenses, loading, addExpense, updateExpense, deleteExpense, refresh } = useExpenses(year, month);
  const { income, loading: incomeLoading, addIncome, updateIncome, deleteIncome } = useIncome(year, month);
  const { total, savings, byCategory, daily } = useMonthSummary(expenses);
  const { total: incomeTotal } = useIncomeSummary(income);

  const [filters, setFilters] = useState<ExpenseFiltersType>({
    categoryId: 'all',
    searchQuery: '',
    monthFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    includeSavings: true,
  });

  // Get available months from expenses
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    expenses.forEach((e) => {
      const [year, month] = e.date.split('-');
      monthSet.add(`${year}-${month}`);
    });
    return Array.from(monthSet).sort().reverse(); // Most recent first
  }, [expenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Filter by savings inclusion
    if (!filters.includeSavings) {
      filtered = filtered.filter((e) => !isSavingsCategory(e.categoryId));
    }

    // Filter by month
    if (filters.monthFilter !== 'all') {
      filtered = filtered.filter((e) => {
        const [year, month] = e.date.split('-');
        return `${year}-${month}` === filters.monthFilter;
      });
    }

    // Filter by category
    if (filters.categoryId !== 'all') {
      filtered = filtered.filter((e) => e.categoryId === filters.categoryId);
    }

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.note.toLowerCase().includes(query));
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          const catA = getCategoryById(a.categoryId).label;
          const catB = getCategoryById(b.categoryId).label;
          comparison = catA.localeCompare(catB);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, filters]);

  // Calculate total amount for filtered expenses
  const filteredTotalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const defaultDate = format(new Date(), 'yyyy-MM-dd');

  const requireAuth = isSupabaseConfigured && auth && !auth.user && !auth.loading;
  if (requireAuth) return <AuthScreen />;
  if (auth?.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-100 dark:bg-surface-900">
        <p className="text-surface-500">Loading…</p>
      </div>
    );
  }

  return (
    <Layout year={year} month={month} onMonthChange={setMonth}>
      <div className="space-y-8">
        {isSupabaseConfigured && auth?.user && (
          <MigrateLocalBanner onDone={refresh} />
        )}
        {/* Dashboard */}
        <section className="animate-fade-in">
          <h2 className="mb-4 font-display text-lg font-bold text-surface-900 dark:text-white">Dashboard</h2>
          <DashboardSummary total={total} savings={savings} income={incomeTotal} formatCurrency={formatCurrency} />
          <div className="mt-6">
            <DashboardCharts
              byCategory={byCategory}
              daily={daily}
              total={total}
              formatCurrency={formatCurrency}
            />
          </div>
          <div className="mt-6">
            <CategoryBreakdownTable byCategory={byCategory} formatCurrency={formatCurrency} />
          </div>
        </section>

        {/* Income & Expenses Section */}
        <section className="animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Transactions</h2>
            <div className="flex flex-wrap items-center gap-3">
              <AddIncome defaultDate={defaultDate} onAdd={addIncome} />
              <AddExpense defaultDate={defaultDate} onAdd={addExpense} />
            </div>
          </div>

          {/* Income List */}
          <div className="mb-8">
            <h3 className="mb-4 font-display text-base font-semibold text-surface-700 dark:text-surface-300">Income</h3>
            {incomeLoading ? (
              <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
                Loading…
              </div>
            ) : (
              <IncomeList income={income} onEdit={updateIncome} onDelete={deleteIncome} formatCurrency={formatCurrency} />
            )}
          </div>

          {/* Expenses List */}
          <div>
            <h3 className="mb-4 font-display text-base font-semibold text-surface-700 dark:text-surface-300">Expenses</h3>
            {loading ? (
              <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
                Loading…
              </div>
            ) : (
              <>
                <ExpenseFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  expenseCount={filteredExpenses.length}
                  totalAmount={filteredTotalAmount}
                  formatCurrency={formatCurrency}
                  availableMonths={availableMonths}
                />
                <ExpenseList expenses={filteredExpenses} onEdit={updateExpense} onDelete={deleteExpense} formatCurrency={formatCurrency} />
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
