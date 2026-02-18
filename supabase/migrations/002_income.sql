-- Expense Tracker: income table with RLS
create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric not null check (amount >= 0),
  source text not null,
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists income_user_date_idx on public.income (user_id, date);

alter table public.income enable row level security;

create policy "Users can manage own income"
  on public.income
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
