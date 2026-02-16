import { useExpenses, useMonthRange } from './hooks/useExpenses';
import { useMonthSummary } from './hooks/useMonthSummary';
import { useAuthOptional } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { Layout } from './components/Layout';
import { AddExpense } from './components/AddExpense';
import { ExpenseList } from './components/ExpenseList';
import { DashboardSummary, CategoryBreakdownTable } from './components/DashboardSummary';
import { DashboardCharts } from './components/DashboardCharts';
import { AuthScreen } from './components/AuthScreen';
import { MigrateLocalBanner } from './components/MigrateLocalBanner';
import { format } from 'date-fns';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function App() {
  const auth = useAuthOptional();
  const { year, month, setMonth, label } = useMonthRange();
  const { expenses, loading, addExpense, updateExpense, deleteExpense, refresh } = useExpenses(year, month);
  const { total, byCategory, daily } = useMonthSummary(expenses);

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
          <DashboardSummary total={total} byCategory={byCategory} monthLabel={label} formatCurrency={formatCurrency} />
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

        {/* Add expense + List */}
        <section className="animate-fade-in">
          <h2 className="mb-4 font-display text-lg font-bold text-surface-900 dark:text-white">Expenses</h2>
          <div className="mb-6">
            <AddExpense defaultDate={defaultDate} onAdd={addExpense} />
          </div>
          {loading ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
              Loading…
            </div>
          ) : (
            <ExpenseList expenses={expenses} onEdit={updateExpense} onDelete={deleteExpense} formatCurrency={formatCurrency} />
          )}
        </section>
      </div>
    </Layout>
  );
}
