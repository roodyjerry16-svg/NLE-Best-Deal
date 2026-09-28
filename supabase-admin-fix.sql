-- NLE Best Deal — migration Admin + Rewards (non destructive)
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Cette migration crée les tables manquantes et ajoute les colonnes manquantes
-- si une ancienne version de Rewards a déjà été installée.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.nle_reward_profiles (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null unique,
  session_id text,
  full_name text not null default '',
  phone text not null default '',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nle_reward_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  referral_code text,
  session_id text,
  task text,
  platform text,
  username text,
  points_requested integer not null default 0,
  points_awarded integer not null default 0,
  status text not null default 'logged',
  landing_path text,
  channel text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

alter table public.nle_reward_events add column if not exists platform text;
alter table public.nle_reward_events add column if not exists username text;
alter table public.nle_reward_events add column if not exists points_awarded integer not null default 0;
alter table public.nle_reward_events add column if not exists status text not null default 'logged';
alter table public.nle_reward_events add column if not exists reviewed_at timestamptz;
alter table public.nle_reward_events add column if not exists reviewed_by uuid;

create table if not exists public.nle_reward_verifications (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  session_id text,
  platform text not null check (platform in ('instagram','tiktok')),
  username text not null,
  points integer not null default 3,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  proof_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

alter table public.site_settings enable row level security;
alter table public.nle_reward_profiles enable row level security;
alter table public.nle_reward_events enable row level security;
alter table public.nle_reward_verifications enable row level security;

drop policy if exists "NLE site settings public read" on public.site_settings;
create policy "NLE site settings public read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "NLE site settings authenticated write" on public.site_settings;
create policy "NLE site settings authenticated write" on public.site_settings for all to authenticated using (true) with check (true);

drop policy if exists "NLE rewards profiles public insert" on public.nle_reward_profiles;
create policy "NLE rewards profiles public insert" on public.nle_reward_profiles for insert to anon, authenticated with check (true);
drop policy if exists "NLE rewards profiles authenticated read" on public.nle_reward_profiles;
create policy "NLE rewards profiles authenticated read" on public.nle_reward_profiles for select to authenticated using (true);
drop policy if exists "NLE rewards profiles authenticated update" on public.nle_reward_profiles;
create policy "NLE rewards profiles authenticated update" on public.nle_reward_profiles for update to authenticated using (true) with check (true);

drop policy if exists "NLE rewards events public insert" on public.nle_reward_events;
create policy "NLE rewards events public insert" on public.nle_reward_events for insert to anon, authenticated with check (true);
drop policy if exists "NLE rewards events authenticated read" on public.nle_reward_events;
create policy "NLE rewards events authenticated read" on public.nle_reward_events for select to authenticated using (true);
drop policy if exists "NLE rewards events authenticated update" on public.nle_reward_events;
create policy "NLE rewards events authenticated update" on public.nle_reward_events for update to authenticated using (true) with check (true);

drop policy if exists "NLE rewards verifications public insert" on public.nle_reward_verifications;
create policy "NLE rewards verifications public insert" on public.nle_reward_verifications for insert to anon, authenticated with check (status='pending' and points=3);
drop policy if exists "NLE rewards verifications authenticated read" on public.nle_reward_verifications;
create policy "NLE rewards verifications authenticated read" on public.nle_reward_verifications for select to authenticated using (true);
drop policy if exists "NLE rewards verifications authenticated update" on public.nle_reward_verifications;
create policy "NLE rewards verifications authenticated update" on public.nle_reward_verifications for update to authenticated using (true) with check (true);

grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update on public.nle_reward_profiles to anon, authenticated;
grant select, insert, update on public.nle_reward_events to anon, authenticated;
grant select, insert, update on public.nle_reward_verifications to anon, authenticated;
