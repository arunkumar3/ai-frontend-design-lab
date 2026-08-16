# Design Map

Analyzed pages: `https://mubi.com` (marketing homepage) and `https://mubi.com/en/films?all_films=true` (Browse catalog grid — primary evidence for the poster/catalog decisions below).

## Spacing Scale
Base unit ~4px. Observed: 7px, 9px, 12px, 14px, 16px, 20px (most frequent, count 50 — grid gutter and card internal padding).

## Font Hierarchy
- Hero (marketing only): 60px / weight 500
- H1 "BROWSE": 32px / weight 500
- H3 / active tab: 22px / weight 500
- H2 / section label: 18px / weight 300
- Body / UI text: 14px / weight 400
- Card metadata (director/country/year): 12px / weight 700, director name uppercase

Single family throughout: Riforma. No serif, no mono anywhere on the site.

## Color Palette
- Page background: `#EAEAEA` (warm mid-gray, not pure white/black)
- Text on image overlay: `#FFFFFF`
- Secondary text: `#7D7D7D`
- Tertiary text: `#666666`
- Accent (UI-state only): `#001489` (deep cobalt blue)

## Image Ratios
- Catalog grid cell: 16:9 (1.78:1) landscape film still — uniform across every sampled card (10/10 sampled at identical 400×225 source dimensions)
- Homepage promo modules: mixed ratios (1.48:1–1.83:1), editorial use only, not part of the catalog grid

## Component Tokens
- Border radius: `0px` on all grid cells/images; `10px` search input; `38px` pill CTA; `50%` hover icon buttons
- Shadow: functionally none (only alpha-0 artifact detected: `rgba(0,0,0,0) 0px 2px 4px 0px`)
- Grid: 3 columns at 1440px viewport (~1112px content width), ~20-24px gutter, `display:grid` with `gap` (not margin-based)
- Pagination: numbered pages (1…417), not infinite scroll
- Motion: hover feedback via `opacity`/`transform` only, 100-150ms durations, no layout-shifting animation
- `focus-visible` implemented; no `prefers-reduced-motion` rule detected in stylesheets

---

# Taste DNA

### Absorb, Don't Compete — the Gray Canvas
- **Trigger**: Laying out a grid where nearly every cell is a different, uncontrolled film still with clashing color and tone.
- **Decision**: Chose a flat warm mid-gray page background (`#EAEAEA`) over pure white or pure black.
- **Reason**: White would wash out stills and amplify contrast clashes between neighbors; black would tip the page into cinema-viewer mode instead of a browsing surface. Mid-gray stays neutral enough that no single still can dominate it.
- **Evidence**: `pageBackground rgb(234,234,234)`; absent from top text/accent color lists; dominant surface across background samples.

### No Elevation, By Design
- **Trigger**: Building a repeating grid-cell component that renders thousands of times across a 417-page catalog.
- **Decision**: Chose zero border-radius, zero border, and no perceivable shadow over any card elevation treatment.
- **Reason**: Elevation is a cost paid once by the designer but re-perceived thousands of times by the user; flatness lets the grid recede so the artwork carries the page rather than a UI chrome effect competing with it at scale.
- **Evidence**: card radius `0px`; shadow `rgba(0,0,0,0) 0px 2px 4px 0px` — alpha 0, imperceptible; no bordered card shape detected by the extractor at all.

### Metadata as Skin, Not Furniture
- **Trigger**: Needing to show title, director, and country/year on a cell fully occupied by a 16:9 image with no reserved caption space.
- **Decision**: Chose a bottom-left text overlay on a dark scrim directly over the image, over a separate caption bar below the image.
- **Reason**: A caption bar under every cell would shrink the actual artwork by roughly a fifth to make room for three lines of small text, repeated across hundreds of pages; overlaying keeps full image size and treats the text like credits printed on a lobby card.
- **Evidence**: white text (`#FFFFFF`, count 102) dominates the text-color sample; no separate card/caption shape detected; 12px/700-weight metadata block sits inside the image bounds, not below it.

### One Blue, Never Spent on the Content Itself
- **Trigger**: Having a single brand accent color while the grid already supplies its own color signal from hundreds of unrelated film stills.
- **Decision**: Chose to spend `#001489` exclusively on UI state — active tab, links, CTA — over using it to color-code genres, badges, or tags on the grid itself.
- **Reason**: If the accent bled into content (colored genre badges on every still), it would compete with the artwork and dilute its own meaning; kept scarce, the one time it shows up mid-hover it reads unambiguously as "this is an action," not decoration.
- **Evidence**: `#001489` occupies ~0.6% of visible area despite 38 occurrences; never appears in the top-6 backgroundColors by area; only appears on active-tab underline, links, and hover-triggered add/watchlist icons.

---

## Notes specific to the poster-grid catalog brief

- **MUBI's catalog does NOT use 2:3 poster art** — it uses uniform 16:9 landscape film stills. This is itself a transferable lesson: a wider, calmer aspect ratio is one way to tame a wall of visually loud, unrelated artwork. If the target design commits to 2:3 posters (which crop tighter and read "louder" per cell — more face/color per square inch), MUBI's flat-canvas and zero-elevation strategies become even more load-bearing to compensate.
- **Density control**: only 3 data points per card (title, director, country+year) — no runtime, no rating, no genre tags, no synopsis on the grid itself. Everything else is deferred to a detail page. Numbered pagination (not infinite scroll) is itself a density-control decision — it bounds how much a user is asked to process per screen and gives a stable return-point.
- **Missing/poor artwork**: no broken-image or placeholder-art case was found in ~24 sampled cards across the first catalog page — MUBI's curated-catalog model (every title has a maintained still) sidesteps this problem rather than solving it visually. This is a meaningful gap for the transfer: MUBI's design system doesn't demonstrate a fallback treatment, so that specific problem (what a card looks like with no good artwork) will need to be solved independently, not borrowed from MUBI.
- Two automation notes for the record: mubi.com's homepage repeatedly opened an uncontrollable new tab to justwatch.com/us/new (MUBI owns JustWatch) during navigation/wait steps — closed and ignored, did not affect analysis of mubi.com itself.
