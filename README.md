# AI Frontend Design Lab

Measuring what design-direction techniques actually buy an AI coding agent building a UI
from scratch — with evidence, not opinion.

Eight builds of the same page. Six of them (`v0`–`v5`) add exactly one lever on top of the
last, so the difference between any two routes is one variable. `v6` was built from what the
measurements said; `v7` from a measured spec of a real site nobody here could load.

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

| Route | Lever added | At build time | Re-scanned, same run |
|---|---|---|---|
| `/v0` | none — naive baseline, bare prompt, default Tailwind | 7 | 4 |
| `/v1` | a standing constitution ([`CLAUDE.md`](CLAUDE.md)) | 28 | 13 |
| `/v2` | a token system committed before any markup | 14 | 1 |
| `/v3` | design references extracted from real sites | 3 | 3 |
| `/v4` | a screenshot-critique loop (render, look, fix, repeat) | 3 | 3 |
| `/v5` | installed community design skill packs | 3 | 3 |
| `/v6` | *not a lever* — built from the verdict | 0 | 5 |
| `/v7` | *not a lever* — built from a measured spec of [filmhood.in](https://filmhood.in) | — | **0** |

Routes are append-only: a later drill never edits an earlier one, so all eight stay live
and directly comparable.

**The two columns are the same tool on the same pages, and they disagree.** No route
changed; `impeccable`'s rule set did. `v2` moves from third-worst to second-best, `v6`
from a clean sheet to five findings on a rule that did not exist when it was scored, and
`v1`'s headline 28 is now 13. Nothing in the left column is wrong — it was true when it was
measured — but **a defect count is a reading of one tool at one version, and only a column
where every page was scanned in the same run can be ranked.** This is the same lesson as the
source-versus-live discovery below, arriving from a different direction:
[`playbook/findings/v7.md`](playbook/findings/v7.md) §5.

Three more caveats worth stating before anyone quotes these numbers:

- **`v1` scoring worse than `v0` is real, not a typo.** `v0` scores well by never trying;
  the audit counts defects, and a page that attempts nothing has few. Ranking by defect
  count and ranking by whether a decision was made at all disagree sharply in the middle.
- **Neither `v6` nor `v7` is a lever, and neither must be scored as one.** The six drills
  each isolated one variable, unsupervised. Both later routes were directed by a human
  across several rounds. They are included because their *findings about the tools* transfer.
- **`v7` has never rendered a poster.** `image.tmdb.org` is blocked on the network it was
  built on, so its sixteen titles with artwork all fall through to the designed no-artwork
  tile. For a design whose chrome is deliberately achromatic *so the artwork can be the
  colour*, that is a real gap, not a footnote.

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

Then `http://localhost:5173/` for the index, or jump to `/v0`–`/v7`.

With the dev server still running, in a second shell:

```bash
cd lab && pnpm shoot v7
```

Writes six PNGs to `lab/shots/v7/` — 390 / 768 / 1440px, light and dark.

### Verifying a change

`v6` ships the checks phase 1 lacked. Each answers a question inspection cannot:

```bash
pnpm test           # 35 unit tests — the feed boundary; no browser needed

pnpm verify:v6      # 27 render-vs-data checks, both regions
pnpm contrast:v6    # 20 computed contrast pairs, both themes
pnpm palette:v6     # re-derives the palette from the live poster art

pnpm verify:v7      # 42 render-vs-data checks, incl. the empty state and the calendar
pnpm contrast:v7    # 32 computed pairs, read from the running page rather than a copy
pnpm feed:shapes    # 10 adversarial feed shapes driven through the real page
```

`src/feed/` is the boundary a live source lands on — validate, dedupe, and guarantee every
platform lookup resolves before a route sees a record. `v7` reads through it; `v0`–`v6`
still import the frozen table directly and are unchanged. See
[`PHASE-2.md`](PHASE-2.md) §6.

Plus the live audit, which must be pointed at the running URL, not at `src/`:

```bash
npx impeccable detect http://localhost:5173/v7
```

`v6`'s four checks were green at `d82fbf9`; `verify:v6` needed a fix afterwards when Node
and Chromium turned out to format dates differently ([`v6.md`](playbook/findings/v6.md) §6).
`v7`'s checks are green as committed, and each was negative-tested — deliberately broken and
confirmed to go red — before being believed.

## A note on the numbers

Every page-height figure in the playbook (e.g. "`v4` = 3742px") is measured from screenshots
captured at `deviceScaleFactor: 2` — **device pixels**, twice CSS pixels. Checking
`scrollHeight` in a browser at 1× gives half that. Different unit, not an error.

`v6` and `v7`'s heights are not comparable to the others at all: they render one week where
`v0`–`v5` render the whole slate.

## Where to start reading

- [`playbook/01-why-output-is-generic.md`](playbook/01-why-output-is-generic.md) — the
  mechanism, and why to measure your own baseline before trusting anyone's
- [`playbook/02-the-levers.md`](playbook/02-the-levers.md) — every lever ranked by measured
  value, not by how good it sounds
- [`playbook/findings/RANKING.md`](playbook/findings/RANKING.md) — the verdict pass
- [`playbook/findings/v6.md`](playbook/findings/v6.md) — what building the predicted page
  proved about the toolkit, including where the verdict's own prescription was wrong
- [`playbook/findings/v7.md`](playbook/findings/v7.md) — building from a reference nobody
  could load: why the 3D everyone assumed was there was two gradients and an easing curve,
  and why a reference's layout is the one thing not to copy
- [`PHASE-2.md`](PHASE-2.md) — current state and what's next
- [`CLAUDE.md`](CLAUDE.md) — the constitution, including the rules the drills forced into it

## Scope and honesty

This is **one project's evidence**, on one page, with one model, at one point in time. The
levers were measured against a specific brief with real data and real missing fields; a
different page could rank them differently. Treat the method as the transferable part —
isolate one variable, render it, and check the output rather than the intent.

The dataset in `lab/src/data/releases.js` is a frozen hand-scraped snapshot of 22 titles
dated August 2026. `v6` and `v7` resolve "this week" against the real clock, so they degrade
to the most recent week with releases once the clock passes the data. It needs a live feed to
be a real product; see [`PHASE-2.md`](PHASE-2.md).

`v7` reproduces the *visual language* of [filmhood.in](https://filmhood.in) — palette, type
pairing, card treatment, section rhythm — from a spec of measured values read off the live
page. No code, markup or asset was copied, and it is not affiliated with or endorsed by
Filmhood. See [`NOTICE`](NOTICE).

## Third-party work

`.agents/skills/` and `.claude/skills/` vendor 24 community skill packs from three projects
(MIT and Apache-2.0), committed so the `v5` measurement stays reproducible. `lab/public/fonts/`
holds two OFL-licensed webfont subsets, self-hosted so `v7`'s typography does not depend on a
third-party host being reachable at screenshot time. Attribution,
licenses and provenance are in [`NOTICE`](NOTICE) and
[`third_party/licenses/`](third_party/licenses/). Everything else here is this
repository's own work.

Poster artwork is served from TMDB by URL and is not redistributed. This product uses the
TMDB API but is not endorsed or certified by TMDB.
