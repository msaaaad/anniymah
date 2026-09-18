-- Shipping bar becomes a proper repeatable list (add/remove rows in the
-- admin UI) instead of one newline-separated textarea.
alter table landing_pages drop column if exists shipping_bar_text;
alter table landing_pages add column if not exists shipping_bar_items jsonb not null default '[]'::jsonb;
