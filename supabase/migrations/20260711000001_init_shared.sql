-- Shared helpers used by all subsequent migrations.

create extension if not exists "pgcrypto";

-- Trigger function that keeps updated_at in sync on every row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
