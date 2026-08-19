# Session — 2026-08-18/19: `v7`, and a boundary for a live feed

Three commits on `claude/continue-discussion-w580hz`, from `330ead5`.

| | |
|---|---|
| `600814d` | fix `verify:v6` — Node and Chromium format dates differently |
| `e354ca2` | `/v7` — the radar in filmhood.in's visual language |
| `2ad0753` | `src/feed/` — a validated boundary, `pnpm test`, `pnpm feed:shapes` |

---

## How it started

The session opened as a continuation with no stated task, so the first move was to re-run
the four checks `PHASE-2.md` says to trust. One of them failed, and the failure turned out
to be the most useful thing in the first hour.

Mid-session the user redirected: *"https://filmhood.in/ — I want the website like this, this
is too good, use three js if you want."* That became `v7`. Then: *"move to phase 2"*, which
became the feed boundary.

---

## 1. `verify:v6` was failing on a page that was correct

25 of 27. Both failures were `cards still show their own exact release date`, in both
regions. Nobody had touched `v6` since it was scored green.

The script built its expected string with `Intl.DateTimeFormat('en-GB', { weekday: 'short',
… })` **in Node**, then compared it to text **Chromium** had rendered. Node 22 (ICU 78)
emits `Thu 6 Aug`; Chromium 141 emits `Thu, 6 Aug`. One comma, two red checks, nothing wrong
with the page.

**The generalisation is sharper than the repo's existing version of this trap, because no
one changed any code** — the container was rebuilt and the check came due. A check that
re-derives a formatted string in a second engine is asserting on that engine, not on the
page. The fix moves formatting into `page.evaluate`; the script still decides *which* date
belongs on which card, which is the actual claim.

Negative-tested by shifting expectations one day: 2 FAILs naming the exact mismatch, which
the original assertion never printed.

## 2. `/v7`

### The premise was wrong, and finding that out was the work

The brief offered Three.js. The reference uses none — no canvas, no WebGL, nothing on
`window`, one app bundle and Google Analytics. Its two apparently-dimensional moments:

- a poster field of 254 absolutely-positioned anchors driven by `matrix(s,0,0,s,tx,ty)`,
  where the same `s` is written to `z-index` as `round(s * 1000)` — scale is the depth cue
  and paint order follows for free
- a turntable built from a `repeating-radial-gradient` at a 3px period, one
  `conic-gradient` sheen, and an arm on `cubic-bezier(.3,1.12,.4,1)`, an easing that
  crosses 1 before settling so the needle overshoots

**The quality being attributed to WebGL was two gradients and an easing curve.** Adding
Three.js would have added a bundle and subtracted what made it good.

### Getting a spec for a page that could not be loaded

`filmhood.in` is blocked by the egress proxy and was never loaded in this environment. What
worked was writing an extraction prompt for a browser-side agent that could see it, and
demanding measured values rather than description — `getComputedStyle` dumps, a colour
histogram with counts, `@font-face` src URLs, `document.fonts`, the resource timeline.

That is the whole reason the spec was usable. "Warm off-white with a bold serif" cannot be
built from. `#F7F7F1`, `padding: 80px min(20vw, 280px) 0`, and `Abril Fatface 400` can.

### The one structural refusal

The reference lays every group out as a horizontal scroll strip. Built that way, the
featured week showed **three of eleven titles**, with eight behind a gesture nothing
announced — on a page whose entire job is *what drops this week*.

This is `v3` again. `v3` copied JustWatch's platform grouping, `v4` and `v5` inherited it,
all three scored best on every instrument, and a whole verdict pass was needed to notice the
page no longer answered its own question. **A reference's container encodes its data's
shape, not yours.**

### Defects

Seven across three screenshot rounds; three self-inflicted, matching `v4` and `v6`.

The two worth remembering: a chart whose bars had no height except from an
IntersectionObserver class, photographed as an empty box (an entrance animation must never
be what makes content visible); and a blank white page on every route, caused by trimming
an unused import that took `useRef` with it — which `pnpm lint` passed, because oxlint ships
`no-undef` off.

The chart never came back. Three weeks of data running 1, 11, 1 make a 240px section that is
ninety per cent empty; the counts moved onto the week list as a bar per row. Same
information, no new surface.

## 3. The feed boundary

`releases.js` is 22 rows a person hand-checked. A live source is the opposite. `src/feed/`
is the layer that difference lands on. `v0`–`v6` are untouched; `v7` reads through it, so
the path a real feed will use runs on every page load rather than first running the day
someone wires up an API.

Four things a live feed actually breaks, found by building it:

1. **`PLATFORMS[key].label` is a TypeError waiting for its first uncurated platform.** Every
   route indexes that map with a value from the data. Unseen platforms now get a derived
   label so the lookup always resolves.
2. **A malformed record must be rejected loudly, not rendered partially.** A backwards date
   range prints `Sat 15 – Fri 7 Aug` and nothing notices. `v7` shows a collapsed notice
   naming what was dropped and why.
3. **"The week is empty" and "every request failed" both end in zero records.** `feed:fetch`
   separates them and refuses to write a file for the second.
4. **One source does not cover the page.** TMDB has no fixtures; two of the 22 rows are
   cricket and football.

`pnpm feed:shapes` is the piece that earns its place: it drives the real page in a browser
against ten shapes the snapshot cannot produce — 50 titles in a week, an empty current week,
an unknown platform, every optional field missing, a 60-character unbroken word, half the
feed malformed, one region only, nothing usable at all — plus layout invariants on every
shape. Negative-tested by forcing 420px cards; the overflow assertion fired on four
scenarios.

## 4. Things this session got wrong

Recorded because the corrections are the useful part.

| | What happened |
|---|---|
| Artwork counts | Wrote "eight of twenty-two titles have no artwork" across five files. It is six, and sixteen have artwork across fourteen distinct files. Caught by an existing test asserting the real numbers. |
| Check counts | Claimed `verify:v7` runs 42 checks; it runs 38. `verify:v6` has been documented as 27 since phase 1 and runs 26. Both suites branch on the data, so the totals move with the calendar — now stated in the docs. |
| A wrong check | A `feed:shapes` scenario asserted an empty state where `resolveWeek`'s documented fallback to the most recent week is correct. Third instance this session of the page being right and the check being wrong. |
| An over-strict check | A contrast assertion required the week-bar's *track* to hit 3:1 against the canvas. WCAG does not require it and the design does not need it; held to that floor it would have condemned every hairline on the page. Deleted rather than satisfied. |
| Overwrote a config | Wrote `.oxlintrc.json` without reading it first and destroyed two existing react rules. Restored and merged. The repo's own instruction — look at the target before overwriting — exists for this. |

## 5. Two instruments moved underneath the repo

Neither is about any route.

**`impeccable`'s rule set changed.** Re-scanned in one run:

| | v0 | v1 | v2 | v3 | v4 | v5 | v6 | v7 |
|---|---|---|---|---|---|---|---|---|
| recorded at build time | 7 | 28 | 14 | 3 | 3 | 3 | 0 | — |
| same-run scan, today | 4 | 13 | **1** | 3 | 3 | 3 | **5** | **0** |

`v6` did not regress — `gpt-thin-border-wide-shadow` did not exist when it was scored. `v2`
moves from third-worst to second-best. **Only a same-run column can be ranked.**

**A test suite nobody could run.** `src/data/releases.test.js` had sat in the repo since
phase 1 with ten passing tests and no `test` script — not in the README, not in the four
verification commands. The repo's own "a green suite actively misleads" trap one turn
further on. `pnpm test` now exists.

## 6. Rules this session added to `CLAUDE.md`

Nine, all marked `(v7)`. The four that generalise furthest:

- A reference's *container* encodes its data's shape, not yours.
- An entrance animation must never be what makes content visible.
- Never index a lookup with a value that came from data you do not control.
- A defect count is a reading of one tool at one version.

## 7. Where it ended

All checks green at `2ad0753`: 35 unit tests, `verify:v6` 26, `contrast:v6` 20, `verify:v7`
38, `contrast:v7` 32, `feed:shapes` 67, live audit 0 findings. Each negative-tested.

`/v7` was also published as a self-contained interactive artifact so it could be viewed
without running the repo.

Still blocked, and named at the top of `HANDOFF.md`: `image.tmdb.org` is unreachable, so no
poster has ever rendered on this page.
