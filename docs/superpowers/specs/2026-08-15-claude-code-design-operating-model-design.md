# Design Operating Model for Claude Code

**Date:** 2026-08-15
**Status:** Awaiting review
**Owner:** Arun

## Context

The goal is not to learn HTML/CSS/JavaScript. Arun is an experienced
programmer in other languages and has explicitly opted out of learning the
web stack itself. The goal is to learn **how to operate Claude Code so its
frontend output stops looking machine-generated.**

The problem has a specific cause. With no direction, Claude regresses to the
statistical center of every Tailwind landing page in its training data:
Inter or system font, indigo→purple gradients, a centered hero with two
buttons, a three-column feature grid with lucide icons, `rounded-xl shadow-lg`
on every surface, `max-w-7xl mx-auto`, and copy like "Empower your workflow."
Nothing is broken; it is simply the mean. Advanced output comes from
systematically denying the model that mean.

This project builds two things: a **playbook** (durable, reusable knowledge)
and a **lab** (six live routes proving what each technique actually buys).
It then applies both to a real existing project.

## Goals

- A reusable operating model, on disk, that upgrades every future session.
- The judgment to diagnose bad output and name which lever fixes it.
- Evidence-backed findings — screenshots and third-party audits, not vibes.
- The ability to evaluate a new design skill rather than installing on faith.

## Non-Goals

- Teaching HTML/CSS/JS syntax or React fundamentals.
- Figma. Deferred — see Deferred Decisions.
- Rewriting `ipl-predictions` logic or touching its Supabase layer.

## Stack (verified 2026-08-15)

| Tool | Version | Note |
|---|---|---|
| Node | 20.20.2 | |
| Vite + React | latest | matches `ipl-predictions` exactly |
| Tailwind | 4.3.3 | CSS-first `@theme`; no JS config file |
| Motion | 13.1.0 | |
| Playwright | 1.62.1 | MCP already connected |
| pnpm | 10.33.2 | |

## Repository Layout

```
web_development/
  CLAUDE.md                     # design constitution — the load-bearing file
  playbook/
    01-why-output-is-generic.md
    02-the-levers.md            # lever → when to pull it
    03-prompt-patterns.md
    04-screenshot-loop.md
    05-troubleshooting.md       # symptom → missing lever (written from findings)
    06-evaluating-skills.md     # how to vet the next one you find
  lab/
    design/tokens.md
    design/references/          # captured gallery screenshots
    design/dna/                 # /taste output: {domain}.md + {domain}.json
    app/v0 … v5/                # one route per drill stage
    scripts/shoot.mjs           # multi-viewport + dark-mode capture
  docs/superpowers/specs/
```

### Key structural decisions

**`CLAUDE.md` carries most of the leverage.** The playbook teaches the human;
`CLAUDE.md` constrains the model automatically in every future session in this
directory, with nothing retyped. It names banned defaults explicitly (no
indigo→purple gradients, no centered-hero-plus-two-buttons, no emoji, no
blanket `shadow-lg`, no copy containing "seamless"/"empower") and mandates the
screenshot loop before any section is claimed done.

**One route per drill stage; never overwrite.** Each drill adds exactly one
lever and lands in the next route. At the end, six live URLs can be compared
directly. Iterating in place is the normal instinct and it destroys the
evidence this project exists to produce.

## Tooling to Install

Installed at the start of Drill 5, not before — the drills measure the levers
in isolation, and pre-installing taste skills contaminates the baseline.

Commands corrected against the source that prompted this work; three of its
five were wrong as printed.

| Tool | Command | Status |
|---|---|---|
| Emil Kowalski motion | `npx skills add emilkowalski/skill` | post said `emilkowal/skill` → 404 |
| Impeccable | `/plugin marketplace add pbakaus/impeccable` then `npx impeccable install`, `/impeccable init` | verified; npm `impeccable@3.6.0` |
| Taste (anti-slop) | `npx skills add Leonxlnx/taste-skill` | post said `Leonxlnx/taste` → 404 |
| Taste (DNA extractor) | clone `senlindesign/taste-skill` → `~/.claude/skills/taste` | **not in the post**; the highest-value find |
| Playwright MCP | — | already connected |
| Figma MCP | — | skipped; post's syntax was invalid anyway |

Note: `senlindesign/taste-skill` (`/taste <url>`) and `Leonxlnx/taste-skill`
are unrelated projects sharing a name. Both are wanted, for different reasons.

Skills install globally and will affect other projects (`dealhunter`,
`optionsflow`). This is intended, but should not be a surprise.

## Phase A — The Drills

All six routes build the same product: **"OTT Releases This Week"** — a
catalog of new streaming releases, with a **region toggle between India and
the US**.

Chosen over a conventional landing page because it is a harder and more
honest design problem: poster-driven imagery instead of placeholder blocks,
and a grid/card/filter surface, which is exactly where AI-slop tells cluster
most densely (nested cards, uniform `rounded-xl`, shadow soup, identical
card heights fighting variable poster aspect ratios).

Content is real (see Dataset), so generic copy cannot flatter weak layout.

### Dataset — week of 15–21 Aug 2026

Hardcoded to `lab/src/data/releases.json`. Real titles gathered from
FilmiBeat, myvi.in, FilmyChill, and Boston.com.

**India**

| Title | Platform | Date | Language | Type |
|---|---|---|---|---|
| 108 Base Hospital: Uri | JioHotstar | Aug 15 | Hindi | Series |
| Bigg Boss Agnipareeksha | JioHotstar | Aug 15 | Malayalam | Series |
| Bigg Boss Agnipariksha | JioHotstar | Aug 15 | Telugu | Series |
| Bigg Boss Agniparikshe | JioHotstar | Aug 16 | Kannada | Series |
| Bigg Boss: The Common Man | JioHotstar | Aug 16 | Tamil | Series |
| Lanterns | JioHotstar | Aug 17 | English | Series |
| Pyaar Prema Kalyanam | Netflix | Aug 21 | Tamil | Movie |
| Bharat Bhagya Vidhaata | ZEE5 | Aug 14 | Hindi | Movie |
| Aakhri Sawal | Lionsgate Play | Aug 14 | Hindi | Movie |
| Mr. Work From Home | Sun NXT | Aug 14 | Telugu | Movie |
| Reacher S4 | Prime Video | Aug 12 | English | Series |
| India Tour of Sri Lanka | SonyLIV | Aug 15 | — | Sport |
| IndianOil Durand Cup 2026 | SonyLIV | Aug 15–21 | — | Sport |

**US**

| Title | Platform | Date | Type |
|---|---|---|---|
| Lanterns | HBO Max | Aug 16 | Series |
| Reacher S4 | Prime Video | Aug 14 | Series |
| The Whisper Man | Netflix | Aug 28 | Movie |
| Soy Luna: Let's Roll Again | Disney+ | Aug | Series |
| Futurama | Hulu | Aug 3 | Series |
| Ted Lasso | Prime Video | Aug 4 | Series |
| Lioness | Prime Video | Aug 2 | Series |
| Silo | Apple TV+ | Jul 2 | Series |
| My Daughter's Father | Netflix | Jul 22 | Series |

US dates are less reliable than the India set — sources disagreed. Adequate
for design drills; corrected when TMDB goes live in Phase B.

**Poster artwork.** Real, from TMDB's image CDN
(`https://image.tmdb.org/t/p/w500/…`), resolved by scraping TMDB's
server-rendered search pages — no API key needed, since only *live data*
requires one, not images. 16 of 22 titles have artwork; the six that do not
are listed in the plan and are kept deliberately.

**Design problems this dataset creates, deliberately:**

- **Six releases have no poster at all** — both sports fixtures, plus four
  regional titles absent from TMDB. Real aggregators have exactly this gap,
  concentrated in exactly this content. A designed missing-artwork state is a
  requirement of every drill, not an edge case, and is likely the sharpest
  discriminator between `v0` and later routes.

- `Lanterns` ships on **HBO Max (US, Aug 16)** and **JioHotstar (India,
  Aug 17)** — same title, different platform *and* date per region, so the
  toggle must be a real control, not decoration.
- Five near-identical `Bigg Boss` variants across five languages — a genuine
  visual-hierarchy and deduplication problem.
- Sport entries carry date *ranges*, not dates; the card cannot assume one
  shape fits all.
- Multi-script titles (Latin, and Devanagari/Telugu/Tamil if rendered
  natively) — a real typography constraint, not a hypothetical one.

| Route | Lever added | Question answered |
|---|---|---|
| `v0` | none — naive prompt, no skills, no constraints | What is the actual baseline? |
| `v1` | `CLAUDE.md` constitution | How far does pure negative constraint get? |
| `v2` | design system first: tokens, real typeface pairing, non-Tailwind palette, type + spacing scale | What changes when the system precedes the markup? |
| `v3` | reference pipeline (below) | Adjectives vs. evidence |
| `v4` | screenshot loop — render → self-critique → fix, ×3 | Predicted largest single jump |
| `v5` | community skills stacked | What does pre-packaged taste add on top? |

### Drill 3 reference pipeline

1. Source from galleries: Godly, Land-book, Lapa Ninja, SiteInspire, and
   Mobbin (best for data-dense product UI).
2. Capture with Playwright into `lab/design/references/` — done together in
   session, not assigned as homework.
3. Run `/taste <url>` on the 3–4 strongest → `lab/design/dna/`.
4. **Synthesize, do not clone.** Extract systems (type scale, spacing rhythm,
   color relationships, motion timing) and compose an original token set.
   Copying one site yields a worse copy of that site and transfers nothing.

### Verdict pass

Run `/impeccable audit` across all six routes. Rank them. Write
`05-troubleshooting.md` from observed results, including any case where a
predicted lever failed to show up in the screenshots.

## Phase B — Take the Site Live

The winning design from Phase A becomes a real product by replacing the
hardcoded JSON with live data. One product carried the whole way, rather than
two half-projects.

1. **TMDB integration** — the `/watch/providers` endpoint supplies real
   release data per region (`IN` / `US`), plus poster artwork at proper
   resolutions. Requires a free API key.
2. **Real states** — loading, empty, error, and stale-data states. These were
   deliberately excluded from the drills so they would not compete with
   design for attention; now they are the work, and each one is a design
   surface in its own right.
3. **Real posters** — swaps in TMDB's image CDN. Variable aspect ratios and
   missing artwork will break layout assumptions made in Phase A. Expected.
4. **Deploy** — the `deploy-to-vercel` skill is already installed.

Arun directs; Claude narrates which lever it is pulling and why.

### Optional later work

`ipl-predictions` redesign (React + Vite + Tailwind v4 + framer-motion +
Supabase, 17 components) — same stack, so the playbook transfers directly.
Good second application once the operating model is proven.

## Verification

- Every drill route captured by Playwright at **390 / 768 / 1440**, in both
  light and dark, committed to the repo.
- Comparative claims must be defensible against those images.
- `/impeccable audit` provides a third-party score across all six routes.
- Phase B requires before/after captures of every route.

## Session Shape

One drill per session: explain the lever → run it → review output together →
Arun names what reads wrong → finding is written into the playbook. Arun acts
as art director. The skill being built is *seeing what is off and naming which
lever fixes it* — precisely what an installed skill cannot do for you.

## Risks

**Skill conflicts at `v5`.** Emil's motion rules, Impeccable, and Taste have
overlapping jurisdiction over spacing, color, and motion, and may contradict
each other. If this happens it is the most instructive moment in the sequence:
document the conflicts and pick winners deliberately.

**Skills may underdeliver relative to `v4`.** If the `v4`→`v5` delta is small,
that is a real finding about where leverage lives, and the playbook must say
so rather than flattering the tools.

**Global skill installation** changes behavior in unrelated projects.

## Deferred Decisions

**Figma.** Requires designing first — a separate craft, further from the goal
than the coding already declined. Live-site references additionally carry
motion and interaction that static frames cannot. Revisit if a designer
supplies files, or if Figma Community UI kits become a working source; the
installed `compound-engineering` plugin already ships `figma-design-sync` and
`design-implementation-reviewer`, so it is a short add later.

## Framework Choice

**Vite + React, not Next.js.** Next 16.3.1 would be the right call for a
production landing page, but the subject here is design direction, not
framework learning. Vite gives faster iteration, fewer moving parts, no
server/client boundary to reason about — and it is the exact stack
`ipl-predictions` already runs, so Phase A transfers to Phase B with nothing
re-learned. Tailwind v4 via `@tailwindcss/vite` is identical either way.

## Open Questions

1. `web_development/` is not yet a git repo. Initialize one, so drill routes
   and screenshots are diffable across stages?
2. Render regional titles in native script (Telugu/Tamil/Devanagari) or
   transliterated Latin? Native is the harder and more interesting
   typography problem; Latin is what most Indian OTT aggregators actually do.
   Deferred to Drill 2, where the type system gets built.

