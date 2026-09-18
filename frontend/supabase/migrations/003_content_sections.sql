-- Replaces the old single-image "Part 2" section with three independently
-- toggleable content sections: a product photo collection, a features/USP
-- grid, and a shipping trust bar. Additive/renaming only -- no data loss for
-- title/enabled state, though the old part2_text/part2_image_url content
-- (a single shared image + plain text list) doesn't carry over automatically
-- since the new collection section uses one photo per item instead.

alter table landing_pages rename column part2_enabled to collection_enabled;
alter table landing_pages rename column part2_title to collection_title;
alter table landing_pages drop column if exists part2_text;
alter table landing_pages drop column if exists part2_image_url;

alter table landing_pages
  add column if not exists collection_items jsonb not null default '[]'::jsonb,
  add column if not exists features_enabled boolean not null default false,
  add column if not exists features_title text not null default '',
  add column if not exists features_subtitle text not null default '',
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists shipping_bar_enabled boolean not null default false,
  add column if not exists shipping_bar_text text not null default '';
