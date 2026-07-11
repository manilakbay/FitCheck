-- weight_records: append-only log of the user's measured body weight.

create table if not exists public.weight_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5, 2) not null check (weight_kg between 20 and 500),
  recorded_on date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, recorded_on)
);

create index if not exists weight_records_user_recorded_idx
  on public.weight_records (user_id, recorded_on desc);

create trigger weight_records_set_updated_at
  before update on public.weight_records
  for each row execute function public.set_updated_at();

alter table public.weight_records enable row level security;

drop policy if exists "weight_records_select_own" on public.weight_records;
create policy "weight_records_select_own"
  on public.weight_records for select
  using (auth.uid() = user_id);

drop policy if exists "weight_records_insert_own" on public.weight_records;
create policy "weight_records_insert_own"
  on public.weight_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "weight_records_update_own" on public.weight_records;
create policy "weight_records_update_own"
  on public.weight_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "weight_records_delete_own" on public.weight_records;
create policy "weight_records_delete_own"
  on public.weight_records for delete
  using (auth.uid() = user_id);
