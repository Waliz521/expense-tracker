-- Allow marking expenses as paid from savings (withdrawal from savings pool)
alter table public.expenses
  add column if not exists paid_from_savings boolean not null default false;
