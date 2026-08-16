# Phase 2 — handoff

Phase 1 ran six drills (`v0`–`v5`) to measure which lever most improves AI-generated
frontend, then built `v6` from what the measurements said. This document is the starting
point for the next conversation. Read this, `CLAUDE.md`, and `playbook/findings/RANKING.md`
first.

**State:** branch `claude/frontend-design-v6-18py7n`, not merged to `main`.
Route `/v6` at `http://localhost:5173/v6` (`pnpm dev` in `lab/`).

`/v6` has since been rebuilt under Anthropic's `frontend-design` skill. This document is
updated for that page; `playbook/findings/v6-frontend-design-skill.md` records what
changed and why, and the pre-skill page is at commit `330ead5`.

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
| Palette derived from the posters, then **inverted** | The slate's dominant hue band is 10–40° (12,757px) vs a 180–210° cyan minority (5,476px), mean lightness 39. The first cut spent the dominant band on the chrome and landed on cream-plus-terracotta — one of the three looks generative design defaults into, and the one hue an amber poster cannot stand on. Now: ground is the dominant hue at near-zero chroma (a mid-toned grey card, both themes), accent is the *minority* band, so the one interface colour can never be mistaken for poster colour. Re-derive with `pnpm palette:v6`. |
| A seven-day ruler above the grid | The page's job is *what drops when*, and the grid cannot show the shape of a week — eleven cards do not tell you five of them land on the Saturday. Day numerals are the largest type on the page, one countable mark per title sits under each day, today's column carries the accent, and a day with nothing is drawn rather than skipped. |
| The archive lists the whole run | Quiet weeks included. A weekly run has weeks where nothing landed (the US feed has three); listing only the other six presents a feed with holes in it as continuous. It also makes the empty surface reachable instead of dead code. |
| Region switch keeps the week | Both runs are continuous, so the reader stays where they were in time and a region that published nothing that week says so. Only a week outside the other run entirely falls back. |
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
```

- `pnpm verify:v6` — 42 render-vs-data checks across both regions: landing week, the day
  ruler against per-day counts, picker contents and ordering over the whole run, archive
  switching, per-card dates, the quiet week and its one control, and both region-switch
  behaviours.
- `pnpm contrast:v6` — 30 computed contrast pairs, both themes, plus three
  surface-separation assertions per theme (a fallback panel that collapses into the canvas
  has shipped twice). Tightest pair is 4.70:1, so **any palette edit needs a re-run**.
- `npx impeccable detect <url>` — live-browser audit. Currently clean at 1280 and at
  390×844. Source-mode is worthless here (see RANKING.md §1); always audit the running
  page. Note that a clean run prints *nothing* — use `--json` and look for `[]` rather than
  reading silence, and remember `npx -y` resolves whatever version npm serves that day.
- `pnpm shoot v6` — captures 3 widths × 2 themes into `shots/v6/`. Then *look at them*, and
  read `shots/v6/README.md` first: where `image.tmdb.org` is blocked, every card captures
  on the no-artwork path.

All four were green at the head of `claude/frontend-design-v6-18py7n`.

Two environment notes. The three Playwright scripts honour `CHROMIUM_PATH` for sandboxes
that ship a browser and block the Playwright CDN. And `impeccable` drives Puppeteer, which
refuses to launch as root without `--no-sandbox`; point `PUPPETEER_EXECUTABLE_PATH` at a
wrapper that adds the flag.

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
  for CSS `::after` separators in `textContent`, and two more were a date format that Node
  and Chromium disagree about (`Wed 12 Aug` vs `Wed, 12 Aug`).
- **Audit only the page.** Every route's CSS was attached to every page, so the live audit's
  stylesheet-text rules were reading five other drills while pointed at `/v6`. Routes are
  lazy now. See `playbook/findings/v6-frontend-design-skill.md` §3a.
- **Evidence behind a choice does not stop it being the reflex answer.** `v6`'s palette was
  measured from the real artwork and still arrived at cream-plus-terracotta.

## 5. Known gaps — start here

1. **The data is frozen and dated `2026-08`.** `pickDefaultWeek` resolves against the real
   clock, so once today drifts past the table the landing view falls back to the most
   recent week that has releases and every week reads `archive`. Verified as intended
   behaviour, but it means **the page needs a live feed to be real**. `releases.js` is a
   hand-scraped snapshot of 22 titles.
2. ~~**No empty state.**~~ Closed. The archive lists the whole run, so quiet weeks are
   reachable and the surface is designed, exercised by `verify:v6` and hit by an ordinary
   region switch. `poster: null` and *poster URL failed to load* now both land on it too.
3. ~~**No `playbook/findings/v6.md`.**~~ Closed, and joined by
   `playbook/findings/v6-frontend-design-skill.md`.
4. ~~**Tablet wrap.**~~ Closed. `auto-fill` counts repetitions against a definite max track
   size, so a 280px card ceiling gave 768px exactly two columns and a 7,722px page. The
   base grid uses `minmax(160px, 1fr)`; the ceiling is enforced on the track box above
   1200px instead. 768px now runs four columns at 3,720px.
5. **The native select's option list** is drawn by the OS and is the one surface the
   palette cannot reach.
6. **`lab/public/directions.html`** is the static four-way colour comparison used to choose
   the pre-skill direction (D). It documents a palette the page no longer uses. Keep,
   update or delete deliberately — it ships in `dist`.
7. **`pnpm palette:v6` cannot run where `image.tmdb.org` is blocked**, and neither can a
   truthful `pnpm shoot v6`. The figures in `v6.css`'s header are cited as recorded on
   2026-08-16, not as freshly sampled. Re-run both somewhere with access.
8. **An 11-title week still leaves one card alone on the last row at 390px** — 2 columns,
   odd count. Standard for a wrapping list rather than the marooned-single-item defect, but
   untuned.

## 6. Open questions for the next session

- Merge `claude/frontend-design-v6-18py7n` into `main`, or keep drills on branches from
  here?
- Phase 1's audit numbers were taken with every route's CSS attached to every page. The
  pixel-level findings that decided the ranking are unaffected, but the stylesheet-text
  ones are not. Worth re-running all seven routes now that they are isolated — and pinning
  an `impeccable` version so the numbers compare.
- Is `v6` a seventh drill to be scored against the 17-item tell list like the others, or is
  it the product the drills were for? It was not built under a single lever, so it is not
  a like-for-like measurement.
- Does the region toggle survive contact with a real feed, or does region become a route?
- Where does the weekly run actually execute, and does it publish static HTML per week —
  which would change the archive from client-side state to real URLs?
