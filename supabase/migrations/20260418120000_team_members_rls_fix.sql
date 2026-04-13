-- team_members SELECT policy referenced team_members in its own USING clause →
-- infinite recursion. Read memberships via SECURITY DEFINER (owner bypasses RLS).

create or replace function public.team_ids_for_current_user()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tm.team_id
  from public.team_members tm
  where tm.user_id = auth.uid();
$$;

comment on function public.team_ids_for_current_user() is
  'RLS-safe: team_ids where the invoking user is a member; used by policies to avoid self-referential team_members scans.';

revoke all on function public.team_ids_for_current_user() from public;
grant execute on function public.team_ids_for_current_user() to authenticated;

drop policy if exists "team_members_select_shared_team" on public.team_members;
create policy "team_members_select_shared_team"
  on public.team_members for select
  to authenticated
  using (team_id in (select public.team_ids_for_current_user()));
