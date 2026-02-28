import { useState, useMemo, useCallback } from 'react';
import { useExpenses, useMonthRange } from './hooks/useExpenses';
import { useIncome } from './hooks/useIncome';
import { usePreviousMonthNet } from './hooks/usePreviousMonthNet';
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
import { CarryOverBanner } from './components/CarryOverBanner';
import { ReportModal } from './components/ReportModal';
import { isSavingsCategory, getCategoryById } from './lib/categories';
import { getCarriedOverSourceLabel, isCarriedOverIncome } from './lib/carryOver';
import { FileText } from 'lucide-react';
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
  const { net: prevMonthNet, loading: prevMonthLoading, prevMonthLabel } = usePreviousMonthNet(year, month);

  const carriedOverAmount = useMemo(
    () => income.filter((i) => isCarriedOverIncome(i.source)).reduce((s, i) => s + i.amount, 0),
    [income]
  );

  const alreadyCarriedOverFromPrev = useMemo(
    () => income.some((i) => i.source === getCarriedOverSourceLabel(prevMonthLabel)),
    [income, prevMonthLabel]
  );

  const [reportOpen, setReportOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFiltersType>({
    categoryId: 'all',
    searchQuery: '',
    dateScopeFilter: 'today',
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

    // Filter by date scope (today = current date only, month = whole month)
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (filters.dateScopeFilter === 'today') {
      filtered = filtered.filter((e) => e.date === todayStr);
    } else if (filters.dateScopeFilter !== 'month' && filters.dateScopeFilter !== 'all') {
      // Specific month (YYYY-MM)
      filtered = filtered.filter((e) => {
        const [y, m] = e.date.split('-');
        return `${y}-${m}` === filters.dateScopeFilter;
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
  const firstDayOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;

  const handleCarryOver = useCallback(async () => {
    if (prevMonthNet == null || prevMonthNet <= 0) return;
    await addIncome({
      date: firstDayOfMonth,
      amount: prevMonthNet,
      source: getCarriedOverSourceLabel(prevMonthLabel),
      note: `Carried over from ${prevMonthLabel}`,
    });
  }, [addIncome, prevMonthNet, prevMonthLabel, firstDayOfMonth]);

  // When editing an expense and changing its date: switch month view if date moved to another month,
  // and switch to "This Month" filter so the updated expense stays visible
  const handleUpdateExpense = useCallback(
    async (
      id: string,
      updates: { date?: string; amount?: number; categoryId?: import('./lib/categories').CategoryId; note?: string }
    ) => {
      await updateExpense(id, updates);
      if (updates.date) {
        const [newYear, newMonth] = updates.date.split('-').map(Number);
        if (newYear !== year || newMonth !== month) {
          setMonth(newYear, newMonth);
        }
        if (filters.dateScopeFilter === 'today') {
          setFilters((f) => ({ ...f, dateScopeFilter: 'month' }));
        }
      }
    },
    [updateExpense, year, month, setMonth, filters.dateScopeFilter]
  );

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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Dashboard</h2>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
          </div>
          {!prevMonthLoading && (
            <CarryOverBanner
              amount={prevMonthNet ?? 0}
              fromMonth={prevMonthLabel}
              onCarryOver={handleCarryOver}
              alreadyCarriedOver={alreadyCarriedOverFromPrev}
              formatCurrency={formatCurrency}
            />
          )}
          <DashboardSummary
            total={total}
            savings={savings}
            income={incomeTotal}
            carriedOver={carriedOverAmount}
            formatCurrency={formatCurrency}
          />
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
          {reportOpen && (
            <ReportModal onClose={() => setReportOpen(false)} formatCurrency={formatCurrency} />
          )}
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
                <ExpenseList expenses={filteredExpenses} onEdit={handleUpdateExpense} onDelete={deleteExpense} formatCurrency={formatCurrency} />
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
