# Design Map

*Capture note: DOM/CSS extraction was not available for this domain (the shared Playwright browser session was under contention from a concurrent process throughout the capture window). Every value below is read directly from three verified screenshots — marketing hero, `/browse` hero, `/browse` shelves — and marked `~approx` per the no-DOM-data rule, rather than computed from `getComputedStyle`.*

## Spacing Scale
- `~approx` 16px / 24px / 32px / 48px rhythm between shelf sections and tile gutters — not DOM-confirmed

## Font Hierarchy
- Marketing headline ("Great movies take you there") — `~approx` 44–48px, bold sans, sentence case
- Collection hero title ("DESERT TRIPS") — **not a live text element**: custom lettering baked into the hero image itself, with a tiled five-star-icon texture filling the letterforms
- Shelf section labels (WATCH LIVE / NEW COLLECTIONS / POPULAR COLLECTIONS / FRESH FROM THEATERS) — `~approx` 14–16px, bold, tracked, all-caps — identical size across every section regardless of position
- Tile captions ("Starring Harry Dean Stanton") — `~approx` 15–16px, regular weight, sentence case
- Nav labels (NOW PLAYING, SEARCH, ALL FILMS) — `~approx` 13px, tracked, all-caps

## Color Palette
- `~approx #141414` — page background (near-black, not pure black)
- `#FFFFFF` — primary text, section labels
- `~approx #9A9A9A` — secondary text (captions, "VIEW ALL")
- `~approx #A9812F` — warm gold/mustard, used only on the primary subscribe CTA ("TRY 7 DAYS FREE") — the single saturated, solid-fill chrome element across all three captured views
- `~approx #E0212F` — red, confined to the "LIVE" status pill badge only
- All other color in the interface comes from the content itself (film stills, hand-lettered collection art), not from UI chrome

## Image Ratios
- Collection tile (curatorial shelves): `~approx` 3:2 landscape, custom-lettered art (e.g. Southern Gothic, Rock Biopics)
- Premiere poster tile ("Fresh From Theaters" shelf): `~approx` 2:3 portrait, standard poster crop with an "EXCLUSIVE PREMIERE" ribbon and an overlaid critic pull-quote
- Hero still (marketing + per-collection browse hero): `~approx` 21:9 to full-bleed

## Component Tokens
- Radius: `~approx` 4–6px on tiles and the CTA button — not DOM-confirmed
- Shadow: none strongly visible in any capture — depth comes from image content against the dark background, not elevation
- Grid: 4 tiles visible per shelf at ~1200px viewport width, advanced via a chevron (›) control — horizontal-scroll carousel, not a wrapping grid
- Live/lock iconography: small lock glyph bottom-left on gated live content, red "LIVE" pill bottom-left on the live channel tile

---

# Taste DNA

### Editorial Voice Lives in the Artwork, Not the UI Type System
- **Trigger**: Needing a distinct curatorial personality for each weekly collection while still running a scalable, repeatable shelf template.
- **Decision**: Baked bespoke lettering and graphic treatment into each collection's thumbnail image itself (Desert Trips' tiled-star block caps, Southern Gothic's yellow serif, Rock Biopics' red script) instead of expressing personality through the live CSS type system.
- **Reason**: A single reusable shelf component can't carry curatorial voice on its own. Putting the voice in the artwork lets every collection look hand-designed while the surrounding grid, captions, and section labels stay completely uniform and quiet.
- **Evidence**: Section headers (WATCH LIVE, NEW COLLECTIONS, POPULAR COLLECTIONS, FRESH FROM THEATERS) are small, uniform, tracked caps at one consistent size; captions beneath tiles are plain sentence-case white text with no styling variation; only the tile artwork itself varies in typeface, color, and composition per collection.

### Two Tile Grammars for Two Kinds of Content
- **Trigger**: Displaying both curated collections (an editorial argument, e.g. "Southern Gothic") and individual new theatrical releases (a single film needing critical credibility) in the same scrolling-shelf format.
- **Decision**: A landscape ~3:2 tile with custom collection typography for curated shelves, and a portrait poster tile with an "EXCLUSIVE PREMIERE" ribbon plus an overlaid critic pull-quote for the "Fresh From Theaters" shelf — rather than forcing every shelf into one poster-grid shape.
- **Reason**: A collection is a curatorial statement and reads better as a wide cover; a single new film needs the vertical one-sheet plus critical praise to make its case for a subscription decision. The two content types have different jobs, so they get different card shapes.
- **Evidence**: New Collections and Popular Collections tiles are landscape with typographic art; Fresh From Theaters tiles are portrait poster crops carrying an EXCLUSIVE PREMIERE label bar and an italic critic quote overlaid directly on the image.

### Chrome Stays Grayscale So Content Photography Supplies All Color
- **Trigger**: Displaying decades of film stills and hand-designed collection art that already carry enormous inherent color variety (Southern Gothic's yellow, Desert Trips' blue, Rock Biopics' red).
- **Decision**: Kept nav, section labels, captions, and body chrome entirely black/white/gray, with exactly one warm gold accent reserved for the primary subscribe CTA.
- **Reason**: If the interface introduced additional brand colors, it would compete with the film stills and hand-lettered collection art for attention. A neutral frame lets the already-colorful content be the only color source, and reserves the single accent for the one action that matters commercially.
- **Evidence**: Header/nav bar reads as near-black with white type only across all three captured views; section headers and captions are white/gray with no color; the gold-filled CTA button is the only saturated, solid-fill chrome element visible in the entire capture.

### Restraint: A Flat, Quiet Type Scale Despite Having Room for a Loud One
- **Trigger**: With several shelf sections stacked vertically (Watch Live, New Collections, Popular Collections, Fresh From Theaters), a typical streaming UI would use escalating, oversized shelf headers to build scannable hierarchy.
- **Decision**: Every section header renders at the same small, tracked, all-caps size regardless of position or importance — none competes in size with the collection artwork above it.
- **Reason**: The collection artwork above the fold has already spent the page's typographic drama (huge custom lettering, a tiled star-pattern texture on "DESERT TRIPS"). A second layer of big display headers below would fight it; keeping shelf labels uniformly quiet lets the hand-designed hero art remain the only loud typography on the page.
- **Evidence**: WATCH LIVE, NEW COLLECTIONS, POPULAR COLLECTIONS, and FRESH FROM THEATERS all render at the same small caps size/weight across the captured screenshots; the DESERT TRIPS hero treatment is roughly an order of magnitude taller than any shelf label.

---

## Capture caveats
- No DOM/CSS extraction succeeded for this domain — the shared Playwright browser was under active contention from a concurrent process (evidenced by tabs and navigations repeatedly being hijacked mid-capture toward mubi.com and letterboxd.com). All px/hex values above are visual estimates from three verified screenshots, not computed styles. Flagged `~approx` throughout per the skill's no-data rule.
- www.criterionchannel.com's root redirects to a marketing/signup page (`signup.criterionchannel.com`); the poster-grid-relevant surface is `/browse`, which is publicly viewable without login and was captured directly.
- Region/locale switcher was not located in this capture (US-only site as far as observed); not confirmed either way.
- No instance of missing/placeholder artwork was observed in the captured shelves.
