-- Vereist: teams.created_by + trigger (migratie 20260418140000) — hier idempotent herhaald
-- zodat RETURNING na team-insert blijft werken als alleen dit bestand wordt gedraaid.
alter table public.teams
  add column if not exists created_by uuid references auth.users (id) on delete set null;

update public.teams t
set created_by = sub.uid
from (
  select distinct on (team_id) team_id, user_id as uid
  from public.team_members
  order by team_id, user_id
) sub
where t.id = sub.team_id
  and t.created_by is null;

create or replace function public.teams_set_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists teams_set_created_by_bi on public.teams;
create trigger teams_set_created_by_bi
  before insert on public.teams
  for each row
  execute procedure public.teams_set_created_by();

-- Some Postgres/Supabase setups still evaluate RLS inside SECURITY DEFINER SQL helpers,
-- causing infinite recursion: team_members policy → team_ids_for_current_user() → team_members.
-- Fix: PL/pgSQL + row_security off for the inner read only, then restore.
-- Also replace other policies that subquery team_members with the same helper / helper2.

create or replace function public.team_ids_for_current_user()
returns setof uuid
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform set_config('row_security', 'off', true);
  return query
    select tm.team_id
    from public.team_members tm
    where tm.user_id = auth.uid();
  perform set_config('row_security', 'on', true);
  return;
end;
$$;

comment on function public.team_ids_for_current_user() is
  'Team IDs for auth.uid(); RLS disabled only for this read to avoid policy recursion.';

revoke all on function public.team_ids_for_current_user() from public;
grant execute on function public.team_ids_for_current_user() to authenticated;

-- INSERT first member: avoid EXISTS scan on team_members under invoker RLS.
create or replace function public.team_has_any_members(p_team_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  n int;
begin
  perform set_config('row_security', 'off', true);
  select count(*)::int into n from public.team_members where team_id = p_team_id;
  perform set_config('row_security', 'on', true);
  return n > 0;
end;
$$;

comment on function public.team_has_any_members(uuid) is
  'True if team already has ≥1 member; used by INSERT policy without RLS recursion.';

revoke all on function public.team_has_any_members(uuid) from public;
grant execute on function public.team_has_any_members(uuid) to authenticated;

drop policy if exists "team_members_insert_first" on public.team_members;
create policy "team_members_insert_first"
  on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.team_has_any_members(team_members.team_id)
  );

drop policy if exists "profiles_select_teammates" on public.profiles;
create policy "profiles_select_teammates"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.team_members m
      where m.user_id = profiles.id
        and m.team_id in (select public.team_ids_for_current_user())
    )
  );

drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member"
  on public.teams for select
  to authenticated
  using (
    created_by = auth.uid()
    or teams.id in (select public.team_ids_for_current_user())
  );

drop policy if exists "completions_select_team" on public.completions;
create policy "completions_select_team"
  on public.completions for select
  to authenticated
  using (
    completions.team_id in (select public.team_ids_for_current_user())
  );

drop policy if exists "completions_write_own_team" on public.completions;
create policy "completions_write_own_team"
  on public.completions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and completions.team_id in (select public.team_ids_for_current_user())
  );

drop policy if exists "completions_update_own_team" on public.completions;
create policy "completions_update_own_team"
  on public.completions for update
  to authenticated
  using (
    user_id = auth.uid()
    and completions.team_id in (select public.team_ids_for_current_user())
  )
  with check (
    user_id = auth.uid()
    and completions.team_id in (select public.team_ids_for_current_user())
  );

drop policy if exists "completions_delete_own_team" on public.completions;
create policy "completions_delete_own_team"
  on public.completions for delete
  to authenticated
  using (
    user_id = auth.uid()
    and completions.team_id in (select public.team_ids_for_current_user())
  );
