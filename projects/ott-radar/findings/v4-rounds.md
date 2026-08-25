# v4 design-lab findings

Method: `pnpm shoot v4`, look at all six screenshots (390/768/1440 × light/dark), write
down defects, fix only what was written down, repeat. `/v4` started as a verified
pixel-identical copy of `/v3` (confirmed via `PIL.ImageChops.difference` across all six
shots — the only non-zero bbox was inside a single poster `<img>`, consistent with
sub-pixel JPEG decode noise, not a layout difference).

## Round 1

Screens reviewed: `lab/shots/v4/{390,768,1440}-{light,dark}.png`, plus a manual check of
the US region (toggled via Playwright) at 1440px, since the toggle is a primary
interaction and IN-only screenshots would miss half the page's states.

**D1 — Sparse platform-group grids leave the row 70–90% empty at 768px and 1440px.**
`.v4-grid` uses `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`. The
number of tracks is computed from the *container* width, not from how many releases are
in that group, so a platform with 1–2 titles (Prime Video, ZEE5, Lionsgate Play, Sun NXT,
Netflix, SonyLIV in the India view; 4 of 6 groups in the US view — Apple TV+, Disney+,
Hulu, HBO Max) renders one poster pinned to the left edge of a full-width row with a
large blank field to its right. Worst on the US page at 1440px: four consecutive
sections each show a single ~230px poster on an otherwise empty 1300px-wide row. Reads
as broken/half-loaded content, not a deliberate layout.

**D2 — The "~" approximate-artwork marker is a stray-looking floating character that can
end up orphaned at a line wrap (390px).** In `ReleaseCard`, `{' '}~` is appended straight
into the `<h3>` title text with only a regular space before it. At 390px, "Bigg Boss: The
Common Man" wraps, and the marker lands alone at the end of the wrapped line ("Common
Man ~") with no visual container tying it to the concept of "approximate" — it reads as
a typo or a rendering glitch, not an intentional annotation. Same issue, less severe, at
1440px ("Aakhri Sawal ~").

**D3 — `.v4-meta` line-wrap leaves an orphaned "·" separator alone at the start of the
wrapped line (390px).** The middle-dot separators are implemented as `::before` content
on every meta item after the first (`.v4-meta > * + *::before`), so the dot travels with
the *following* item, not the preceding one. When `.v4-meta` wraps at 390px (e.g. Reacher
S4: "Series · English" on line 1, "· Aug 12" on line 2), the date's leading dot opens the
new line by itself — a stray punctuation mark with nothing before it on that line.

**D4 — The H1's "this week" claim is directly contradicted by the date range printed two
lines below it, worst on the US region at all widths.** Header reads "This week in the
United States"; `.v4-sub` immediately below reads "9 new titles across 6 platforms ·
Jul 2 – Aug 28, 2026" — an 8-week span, not a week. The page's central claim doesn't
match the data it's summarizing, and the contradiction sits inside the same header block
where a reader's eye naturally connects the two lines.

**D5 — Dark-mode poster/fallback edge treatment is invisible against the near-black
canvas, so cards with light-toned artwork "float" with no framing while cards with dark
artwork blend into the page.** `--shadow-rest`/`--shadow-lift` in dark mode use black
shadow colors (`rgba(0,0,0,…)`) against a `#17181C` canvas — a shadow that dark is
indistinguishable from the background it's meant to lift off of. The only edge cue is
`--rim: inset 0 0 0 1px rgba(255,255,255,0.14)`, which is too faint to read as a border
at normal viewing size. Most visible on "Aakhri Sawal" (768px/1440px dark): the poster's
own baked-in cream/white background reads as a stray bright rectangle with no unifying
edge, rather than a deliberately framed card like its neighbors.

**D6 — At 1440px the JioHotstar row (6 items) and every 1–2 item row below it use the
same ~230px column width, so there is no visual hierarchy between "this platform has a
lot this week" and "this platform has one title" — both render as identically-sized
tiles in identically-structured rows, just with different amounts of trailing dead
space.** This compounds D1: the page has no way to signal "big week" vs. "small week" per
platform other than the count label in the header text.

### Fixes applied after Round 1

- D1/D6: restructured `main` to a `flex-wrap` row of group blocks (`.v4-group` sized to
  its own content via `flex: 0 1 auto` instead of always claiming 100% width), and
  bounded `.v4-grid` tracks to `auto-fit, minmax(150px, 200px)` so a group's natural
  width is well-defined. Sparse groups now sit side by side instead of each claiming an
  empty full-width row. A `max-width: 600px` breakpoint keeps mobile as a single column
  (matching v3/v4's existing stacked mobile layout) since side-by-side groups don't fit
  a 390px viewport.
- D2: approx marker rewritten as a non-breaking, self-contained `(approx.)` suffix
  (` (approx.)`) styled as small muted text, so it can't separate from its title
  and reads as an intentional annotation instead of a stray glyph.
- D3: swapped the separator from a leading `::before` on each item to a trailing
  `::after` on every item except the last, so the dot stays attached to the end of the
  item before it and never opens a wrapped line alone.
- D4: changed the H1 copy from "This week in {region}" to "New on OTT in {region}" —
  drops the false "this week" claim; the exact date range remains in the sub-line where
  it belongs.
- D5: raised dark-mode `--rim` opacity from 0.14 to 0.26 so every poster/fallback gets a
  consistently visible light edge regardless of the artwork's own background color.

## Round 2

Re-shot `/v4` after the Round 1 fixes and reviewed all six screenshots again
(`sips -Z 1200`, full read of each), plus targeted full-resolution crops of the group
rows and a pixel comparison against the pre-fix `/v3` reference to quantify the mobile
height change. The flex-wrap restructuring from Round 1 fixed D1/D6 convincingly (sparse
groups now share rows) but introduced its own problems, and one Round 1 copy fix created
a new redundancy.

**D7 — The JioHotstar group (6 titles) collapses into a single narrow column at 768px and
1440px instead of a wide multi-column block.** Root cause: `.v4-group` uses `flex: 0 1
auto`, so its flex-basis is computed from `.v4-grid`'s *intrinsic* (max-content) size. Per
the CSS Grid spec, `repeat(auto-fit, …)` has no definite repetition count when sized
intrinsically (there's no container width to divide by yet), so browsers resolve it to a
single column for that calculation — meaning JioHotstar's grid reports a max-content width
of ~200px (one card) to the flex algorithm, identical to a true one-item group. Flexbox
then packs it into a row alongside the other single-item groups and hands it only ~200px
of *actual* width. Only once laid out inside that too-narrow allocation does `auto-fit`
recompute for real — and with ~200px available, only one column fits, so all 6 titles
stack vertically in a single tall, narrow lane. The section is now the visually dominant,
oddly-shaped element on the page: a 6-poster-tall column standing alone next to four
normal-height single-poster groups.

**D8 — SonyLIV's 2 titles stack vertically instead of sitting side by side (768px,
1440px), same root cause as D7.** "India Tour of Sri Lanka" renders directly above
"IndianOil Durand Cup 2026" in one ~200px column even though the row has 900+ px of
unused width to the right at 1440px — there is no content reason for these two same-group
cards not to sit next to each other.

**D9 — Round 1's fix made every poster render at a flat 200px cap regardless of viewport,
inflating the mobile page's scroll length well beyond what the content needs.** At 390px,
a single-item group's card grew from ~167px wide (the old `auto-fill, minmax(150px,1fr)`
result, confirmed by pixel-measuring the frozen `/v3` reference at the same width) to a
flat 200px, ~20% larger per card with no added content — on a phone screen, where vertical
space is the scarce resource, this is the wrong trade-off; the desktop/tablet gain (D1's
fix) doesn't need to cost mobile scroll depth.

**D10 — Self-inflicted copy regression: "OTT" now appears twice in two consecutive
lines of the header, at every viewport and both regions.** Round 1's D4 fix changed the
H1 from "This week in India" to "New on OTT in India" to drop the false weekly claim —
but the eyebrow directly above it already reads "OTT RELEASE RADAR". The two lines now
read "OTT RELEASE RADAR / New on OTT in India," repeating the same word beat-for-beat
right where a reader's eye lands first.

**D11 — Round 1's dark-mode rim fix (opacity 0.14 → 0.26) is not enough to frame
posters whose own artwork has a light/white background.** Re-checked "Aakhri Sawal"
(Lionsgate Play) at 768px and 1440px dark: the poster's cream background still meets the
near-black canvas edge-on, with only a 1px highlight between them — at normal viewing
distance it still reads as a stray white rectangle cut out of the page rather than a
framed card. A 1px inset highlight cannot function as a mat; the artwork needs an actual
border of canvas-toned pixels around it, not just a brighter edge highlight.

### Fixes applied after Round 2

- D7/D8: gave each `.v4-group` an explicit pixel `flexBasis` computed in JS from its own
  item count (`min(items.length, 6) × 200px + gaps`), instead of leaving it at `auto`.
  This sidesteps the auto-fit intrinsic-sizing ambiguity entirely — flexbox now reserves
  real width for content-heavy groups up front, so JioHotstar gets bumped to its own row
  with room for multiple columns, and SonyLIV's 2 items get exactly enough width to sit
  side by side.
- D9: added a mobile-only override (inside the existing `max-width: 600px` block)
  capping `.v4-grid` at `minmax(140px, 170px)` instead of the desktop `200px`, restoring
  roughly the original mobile card size.
- D10: changed the H1 copy again, from "New on OTT in {region}" to "New releases in
  {region}" — drops the repeated "OTT" without reintroducing a false "this week" claim.
- D11: wrapped the poster `<img>` in a `.v4-poster-frame` div with a small padding and a
  `var(--surface-a)` background, so every poster gets an actual themed mat around it
  (not just a 1px highlight) regardless of the artwork's own background color. Box-shadow
  and hover-lift moved from the image to the frame.

## Round 3

Re-shot again after the Round 2 fixes. Page height at 1440px dropped from 7400px to
4540px device-px — the D7/D8 fix worked as intended. But two of the Round 2 fixes had
side effects only visible once re-rendered, and closer inspection of the compacted
layout surfaced two more.

**D12 — Platform-name headers wrap mid-word at 768px and 1440px: "Prime Video" renders
as "Prime" / "Video" on two lines, and "Lionsgate Play" as "Lionsgate" / "Play"; "1
title" next to them wraps to "1" / "title" too.** Cause: Round 2's `basisFor()` sets a
single-item group's `flex-basis` to exactly `CARD_MAX` (200px) — enough for the poster,
but "Prime Video" and "Lionsgate Play" need more than 200px at `--fs-2` (1.5rem, bold).
Since `.v4-group` has `flex-shrink: 1` and no `white-space: nowrap` guarding the header,
the box shrinks below the header's natural width and the header text wraps. Round 1's
fix (D1) solved the empty-space problem for these same short platform names; Round 2's
fix (D7) reintroduced a wrapping problem for them from the opposite direction.

**D13 — JioHotstar's 6 cards split 5-and-1 at 1440px, leaving the second row almost
entirely empty (just "Lanterns" alone against ~1100px of blank space).** `CARD_MAX` is
200px, so 6 columns need `6×200 + 5×24 = 1320px` — 8px more than the shell's ~1312px
content width. `auto-fit` can't quite fit 6, drops to 5, and the 6th item free-falls to a
mostly-empty second row. The exact same content at 768px splits evenly (3+3) because the
math works out differently there — this is specifically a 1440px, 8-pixels-short problem.

**D14 — The H1 copy from Round 2's D10 fix, "New releases in {region}," doesn't
describe 2 of India's 13 titles.** "India Tour of Sri Lanka" and "IndianOil Durand Cup
2026" (SonyLIV) are live sport listings, not releases — a cricket tour isn't "released."
Visible directly under the H1 at all three widths for the India region.

**D15 — The approximate-artwork marker's `font-size: 0.8em` computes to ~12.8px (0.8 ×
the inherited 16px title size) — a fifth type size that doesn't match any token in the
page's own four-size scale (`--fs-0` 14px / `--fs-1` 16px / `--fs-2` 24px / `--fs-3`
fluid display size).** Visible on every card with `posterApprox: true` ("Aakhri Sawal,"
"Bigg Boss: The Common Man") at every viewport — the marker is legible but doesn't
belong to the type system.

**D16 — SonyLIV's two India entries are both fallback (no-poster) cards, and thanks to
Round 2's D7/D8 fix they now sit directly side by side in the same row (1440px/768px)
— but the tone system meant to differentiate adjacent fallback panels is too subtle to
read as different at a glance.** "India Tour of Sri Lanka" (tone b, `--surface-b`
`#D9DCE1`) and "IndianOil Durand Cup 2026" (tone a, `--surface-a` `#E2E4E8`) differ by
about 10 luminance units — practically identical side by side. Before Round 1's fix
these two cards were stacked in the same narrow column and rarely viewed side-by-side in
the same glance; now that sparse groups share rows, adjacent-fallback tone collisions are
common and the existing three-tone spread doesn't hold up.

### Fixes applied after Round 3

- D12: added `white-space: nowrap` to `.v4-group-header h2` and `.v4-group-count`. A
  platform name should never wrap regardless of the target flex-basis; this restores the
  group's automatic flex-shrink minimum to the header's real content width, so the group
  box can't be squeezed narrower than its own title.
- D13: lowered `CARD_MAX` from 200px to 190px (both the JS `basisFor()` constant and the
  matching `.v4-grid` `minmax(150px, …)` upper bound), so 6 columns fit within the
  1440px shell's content width (`6×190 + 5×24 = 1260px` ≤ ~1312px) instead of falling
  just short of it.
- D14: changed the H1 copy again, from "New releases in {region}" to "What's new in
  {region}" — reads naturally for movies, series, and live sport alike, still avoids
  repeating "OTT" from the eyebrow, still doesn't overclaim a strict weekly cadence.
- D15: changed `.v4-approx` from `font-size: 0.8em` to `font-size: var(--fs-0)`, reusing
  the existing 14px meta-text token instead of introducing a new size.
- D16: widened the tonal spread of `--surface-a/b/c` in both themes (light:
  `#E2E4E8`/`#CBCED4`/`#F4F5F7`; dark: `#1F2126`/`#2E323B`/`#131418`) so the three
  fallback tones are clearly distinguishable when two land next to each other, while
  staying inside the same zero-saturation, cool-neutral family the file's own comment
  calls for.
