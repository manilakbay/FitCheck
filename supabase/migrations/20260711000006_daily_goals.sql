-- daily_goals: exactly one row per user, upserted whenever the profile is
-- recalculated. Captures the calorie & macro targets for the day and the
-- (optional) longer-term goal weight.

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
