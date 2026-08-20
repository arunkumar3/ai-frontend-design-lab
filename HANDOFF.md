# Handoff

**Read this first in a new session.** It is the current state. `PHASE-2.md` is still worth
reading for *why* `v6` is the way it is and for the trap list, but where the two disagree
about state, this document is right.

Last updated: 2026-08-20, after the week-of-20-26-Aug curation and the calendar rollover fixes.

---

## 1. Sixty seconds of context

Eight builds of one page — a weekly OTT release radar over 22 hand-scraped titles in two
regions. `v0`–`v5` each added exactly one design lever to measure what it was worth; that
measurement is finished and written up. `v6` and `v7` are not levers: `v6` was built from
what the measurements concluded, `v7` from a measured spec of a real site.

The repo's headline finding is that **the best-scoring page was not the best product** —
`v3`/`v4`/`v5` scored best on every instrument while failing at the question the page
exists to answer. Only reading the data found it. `playbook/findings/RANKING.md` is the
argument.

`playbook/` is the deliverable. `lab/` is the apparatus.

## 2. State

Branch `claude/continue-discussion-w580hz`, six commits ahead of `main`, open as
[PR #1](https://github.com/arunkumar3/ai-frontend-design-lab/pull/1):

| | |
|---|---|
| *(latest)* | ETV Win + the hand-curated week of 20–26 Aug as a second feed source |
| `7a330ce` | Aha; survived the first run-day past the frozen data (four latent defects) |
| `c52706e` | `HANDOFF.md`, session record, corrected check counts |
| `2ad0753` | the feed boundary — `src/feed/`, `pnpm test`, `pnpm feed:shapes` |
| `e354ca2` | `/v7` — the radar in filmhood.in's visual language |
| `600814d` | fixed `verify:v6`, which was failing on a page that was correct |

Not merged to `main`. Nothing is uncommitted. Run the checks — never trust this table's
notion of "green" without re-running.

## 3. Running it

```bash
cd lab && pnpm install && pnpm dev     # http://localhost:5173/, routes /v0 … /v7
```

With the dev server up, in a second shell:

```bash
cd lab
pnpm test          # 35 unit tests — the feed boundary. No browser, no server needed.
pnpm lint

pnpm verify:v6     # 26 render-vs-data checks
pnpm contrast:v6   # 20 computed contrast pairs
pnpm verify:v7     # 38 render-vs-data checks
pnpm contrast:v7   # 32 computed pairs, read from the running page
pnpm feed:shapes   # 67 checks across 10 adversarial feed shapes

npx impeccable detect http://localhost:5173/v7    # live audit — never point it at src/
pnpm shoot v7      # 6 PNGs into lab/shots/v7/ — then look at them
```

All green as of `2ad0753`.

**The verify totals move with the calendar.** Both suites skip blocks the current data
cannot reach, so the number is not a constant. Read the `0 failing check(s)` line.

### If Playwright will not launch

This container has Chromium at `/opt/pw-browsers/chromium-1194` but Playwright 1.62 looks
for build 1234. Symlinking the expected paths works. `impeccable` additionally refuses to
run as root — pass it a wrapper that adds `--no-sandbox` via `PUPPETEER_EXECUTABLE_PATH`.

## 4. Blocked, and it matters

The egress proxy blocks `image.tmdb.org`, `api.themoviedb.org` and `filmhood.in`.

**No poster has ever rendered on `/v7`.** All sixteen titles with artwork fall through to
the designed no-artwork tile, and every committed screenshot shows that state. For a design
whose chrome is deliberately achromatic *so the artwork can be the colour*, the composition,
the density and the caption-over-artwork contrast are unreviewed.

**A poster pass is the first thing to do** once `image.tmdb.org` is reachable. Roughly
thirty minutes: `pnpm shoot v7`, look at all six images, fix what the artwork exposes.

The same block means no assertion in this repo has ever run against the real TMDB API. The
mapper, URL builder and provider table are pure and tested against a recorded payload;
`fetchTmdbFeed` is not.

## 5. What `/v7` is

The weekly radar in filmhood.in's visual language: one acid-lime accent (`#e6ff41`) on an
achromatic ground, Abril Fatface over Afacad Flux, cards bordered rather than shadowed,
an infinite ticker of real titles, a magnetic nav pill, and one full-bleed lime block with
the next run's poster overhanging its edge.

Four decisions to know before changing it:

1. **The featured week is a grid, not a horizontal strip.** The reference uses strips for
   everything; built that way this page showed 3 of 11 titles. A reference's container
   encodes its data's shape, not yours — this is `v3`'s mistake in a new costume. The
   column count follows the group size so 11 titles run 3+3+3+2 with no orphan row.
2. **There is no 3D, and the reference has none either.** Its two apparently-dimensional
   moments are a `repeating-radial-gradient` and an easing curve that overshoots.
3. **Week and region live in the query string** — `?week=2026-08-06`, `?region=US`. That
   makes an archive week a real URL and makes the empty state reachable and testable.
4. **Fonts are self-hosted** (`lab/public/fonts/`, OFL, attributed in `NOTICE`). When
   `fonts.googleapis.com` was blocked the `h1` silently rendered in Georgia and four review
   passes would have approved it.

## 6. What `src/feed/` is

The boundary a live source lands on. `v0`–`v6` still import `RELEASES` directly and are
unchanged; `v7` reads through the boundary, so the path a real feed will use is exercised
on every page load.

| File | Role |
|---|---|
| `schema.js` | `validateRelease` — one record in, `{ok, value}` or `{ok:false, reasons}` |
| `normalise.js` | validate, dedupe by id, sort, **guarantee every platform lookup resolves** |
| `sources/snapshot.js` | the frozen 22, through the same checks as anything off the network |
| `sources/curated.js` | the hand-curated week of 20–26 Aug — the mixed-source design, used for real |
| `sources/tmdb.js` | discover-by-watch-provider: a pure mapper (covered) and a fetch (not) |
| `index.js` | `loadFeed`, `forRegion`, `regionsIn`, `titlesInBothRegions` |

`feed.generated.json` is gitignored and **deliberately not wired as the app's source** —
see the open decision in §8.

## 7. Gaps, ranked

1. **No poster has ever rendered.** §4. Blocked on the network, ~30 min once unblocked.
2. **The data still ends where the curation ends.** The clock crossed the frozen snapshot
   on 2026-08-20 and the week of 20–26 Aug was hand-curated the same day
   (`src/feed/sources/curated.js` — a second source mixed in through the boundary, so
   `v0`–`v6` still render the untouched 22-row table). That buys one week. The page needs
   the live feed to stay real; the boundary and fetch script exist, the §8 decision does
   not, and ETV Win's TMDB provider id still needs verifying before a live fetch covers it.
3. **TMDB cannot supply sport.** Two of the 22 rows are cricket and football fixtures with
   date ranges. A real build needs a second source. `normaliseFeed` takes a concatenated
   array so sources can mix.
4. **`v0`–`v6` render a broken-image glyph** when artwork fails to load, and no check
   anywhere fails when it does. `v7` handles it; the earlier routes are frozen by the
   append-only rule and should stay that way.
5. **`lab/public/directions.html`** is the four-way colour comparison used to pick `v6`'s
   palette. It ships in `dist`. Keep or delete deliberately.

## 8. Open decisions

These are yours, not mine. Each changes what gets built next.

- **Where does the weekly run execute, and does it publish static HTML per week?** This is
  the blocker on making the feed real. Static-per-week turns the archive into cacheable
  pages and kills the runtime fetch; runtime-fetch keeps one deploy and needs a loading and
  an error state the page does not have. `?week=` already makes either viable.
- **Merge this branch to `main`, or keep going on the branch?**
- **Is `v7` scored as a drill?** It was human-directed across several rounds, like `v6`, so
  it is not a like-for-like measurement against `v0`–`v5`. The README says so; the levers
  table has never been updated with what `v6` and `v7` proved.
- **Does the grid still hold at feed scale?** `feed:shapes` proves 50 titles in a week lay
  out without breaking. Whether 50 cards is a *good* answer to "what dropped this week" is
  a design question nobody has looked at.

## 9. Traps this repo has already paid for

The full list with evidence is in `CLAUDE.md`. The four that cost the most:

1. **Audit the running page, never the repository.** Source-mode reported 0 findings on a
   page the live scan gave 28.
2. **When a check fails, confirm the check before changing the page.** This has now
   happened three times — a `textContent` search for CSS `::after` content, a Node-vs-
   Chromium ICU comma, and a feed scenario asserting an empty state where the documented
   fallback is correct. Every time, the page was right.
3. **A defect count is one tool at one version.** `impeccable` scored `v1` at 28 and `v6`
   at 0 when they were built; re-scanned in one run today they are 13 and 5. Only same-run
   columns can be ranked.
4. **Three review rounds, not one.** Across `v4`, `v6` and `v7`, roughly half of every
   defect found was caused by a fix made earlier in the same session.

## 10. Where to read next

- `playbook/findings/RANKING.md` — the verdict pass, and the repo's central argument
- `playbook/findings/v7.md` — building from a reference nobody could load
- `PHASE-2.md` §2 — why each `v6` decision was made; §4 — the trap list with evidence
- `CLAUDE.md` — the constitution, including every rule the drills forced into it
- `docs/sessions/` — what happened in each working session
