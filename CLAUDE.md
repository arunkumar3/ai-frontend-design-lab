# Design Constitution

Applies to all frontend work in this repository.

Rules marked **(measured)** were added after `v0`–`v5`, because the original list missed
them and the drills exposed the gap. Rules marked **(v6)** were added after the `v6` build.
See `playbook/05-troubleshooting.md` and `playbook/findings/v6.md` for evidence.

## Start here

Phase 1 (`v0`–`v5`) is complete and scored. The current work is `v6`.

1. **`PHASE-2.md`** (repo root) — current state, the four verification commands, known gaps,
   open questions. Read this first in a new session.
2. `playbook/findings/RANKING.md` — why the best-scoring page was not the best product.
3. `playbook/findings/v6.md` — what the `v6` build proved about the toolkit.

`v6` was built on branch `v6-weekly-radar` and has since landed on `main`. Before trusting
any change to it, run all four checks in `PHASE-2.md` §3.

## Banned outright

- Indigo→purple (or any violet) gradient as a background or accent.
- Centered hero with a headline, subhead, and two buttons.
- Emoji used as iconography.
- `shadow-lg` (or heavier) applied broadly. Elevation must be earned by one or two elements.
- `max-w-7xl mx-auto` as the reflexive container.
- Gradient text.
- Cards nested inside cards.
- Copy containing: seamless, empower, effortless, unlock, elevate, revolutionize, supercharge.
- Default Tailwind palette colors as brand colors (`blue-500`, `indigo-600`, `slate-*` as an accent).
- **(measured)** Inter, Fraunces, Instrument Serif, Geist, Plus Jakarta Sans, Space Grotesk.
  Banning Inter alone just routes you to the next fashionable face — all of these are flagged
  as overused in AI-generated UIs.
- **(measured)** Invented abbreviations or monograms as a fallback for missing content. If
  the data has a title, show the title.

## Required

- Exactly one accent color across the page.
- A deliberate type scale — no more than four sizes on one screen.
- Asymmetry somewhere. A page where every section is centered is a failed page.
- Real copy about real titles. No filler.
- Both light and dark must be designed, not inherited.
- **(measured)** Third-party brand colors stay out of the content grid. One mark per group,
  not one per item.
- **(measured)** Every layout must be checked against the *shape* of the real data —
  group sizes, longest title, missing fields. A grid chosen once and applied uniformly to
  groups of varying length produces marooned single items.
- **(measured)** Empty, missing, and partial states are designed surfaces, not edge cases.
- **(measured)** Text contrast must be computed, not eyeballed. 4.5:1 for body, 3:1 for
  large. A clean automated scan is not proof.
- **(measured)** Any organising axis you remove must be replaced, not just deleted. If the
  page's purpose is chronological, chronology has to live somewhere visible.
- **(v6)** Measure caps in `ch` belong on the text element, not on a wrapper. `ch` resolves
  against the element's *own* font-size, so a 24ch cap set on a 16px container sized a 56px
  headline at ~190px and broke it over three lines.
- **(v6)** Never use `opacity` to make text recede. It stacks a second reduction the token
  values cannot see: the computed pair passes 4.5:1 and the rendered pixels fail. Recede
  with type size or a designed muted token.
- **(v6)** Restoring what an earlier version did is a hypothesis, not an instruction. `v0`'s
  date grouping was the missing axis, but re-implemented literally it put the 9-title US
  slate into nine groups of one — the orphan defect `v4` had already fixed.

## Build rules

- **Tailwind v4 is CSS-first.** No `tailwind.config.js`.
- **(measured)** Never put `@theme` in a route-local CSS file imported from a component.
  `@tailwindcss/vite` only processes `@theme` inside the module graph rooted at the file
  containing `@import "tailwindcss"`. Elsewhere it ships as inert text and every token
  silently resolves to `""`, with no dev-time error. Use plain CSS custom properties scoped
  to the route's root class.
- **(measured)** No `loading="lazy"` on images. The capture harness waits for network idle
  at a pre-expansion viewport, so lazy images below the fold capture blank.

## Process

- Before claiming any surface complete, capture it with `pnpm shoot <route>` and look at the
  images.
- **(measured)** Three rounds, not one. One round of screenshot review ships the regressions
  it just introduced. 8–10 of 16 defects in `v4` were caused by the loop's own earlier
  fixes (8 clean regressions, 2 more on a generous reading — see `playbook/findings/v4.md`).
- **(measured)** Verify against the render, never against your intent. Check computed style
  in a browser; cross-reference displayed text against the underlying data.
- **(measured)** Audit the running page, not the repository:
  `npx impeccable detect http://localhost:5173/<route>`. Source-mode reported 0 findings on
  a page the live scan gave 28.
- **(measured)** After changing a convention, grep for everything that documents it. Stale
  legends survive any number of screenshot passes because they look perfectly designed.
- **(measured)** Passing tests prove correctness, not wiring. A function with full coverage
  and zero callers is the failure mode where a green suite actively misleads.
- **(v6)** When a check fails, confirm the check before changing the page. A `v6` assertion
  reported a real page as broken because it searched `textContent` for `·` separators that
  are CSS `::after` content. The mirror of the trap above: a failing test that means nothing.
- **(v6)** A check that re-derives a formatted string in a second engine is asserting on
  that engine, not on the page. `verify:v6` formatted dates with Node's `Intl` and compared
  them to text Chromium rendered; the two ICU versions disagree by one comma, so the suite
  went 25/27 on an untouched page the first time the container was rebuilt. Format inside
  the page's own engine, and keep only the *claim* — which date belongs on which card — on
  the script's side.
- **(v6)** A check restored to green proves nothing until you have watched it go red on
  purpose. Break the input deliberately and confirm the failure names the mismatch.
- **(v6)** Removing a structural element removes everything it silently carried. Deleting
  the week rail also deleted the page's only `<h2>`, leaving `h1` → `h3`; four screenshot
  passes could not see it and the live audit caught it immediately.
