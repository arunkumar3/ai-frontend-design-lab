# Reference synthesis — what to take, and why it suits an OTT catalog

Sources: `mubi.com`, `letterboxd.com`, `justwatch.com`, `criterionchannel.com`
(extracted with the `taste` skill, 2026-08-15).

Rule for this drill: **take the systems, not the pixels.** Cloning any one of these
produces a worse version of it. Each decision below names the reference that informed it
and why it applies to *this* product specifically.

---

## 1. Platform identity: stamp it once per group, never per card

**From JustWatch** — the direct competitor, and the single most valuable extraction.

JustWatch does **not** badge every poster with its streaming service. It groups titles
under a provider header carrying one 50×50 logo and a title count, then lays the posters
out beneath. A dozen competing brand colours — Netflix red, Disney blue, Hulu green —
never touch the poster grid itself.

**Why it applies here:** this is the direct fix for our deepest surviving tell. `v0` had no
colour identity because eleven platform brand colours *were* the palette. `v1` confined
them to hatch tints. `v2` shrank them to 8px dots. All three kept the brand colour
*inside the grid*. JustWatch removes it from the grid entirely.

**Take:** platform becomes a grouping dimension with one mark per group, not a per-card
decoration. This also retires T13 (the decorative badge dot) by deleting the badge.

## 2. A non-white canvas, because the artwork is loud

**From MUBI** (`#EAEAEA` warm mid-grey) and **Letterboxd** (`#14181C` near-black).

Neither uses white. Both chose a canvas whose job is to stop clashing poster artwork from
fighting the page.

**Why it applies here:** our 16 posters span Bollywood primaries, a neon *Bigg Boss* set, a
muted sci-fi still, and cartoon illustration. That is a harder colour problem than either
reference faces, and `v2`'s cream paper is closer to right than `v0`'s white — but still
light enough that saturated posters punch holes in it.

**Take:** commit to a deliberate canvas value chosen against our actual artwork, and check
it against the loudest poster in the set (`Bigg Boss: The Common Man`, saturated yellow).

## 3. Elevation belongs to the poster, not to a card around it

**From Letterboxd.** Posters carry a two-layer drop shadow plus a 1px light inset rim,
applied directly to the image. There is no wrapping card `div`.

**Why it applies here:** this quietly fixes **T4**, our one regression. Ragged card heights
exist because there is a card — a box whose height is set by however many lines the title
wraps to. Delete the box and the raggedness has nowhere to live: posters align on a strict
grid, and captions below simply run to their natural length.

**Take:** no card wrapper. The poster is the object.

## 4. Fluid radius, so rounding stays proportional

**From Letterboxd:** `border-radius: clamp(2px, 2.66667%, 8px)`.

**Why it applies here:** our grid renders posters at very different widths — 390px mobile
single-column against 1440px multi-column, plus any featured treatment. A fixed 8px radius
that reads correct at 200px reads clumsy at 90px.

**Take:** express radius as a percentage-based clamp, not a fixed token.

## 5. The accent is for interface state only, never for content

**MUBI** rations `#001489` navy to active tabs, links, and hover. **Criterion** reserves
one warm gold for the subscribe CTA and nothing else. Both keep the accent off the content.

**Why it applies here:** `v2` used its amber accent for the eyebrow *and* the sport
date-range pills — a content role. That is why the sport pills read as louder than they
should.

**Take:** accent is reserved for interactive state: active toggle, focus ring, hover. Content
differentiation must come from typography and position instead.

## 6. Two fonts as a register signal, not decoration

**From Letterboxd:** sans for product UI, serif reserved strictly for editorial and
marketing headlines. **Criterion** does the inverse and keeps its live type system
deliberately flat, letting bespoke artwork carry the voice.

**Why it applies here:** `v2` used Fraunces for the h1 *and* for the missing-artwork
panels — mixing an editorial voice into a utility state. The register split should be a
rule, not a mood.

**Take:** serif marks editorial moments only. Everything functional is sans.

---

## What the references do NOT solve

**None of the four handles missing artwork.** MUBI, Letterboxd, and Criterion run curated,
complete catalogs; JustWatch's providers supply art for everything. There was no fallback
case to extract in any of them.

This is worth stating plainly because it inverts the usual assumption about references.
Our hardest problem — six of 22 titles with no poster, concentrated in regional and sports
content — **has no reference solution available.** It requires original design work.

`v2`'s answer (set the real title in display type on a quiet panel) remains the best idea
produced so far, and the references validate it by their silence rather than contradict it.
Carry it forward; refine it against the new canvas.

**JustWatch has no region switcher.** Region is resolved entirely by URL segment (`/us/`).
Our toggle is therefore an unvalidated design decision, not a convention we can borrow.
It needs its own justification and its own place in the hierarchy.

---

## Extraction caveats

- **Criterion Channel:** DOM extraction never completed; its tokens are screenshot-derived
  and marked `~approx` throughout. Treat its numbers as indicative, its structural
  observations as sound.
- **Letterboxd:** `/films/` browse pages redirect to a sponsor site under automation, so
  the analysis draws on homepage poster-carousel and review-feed modules rather than the
  true browse grid.
- **Process note:** two extraction agents were run concurrently and contended for a single
  Playwright MCP browser, hijacking each other's tabs mid-capture. Both recovered by
  retrying and verifying page content before trusting a screenshot, but it roughly doubled
  the wall-clock and caused the Criterion DOM failure. Do not parallelise agents that share
  one browser.
