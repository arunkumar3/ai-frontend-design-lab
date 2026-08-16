# Design Constitution

Applies to all frontend work in this repository.

Rules marked **(measured)** were added after `v0`–`v5`, because the original list missed
them and the drills exposed the gap. See `playbook/05-troubleshooting.md` for evidence.

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
