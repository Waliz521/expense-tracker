# Expense Tracker — Monthly Overview

A responsive monthly expense tracking app with a rich dashboard, categories, and optional cloud database (Supabase) or local-only storage (IndexedDB).

## Features

- **Categories** — 19 categories in 5 groups (Living, Transport, Lifestyle, Health, Other), including Gym, Repairs & Maintenance
- **Dashboard** — Total spent, period, categories used; pie chart by category; bar chart for daily spending; category breakdown table
- **Daily entry** — Add, edit, delete expenses (date, amount, category, note)
- **Data** — Use **IndexedDB** (browser-only, no setup) or **Supabase** (PostgreSQL in the cloud, sign in on any device)
- **Responsive** — Works on mobile and desktop; light/dark theme toggle

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS**, **Recharts**, **date-fns**, **lucide-react**
- **Dexie.js** — IndexedDB (local storage)
- **Supabase** (optional) — PostgreSQL + Auth for cloud storage and deployment

## Quick start (local only)

```bash
npm install
npm run dev
```

Open http://localhost:5173. Data is stored in your browser (IndexedDB); no account or backend required.

---

## Cloud database + deploy (Supabase)

Use this when you want a **solid database** and to **deploy the app** so you can use it from any device.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name, database password, region.
3. Wait for the project to be ready.

### 2. Create the table and RLS

In the Supabase dashboard: **SQL Editor** → **New query**, paste and run:

```sql
-- From supabase/migrations/001_expenses.sql
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric not null check (amount >= 0),
  category_id text not null,
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date);

alter table public.expenses enable row level security;

create policy "Users can manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 3. Get API keys and configure the app

1. In Supabase: **Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. In the project root, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Edit `.env` and set:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

5. Restart the dev server: `npm run dev`. You should see a **Sign in / Sign up** screen. Create an account and use the app; data is now stored in Supabase.

### 4. Deploy the app

Deploy the frontend to **Vercel**, **Netlify**, or **Cloudflare Pages** so the app is available online.

**Vercel (example):**

1. Push the project to GitHub (ensure `.env` is **not** committed; it’s in `.gitignore`).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
3. **Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as in your `.env`.
4. Deploy. Your expense tracker will be live; users sign in and data is stored in your Supabase database.

**Netlify / Cloudflare Pages:** Same idea — build command `npm run build`, publish `dist/`, and set the two `VITE_*` env vars in the dashboard.

### Summary

| Mode              | When to use                         | Data location        |
|-------------------|-------------------------------------|----------------------|
| No `.env` / no Supabase | Local use, no account               | Browser (IndexedDB)  |
| `.env` with Supabase   | Cloud DB + deploy + use on any device | Supabase (PostgreSQL) |

---

## Security

- **Do not commit `.env`** — It contains your Supabase URL and anon key. `.env` is in `.gitignore`; keep it that way.
- **Use `.env.example`** as a template (no real values). On deploy (Vercel, Netlify, etc.), set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the dashboard, not in the repo.
- The **anon key** is meant for browser use; Row Level Security (RLS) in Supabase restricts data per user. Never commit the **service_role** key.

---

## Scripts

- `npm run dev` — start dev server
- `npm run build` — build for production (`dist/`)
- `npm run preview` — serve the production build locally

## Currency

The app uses **PKR** (Pakistani Rupee). You can change this in `src/App.tsx` (`formatCurrency`).
