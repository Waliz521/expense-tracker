import { useState, useEffect } from 'react';
import { Database, X } from 'lucide-react';
import { useAuthOptional } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'expense-tracking-supabase-notice-seen';

export function FirstLoginDataNotice() {
  const auth = useAuthOptional();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !auth?.user?.id) {
      setVisible(false);
      return;
    }
    const key = `${STORAGE_KEY}-${auth.user.id}`;
    const seen = localStorage.getItem(key);
    setVisible(seen !== 'true');
  }, [auth?.user?.id]);

  function handleDismiss() {
    if (auth?.user?.id) {
      localStorage.setItem(`${STORAGE_KEY}-${auth.user.id}`, 'true');
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 dark:bg-accent/10">
      <Database className="h-5 w-5 shrink-0 text-accent" />
      <p className="flex-1 text-sm text-surface-700 dark:text-surface-300">
        Data is stored in the cloud (Supabase). Sign in on any device to see your expenses.
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1.5 text-surface-500 transition hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-300"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
