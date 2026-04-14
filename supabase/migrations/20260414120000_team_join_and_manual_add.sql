-- Fix team joining under strict RLS + add optional manual member add.
-- Rationale:
-- - Existing RLS policy `team_members_insert_first` blocks inserts for the 2nd member.
-- - `join_team_by_code` is SECURITY DEFINER, but some setups still evaluate RLS.
-- - We bypass RLS inside the function and enforce duo-size constraints.

alter table public.teams
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create or replace function public.join_team_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
  member_count int;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select t.id into tid
  from public.teams t
  where lower(t.invite_code) = lower(trim(p_code))
  limit 1;

  if tid is null then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;

  -- Ensure duo constraint and bypass RLS for membership maintenance.
  perform set_config('row_security', 'off', true);

  select count(*)::int into member_count
  from public.team_members
  where team_id = tid;

  if member_count >= 2 then
    raise exception 'team_full' using errcode = 'P0001';
  end if;

  insert into public.team_members (team_id, user_id, color)
  values (tid, auth.uid(), null)
  on conflict do nothing;

  perform set_config('row_security', 'on', true);

  return tid;
end;
$$;

revoke all on function public.join_team_by_code(text) from public;
grant execute on function public.join_team_by_code(text) to authenticated;

-- Manual add: creator/member can add a teammate by email (duo constraint).
create or replace function public.add_team_member_by_email(p_team_id uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  can_manage boolean;
  member_count int;
  cleaned_email text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  cleaned_email := lower(trim(p_email));
  if cleaned_email = '' or position('@' in cleaned_email) = 0 then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;

  -- Allow if caller is team creator or already a member (keeps it simple for duo teams).
  perform set_config('row_security', 'off', true);

  select
    (t.created_by = auth.uid())
    or exists (select 1 from public.team_members tm where tm.team_id = p_team_id and tm.user_id = auth.uid())
  into can_manage
  from public.teams t
  where t.id = p_team_id;

  if can_manage is distinct from true then
    raise exception 'not_allowed' using errcode = 'P0001';
  end if;

  select count(*)::int into member_count
  from public.team_members
  where team_id = p_team_id;

  if member_count >= 2 then
    raise exception 'team_full' using errcode = 'P0001';
  end if;

  select p.id into target_user_id
  from public.profiles p
  where lower(coalesce(p.email, '')) = cleaned_email
  limit 1;

  if target_user_id is null then
    raise exception 'unknown_email' using errcode = 'P0001';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'cannot_add_self' using errcode = 'P0001';
  end if;

  insert into public.team_members (team_id, user_id, color)
  values (p_team_id, target_user_id, null)
  on conflict do nothing;

  perform set_config('row_security', 'on', true);

  return target_user_id;
end;
$$;

revoke all on function public.add_team_member_by_email(uuid, text) from public;
grant execute on function public.add_team_member_by_email(uuid, text) to authenticated;

