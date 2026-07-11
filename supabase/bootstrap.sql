-- FitTrack AI — one-shot bootstrap SQL.
-- Paste the entire contents of this file into the Supabase SQL editor and click Run.
-- Idempotent: safe to re-run any time (uses IF NOT EXISTS / DROP IF EXISTS / OR REPLACE).

-- =====================================================================
-- Section 1 — Shared helpers
-- =====================================================================

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =====================================================================
-- Section 2 — profiles table (1:1 with auth.users)
-- =====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer check (age is null or (age between 10 and 120)),
  gender text check (gender is null or gender in ('male', 'female', 'other')),
  height_cm numeric(5, 2) check (height_cm is null or (height_cm between 50 and 272)),
  weight_kg numeric(5, 2) check (weight_kg is null or (weight_kg between 20 and 500)),
  activity_level text check (
    activity_level is null
    or activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  goal text check (
    goal is null
    or goal in ('lose_weight', 'maintain_weight', 'gain_weight', 'gain_muscle')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- =====================================================================
-- Section 3 — weight_records table
-- =====================================================================

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

drop trigger if exists weight_records_set_updated_at on public.weight_records;
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

-- =====================================================================
-- Section 4 — food_entries table
-- =====================================================================

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

drop trigger if exists food_entries_set_updated_at on public.food_entries;
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

-- =====================================================================
-- Section 5 — activity_entries table
-- =====================================================================

create table if not exists public.activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  activity_type text not null check (
    activity_type in (
      'walking', 'running', 'swimming', 'cycling', 'weight_training', 'other'
    )
  ),
  duration_min integer not null check (duration_min > 0 and duration_min <= 1440),
  distance_km numeric(6, 2) check (distance_km is null or distance_km >= 0),
  intensity text not null check (intensity in ('low', 'moderate', 'high')),
  calories_burned numeric(10, 2) not null default 0 check (calories_burned >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists activity_entries_user_date_idx
  on public.activity_entries (user_id, entry_date desc);

drop trigger if exists activity_entries_set_updated_at on public.activity_entries;
create trigger activity_entries_set_updated_at
  before update on public.activity_entries
  for each row execute function public.set_updated_at();

alter table public.activity_entries enable row level security;

drop policy if exists "activity_entries_select_own" on public.activity_entries;
create policy "activity_entries_select_own"
  on public.activity_entries for select
  using (auth.uid() = user_id);

drop policy if exists "activity_entries_insert_own" on public.activity_entries;
create policy "activity_entries_insert_own"
  on public.activity_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "activity_entries_update_own" on public.activity_entries;
create policy "activity_entries_update_own"
  on public.activity_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "activity_entries_delete_own" on public.activity_entries;
create policy "activity_entries_delete_own"
  on public.activity_entries for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- Section 6 — daily_goals table
-- =====================================================================

create table if not exists public.daily_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calorie_target numeric(10, 2) not null default 2000 check (calorie_target >= 0),
  protein_target_g numeric(10, 2) not null default 100 check (protein_target_g >= 0),
  carbs_target_g numeric(10, 2) not null default 250 check (carbs_target_g >= 0),
  fat_target_g numeric(10, 2) not null default 70 check (fat_target_g >= 0),
  goal_weight_kg numeric(5, 2) check (goal_weight_kg is null or goal_weight_kg between 20 and 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists daily_goals_set_updated_at on public.daily_goals;
create trigger daily_goals_set_updated_at
  before update on public.daily_goals
  for each row execute function public.set_updated_at();

alter table public.daily_goals enable row level security;

drop policy if exists "daily_goals_select_own" on public.daily_goals;
create policy "daily_goals_select_own"
  on public.daily_goals for select
  using (auth.uid() = user_id);

drop policy if exists "daily_goals_insert_own" on public.daily_goals;
create policy "daily_goals_insert_own"
  on public.daily_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_goals_update_own" on public.daily_goals;
create policy "daily_goals_update_own"
  on public.daily_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_goals_delete_own" on public.daily_goals;
create policy "daily_goals_delete_own"
  on public.daily_goals for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- Section 7 — Grants for the Supabase API roles + PostgREST reload
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public
  to anon, authenticated, service_role;
grant all on all sequences in schema public
  to anon, authenticated, service_role;
grant all on all functions in schema public
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;

notify pgrst, 'reload schema';
notify pgrst, 'reload config';
