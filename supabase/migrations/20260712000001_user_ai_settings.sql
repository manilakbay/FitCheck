-- =====================================================================
-- user_ai_settings — per-user AI provider configuration (BYO API key)
--
-- Key material is encrypted at rest with AES-256-GCM in the Node
-- application layer. The database only stores the ciphertext + IV; the
-- symmetric key (AI_ENCRYPTION_KEY) lives exclusively in the app's
-- environment. api_key_last4 is a display-only preview and is safe to
-- expose to the user.
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
