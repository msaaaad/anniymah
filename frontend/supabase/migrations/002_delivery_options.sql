-- Adds per-page delivery pricing: free delivery by default, or separate
-- charges for inside/outside Dhaka. Additive only — safe to run without
-- losing any existing pages or orders.

alter table landing_pages
  add column if not exists free_delivery boolean not null default true,
  add column if not exists delivery_charge_inside_dhaka integer not null default 0,
  add column if not exists delivery_charge_outside_dhaka integer not null default 0;

alter table orders
  add column if not exists delivery_zone text,
  add column if not exists delivery_charge integer not null default 0;

alter table orders
  drop constraint if exists orders_delivery_zone_check;
alter table orders
  add constraint orders_delivery_zone_check
  check (delivery_zone is null or delivery_zone in ('inside_dhaka', 'outside_dhaka'));
