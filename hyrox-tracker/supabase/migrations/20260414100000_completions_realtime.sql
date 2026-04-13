-- Supabase Realtime: broadcast completion changes to subscribed clients (RLS SELECT still applies).
-- REPLICA IDENTITY FULL ensures DELETE payloads include columns needed for UI mapping.

alter table public.completions replica identity full;

alter publication supabase_realtime add table public.completions;
