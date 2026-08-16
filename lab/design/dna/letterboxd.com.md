# Design Map

Analyzed page: `https://letterboxd.com` (homepage). Note: `/films/`, `/films/popular/`, and other browse pages instantly redirected (same-tab) to a sponsor site (Criterion Channel) on every attempt — a pattern consistent with automation/bot-detection cloaking rather than a normal ad. The homepage itself loaded without redirect on repeated attempts and contains multiple real poster-grid modules (horizontal poster carousels, review-feed poster rows, and list-preview poster filmstrips), which supplied all the evidence below.

## Spacing Scale
Base unit ~5px. Observed: 5px, 10px (most frequent — poster grid gap), 15px, 16px, 20px, 24px, 32px.

## Font Hierarchy
- Hero headline (editorial): 36px / weight 700, serif (TiemposHeadlineWeb)
- H1 (product): 24px / weight 400, sans (GraphikWeb)
- H3 (list/card title): 16px / weight 700, sans
- Body: 16px / weight 400, sans
- Review/list meta: 13px / weight 400, sans (most frequent size on the page)
- Secondary label: 12px / weight 400, sans

Two-family system: GraphikWeb (sans) for all product/UI surfaces; Tiempos (serif) reserved for editorial headline/body moments only.

## Color Palette
- Page background: `#14181C` (near-black navy, 70% visible area)
- Panel/card background: `#202830`
- Text primary: `#FFFFFF`
- Text secondary: `#99AABB`
- Text tertiary: `#667788`
- Rating accent: `#00AC1C` (green, star ratings only)

## Image Ratios
- Poster (carousel + review-feed): 2:3 (0.67:1), true theatrical poster crop, 150×225px source — confirmed on 10/10 sampled images
- Editorial card (Showdowns/News modules): 16:9, a separate, unrelated format used only for non-poster editorial content

## Component Tokens
- Border radius: `clamp(2px, 2.66667%, 8px) / clamp(2px, 1.77778%, 8px)` — fluid, percentage-based, dominant value (count 189); fixed alternatives (3px, 4px) exist but are minority use
- Shadow: 2-layer poster elevation `rgba(0,0,0,0.25) 0px 1px 5px 0px, rgba(0,0,0,0.35) 0px 1px 10px 0px`, plus a 1px inset rim-light `rgba(221,238,255,0.25) 0px 0px 0px 1px inset`
- Grid: 6 columns × 150px poster width, 10px gap (`ul.list.-items-5` — horizontal poster-list/carousel component), 15 separate grid instances detected on one homepage load
- No wrapping card container around posters — shadow/radius applied directly to the poster image
- Motion: consistent custom easing `cubic-bezier(0.165, 0.84, 0.44, 1)` reused across `opacity`/`width`/`right` transitions; `prefers-reduced-motion` respected
- `focus-visible` implemented

---

# Taste DNA

### Give Posters Real Weight on a Near-Black Field
- **Trigger**: Placing small, densely-packed poster thumbnails against a near-black page (`#14181C`) where a flat image would visually merge with its own background.
- **Decision**: Chose a genuine 2-layer drop shadow plus a 1px light inset rim over flat, borderless poster tiles.
- **Reason**: On a dark canvas, the eye needs a physical cue — light catching an edge — to separate "this poster" from "the void behind it"; on a light canvas that cue is unnecessary because contrast against white does the separating for free.
- **Evidence**: shadow `rgba(0,0,0,0.25) 0px 1px 5px 0px, rgba(0,0,0,0.35) 0px 1px 10px 0px` at count 44; inset highlight `rgba(221,238,255,0.25) 0px 0px 0px 1px inset` at count 56.

### One Radius Rule, Fluid Across Every Size
- **Trigger**: Reusing the same poster image at wildly different rendered sizes across the product — a 60px thumbnail in a review row, a 150px tile in a carousel.
- **Decision**: Chose a single `clamp(2px, 2.66667%, 8px)` percentage-based radius formula over a fixed px value or per-context radius overrides.
- **Reason**: A fixed 4px radius looks sharp on a 150px poster but chunky on a 60px thumbnail; a fluid formula keeps the rounding feeling proportionally identical wherever the same poster gets reused.
- **Evidence**: `clamp(2px, 2.66667%, 8px) / clamp(2px, 1.77778%, 8px)` at count 189, the single most frequent radius value site-wide, vs. `3px`:24 and `4px`:22.

### Product Voice vs. Editorial Voice, Told Through Typeface Alone
- **Trigger**: Needing to distinguish "the app talking to you" (feature list, nav, buttons) from "Letterboxd's editorial voice" (marketing headline, trend pieces) without extra visual chrome.
- **Decision**: Chose to reserve the serif family exclusively for headline/editorial moments and keep the sans family for everything else, rather than one font throughout or serif mixed into UI labels.
- **Reason**: A reader can tell instantly, without reading a word, whether they're looking at the product or something Letterboxd wrote — the typeface carries that signal so copy doesn't need a label or color change to announce its register.
- **Evidence**: GraphikWeb count 1131 vs. TiemposHeadlineWeb count 1 (36px/700, hero-only) vs. TiemposTextWeb count 68 (editorial body only); zero serif occurrences in nav, buttons, or review-feed UI.

### Restraint: No Wrapping Card Around the Poster
- **Trigger**: Every poster needs elevation and rounding — the obvious solution is a card wrapper div with its own background, padding, and border containing the image.
- **Decision**: Chose to apply shadow and radius directly to the poster image/link itself, over wrapping every poster in a background-color card container.
- **Reason**: A wrapping card adds a second layer of background color and padding that, on a page showing hundreds of posters per screen, would either force extra whitespace around every tile or introduce a visible color mismatch between card-bg and page-bg; skipping the wrapper keeps the poster as large as possible in the same footprint.
- **Evidence**: `cards: []` — the extractor's card-detection heuristic found zero matches despite shadow (count 44) and radius (count 189) being clearly present and visually confirmed on poster tiles in every screenshot.

---

## Notes specific to the poster-grid catalog brief

- **Letterboxd IS the 2:3 poster-grid reference** (unlike MUBI, which uses 16:9 stills) — this is the more directly transferable site for the target catalog. The clamp()-based radius and dark-canvas elevation technique are both immediately portable.
- **Metadata placement differs sharply from MUBI**: Letterboxd puts metadata *beside/below* the poster (review rows: poster left, title/year/reviewer/stars/text to the right; list previews: poster filmstrip on top, list title/curator/stats below) rather than overlaid on the image. This is the opposite trade-off from MUBI's on-image overlay — worth deciding deliberately for the target design rather than defaulting to one.
- **Density control**: the homepage is much denser and more sprawling than MUBI's catalog — many small components (12-13px type, tightly packed carousels, review feed) reflecting a social product, not a pure browse grid. For a catalog/browse-grid brief specifically, MUBI's flatter, more restrained density is probably the closer model; Letterboxd's poster-elevation and radius technique should be borrowed selectively, not its overall information density.
- **Missing/poor artwork**: no broken-poster or fallback-placeholder case was observed in the sampled screenshots — all posters displayed were legitimate theatrical art. Like MUBI, Letterboxd's design system gives no visible answer to "what does a card look like with no good artwork," since its catalog is curated/complete. This remains an open problem to solve independently for the target design.
- **Automation note for the record**: `/films/`, `/films/popular/`, and similar Letterboxd browse-page URLs redirected instantly (same tab, before any script could capture data) to `criterionchannel.com` on every attempt — this happened across three different browse URLs and is almost certainly automated-traffic cloaking/detection rather than a normal ad unit, since it fired before the page's own content ever painted. The homepage was not affected and yielded reliable, unobstructed data.
