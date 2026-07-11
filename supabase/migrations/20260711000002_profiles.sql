-- profiles: 1:1 with auth.users. Stores personal / physiological details
-- used to compute BMR, TDEE, and daily calorie targets.

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

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Seed a profile row automatically when a user signs up.
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

-- Row Level Security: users can only read / modify their own profile.
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
