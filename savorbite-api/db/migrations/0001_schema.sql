-- ---------------------------------------------------------------------------
-- SavorBite — initial schema (Supabase Postgres)
-- All money is stored in KOBO (integer) to avoid floating point rounding.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------- profiles (1:1 with Supabase auth.users) -------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- New auth users automatically get a customer profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- categories ------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  blurb       text not null default '',
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ---------- products --------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories (id) on delete restrict,
  name          text not null,
  description   text not null default '',
  unit          text not null default '',
  price_kobo    bigint not null check (price_kobo > 0),
  stock         integer not null default 0 check (stock >= 0),
  available     boolean not null default true,
  featured      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_featured_idx on public.products (featured);

-- ---------- product_images --------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  position    integer not null default 0
);

create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- ---------- orders ----------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique default 'SB-' || floor(random() * 90000 + 10000)::int,
  user_id            uuid references auth.users (id) on delete set null,
  customer_name      text not null,
  customer_phone     text not null,
  customer_email     text not null,
  address            text not null,
  notes              text,
  delivery_method    text not null default 'standard' check (delivery_method in ('standard', 'express')),
  subtotal_kobo      bigint not null check (subtotal_kobo >= 0),
  delivery_fee_kobo  bigint not null default 0,
  total_kobo         bigint not null check (total_kobo > 0),
  status             text not null default 'Pending'
                     check (status in ('Pending', 'Paid', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled')),
  payment_status     text not null default 'Pending'
                     check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  payment_provider   text check (payment_provider in ('paystack', 'flutterwave')),
  payment_reference  text unique,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- ---------- order_items (frozen snapshots of what was bought) ---------------
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  name              text not null,
  unit_price_kobo   bigint not null check (unit_price_kobo >= 0),
  quantity          integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- updated_at trigger ----------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- helper used by RLS policies ------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
