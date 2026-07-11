-- food_entries: one row per logged food / drink item.

create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null check (length(food_name) between 1 and 200),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null check (length(unit) between 1 and 20),
  calories numeric(10, 2) not null default 0 check (calories >= 0),
  protein_g numeric(10, 2) not null default 0 check (protein_g >= 0),
  carbs_g numeric(10, 2) not null default 0 check (carbs_g >= 0),
  fat_g numeric(10, 2) not null default 0 check (fat_g >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists food_entries_user_date_idx
  on public.food_entries (user_id, entry_date desc);

create trigger food_entries_set_updated_at
  before update on public.food_entries
  for each row execute function public.set_updated_at();

alter table public.food_entries enable row level security;

drop policy if exists "food_entries_select_own" on public.food_entries;
create policy "food_entries_select_own"
  on public.food_entries for select
  using (auth.uid() = user_id);

drop policy if exists "food_entries_insert_own" on public.food_entries;
create policy "food_entries_insert_own"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "food_entries_update_own" on public.food_entries;
create policy "food_entries_update_own"
  on public.food_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "food_entries_delete_own" on public.food_entries;
create policy "food_entries_delete_own"
  on public.food_entries for delete
  using (auth.uid() = user_id);
