-- Track first-run onboarding (geslacht / niveau / naam) for a professional setup experience.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

comment on column public.profiles.onboarding_completed is 'True after the user finished the in-app onboarding wizard.';

-- Bestaande profielen met al ingevulde velden hoeven niet opnieuw door de wizard.
update public.profiles
set onboarding_completed = true
where gender is not null
  and fitness_level is not null;

-- Upsert onboarding fallback (als er ooit geen profielrij was na auth).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());
