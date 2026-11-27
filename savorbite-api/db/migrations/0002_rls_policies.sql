-- ---------------------------------------------------------------------------
-- SavorBite — Row Level Security policies
-- Customers: read the menu, read/create only THEIR orders.
-- Admins (role = 'admin' in profiles): full access.
-- NOTE: our Express API mostly uses the service-role key after verifying the
-- caller's JWT; RLS is the second line of defence for direct Supabase access.
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ---------- profiles ---------------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- categories / products / images -----------------------------------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories for select using (true);

drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write"
  on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: public read" on public.products;
create policy "products: public read"
  on public.products for select using (true);

drop policy if exists "products: admin write" on public.products;
create policy "products: admin write"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_images: public read" on public.product_images;
create policy "product_images: public read"
  on public.product_images for select using (true);

drop policy if exists "product_images: admin write" on public.product_images;
create policy "product_images: admin write"
  on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- orders -----------------------------------------------------------
drop policy if exists "orders: read own or admin" on public.orders;
create policy "orders: read own or admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

-- Customers may insert orders only for themselves; the server computes status.
drop policy if exists "orders: insert own" on public.orders;
create policy "orders: insert own"
  on public.orders for insert
  with check (user_id = auth.uid() and payment_status = 'Pending');

-- Status changes are admin-only (and the payment_status transition is
-- performed by the service role after provider verification).
drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders: admin delete" on public.orders;
create policy "orders: admin delete"
  on public.orders for delete
  using (public.is_admin());

-- ---------- order_items ------------------------------------------------------
drop policy if exists "order_items: read own or admin" on public.order_items;
create policy "order_items: read own or admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items: insert own" on public.order_items;
create policy "order_items: insert own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: run in the SQL editor or via `supabase storage` CLI.
-- The bucket below is created by the migration script (see README):
--   insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- Storage policies (dashboard → Storage → product-images → Policies):
--   public read:  bucket_id = 'product-images' and (storage.foldername(name))[1] = 'products'
--   admin write:  bucket_id = 'product-images' and public.is_admin()
-- ---------------------------------------------------------------------------
