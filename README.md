# Expense Tracking

A responsive app for tracking monthly expenses. Add expenses by date, amount, and category; view a dashboard with spending by category (pie chart), daily spending (bar chart), and a category breakdown. Supports local-only storage (IndexedDB) or cloud storage and sign-in via Supabase.

## What it does

- **Track expenses** — Add, edit, and delete expenses with date, amount, category, and optional note.
- **Categories** — 19 categories in 5 groups (Living, Transport, Lifestyle, Health, Other), e.g. Housing, Food & Dining, Gym, Repairs & Maintenance.
- **Dashboard** — Total spent, categories used, pie chart by category, bar chart for daily spending, and a category breakdown table.
- **Data** — Use the app with **IndexedDB** only (no account), or with **Supabase** (sign in, data in the cloud).
- **UI** — Responsive layout, light/dark theme toggle, mobile-friendly navbar.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** — styling and layout
- **Recharts** — pie and bar charts
- **date-fns** — dates
- **lucide-react** — icons
- **Dexie.js** — IndexedDB (local storage)
- **Supabase** (optional) — PostgreSQL and Auth for cloud storage

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Use **PKR** as the currency (configurable in `src/App.tsx`).
