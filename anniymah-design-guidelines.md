# Anniymah — Design Guidelines

Hand this to Claude Code alongside the tech spec so design decisions don't need
to be re-explained per session. These values are pulled directly from the
working landing page mockup — treat that HTML/CSS as the canonical reference
if anything here is ambiguous.

## Brand

Anniymah sells a 4-in-1 perfume combo (Hawas Ice, Bleu de Chanel, Dior
Sauvage, Vampire Blood) for ৳999 with free delivery, targeting customers in
Dhaka via cash on delivery. The visual direction is clean and editorial —
closer to a boutique showroom than the cluttered, discount-badge-heavy style
common among local competitors. Confident, calm, a little premium; never
shouty.

## Color palette

| Token | Hex | Usage |
| --- | --- | --- |
| `--bg` | `#FAF6F0` | Page background |
| `--surface` | `#FFFFFF` | Cards, header, inputs |
| `--sage` | `#6B8F71` | Primary buttons, links, active states |
| `--sage-dark` | `#57765D` | Hover states, price text |
| `--sage-tint` | `#E9F0EA` | Soft backgrounds (trust badges, notes, payment option) |
| `--rose` | `#D98C86` | Accent badges (e.g. "Trending") |
| `--rose-dark` | `#C1746E` | Rose hover state |
| `--rose-tint` | `#F7E9E7` | Soft rose backgrounds |
| `--text` | `#2E2A25` | Body text, headings |
| `--muted` | `#8A8175` | Secondary text, labels, captions |
| `--border` | `#E9E1D3` | Card borders, dividers, input borders |
| `--media-bg` | `#F2E9DD` | Image/icon placeholder backgrounds |

Never introduce new colors outside this palette without updating this doc —
consistency matters more than any single component looking "better."

## Typography

- **Headings:** Fraunces (serif) — weight 500–600. Used for page titles,
  section headings, product names in hero contexts.
- **Body:** Inter (sans-serif) — weights 400 (body text), 500–600 (labels,
  buttons, emphasis).
- Google Fonts import: `Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600`
  and `Inter:wght@400;500;600;700`.
- Base body size: 16px, line-height 1.55.
- Hero heading: ~38–46px. Section headings: ~24–28px. Product/card titles:
  ~15–16px, Inter (not Fraunces) at this size.

## Layout & spacing

- Max content width: 1180px, centered, 28px side padding.
- Border radius: 8px (buttons, inputs), 10px (cards), 16px (large media
  panels, hero visuals).
- Card shadow (where used): `0 1px 2px rgba(46,42,37,.04), 0 6px 20px rgba(46,42,37,.05)`.
- Mobile breakpoint: 880px (nav collapses to a hamburger, grids go to 1
  column, sticky bottom CTA bar appears). Secondary breakpoint at 520px for
  further grid collapsing (e.g. product grids to 1 column) and 480px for
  form input sizing.
- **Mobile input font-size must stay at 16px** — anything smaller triggers
  unwanted auto-zoom on iOS Safari when a field is focused.

## Components

**Buttons**
- Primary: solid `--sage` background, white text, 8px radius, `13px 26px`
  padding, hover darkens to `--sage-dark`.
- Outline: white background, `--border` border, hover border/text turns
  `--sage-dark`.
- Full-width variant (`btn-block`) for form submits and mobile CTAs.

**Badges**
- Pill-shaped, small caps-style label, white text on solid color
  (`--sage` for "New", `--rose` for "Trending"), positioned top-left over
  card media.

**Cards (product / info)**
- White surface, 1px `--border`, 10px radius.
- Media area on top: fixed height, `--media-bg` background, centered icon or
  image.
- Body: 18px padding, title + price + button stacked with ~6px gaps.

**Forms**
- Inputs: white background, 1px `--border`, 8px radius, `12px 14px` padding,
  focus state switches border to `--sage`.
- Labels: 13px, `--muted`, sit above the field.
- Two-column grid on desktop, collapses to 1 column under 880px.

**Order summary card**
- `--sage-tint` background, 12px radius, itemized rows (label left, value
  right), a bold total row separated by a top border, and a small dashed-
  border note box below for delivery/payment info.

**Sticky mobile CTA**
- Fixed to viewport bottom, white background, top border, appears only under
  880px, full-width primary button. Add bottom padding to `body` equal to its
  height so it never overlaps page content.

**Mobile nav**
- Hamburger icon toggles a dropdown panel directly under the header
  (`.mobile-nav`), not an overlay — keeps it simple and avoids z-index/scroll-
  lock complexity for this scope.

## Iconography

Flat, single-color SVG icons on a 64×64 viewBox, either solid-fill silhouette
or simple outline (stroke-width 3) depending on the object — mix both within
a page for visual variety, matching what's already in the reference
implementation (e.g. solid heart-lamp icon, outline fan/jar icons). No
multi-color or gradient icons. No icon packs/libraries — keep them
hand-drawn SVG for full color control and zero dependency weight.

## Copy conventions

- **Bilingual by section, not by sentence:** structural/UI text (button
  labels, field labels) can stay in English; persuasive/customer-facing copy
  (hero pitch, order confirmation messages) is written in Bangla, matching
  how the actual brand talks to its customers.
- **Currency:** always `৳` prefix directly against the number, no space
  (`৳999`, not `৳ 999` or `999৳`).
- **Delivery:** always state "Free" explicitly rather than omitting it —
  free delivery is a selling point, not a default assumption.
- **Payment:** always Cash on Delivery — never imply online payment exists
  yet.
- **Tone:** warm and direct, never using urgency/scarcity tactics ("only 2
  left!", countdown timers) — that's the "bazaar" style this brand is
  deliberately avoiding.

## Reference implementation

The most recent working build (single-offer landing page, WhatsApp/SMS-era)
is the canonical source for exact CSS values, component markup, and
responsive behavior. When in doubt about a specific pixel value, spacing, or
interaction detail not covered above, match that implementation rather than
inventing a new pattern.
