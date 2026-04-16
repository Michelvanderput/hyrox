-- Push subscriptions tabel voor Web Push notificaties
-- Slaat per gebruiker de browser push subscription op

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  -- Notificatie-instellingen
  workout_reminder_enabled  boolean not null default false,
  workout_reminder_time     text    not null default '08:00',   -- HH:MM formaat
  creatine_reminder_enabled boolean not null default false,
  creatine_reminder_time    text    not null default '09:00',   -- HH:MM formaat
  teammate_workout_enabled  boolean not null default true,
  teammate_message_enabled  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Één subscription per user (laatste wint)
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Eigen subscription lezen"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Eigen subscription aanmaken/updaten"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Eigen subscription updaten"
  on public.push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Eigen subscription verwijderen"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Service role mag alle subscriptions lezen (voor het versturen van push)
create policy "Service role leest alles"
  on public.push_subscriptions for select
  to service_role
  using (true);
