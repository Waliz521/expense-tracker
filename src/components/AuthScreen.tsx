import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    if (isSignUp) setMessage({ type: 'success', text: 'Check your email to confirm your account.' });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4 dark:bg-surface-900">
      <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-xl dark:border-surface-800 dark:bg-surface-900 sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="rounded-xl bg-accent p-3 text-white shadow-lg shadow-accent/20">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-center font-display text-xl font-bold text-surface-900 dark:text-white">
          Expense Tracker
        </h1>
        <p className="mt-1 text-center text-sm text-surface-500 dark:text-surface-400">
          {isSignUp ? 'Create an account' : 'Sign in to continue'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-surface-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-800 dark:text-white"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.type === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsSignUp((v) => !v)}
          className="mt-4 w-full text-center text-sm text-surface-500 underline hover:text-surface-700 dark:hover:text-surface-400"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
