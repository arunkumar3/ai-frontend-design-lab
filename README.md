# Design Lab — Claude Code Design Operating Model

This repo is a design lab, not a product. It exists to measure what individual
design-direction techniques actually buy an AI coding agent when it builds a UI from
scratch — with evidence, not opinion.

**The deliverable is `playbook/`.** `lab/` is the apparatus that produced the evidence
behind it. If you're here to read the findings, start in `playbook/` (see "Where to
start reading" below) — this file won't restate them.

## What's in `lab/`

Six routes, `/v0` through `/v5`, built as a single Vite + React app. Each route is a
full, independent build of the same page (an "OTT releases this week" catalog, real
India/US data, real TMDB posters where they exist) with exactly one design lever added
on top of the previous route. Routes are append-only — a later drill never edits an
earlier one — so all six stay live and directly comparable.

| Route | Lever |
|---|---|
| `/v0` | none — naive baseline, bare prompt, default Tailwind |
| `/v1` | a standing constitution (`CLAUDE.md`) |
| `/v2` | a token system committed before any markup |
| `/v3` | design references extracted from real sites |
| `/v4` | a screenshot-critique loop (render, look, fix, repeat) |
| `/v5` | installed community design skill packs |

## How to run it

```bash
cd lab
pnpm install
pnpm dev
```

Visit `http://localhost:5173/` for the index, or jump straight to `/v0`–`/v5`.

To capture screenshots (used to produce every image referenced in `playbook/`), **with
the dev server from `pnpm dev` still running**, in a second shell:

```bash
cd lab
pnpm shoot <route>   # e.g. pnpm shoot v3
```

Writes six PNGs to `lab/shots/<route>/` — 390 / 768 / 1440px wide, light and dark.

## A note on the numbers

Every page-height figure in the playbook (e.g. "`v4` = 3742px") is measured from these
screenshots, captured at `deviceScaleFactor: 2` — that's **device pixels**, twice CSS
pixels. If you check `document.documentElement.scrollHeight` in a browser at 1x, you'll
get half that number. This isn't an error in the docs; it's a different unit.

## Where to start reading

- `playbook/01-why-output-is-generic.md` — the mechanism, and why you should measure
  your own baseline before trusting it
- `playbook/02-the-levers.md` — every lever, ranked by measured value, not by how good
  it sounds
- `playbook/findings/RANKING.md` — the full verdict pass across all six routes
- `playbook/findings/vN.md` — the detailed per-route findings, one file per route

## Scope

This repo covers **Phase A only** — the six drills and the playbook. A described
**Phase B** ("Take the Site Live": swap the hardcoded dataset for live TMDB data, build
real loading/error/empty states, deploy) is **out of scope** here and was not built.
