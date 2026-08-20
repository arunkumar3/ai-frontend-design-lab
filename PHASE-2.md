# Phase 2 — handoff

> **Superseded on state by [`HANDOFF.md`](HANDOFF.md).** That document is the current entry
> point: branch, commands, what is blocked, gaps and open decisions. This one is kept for
> what it uniquely holds — §2, the reasoning behind every `v6` decision, and §4, the trap
> list with the evidence for each. Where the two disagree about state, `HANDOFF.md` is
> right.

Phase 1 ran six drills (`v0`–`v5`) to measure which lever most improves AI-generated
frontend, then built `v6` from what the measurements said. This document is the starting
point for the next conversation. Read this, `CLAUDE.md`, and `playbook/findings/RANKING.md`
first.

**State:** `v6` is merged to `main`. It was built on `v6-weekly-radar` at `d82fbf9`; that
branch is gone and the history is on `main`. `v7` is the current work — the weekly radar
rebuilt in the visual language of `filmhood.in`; see `playbook/findings/v7.md`.
Routes `/v6` and `/v7` at `http://localhost:5173/` (`pnpm dev` in `lab/`).

---

## 1. Where phase 1 landed

The lab's own verdict, from `playbook/findings/RANKING.md`:

> the best-scoring page is not the best product

`v3` copied JustWatch's platform grouping, `v4` and `v5` inherited it, and all three
scored best on the audit while failing at the thing the product is for — *what drops
when*. Nothing in the toolkit caught it. The audit has no rule for a missing axis, the
screenshot loop cannot photograph an absence, and the community packs never looked at the
data. Only reading the data and asking what the page is for found it.

`v6` is that page built: `v4`'s card craft, chronology restored, and a palette derived from
the artwork rather than picked.

## 2. What `v6` is, and why each decision was made

| Decision | Why |
|---|---|
| Palette sampled from the posters | The slate's dominant hue band is 10–40° (12,757px) vs a 180–210° cyan minority (5,476px). Canvas is a poster's own brown deepened; accent sits mid-band. Cyan is left to the artwork so the chrome never competes with it. Re-derive with `pnpm palette:v6`. |
| Grouped by publishing week | The run is weekly. Day grouping was built first and was too fine; week is the unit the product actually ships. |
| Weeks anchored to **Thursday** | The run day. A title dropping Thursday morning belongs to the week that run publishes, not the tail of the week already sent. `RUN_DAY` in `V6.jsx`. |
| Exact date moved onto the card | The week is the section, so per-title chronology has to live on the title or the axis is decorative. Sits above the descriptive metadata because it is the question the page exists to answer. |
| Platform demoted to card metadata | It stopped being the grouping dimension, so per the constitution it had to be *replaced, not deleted* — it appears on every card and in the header count. No brand colour enters the grid. |
| Landing = current week only | Resolved against the clock, not the end of the table. **This data set is frozen and will age** — see §5. |
| Week selection derived, not synchronised | The two regions publish different weeks. A derived value with a fallback means switching region can never land on an empty page and no effect races the render. |
| Future weeks labelled, not hidden | The feed carries dates on both sides of today. Hiding them would silently drop real releases; they are marked `upcoming`. |
| Native `<select>` for the archive | A one-of-many choice. Brings keyboard support, type-ahead and the platform touch picker for free; a custom listbox would need focus management, escape and click-outside to match. |

## 3. How to verify it (do this before trusting any change)

```bash
cd lab && pnpm dev
```

```bash
pnpm test          # 35 unit tests, no browser needed
pnpm verify:v6 && pnpm contrast:v6 && npx impeccable detect http://localhost:5173/v6
pnpm verify:v7 && pnpm contrast:v7 && npx impeccable detect http://localhost:5173/v7
pnpm feed:shapes   # 10 adversarial feed shapes through the real page
```

**These totals move.** Both verify suites skip blocks the current data cannot reach — a
region with only one week runs no archive-switch check, a month with no fixture runs no
multi-day check — so the count is a function of the clock, not a constant. `verify:v6` was
written with 27 assertions and executes 26 today; `verify:v7` executes 38. Read the
`0 failing check(s)` line, not the total.

`v7` adds 38 render-vs-data checks and 32 computed contrast pairs. Unlike `contrast:v6`,
`contrast:v7` reads the palette out of the running page rather than keeping its own copy,
so the check cannot drift away from the stylesheet.

- `pnpm verify:v6` — 26 render-vs-data checks across both regions: landing week, picker
  contents and ordering, archive switching, per-card dates, region-switch fallback.
- `pnpm contrast:v6` — 20 computed contrast pairs, both themes. Tightest is 4.53:1, so
  **any palette edit needs a re-run**.
- `npx impeccable detect <url>` — live-browser audit. Currently clean. Source-mode is
  worthless here (see RANKING.md §1); always audit the running page.
- `pnpm shoot v6` — captures 3 widths × 2 themes into `shots/v6/`. Then *look at them*.

All four were green at `d82fbf9`, and `verify:v6` and `contrast:v6` are green again after
the ICU portability fix (see `playbook/findings/v6.md` §6). **The live audit and the
screenshot loop cannot be re-run on a network that blocks `image.tmdb.org`** — the page
renders, but with six blank posters.

## 4. Traps this project has already paid for

Each of these cost a drill. They are in `CLAUDE.md` as rules; this is why they exist.

- **A clean automated scan is not proof.** `impeccable detect` reported zero contrast
  findings on a page with a real WCAG failure. Compute the values.
- **`opacity` on already-muted text** stacks two reductions the tokens cannot see: the
  computed pair passes, the rendered pixels fail. Recede with size, not alpha.
- **One review round ships the regressions it just introduced.** In `v6`, four of the seven
  defects found were caused by earlier fixes in the same session.
- **Check the layout against the real data shape.** The US slate is 9 titles on 9 separate
  dates; the layout that worked for India stranded every one of them. Group sizes here run
  1 to 11.
- **`ch` resolves against the element's own font-size.** A measure cap on a 16px wrapper
  sized a 56px headline at ~190px.
- **After changing a convention, grep for everything documenting it.** Removing the rail
  removed the page's only `<h2>` and broke the heading outline — caught by the audit, not
  by four screenshot passes.
- **Verify against the render, never the intent.** And when a check fails, confirm the
  check is right before "fixing" the page — one `v6` failure was a bad assertion looking
  for CSS `::after` separators in `textContent`.

## 5. Known gaps — start here

0. **`v7` has never rendered a poster.** `image.tmdb.org` is blocked on this network, so
   all sixteen titles with artwork fall through to the designed no-artwork tile and every
   shot in `lab/shots/v7/` shows that state. The composition and density of the real,
   poster-led page are unreviewed. **A poster pass is owed** the moment the host is
   reachable — start there.
1. **The data is frozen and dated `2026-08`.** *(Groundwork done — see §7. The boundary,
   the source adapter and the fetch script exist; what is missing is a reachable TMDB and
   a decision about where the run executes.)* `pickDefaultWeek` resolves against the real
   clock, so once today drifts past the table the landing view falls back to the most
   recent week that has releases and every week reads `archive`. Verified as intended
   behaviour, but it means **the page needs a live feed to be real**. `releases.js` is a
   hand-scraped snapshot of 22 titles.
2. ~~**No empty state.**~~ *(Closed by `v7`.* It is a designed surface that names the week
   and the catalog and hands back the nearest week that is not empty. Reachable at
   `/v7?week=2027-03-11`, asserted in `verify:v7`, and driven from three different feed
   shapes in `feed:shapes`.)
3. **Poster artwork depends on `image.tmdb.org` being reachable.** Cards are `<img>` tags
   pointed at TMDB. On a network that blocks it every poster renders blank, which silently
   disables the screenshot loop — the lab's highest-value instrument — without failing any
   check. `pnpm verify:v6` and `pnpm contrast:v6` both pass on a page with six broken
   images. *`v7` handles the load failure — `onError` falls through to the same designed
   tile the six artwork-less titles use — but `v0`–`v6` still render a broken-image glyph,
   and no check anywhere fails when the artwork is gone.*
4. **Tablet wrap.** At 768px an 11-title week wraps into rows of 2. It stays under its own
   week so nothing is stranded, but the breakpoint has not been tuned.
5. **The native select's option list** is drawn by the OS and is the one surface the
   palette cannot reach.
6. **`lab/public/directions.html`** is the static four-way colour comparison used to choose
   the direction (D). Keep or delete deliberately — it ships in `dist`.

## 6. The feed boundary (built)

`src/feed/` is the layer a live source lands on. Routes `v0`–`v6` still import `RELEASES`
directly and are unchanged; `v7` reads through the boundary, so the code path a real feed
will use is the one exercised on every page load rather than one that first runs the day
someone wires up an API.

| File | What it is |
|---|---|
| `feed/schema.js` | `validateRelease` — one record in, `{ok, value}` or `{ok:false, reasons}`. Reasons are plural so fixing a feed is one round trip, not six. |
| `feed/normalise.js` | `normaliseFeed` — validate, dedupe by id, sort, and **guarantee every release's platform resolves**. |
| `feed/sources/snapshot.js` | The frozen 22 rows, presented as a source so they go through the same checks as anything off the network. |
| `feed/sources/tmdb.js` | Discover-by-watch-provider. A pure mapper (covered) and a fetch (not — see below). |
| `feed/index.js` | `loadFeed()`, `forRegion`, `regionsIn`, `titlesInBothRegions`. |

```bash
pnpm test          # 35 unit tests — the boundary, the normaliser, the TMDB mapper
pnpm feed:shapes   # 10 feed shapes driven through the real page in a browser
pnpm feed:fetch    # TMDB_TOKEN=... — fetch, validate, report, write
```

### What a live feed actually breaks

Four things, found by building it rather than by reasoning about it:

1. **`PLATFORMS[key].label` is a TypeError waiting for its first unknown platform.** Every
   route indexes that map with a value that comes from the data. The snapshot is safe
   because a person wrote both sides. `normaliseFeed` now registers any unseen platform
   with a derived label, so the lookup always resolves — a slightly wrong label on a card
   is a visible prompt to curate it properly; a crash is not.
2. **A malformed record must be rejected loudly, not rendered partially.** A backwards date
   range prints "Sat 15 – Fri 7 Aug" and nothing downstream notices. `v7` shows a
   collapsed notice naming what was dropped and why — a partial feed is a designed state,
   not a console warning.
3. **"The week is empty" and "every request failed" both end in zero records.** `feed:fetch`
   separates them and refuses to write a file for the second, because a broken pipeline
   that ships as a quiet week is the failure that costs the most to notice.
4. **One source does not cover the page.** TMDB has no fixtures, and two of the snapshot's
   22 rows are cricket and football with date ranges. `normaliseFeed` takes a concatenated
   array so sources can be mixed; `feed:fetch` says so on every run where sport is absent.

### What is *not* covered, and why

`api.themoviedb.org` is blocked on this network, so **no assertion in this repo has ever run
against the real service.** The mapper, the URL builder and the provider table are pure and
tested against a recorded payload; `fetchTmdbFeed` is not. Both `feed:fetch` failure paths
were exercised — no token, and every request 403 — and it explains the second rather than
writing an empty file. That is as far as it can be taken from here.

`feed.generated.json` is gitignored and **not wired as the app's source.** Whether the
weekly run publishes a static file per week or the page fetches at runtime is §7's open
question, and answering it as a side effect of this script would be the wrong way to
decide it.

### A test suite nobody could run

`src/data/releases.test.js` has existed since phase 1 with 10 passing tests and **no `test`
script in `package.json`.** It was not in the four verification commands, not in the README,
and not runnable by any documented command. This is the repo's own "a green suite actively
misleads" trap one turn further on: a suite that was never even green, because it was never
run. `pnpm test` now exists and is part of the check list.

## 7. Open questions for the next session

- Is `v6` a seventh drill to be scored against the 17-item tell list like the others, or is
  it the product the drills were for? It was not built under a single lever, so it is not
  a like-for-like measurement.
- Does the region toggle survive contact with a real feed, or does region become a route?
- Where does the weekly run actually execute, and does it publish static HTML per week?
  **Partly answered by `v7`:** its week and region live in the query string (`?week=`,
  `?region=`), so an archive week is already a real, linkable URL rather than client-side
  state — and that is also what makes the empty state reachable and testable. Static HTML
  per week would be the next step, not a redesign.
- `v7` declines the reference's horizontal strips for the featured week. If a real feed
  carries far more than 22 titles, does the grid still hold, or does the strip become right
  after all for the weeks that overflow?
