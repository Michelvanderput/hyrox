-- HYROX tracker core schema for Supabase (PostgreSQL)
-- Run in Supabase SQL editor or via `supabase db push` after linking a project.
-- Maps app "users" to `profiles` with `id = auth.users.id`.

-- ─── Profiles (1:1 with auth.users) ───────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  avatar_url text,
  gender text check (gender in ('male', 'female', 'other')),
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Atleet')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ─── Teams & members ───────────────────────────────────────────────────────
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text default 'HYROX Duo',
  race_date date not null default '2026-09-20',
  race_location text default 'MECC Maastricht',
  division text not null default 'doubles_open',
  invite_code text not null unique default lower(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12)),
  created_at timestamptz not null default now(),
  constraint teams_division_chk check (
    division in ('doubles_open', 'doubles_pro', 'mixed_doubles')
  )
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  color text,
  primary key (team_id, user_id)
);

create index if not exists team_members_user_id_idx on public.team_members (user_id);
create index if not exists teams_invite_code_idx on public.teams (lower(invite_code));

-- ─── Completions / PRs / metrics ───────────────────────────────────────────
create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  week_number int not null check (week_number between 1 and 52),
  day_index int not null check (day_index between 0 and 6),
  completed boolean default true,
  completed_at timestamptz default now(),
  notes text,
  rating int check (rating between 1 and 5),
  actual_duration_min int,
  unique (user_id, team_id, week_number, day_index)
);

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  station_id text not null,
  value numeric not null,
  recorded_at timestamptz default now(),
  notes text
);

create index if not exists personal_records_user_station_idx
  on public.personal_records (user_id, station_id, recorded_at desc);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  weight_kg numeric,
  resting_hr int,
  sleep_hours numeric,
  energy_level int check (energy_level between 1 and 5),
  recorded_at date default (timezone('utc', now()))::date,
  unique (user_id, recorded_at)
);

-- ─── RPC: invite preview (anon + auth) & join (auth) ───────────────────────
create or replace function public.team_preview_by_code(p_code text)
returns table (
  team_id uuid,
  team_name text,
  race_date date,
  race_location text,
  division text
)
language sql
security definer
set search_path = public
as $$
  select t.id, t.name, t.race_date, t.race_location, t.division
  from public.teams t
  where lower(t.invite_code) = lower(trim(p_code))
  limit 1;
$$;

revoke all on function public.team_preview_by_code(text) from public;
grant execute on function public.team_preview_by_code(text) to anon, authenticated;

create or replace function public.join_team_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
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

  insert into public.team_members (team_id, user_id, color)
  values (tid, auth.uid(), null)
  on conflict do nothing;

  return tid;
end;
$$;

revoke all on function public.join_team_by_code(text) from public;
grant execute on function public.join_team_by_code(text) to authenticated;

-- ─── Row Level Security ───────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.completions enable row level security;
alter table public.personal_records enable row level security;
alter table public.metrics enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_select_teammates" on public.profiles;
create policy "profiles_select_teammates"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.team_members m1
      join public.team_members m2 on m1.team_id = m2.team_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Teams
drop policy if exists "teams_insert_auth" on public.teams;
create policy "teams_insert_auth"
  on public.teams for insert
  to authenticated
  with check (true);

drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member"
  on public.teams for select
  to authenticated
  using (
    exists (
      select 1 from public.team_members m
      where m.team_id = teams.id and m.user_id = auth.uid()
    )
  );

-- Team members
drop policy if exists "team_members_select_shared_team" on public.team_members;
create policy "team_members_select_shared_team"
  on public.team_members for select
  to authenticated
  using (
    exists (
      select 1 from public.team_members self
      where self.team_id = team_members.team_id and self.user_id = auth.uid()
    )
  );

drop policy if exists "team_members_insert_first" on public.team_members;
create policy "team_members_insert_first"
  on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.team_members existing
      where existing.team_id = team_members.team_id
    )
  );

-- Completions
drop policy if exists "completions_select_own_team" on public.completions;
create policy "completions_select_own_team"
  on public.completions for select
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.team_members m
      where m.team_id = completions.team_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "completions_write_own_team" on public.completions;
create policy "completions_write_own_team"
  on public.completions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.team_members m
      where m.team_id = completions.team_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "completions_update_own_team" on public.completions;
create policy "completions_update_own_team"
  on public.completions for update
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.team_members m
      where m.team_id = completions.team_id and m.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.team_members m
      where m.team_id = completions.team_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "completions_delete_own_team" on public.completions;
create policy "completions_delete_own_team"
  on public.completions for delete
  to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.team_members m
      where m.team_id = completions.team_id and m.user_id = auth.uid()
    )
  );

-- Personal records
drop policy if exists "personal_records_select_own" on public.personal_records;
create policy "personal_records_select_own"
  on public.personal_records for select
  using (auth.uid() = user_id);

drop policy if exists "personal_records_write_own" on public.personal_records;
create policy "personal_records_write_own"
  on public.personal_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "personal_records_update_own" on public.personal_records;
create policy "personal_records_update_own"
  on public.personal_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "personal_records_delete_own" on public.personal_records;
create policy "personal_records_delete_own"
  on public.personal_records for delete
  using (auth.uid() = user_id);

-- Metrics
drop policy if exists "metrics_select_own" on public.metrics;
create policy "metrics_select_own"
  on public.metrics for select
  using (auth.uid() = user_id);

drop policy if exists "metrics_write_own" on public.metrics;
create policy "metrics_write_own"
  on public.metrics for insert
  with check (auth.uid() = user_id);

drop policy if exists "metrics_update_own" on public.metrics;
create policy "metrics_update_own"
  on public.metrics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "metrics_delete_own" on public.metrics;
create policy "metrics_delete_own"
  on public.metrics for delete
  using (auth.uid() = user_id);
