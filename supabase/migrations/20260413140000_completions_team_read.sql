-- Allow team members to read all completions within their team (partner progress in UI).
-- Writes remain restricted to own rows via existing INSERT/UPDATE policies.

drop policy if exists "completions_select_own_team" on public.completions;

create policy "completions_select_team"
  on public.completions for select
  to authenticated
  using (
    exists (
      select 1
      from public.team_members m
      where m.team_id = completions.team_id
        and m.user_id = auth.uid()
    )
  );
