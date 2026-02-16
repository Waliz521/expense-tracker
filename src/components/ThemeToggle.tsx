import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-surface-200 bg-surface-50 p-1 dark:border-surface-800 dark:bg-surface-800">
      <button
        type="button"
        onClick={() => setMode('light')}
        title="Light"
        className={`rounded-lg p-2 transition ${
          mode === 'light'
            ? 'bg-white text-amber-600 shadow-sm dark:bg-surface-700 dark:text-amber-400'
            : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
        }`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setMode('dark')}
        title="Dark"
        className={`rounded-lg p-2 transition ${
          mode === 'dark'
            ? 'bg-surface-800 text-indigo-400 shadow-sm dark:bg-surface-700 dark:text-indigo-400'
            : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
        }`}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setMode('system')}
        title="System"
        className={`rounded-lg p-2 transition ${
          mode === 'system'
            ? 'bg-white text-surface-700 shadow-sm dark:bg-surface-700 dark:text-surface-200'
            : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
        }`}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
