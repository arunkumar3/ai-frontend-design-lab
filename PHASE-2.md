# Phase 2 — handoff

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
pnpm verify:v6 && pnpm contrast:v6 && npx impeccable detect http://localhost:5173/v6
pnpm verify:v7 && pnpm contrast:v7 && npx impeccable detect http://localhost:5173/v7
```

`v7` adds 42 render-vs-data checks and 32 computed contrast pairs. Unlike `contrast:v6`,
`contrast:v7` reads the palette out of the running page rather than keeping its own copy,
so the check cannot drift away from the stylesheet.

- `pnpm verify:v6` — 27 render-vs-data checks across both regions: landing week, picker
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
   all fourteen titles with artwork fall through to the designed no-artwork tile and every
   shot in `lab/shots/v7/` shows that state. The composition and density of the real,
   poster-led page are unreviewed. **A poster pass is owed** the moment the host is
   reachable — start there.
1. **The data is frozen and dated `2026-08`.** `pickDefaultWeek` resolves against the real
   clock, so once today drifts past the table the landing view falls back to the most
   recent week that has releases and every week reads `archive`. Verified as intended
   behaviour, but it means **the page needs a live feed to be real**. `releases.js` is a
   hand-scraped snapshot of 22 titles.
2. **No empty state.** Every week in the data has at least one title, so the "no releases
   this week" surface has never rendered. The constitution requires it to be designed, not
   inherited. A real feed will hit this.
3. **Poster artwork depends on `image.tmdb.org` being reachable.** Cards are `<img>` tags
   pointed at TMDB. On a network that blocks it every poster renders blank, which silently
   disables the screenshot loop — the lab's highest-value instrument — without failing any
   check. `pnpm verify:v6` and `pnpm contrast:v6` both pass on a page with six broken
   images. There is no designed no-artwork state; see §5.2.
4. **Tablet wrap.** At 768px an 11-title week wraps into rows of 2. It stays under its own
   week so nothing is stranded, but the breakpoint has not been tuned.
5. **The native select's option list** is drawn by the OS and is the one surface the
   palette cannot reach.
6. **`lab/public/directions.html`** is the static four-way colour comparison used to choose
   the direction (D). Keep or delete deliberately — it ships in `dist`.

## 6. Open questions for the next session

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
