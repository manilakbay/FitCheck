-- =====================================================================
-- Add AI provenance columns to food_entries and activity_entries.
-- Additive migration — existing rows default to 'manual' so nothing
-- about the current data or read patterns changes.
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
