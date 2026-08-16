# AI Frontend Design Lab

Measuring what design-direction techniques actually buy an AI coding agent building a UI
from scratch — with evidence, not opinion.

Seven builds of the same page. Six of them (`v0`–`v5`) add exactly one lever on top of the
last, so the difference between any two routes is one variable. The seventh (`v6`) was built
from what the measurements said.

**The deliverable is [`playbook/`](playbook/).** `lab/` is the apparatus that produced the
evidence.

## The headline finding

The best-scoring page was not the best product.

`v3` adopted platform grouping copied from a real site, `v4` and `v5` inherited it, and all
three scored best on every instrument available — while failing at the thing the page
exists to answer: *what drops when*. Every automated check passed a page whose organising
axis was missing.

| Instrument | Caught the missing axis? |
|---|---|
| Live-browser design audit | No — no anti-pattern fires for an absent axis |
| A screenshot-critique loop, 4 passes, 16 defects | No — an absence leaves no pixels |
| Installed community design skill packs | No |
| Reading the data and asking what the page is for | **Yes** |

Full argument in [`playbook/findings/RANKING.md`](playbook/findings/RANKING.md).

The second finding is smaller and more immediately useful: **how you run an audit changes
the answer completely.** The same tool, on the same pages, minutes apart — a source-file
scan called `v1` perfect; the live-browser scan found 28 defects in it. Audit the running
page, never the repository.

## The routes

| Route | Lever added | Live audit findings |
|---|---|---|
| `/v0` | none — naive baseline, bare prompt, default Tailwind | 7 |
| `/v1` | a standing constitution ([`CLAUDE.md`](CLAUDE.md)) | 28 |
| `/v2` | a token system committed before any markup | 14 |
| `/v3` | design references extracted from real sites | 3 |
| `/v4` | a screenshot-critique loop (render, look, fix, repeat) | 3 |
| `/v5` | installed community design skill packs | 3 |
| `/v6` | *not a lever* — built from the verdict | **0** |

Routes are append-only: a later drill never edits an earlier one, so all seven stay live
and directly comparable.

Three caveats worth stating before anyone quotes these numbers:

- **They were taken with every route's stylesheet attached to every page.** All seven
  routes were imported eagerly, so the audit's stylesheet-text rules were reading five
  other drills while pointed at one. The pixel-level findings that decided the ranking are
  unaffected; the rest need re-running now that routes load one at a time. See
  [`playbook/findings/v6-frontend-design-skill.md`](playbook/findings/v6-frontend-design-skill.md)
  §3a.

- **`v1` scoring worse than `v0` is real, not a typo.** `v0` scores well by never trying;
  the audit counts defects, and a page that attempts nothing has few. Ranking by defect
  count and ranking by whether a decision was made at all disagree sharply in the middle.
- **`v6` is not a seventh lever and must not be scored as one.** The six drills each
  isolated one variable, unsupervised. `v6` was directed by a human across several rounds.
  It is included because its *findings about the tools* transfer.

## What each lever was worth

| Lever | Tells fixed | What it uniquely bought | What it could not do |
|---|---|---|---|
| Constitution | 9/17 | raised the general standard well past its own ban list | only bans what its author already imagined |
| Token system | 14/17 | removed the *opportunity* to break the colour rule | governs values, not layout invariants |
| References | 14/17 | the one structural move — brand colour out of the content grid | imported a structure whose data assumptions didn't transfer |
| Screenshot loop | 15/17 | killed the orphan rows three drills had failed on | cannot see absences or cross-state relationships |
| Community skills | not separately scored | one real WCAG contrast bug the automated scanner missed | strongest opinions all correctly overridden |

The screenshot loop is the best value in the table: it fixed what three rounds of design
thinking could not, and it costs nothing to adopt.

## Running it

```bash
cd lab && pnpm install && pnpm dev
```

Then `http://localhost:5173/` for the index, or jump to `/v0`–`/v6`.

With the dev server still running, in a second shell:

```bash
cd lab && pnpm shoot v6
```

Writes six PNGs to `lab/shots/v6/` — 390 / 768 / 1440px, light and dark.

### Verifying a change

`v6` ships the checks phase 1 lacked. Each answers a question inspection cannot:

```bash
pnpm verify:v6      # 42 render-vs-data checks, both regions
pnpm contrast:v6    # 30 computed contrast pairs + surface separation, both themes
pnpm palette:v6     # re-derives the palette from the live poster art
```

Plus the live audit, which must be pointed at the running URL, not at `src/`:

```bash
npx impeccable detect http://localhost:5173/v6
```

All four were green at the head of `claude/frontend-design-v6-18py7n`.

Where `image.tmdb.org` is blocked, `pnpm palette:v6` cannot run and `pnpm shoot v6`
captures every card on the no-artwork path — see `lab/shots/v6/README.md`. The three
Playwright scripts honour `CHROMIUM_PATH` for sandboxes that ship their own browser.

## A note on the numbers

Every page-height figure in the playbook (e.g. "`v4` = 3742px") is measured from screenshots
captured at `deviceScaleFactor: 2` — **device pixels**, twice CSS pixels. Checking
`scrollHeight` in a browser at 1× gives half that. Different unit, not an error.

`v6`'s height is not comparable to the others at all: it renders one week where `v0`–`v5`
render the whole slate.

## Where to start reading

- [`playbook/01-why-output-is-generic.md`](playbook/01-why-output-is-generic.md) — the
  mechanism, and why to measure your own baseline before trusting anyone's
- [`playbook/02-the-levers.md`](playbook/02-the-levers.md) — every lever ranked by measured
  value, not by how good it sounds
- [`playbook/findings/RANKING.md`](playbook/findings/RANKING.md) — the verdict pass
- [`playbook/findings/v6.md`](playbook/findings/v6.md) — what building the predicted page
  proved about the toolkit, including where the verdict's own prescription was wrong
- [`playbook/findings/v6-frontend-design-skill.md`](playbook/findings/v6-frontend-design-skill.md)
  — `/v6` rebuilt under Anthropic's `frontend-design` skill: a measured palette that still
  landed on a default, and two instruments that turned out to be lying
- [`PHASE-2.md`](PHASE-2.md) — current state and what's next
- [`CLAUDE.md`](CLAUDE.md) — the constitution, including the rules the drills forced into it

## Scope and honesty

This is **one project's evidence**, on one page, with one model, at one point in time. The
levers were measured against a specific brief with real data and real missing fields; a
different page could rank them differently. Treat the method as the transferable part —
isolate one variable, render it, and check the output rather than the intent.

The dataset in `lab/src/data/releases.js` is a frozen hand-scraped snapshot of 22 titles
dated August 2026. `v6` resolves "this week" against the real clock, so it degrades to the
most recent week with releases once the clock passes the data. It needs a live feed to be a
real product; see [`PHASE-2.md`](PHASE-2.md).

## Third-party work

`.agents/skills/` and `.claude/skills/` vendor 24 community skill packs from three projects
(MIT and Apache-2.0), committed so the `v5` measurement stays reproducible. Attribution,
licenses and provenance are in [`NOTICE`](NOTICE) and
[`third_party/licenses/`](third_party/licenses/). Everything else here is this
repository's own work.

Poster artwork is served from TMDB by URL and is not redistributed. This product uses the
TMDB API but is not endorsed or certified by TMDB.
