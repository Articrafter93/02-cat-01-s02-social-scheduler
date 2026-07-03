-- 003: Expose cat01s02_scheduler to PostgREST so the REST API serves it.
-- Without this, every data query fails with PGRST106 ("Invalid schema") and the
-- app silently shows empty state. Required step of the schema-pooling setup that
-- was missing (schema + RLS + grants existed, but the schema was never exposed).
--
-- Idempotent: appends our schema without clobbering other pooled schemas, since
-- schema-pooling shares the `authenticator` role config across projects in the
-- same Supabase instance.
do $$
declare
  cur text;
  newv text;
begin
  select cfg into cur
  from pg_roles r, unnest(r.rolconfig) as cfg
  where r.rolname = 'authenticator' and cfg like 'pgrst.db_schemas=%'
  limit 1;

  if cur is null then
    newv := 'public, graphql_public, cat01s02_scheduler';
  else
    cur := split_part(cur, '=', 2);
    if position('cat01s02_scheduler' in cur) = 0 then
      newv := cur || ', cat01s02_scheduler';
    else
      newv := cur;
    end if;
  end if;

  execute format('alter role authenticator set pgrst.db_schemas = %L', newv);
  perform pg_notify('pgrst', 'reload config');
  perform pg_notify('pgrst', 'reload schema');
end $$;
