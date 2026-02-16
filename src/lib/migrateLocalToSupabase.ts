import { getAllExpensesDexie, clearAllExpensesDexie } from './dbDexie';
import { addExpenseSupabase } from './dbSupabase';

/**
 * Copy all expenses from IndexedDB (Dexie) to Supabase.
 * Call when user is signed in. Clears local data after successful transfer.
 */
export async function migrateLocalToSupabase(): Promise<{ transferred: number; error?: string }> {
  const local = await getAllExpensesDexie();
  if (local.length === 0) return { transferred: 0 };

  let transferred = 0;
  try {
    for (const e of local) {
      await addExpenseSupabase({
        date: e.date,
        amount: e.amount,
        categoryId: e.categoryId,
        note: e.note,
      });
      transferred++;
    }
    await clearAllExpensesDexie();
  } catch (err) {
    return {
      transferred,
      error: err instanceof Error ? err.message : 'Transfer failed',
    };
  }
  return { transferred };
}
