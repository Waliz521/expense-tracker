-- Per-expense opt-out from the daily spending bar chart
alter table public.expenses
  add column if not exists exclude_from_daily_chart boolean not null default false;
