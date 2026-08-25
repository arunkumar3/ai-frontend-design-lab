# Design Constitution

Applies to all frontend work in this repository, across every project under `projects/`.

Projects live in `projects/<name>/` and inherit this document. The `v0`–`v7` builds cited
throughout are the OTT release radar in `projects/ott-radar/`; each rule names the build
that earned it, and the evidence sits in `projects/ott-radar/findings/`.

Rules marked **(measured)** were added after `v0`–`v5`, because the original list missed
them and the drills exposed the gap. Rules marked **(v6)** were added after the `v6` build.
Rules marked **(posters)** came from the 2026-08-20 artwork harvest — see
`projects/ott-radar/docs/sessions/2026-08-20-posters-and-the-merge.md`.
Rules marked **(scrollcraft)** were adopted on 2026-08-23 from diffing this document against `nateherkai/scroll-craft` — see
`projects/ott-radar/findings/scrollcraft.md`; they are the only rules here not earned by a build in
this repo, and each says whose evidence it rests on.
See `playbook/05-troubleshooting.md` and `projects/ott-radar/findings/v6.md` for evidence.

A rule's tag is also its date. A route built before a tag existed is not in violation of
it — see the note under the routes table in `README.md`.

## Start here

**Working on an existing project?** Open its folder and read its `HANDOFF.md` first. That
file is the current state; this one is the standing rules.

**Starting a new project?** Read this document and `playbook/`. Then create
`projects/<name>/` with its own `README.md`, `HANDOFF.md` and fingerprint table. Nothing is
copied from another project — the constitution and the playbook are inherited in place.

The rules below cite `v0`–`v7`, which are the eight builds of the OTT release radar in
`projects/ott-radar/`. Where a rule's evidence matters:

1. `projects/ott-radar/findings/RANKING.md` — why the best-scoring page was not the best
   product. The single most useful thing in the repo.
2. `projects/ott-radar/findings/scrollcraft.md` — this document diffed against the closest
   published equivalent, and where the two disagree.
3. `projects/ott-radar/findings/v7.md` — building from a reference nobody could load.
4. `playbook/FINGERPRINTS.md` — the gate a new build clears, and why the rows are per-project.
5. `projects/ott-radar/docs/sessions/` — what happened in each working session.

Never quote a check count or a defect count from a document without re-running it — both
have gone stale here.

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
- **(v7)** A reference's *container* encodes its data's shape, not yours. Copy the card
  craft, the palette, the type pairing; re-derive the layout. `filmhood.in`'s horizontal
  strips are right for its open-ended browse categories and showed 3 of 11 titles when
  applied to a closed weekly slate — `v3`'s platform-grouping mistake in a new costume.
- **(v7)** An entrance animation must never be what makes content visible. Default to the
  finished state and let the class add the animation; if the observer never fires, the page
  is merely un-animated rather than empty.
  **(scrollcraft)** Scoped: this holds for every content page, which is all of `/v0`–`/v7`.
  A page whose *medium* is the scroll — where there is no single finished state to default
  to, because every scroll position is a different frame — may opt out, and the exemption
  has a price paid in advance: a harness that walks the page and reports any element that
  never reaches full opacity, plus a reduced-motion pass that proves the content is still
  reachable. No harness, no exemption. `scrollcraft` is the worked example on both sides —
  its `data-sc-in` path ships an explicit fallback that adds the class when
  `IntersectionObserver` is missing, and its `data-sc-cue` path, which carries most of the
  copy, ships `opacity: 0` with nothing behind it.
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
- **(v7)** Self-host web fonts. When the review instrument is a screenshot, an unreachable
  font host does not fail — it silently renders the fallback face, and every review pass
  approves typography that is not the typography.
- **(v7)** Anything sized by a grid column will stretch to full width when that column
  collapses. A 300px calendar became 736px with 105px cells; a 2:3 poster became 1100px
  tall. Cap them at the breakpoint that removes the column.
- **(v7)** `overflow-wrap: anywhere` also drives min-content sizing, so it breaks words
  eagerly even where they would have fit. Use `break-word`.
- **(v7)** Never index a lookup with a value that came from data you do not control.
  `PLATFORMS[release.platform].label` is a TypeError the first time a feed carries a
  platform nobody curated. Validate at the boundary and guarantee the lookup resolves —
  a derived label is a visible prompt to curate it properly; a crash is not.
- **(v7)** An empty result and a total failure look identical downstream. A fetch where
  every request 403'd and a week that genuinely has no releases both end in zero records.
  Separate them at the source, and refuse to write the second as if it were the first.
- **(v7)** Lint must enable `no-undef`. oxlint ships with it off, and a component calling a
  hook it no longer imports is a blank page with a green lint.
- **(measured)** No `loading="lazy"` on images. The capture harness waits for network idle
  at a pre-expansion viewport, so lazy images below the fold capture blank.

## Process

- Before claiming any surface complete, capture it with `pnpm shoot <route>` and look at the
  images.
- **(measured)** Three rounds, not one. One round of screenshot review ships the regressions
  it just introduced. 8–10 of 16 defects in `v4` were caused by the loop's own earlier
  fixes (8 clean regressions, 2 more on a generous reading — see
  `projects/ott-radar/findings/v4.md`).
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
- **(v7)** And restore the broken input from a byte-copy, never by re-applying an edit. A
  negative test's string-replace "restore" matched a different rule that shared the same
  value and silently swapped a bar's fill and track; every check stayed green for a day,
  because a contrast ratio is symmetric — the swapped pair computes the same number.
- **(v7)** A defect count is a reading of one tool at one version. `impeccable` scored `v6`
  at 0 and `v1` at 28 when they were built; the same routes on the same server score 5 and
  13 today, because rules were added and removed. Only a comparison where every page was
  scanned in the same run means anything — never quote a number a document recorded months
  ago as if it were current.
- **(v7)** Data shapes are a render concern, not a parser concern. Unit tests on a
  normaliser prove it parses; they cannot show that a 50-title week lays out or that an
  unknown platform reaches the card as a label. Give the page a dev-only seam to inject a
  feed and drive the real render against the shapes a live source will bring — empty,
  huge, malformed, missing fields, one region.
- **(v7)** Every test file needs a documented command that runs it. `releases.test.js`
  sat in this repo through six drills with ten passing tests and no `test` script — worse
  than a green suite that misleads, a suite nobody could run at all.
- **(v7)** A *craft* reference is a set of measurements. If you cannot load the page
  yourself, get `getComputedStyle` output, a colour histogram with counts, and the
  `@font-face` src URLs — not adjectives. "Warm off-white with a bold serif" cannot be
  built from; `#F7F7F1` and `Abril Fatface 400` can.
- **(scrollcraft)** A *direction* reference must not be a site. The rule above governs
  what you copy — card craft, palette, type pairing — and it is wrong applied to what the
  page should *be*: naming a site is how a page inherits that site's structure, which is
  the `v7` trap one level up and the reason `scrollcraft`'s first interview question asks
  for a film, an album cover, a shop, a magazine, and explicitly not "sites you like".
  Measure the reference you are borrowing from; do not take direction from a site at all.
- **(posters)** A review instrument that cannot fetch what the page fetches is reviewing the
  fallback. Every screenshot pass in this repo reviewed the designed poster tiles, because
  `image.tmdb.org` is blocked here and nothing errors when it is — the same shape as the
  unreachable font host rendering Georgia. Give the blocked asset a local base the harness
  can serve, or you are approving a page no reader sees.
- **(posters)** A check that reads its expectation from the same file the page reads is
  asserting that two lines agree, not that the page is right. Breaking the artwork overlay
  left `verify:v7` green because the script imported that overlay too; only breaking the
  page produced the failure. Negative-test by sabotaging the *render*, and know which half
  of the claim your check cannot see.
- **(v6)** Removing a structural element removes everything it silently carried. Deleting
  the week rail also deleted the page's only `<h2>`, leaving `h1` → `h3`; four screenshot
  passes could not see it and the live audit caught it immediately.
- **(scrollcraft)** Before building, check the plan against `playbook/FINGERPRINTS.md`. A
  new build must differ from **every** existing row on at least four of six dimensions —
  four against each row individually, not four on average. If it fails, change the plan,
  not the table; a row rewritten to accommodate a new build makes the whole file worthless.
  Applies from `v8` forward: `v0`–`v5` were deliberately near-identical, which was the
  experiment. This lab produced eight builds of one page and only noticed their convergence
  in the verdict pass, which is what the gate is for.
