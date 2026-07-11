-- activity_entries: one row per logged workout / physical activity.

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
