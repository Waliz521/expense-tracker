import { Wallet, Database, LogOut } from 'lucide-react';
import { MonthPicker } from './MonthPicker';
import { ThemeToggle } from './ThemeToggle';
import { useAuthOptional } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function Layout({ children, year, month, onMonthChange }: LayoutProps) {
  const auth = useAuthOptional();
  const showSignOut = isSupabaseConfigured && auth?.user;

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-900 font-sans text-surface-900 dark:text-surface-100">
      <header className="sticky top-0 z-10 border-b border-surface-200 bg-white/90 backdrop-blur dark:border-surface-800 dark:bg-surface-900/90">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent p-2.5 text-white shadow-lg shadow-accent/20">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">
                  Expense Tracker
                </h1>
                <p className="text-xs text-surface-500 dark:text-surface-400">Monthly overview</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MonthPicker year={year} month={month} onMonthChange={onMonthChange} />
              <ThemeToggle />
              {showSignOut && (
                <button
                  type="button"
                  onClick={() => auth?.signOut()}
                  className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <Database className="h-3.5 w-3.5 shrink-0" />
            {isSupabaseConfigured
              ? 'Data is stored in the cloud (Supabase). Sign in on any device to see your expenses.'
              : 'Data is stored locally in this browser (IndexedDB). Same device & browser = your data stays.'}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
