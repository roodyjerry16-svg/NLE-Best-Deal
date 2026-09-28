-- NLE Best Deal — correction des droits Admin (products + Rewards)
-- À exécuter UNE FOIS dans Supabase > SQL Editor avec un compte propriétaire du projet.
-- Cette correction ne supprime aucun produit ni aucun point.

alter table public.products enable row level security;

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

grant select, insert, update, delete on public.products to authenticated;

grant select, insert, update on public.nle_reward_profiles to authenticated;
grant select, insert, update on public.nle_reward_events to authenticated;
grant select, insert, update on public.nle_reward_verifications to authenticated;

alter table storage.objects enable row level security;

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

grant insert, update, delete on storage.objects to authenticated;
