-- Standard Supabase grants for the API roles, plus a PostgREST schema
-- reload. Safe to re-run any time. Paste in the SQL editor and click Run.

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
