-- NLE Best Deal — extension Rewards + contenu administrable
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor.
-- Le navigateur ne peut pas confirmer à lui seul qu'un utilisateur suit Instagram/TikTok.
-- Les missions sociales passent donc en "pending" et les points ne sont crédités
-- qu'après validation dans l'Admin.

create table if not exists public.nle_reward_profiles (
  id uuid primary key default gen_random_uuid(),
  referral_code text unique not null,
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
  status text not null default 'logged' check (status in ('logged','pending','approved','rejected')),
  landing_path text,
  channel text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

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

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.nle_reward_profiles enable row level security;
alter table public.nle_reward_events enable row level security;
alter table public.nle_reward_verifications enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Rewards profile public upsert" on public.nle_reward_profiles;
create policy "Rewards profile public upsert"
on public.nle_reward_profiles for insert to anon, authenticated
with check (true);

drop policy if exists "Rewards profile owner read" on public.nle_reward_profiles;
create policy "Rewards profile owner read"
on public.nle_reward_profiles for select to anon, authenticated
using (true);

drop policy if exists "Rewards profile authenticated update" on public.nle_reward_profiles;
create policy "Rewards profile authenticated update"
on public.nle_reward_profiles for update to authenticated
using (true) with check (true);

drop policy if exists "Rewards events public insert" on public.nle_reward_events;
create policy "Rewards events public insert"
on public.nle_reward_events for insert to anon, authenticated
with check (status = 'logged' or status = 'pending');

drop policy if exists "Rewards events admin read" on public.nle_reward_events;
create policy "Rewards events admin read"
on public.nle_reward_events for select to authenticated
using (true);

drop policy if exists "Rewards events admin update" on public.nle_reward_events;
create policy "Rewards events admin update"
on public.nle_reward_events for update to authenticated
using (true) with check (true);

drop policy if exists "Rewards verification public insert" on public.nle_reward_verifications;
create policy "Rewards verification public insert"
on public.nle_reward_verifications for insert to anon, authenticated
with check (status = 'pending' and points = 3);

drop policy if exists "Rewards verification admin read" on public.nle_reward_verifications;
create policy "Rewards verification admin read"
on public.nle_reward_verifications for select to authenticated
using (true);

drop policy if exists "Rewards verification admin update" on public.nle_reward_verifications;
create policy "Rewards verification admin update"
on public.nle_reward_verifications for update to authenticated
using (true) with check (true);

drop policy if exists "Site settings public read" on public.site_settings;
create policy "Site settings public read"
on public.site_settings for select to anon, authenticated
using (true);

drop policy if exists "Site settings admin insert" on public.site_settings;
create policy "Site settings admin insert"
on public.site_settings for insert to authenticated
with check (true);

drop policy if exists "Site settings admin update" on public.site_settings;
create policy "Site settings admin update"
on public.site_settings for update to authenticated
using (true) with check (true);

drop policy if exists "Site settings admin delete" on public.site_settings;
create policy "Site settings admin delete"
on public.site_settings for delete to authenticated
using (true);

grant select on public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant insert on public.nle_reward_verifications to anon, authenticated;
grant select, update on public.nle_reward_verifications to authenticated;
grant insert on public.nle_reward_events to anon, authenticated;
grant select, update on public.nle_reward_events to authenticated;
grant select, insert, update on public.nle_reward_profiles to anon, authenticated;

insert into public.site_settings(key,value) values
('hero_title','Tes meilleurs deals au meilleur prix'),
('hero_subtitle','Découvre les produits tendance de NLE Best Deal et commande facilement.'),
('delivery_text','Livraison gratuite à Carrefour et Delmas. Autres zones : frais selon la quantité achetée.'),
('contact_title','Vous cherchez un bon deal ?'),
('contact_text','Écrivez-nous sur WhatsApp et dites-nous ce que vous recherchez.'),
('rewards_title','🎁 NLE Rewards — Partage & Récompense'),
('rewards_description','Partage ton lien NLE Best Deal. Les points sont accordés après validation d’une action réelle.'),
('pdg_name','Duperval Roody Jerry'),
('pdg_email','roodyjerry16@gmail.com'),
('whatsapp_number','+509 4211-3669'),
('instagram_main','https://www.instagram.com/nle_best_deal/'),
('instagram_owner','https://www.instagram.com/jerry__nle/'),
('tiktok','https://www.tiktok.com/@jerry_nle')
on conflict (key) do nothing;
