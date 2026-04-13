-- Leden mogen teamnaam aanpassen (invite blijft server-side ongewijzigd).
drop policy if exists "teams_update_member" on public.teams;

create policy "teams_update_member"
  on public.teams for update
  to authenticated
  using (id in (select public.team_ids_for_current_user()))
  with check (id in (select public.team_ids_for_current_user()));
