# Anniymah — E-commerce MVP Checklist

Organized by business domain, not tech layer. `[x]` = already built and verified in this repo. `[ ]` = not built yet. Priority: **Must** (blocks a real launch), **Should** (launch without it but fix soon), **Later** (post-launch).

## 1. Catalog / Product Content

- [x] Landing-page-per-offer model, up to 4 pages, each at its own `/p/[slug]` URL
- [x] Regular vs. offer price display
- [x] Dynamic Product Collection, Features, and Shipping Info sections (each toggleable)
- [x] Product images via Supabase Storage
- [ ] (Should) Decide: stay single-funnel (one offer pushed at a time) or add a real storefront nav across the up-to-4 pages — right now `/` just redirects to whichever page was created first, with no way to browse the others

## 2. Checkout & Orders

- [x] Order form (name, phone, address, quantity, delivery zone, notes)
- [x] Bangladeshi phone number validation
- [x] Honeypot spam protection
- [x] Server-computed pricing (unit price, delivery charge, total) — never trusts client input
- [x] Order confirmation → dedicated thank-you page with animation
- [ ] (Should) Basic abuse/rate limiting on `POST /api/orders` — right now nothing stops someone scripting repeat submissions

## 3. Payments

- [x] Cash on Delivery (the only method right now)
- [ ] (Must decide, not necessarily must-build) Is COD-only acceptable for launch, or do you want bKash/Nagad/card at MVP? Common for Bangladeshi D2C to launch COD-only and add a gateway later — but decide before launch, not after ad spend starts

## 4. Fulfillment / Delivery

- [x] Delivery zone pricing (free / inside Dhaka / outside Dhaka)
- [x] Order status workflow (pending → confirmed → delivered, or rejected/cancelled)
- [x] Admin: filter orders by status, search by customer name/phone, delete orders
- [ ] (Later) Courier integration — schema already has a `courier_tracking_id` column, but nothing reads/writes it or surfaces tracking to the customer

## 5. Customer Communication

- [x] On-screen thank-you page after order confirmation
- [ ] (Should) SMS or email confirmation to the customer after ordering — right now if they close the tab, they have zero record of their order
- [ ] (Later) Order status-change notifications (e.g. "your order is out for delivery")

## 6. Admin & Operations

- [x] Single-admin auth (env-based credentials, HMAC-signed session cookie)
- [x] Landing page CRUD (create/edit/delete, image upload)
- [x] Orders dashboard (list, filter, search, status update, delete)
- [x] Toast notifications on save/status-change (sonner)
- [ ] (Later) Multi-admin / roles — not needed while it's a single shop owner

## 7. Trust, Legal & Compliance

- [ ] (Must) Privacy policy page — required by Meta/Facebook ad policy, and you're already running the Pixel
- [ ] (Must) Refund/return policy — standard expectation for COD e-commerce, reduces disputes
- [ ] (Should) Terms of service
- [ ] (Should) Visible business contact info beyond the phone number (already shown) — e.g. an About/Contact section

## 8. Marketing & Analytics

- [x] Meta Pixel (PageView tracking, site-wide)
- [ ] (Should) Meta Pixel `Purchase`/`Lead` event fired on order confirmation — right now it only tracks PageView, so ad campaigns can't optimize for actual orders
- [ ] (Later) Server-side Conversions API (more reliable than browser-only pixel, survives ad blockers/iOS tracking limits)
- [ ] (Later) Google Analytics / Search Console

## 9. SEO & Discoverability

- [ ] (Should) `metadataBase` + Open Graph tags — right now shared links (e.g. in Messenger/WhatsApp) won't show a proper preview image/title
- [ ] (Should) `sitemap.xml` / `robots.txt`
- [x] Bengali page title/description in metadata

## 10. Infrastructure & Domain

- [x] Deployed on Vercel, auto-deploy from `main`
- [x] Custom domain (`anniymah.com` / `www.anniymah.com`) connected via Cloudflare DNS
- [ ] (Must, in progress) Confirm both domains show "Valid Configuration" in Vercel with proxy off, and SSL is live
- [x] Supabase Postgres + Storage (production data layer)
- [ ] (Later) NestJS + Prisma + Postgres backend — scaffolded on `backend-nestjs` branch, not required for MVP, this is a future migration path

## 11. Security & Reliability

- [x] Server-side validation on all write paths (price/delivery charge never trusted from client)
- [x] RLS policies on Supabase tables (public can only read landing pages, insert orders — no read/update/delete)
- [ ] (Should) Error monitoring (Sentry or similar) — right now a production error is invisible until a customer or you notice
- [ ] (Later) Automated test coverage — testing so far has been manual (dev server + curl/Playwright checks per feature), no CI test suite

---

**Suggested order to close the gap to a real launch:** privacy + refund policy (§7) → decide payment method (§3) → Pixel Purchase event (§8) → OG/sitemap (§9) → confirm domain SSL is fully live (§10) → SMS/email confirmation (§5).
