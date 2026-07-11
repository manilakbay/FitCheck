-- FitTrack AI — Phase 2 one-shot bootstrap.
-- Paste this into the Supabase SQL editor and click Run.
-- Idempotent: safe to re-run any time.
--
-- Assumes phase 1 (profiles / weight_records / food_entries /
-- activity_entries / daily_goals) is already applied. If not, run the
-- phase-1 migrations first.

-- =====================================================================
-- 1. user_ai_settings table
-- =====================================================================

create table if not exists public.user_ai_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'openai' check (provider in ('openai')),
  model text not null default 'gpt-4o-mini' check (
    length(model) between 1 and 64
  ),
  api_key_ciphertext text check (api_key_ciphertext is null or length(api_key_ciphertext) between 1 and 4096),
  api_key_iv text check (api_key_iv is null or length(api_key_iv) between 1 and 128),
  api_key_last4 text check (api_key_last4 is null or length(api_key_last4) between 1 and 8),
  enabled boolean not null default true,
  monthly_request_count integer not null default 0 check (monthly_request_count >= 0),
  monthly_request_reset date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_ai_settings_set_updated_at on public.user_ai_settings;
create trigger user_ai_settings_set_updated_at
  before update on public.user_ai_settings
  for each row execute function public.set_updated_at();

alter table public.user_ai_settings enable row level security;

drop policy if exists "user_ai_settings_select_own" on public.user_ai_settings;
create policy "user_ai_settings_select_own"
  on public.user_ai_settings for select
  using (auth.uid() = user_id);

drop policy if exists "user_ai_settings_insert_own" on public.user_ai_settings;
create policy "user_ai_settings_insert_own"
  on public.user_ai_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_ai_settings_update_own" on public.user_ai_settings;
create policy "user_ai_settings_update_own"
  on public.user_ai_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_ai_settings_delete_own" on public.user_ai_settings;
create policy "user_ai_settings_delete_own"
  on public.user_ai_settings for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- 2. AI provenance columns on food_entries / activity_entries
-- =====================================================================

alter table public.food_entries
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'ai'));

alter table public.food_entries
  add column if not exists ai_confidence text
    check (ai_confidence is null or ai_confidence in ('low', 'medium', 'high'));

alter table public.activity_entries
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'ai'));

alter table public.activity_entries
  add column if not exists ai_confidence text
    check (ai_confidence is null or ai_confidence in ('low', 'medium', 'high'));

-- =====================================================================
-- 3. Grants + PostgREST schema reload
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;

notify pgrst, 'reload schema';
notify pgrst, 'reload config';
