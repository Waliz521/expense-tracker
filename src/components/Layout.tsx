import { useState } from 'react';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { MonthPicker } from './MonthPicker';
import { ThemeToggle } from './ThemeToggle';
import { useAuthOptional } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { FirstLoginDataNotice } from './FirstLoginDataNotice';

interface LayoutProps {
  children: React.ReactNode;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function Layout({ children, year, month, onMonthChange }: LayoutProps) {
  const auth = useAuthOptional();
  const showSignOut = isSupabaseConfigured && auth?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navControls = (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-900 font-sans text-surface-900 dark:text-surface-100">
      <header className="sticky top-0 z-10 border-b border-surface-200 bg-white/90 backdrop-blur dark:border-surface-800 dark:bg-surface-900/90">
        <div className="mx-auto max-w-6xl px-4 py-4">
          {/* Top row: logo + title + menu (mobile) or controls (desktop) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent p-2.5 text-white shadow-lg shadow-accent/20">
                <Wallet className="h-7 w-7" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">
                Expense Tracking
              </h1>
            </div>
            {/* Desktop: show controls inline */}
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              {navControls}
            </div>
            {/* Mobile: menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {/* Mobile: navbar dropdown */}
          {mobileMenuOpen && (
            <nav className="mt-3 flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-800 md:hidden">
              {/* Month Section */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 text-center">Month</span>
                <div className="flex justify-center">
                  <MonthPicker year={year} month={month} onMonthChange={onMonthChange} />
                </div>
              </div>
              
              {/* Theme and Sign Out in Single Row */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 text-center">Theme</span>
                <div className="flex items-center justify-center gap-3">
                  <ThemeToggle />
                  {showSignOut && (
                    <button
                      type="button"
                      onClick={() => { auth?.signOut(); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-700 whitespace-nowrap"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Sign out</span>
                    </button>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <FirstLoginDataNotice />
        {children}
      </main>
    </div>
  );
}
