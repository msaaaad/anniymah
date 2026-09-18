-- Anniymah MVP — schema v2: multiple landing pages (max 4, enforced in the app),
-- each with its own public URL at /p/[slug]. Run in Supabase SQL Editor.
--
-- This REPLACES the earlier single-row `landing_page` table. Safe to run
-- even if that table exists — it's dropped and recreated. There's no real
-- customer data yet, so this is a clean rebuild rather than an ALTER migration.

drop table if exists orders cascade;
drop table if exists landing_page cascade;
drop table if exists landing_pages cascade;

-- ---------- landing_pages (up to 4 rows; enforced in the app, not here) ----------
create table landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '',
  description text not null default '',
  price integer not null default 0,
  regular_price integer not null default 0,
  phone text not null default '',
  image_url text not null default '',
  collection_enabled boolean not null default false,
  collection_title text not null default '',
  collection_items jsonb not null default '[]'::jsonb,
  features_enabled boolean not null default false,
  features_title text not null default '',
  features_subtitle text not null default '',
  features jsonb not null default '[]'::jsonb,
  shipping_bar_enabled boolean not null default false,
  shipping_bar_items jsonb not null default '[]'::jsonb,
  free_delivery boolean not null default true,
  delivery_charge_inside_dhaka integer not null default 0,
  delivery_charge_outside_dhaka integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into landing_pages (slug, title, description, price, phone, image_url, collection_enabled, collection_title)
values (
  'combo-offer',
  '৪টি জনপ্রিয় পারফিউম, এক কম্বোতে — মাত্র ৳999',
  'একসাথে পাচ্ছেন Hawas Ice, Bleu de Chanel, Dior Sauvage এবং Vampire Blood–এর মতো জনপ্রিয় সুগন্ধির প্রিমিয়াম কম্বো। নিজের জন্য হোক কিংবা প্রিয়জনকে গিফট — এক কম্বোতেই ৪টি পছন্দের সুবাস।',
  999,
  '01614-150325',
  '',
  true,
  'কম্বোতে যা থাকছে'
);

alter table landing_pages enable row level security;

create policy "Public can read landing pages"
  on landing_pages for select
  using (true);

-- No insert/update/delete policy for the public role — only the server's
-- service_role key (which bypasses RLS) can write, gated by the app's own
-- admin session check.

-- ---------- orders ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid references landing_pages(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  unit_price integer not null,
  delivery_zone text check (delivery_zone is null or delivery_zone in ('inside_dhaka', 'outside_dhaka')),
  delivery_charge integer not null default 0,
  total integer not null,
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'delivered', 'cancelled', 'rejected')),
  courier_tracking_id text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table orders enable row level security;

create policy "Public can submit an order"
  on orders for insert
  with check (true);

-- No select/update/delete policy for the public role — a customer must
-- never be able to read anyone's order, including their own. Admin
-- listing/status updates go through the server's service_role key only.

-- ---------- storage bucket for landing page images ----------
insert into storage.buckets (id, name, public)
values ('landing-images', 'landing-images', true)
on conflict (id) do nothing;

-- Bucket is public for read (so <img src> works directly from the CDN URL).
-- Writes still go through the server's service_role key only, which
-- bypasses storage RLS — no public insert/update/delete policy is added.
