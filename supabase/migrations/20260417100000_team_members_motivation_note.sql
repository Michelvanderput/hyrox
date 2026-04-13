-- Korte persoonlijke boodschap zichtbaar voor teamgenoten (home dashboard)
alter table public.team_members
  add column if not exists motivation_note text;

comment on column public.team_members.motivation_note is 'Optioneel bericht voor je partner; max. ~500 tekens aan client-side afgekapt.';

drop policy if exists "team_members_update_own_row" on public.team_members;
create policy "team_members_update_own_row"
  on public.team_members for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
