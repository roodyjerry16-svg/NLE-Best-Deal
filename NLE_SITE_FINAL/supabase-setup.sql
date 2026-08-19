-- NLE Best Deal — configuration Supabase / Admin iPhone
-- Exécuter UNE SEULE FOIS dans Supabase SQL Editor.
-- Le compte admin doit être créé dans Authentication > Users.
-- Désactiver les inscriptions publiques après création du compte admin.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null,
  category text not null default 'Mode',
  description text not null default '',
  badge text not null default 'NOUVEAU',
  source text not null default 'NLE' check (source in ('NLE','Partenaire')),
  available boolean not null default true,
  images text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can view available products" on public.products;
create policy "Public can view available products"
on public.products for select to anon
using (available = true);

drop policy if exists "Authenticated admin can view all products" on public.products;
create policy "Authenticated admin can view all products"
on public.products for select to authenticated using (true);

drop policy if exists "Authenticated admin can insert products" on public.products;
create policy "Authenticated admin can insert products"
on public.products for insert to authenticated with check (true);

drop policy if exists "Authenticated admin can update products" on public.products;
create policy "Authenticated admin can update products"
on public.products for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admin can delete products" on public.products;
create policy "Authenticated admin can delete products"
on public.products for delete to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select to public
using (bucket_id = 'product-images');

drop policy if exists "Authenticated admin can upload product images" on storage.objects;
create policy "Authenticated admin can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated admin can update product images" on storage.objects;
create policy "Authenticated admin can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "Authenticated admin can delete product images" on storage.objects;
create policy "Authenticated admin can delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');
