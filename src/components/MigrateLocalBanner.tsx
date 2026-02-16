import { useState, useEffect } from 'react';
import { CloudUpload, Loader2, X } from 'lucide-react';
import { getAllExpensesDexie } from '../lib/dbDexie';
import { migrateLocalToSupabase } from '../lib/migrateLocalToSupabase';

interface MigrateLocalBannerProps {
  onDone: () => void;
}

export function MigrateLocalBanner({ onDone }: MigrateLocalBannerProps) {
  const [localCount, setLocalCount] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getAllExpensesDexie().then((list) => setLocalCount(list.length));
  }, []);

  async function handleTransfer() {
    setTransferring(true);
    const { transferred, error } = await migrateLocalToSupabase();
    setTransferring(false);
    if (error) {
      alert(`Transferred ${transferred} expenses. Error: ${error}`);
    }
    setLocalCount(0);
    onDone();
  }

  if (localCount === null || localCount === 0 || dismissed) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 dark:bg-accent/10">
      <div className="flex items-center gap-3">
        <CloudUpload className="h-5 w-5 text-accent" />
        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
          You have <strong>{localCount}</strong> expense{localCount !== 1 ? 's' : ''} stored only on this device.
          Transfer them to your cloud account?
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleTransfer}
          disabled={transferring}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
        >
          {transferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
          {transferring ? 'Transferring…' : 'Transfer to cloud'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-2 text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
