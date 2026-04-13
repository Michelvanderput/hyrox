-- INSERT ... RETURNING on teams runs SELECT RLS on the new row.
-- teams_select_member required a team_members row → first member insert failed.
-- Fix: stamp creator and allow SELECT when created_by = auth.uid().

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

drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member"
  on public.teams for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.team_members m
      where m.team_id = teams.id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "teams_insert_auth" on public.teams;
create policy "teams_insert_auth"
  on public.teams for insert
  to authenticated
  with check (auth.uid() is not null);
