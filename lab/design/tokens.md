# v2 design tokens

Committed before any markup. Everything the v2 route builds must resolve to one
of these values — if a needed value isn't here, it gets added here first.

## Typeface pairing

- **Display — Fraunces.** Variable serif with a wide optical-size axis (9–144)
  and a soft, slightly wonky ink-trap character at large sizes. Used for the
  hero title, section date-headers, and the featured card's title — anywhere
  type is large enough to show its personality. Weight 600 everywhere it's
  used as display type.
- **Body / UI — Manrope.** Geometric grotesque, weights 400–800, calm at small
  sizes, doesn't fight the serif for attention. Used for body copy, meta text,
  badges, nav, and the region toggle label. Weight 500 default, 700 for
  emphasis (card titles, active toggle state).

Loaded via `@import url(...)` at the top of `theme.css` (Google Fonts), not a
`<link>` in `index.html` — keeps the font local to this route. Verified with
`document.fonts.check('600 16px Fraunces')` /
`document.fonts.check('500 16px Manrope')` in a real browser after the fonts
load, not assumed from the `@import` alone.

## Type scale

Base **16px**, ratio **1.333 (perfect fourth)**. Four resulting steps:

| token | formula | px | used for |
|---|---|---|---|
| `--font-size-0` (base) | 16 × 1.333⁰ | 16px | body copy, meta, badges, toggle label |
| `--font-size-1` | 16 × 1.333¹ | 21px | regular card titles |
| `--font-size-2` | 16 × 1.333² | 28px | date-group headers |
| `--font-size-3` | 16 × 1.333³ | 38px | featured-card title |
| `--font-size-4` | 16 × 1.333⁴ | 50px | hero title (upper clamp bound only) |

Rule for staying inside "no more than four sizes on one screen": the hero
title uses `font-size: clamp(var(--font-size-3), 5vw + 1rem, var(--font-size-4))`
— a fluid value with both ends pinned to tokens, not a fifth arbitrary size.
At any single viewport width this reads as one size, so a given screen shows
at most `base, 1, 2, 3` (mobile) or `base, 1, 2, hero-clamped` (desktop) — four
sizes, never five at once. Meta text and badges reuse `--font-size-0` and are
differentiated by weight/case/tracking, not a new smaller size.

## Spacing scale

Base unit 4px, growing roughly ×1.5 at the top end so large gaps don't feel
linear-and-boring next to small ones:

| token | px |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 96px |

## Accent colour

One accent: warm gold, evokes a premiere/marquee feel without touching the
banned indigo/purple family or a default Tailwind blue.

- Light mode: `--accent: oklch(0.74 0.16 65)` (≈ `#D99A3B`)
- Dark mode: `--accent: oklch(0.80 0.15 65)` (≈ `#EFB662`) — lifted lightness
  so it still reads as gold, not muddy amber, against a near-black page.
- `--accent-ink`: the colour used *on* the accent (for filled buttons/toggle
  knob text) — `oklch(0.18 0.02 65)` in both modes, a near-black warm brown,
  never pure `#000`.

Platform brand colours (`PLATFORMS[x].color` in the data) are a deliberate,
documented exception to "everything resolves to a token": they're 11 official
third-party brand marks supplied by the data layer, not designer-chosen
values, and diluting them into the token system would misrepresent the
platforms. They're used only as a small 8px identity dot next to the platform
label — never as a background, never at a size or saturation that competes
with the page's one true accent.

## Radius rule

Rounding is a function of *role*, not a per-component list:

- **Pill controls** — anything the user grabs and slides, or a small tag
  meant to read as a chip (the region toggle track/knob, platform badges,
  date-range tags) — get `--radius-full: 999px`.
- **Content containers** — anything that frames media or groups content as a
  discrete block (poster cards, the poster-less fallback tile) — get
  `--radius-md: 14px`.
- **Small interactive non-pill controls** — anything clickable that isn't a
  pill (icon buttons, if any) — get `--radius-sm: 8px`.
- **Everything else — text, layout wrappers, the page background, section
  dividers — stays square (`--radius-none: 0`).** If it doesn't hold media
  and doesn't get grabbed or tapped as a discrete chip, it isn't rounded.

## Elevation rule

Elevation is earned by the one element the user is actively engaging with off
the page's resting plane — nothing is elevated at rest.

- `--shadow-rest: none` — the default for every surface, always.
- `--shadow-raised` — applied only on `:hover`/`:focus-visible` of a poster
  card, and permanently on the active region-toggle knob (it's always "in
  use"). Two-layer shadow, tuned per mode:
  - Light: `0 1px 2px oklch(0 0 0 / 0.08), 0 12px 28px -14px oklch(0 0 0 / 0.35)`
  - Dark: `0 1px 2px oklch(0 0 0 / 0.5), 0 16px 32px -14px oklch(0 0 0 / 0.65)`

Nothing else — not the header, not badges, not the container — ever casts a
shadow.

## Motion

Named easing curves:

- `--ease-glide: cubic-bezier(0.25, 0.46, 0.45, 0.94)` — standard ease-out.
  Used for entrances (card rise-in) and the toggle knob slide.
- `--ease-settle: cubic-bezier(0.65, 0, 0.35, 1)` — symmetric ease-in-out.
  Used for hover lift/return and colour transitions.
- `--ease-snap: cubic-bezier(0.16, 1, 0.3, 1)` — quick, emphasized ease-out.
  Used for the toggle's background-colour flip (fast, decisive).

Durations:

- `--duration-snap: 120ms` — toggle colour flip, focus rings.
- `--duration-glide: 220ms` — hover lift/return, badge state changes.
- `--duration-settle: 420ms` — card entrance rise, toggle knob slide.
- `--stagger-step: 40ms` — per-card entrance delay multiplier
  (`calc(var(--stagger-step) * var(--i))`), so the grid staggers in without a
  hand-picked delay per card.
