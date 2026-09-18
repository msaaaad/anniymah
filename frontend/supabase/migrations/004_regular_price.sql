-- Optional "regular price" shown struck through next to the actual offer
-- price (0 = don't show one). Purely a marketing display value -- order
-- totals always use `price`, never this.
alter table landing_pages add column if not exists regular_price integer not null default 0;
