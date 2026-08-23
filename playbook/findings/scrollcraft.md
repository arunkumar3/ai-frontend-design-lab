# scrollcraft, diffed against the constitution

`scrollcraft` is a Claude Code skill for building scroll-driven landing pages, published by
Nate Herk and written up in a thread on 2026-08-22 (*"I Built The Ultimate Claude Website
Design Skill (steal this)"*). It is the closest published thing to this repo's `CLAUDE.md`:
a long, opinionated, evidence-backed design constitution carried as skill files rather than
as a repo document. This is a line-by-line comparison of the two.

**What was read.** `nateherkai/scroll-craft` at `ea06865`, plugin version `0.2.0`, dated
2026-08-22. About 4,000 lines: `SKILL.md`, the eight `references/*.md`, `CHANGELOG.md`,
`README.md`, `engine/scrollcraft.css`, `references/template.html`. Everything asserted below
about the engine and the template was grepped from those files, not inferred from the prose.

Re-verify before quoting this. Both documents change.

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/nateherkai/scroll-craft
grep -rn "prefers-color-scheme" scroll-craft/          # expect: nothing
grep -n "data-sc-cue" scroll-craft/plugins/nateherk-design/skills/scrollcraft/engine/scrollcraft.css | head -1
```

---

## 1. The short version

The two documents were written from the same posture — rules earned by shipping something
broken, each one carrying the build that produced it — and they arrive at the same finding
about a dozen times independently. Where they differ, the difference is almost always the
same difference: **scrollcraft's page is authored, this repo's page is fed.** Every gap in
scrollcraft is a data-shape gap, and every gap here is a structure-and-emotion gap.

The three genuine conflicts are worth more than the agreements, because each one is a place
where both sides have written down evidence and the evidence disagrees.

| | |
|---|---|
| Independent agreements | 12, several word-for-word |
| Direct conflicts | 3 |
| Gaps in scrollcraft that this repo has measured | 8 |
| Gaps here that scrollcraft has measured | 9 |

---

## 2. The three conflicts

### 2.1 Geist

`CLAUDE.md` bans Inter, Fraunces, Instrument Serif, **Geist**, Plus Jakarta Sans and Space
Grotesk, with the rationale stated in the rule itself:

> Banning Inter alone just routes you to the next fashionable face.

scrollcraft `references/taste.md` does exactly that:

> Inter is discouraged as a default: it is the most-used face in AI-generated pages and it
> reads as a non-decision. Reach first for **Geist**, Archivo, Outfit, Satoshi, Cabinet
> Grotesk, or the brand's own face.

And `references/template.html:35` ships `--sc-font-text: "Geist", system-ui, sans-serif` as
the default theme. So the skill bans the overused face and hands you the next one, which is
the failure mode this repo's rule was written to name. This one is not a close call:
scrollcraft is the worked example of its own predicted failure.

scrollcraft is more permissive in the other direction too — it allows Inter "when the brand
asks for neutral, or when accessibility is the brief". That escape is reasonable and this
repo does not have it.

### 2.2 Content that is invisible until an animation runs

`CLAUDE.md` (v7):

> An entrance animation must never be what makes content visible. Default to the finished
> state and let the class add the animation; if the observer never fires, the page is merely
> un-animated rather than empty.

`engine/scrollcraft.css:267`:

```css
[data-sc-cue] { opacity: 0; will-change: opacity, transform; }
```

Every cued element in a scrollcraft page starts invisible and is made visible by scroll
progress. That declaration is unconditional CSS; the only thing that raises the opacity is
the engine's per-frame write. There is no `<noscript>` path and no no-JS fallback: the
`.sc-ready` class the engine sets on init only suppresses transitions
(`engine/scrollcraft.css:268`), it does not reveal anything. A page whose script 404s or
throws before init renders its media and none of its copy.

**One path does get this right, and it is worth crediting.** Flow reveals (`data-sc-in`) use
the engine's single `IntersectionObserver`, and it is written with an explicit else-branch:
when the API is unavailable the engine adds the `.sc-in` class to every such element
directly (`engine/scrollcraft.js:505-507`). That is precisely the construction `CLAUDE.md`
asks for — if the observer never fires, the content is merely un-animated. The gap is that
the same care was not extended to `[data-sc-cue]`, which is most of the copy on the page.

scrollcraft's answer is not denial — it is a harness. It detects **cues that never peak**
(an element that never reaches full opacity anywhere), it runs a mandatory reduced-motion
pass, and it centres keyboard focus on elements whose cue is under 0.85. That is a serious
mitigation and it is more than this repo does for its own animations.

But it is detection after the fact where the constitution asks for a construction that
cannot fail, and `verify.md` documents its own holes: *"Acts with no `[data-sc-cue]`
elements are not graded at all"* and *"Lines under 0.85 opacity are skipped"*. A page whose
JS throws before the engine initialises is blank, and nothing in the pass runs to say so.

**Both positions are defensible and they are not reconcilable.** A scrub-driven film page
genuinely cannot default to the finished state, because it has no single finished state —
that is `verify.md`'s opening sentence and it is correct. The honest reading is that this
rule is scoped: it holds for content pages, and a page whose medium *is* the scroll buys an
exemption by paying for a harness. Worth writing that scope into `CLAUDE.md` rather than
leaving the rule looking absolute and quietly violated by anything scroll-driven.

### 2.3 What a reference is

`CLAUDE.md` (v7), earned on `filmhood.in`:

> A design reference is a set of measurements. If you cannot load the page yourself, get
> `getComputedStyle` output, a colour histogram with counts, and the `@font-face` src URLs —
> not adjectives. "Warm off-white with a bold serif" cannot be built from; `#F7F7F1` and
> `Abril Fatface 400` can.

scrollcraft's interview, question 1:

> **Vibe in three to five words**, plus up to three references from any medium. A film, an
> album cover, a shop, a magazine, a game. **Not "sites you like"**: naming sites is how a
> page ends up looking like an existing site.

Deliberately adjectives, and site references are banned for the opposite reason this repo
wants them measured. Both have evidence. This repo's is `v7`: a reference described in
adjectives produced a page built from the wrong measurements. scrollcraft's is its own
template trap (§2.4 below): four builds converged because they all inherited one site's
shape.

The reconciliation is that they are answering different questions. **A reference for
*craft* must be measured; a reference for *direction* must not be a site at all.** `v7`
needed `#F7F7F1` because it was copying card craft. scrollcraft bans site references because
it is choosing a structure, and there the measurement is the contamination. Both rules are
right about their own axis, and each is wrong applied to the other's.

---

## 3. Where they independently agree

These are the strongest part of the comparison, because neither document could have copied
the other. Each was written from a build that broke.

| Finding | `CLAUDE.md` | scrollcraft |
|---|---|---|
| **A `ch` cap on a wrapper sizes against the wrapper's font-size, not the heading's** | (v6), broke a 56px headline over three lines | `verify.md` failure table: "A hero headline wrapped to six lines — `max-width` in `ch` on a **container**" |
| **A review instrument that cannot fetch what the page fetches reviews the fallback** | (posters), `image.tmdb.org` blocked, every pass reviewed the fallback tiles | Three separate instances: `file://` blocks the Blob fetch so clips fall back to posters; bundled Chromium has no h264 decoder so "the run passes against posters"; "a 404 on a clip degrades to a poster silently, which looks fine and is not" |
| **Verify against the render, never against intent** | (measured) | `taste.md` opening: "a check on the **rendered result**, not on intention. 'I used a spacing scale' is not evidence; a computed value is" |
| **An empty result and a total failure look identical downstream** | (v7), a fetch where every request 403'd vs a genuinely empty week | The whole poster-fallback family above, plus "Console errors and failed requests" as a named check |
| **A green check can be measuring the wrong thing entirely** | (measured) "Passing tests prove correctness, not wiring" | `verify.md`: `serve.mjs` fails `EADDRINUSE` into a log nobody reads, `shoot.mjs` gets a clean 200 from whatever else is on the port, and writes "a full contact sheet and a clean report for a site you did not build" |
| **When a check will not move, suspect the check** | (v6) "confirm the check before changing the page" | "You strengthen the scrim and the reported numbers do not move at all. Not 'improve slightly': byte-identical, because the thing you changed was never in the measurement" |
| **Removing a structural element removes what it silently carried** | (v6), deleting the week rail deleted the page's only `<h2>` | `[data-sc-pan] { transform: none }` under reduced motion "deleting the navigation" — the rail parks on its first screenful and the rest is unreachable |
| **Contrast must be computed, and a clean automated scan is not proof** | (measured) | Measured on the composited page at the brightest frame under each line — **and** a documented list of what that pass still cannot see |
| **Text contrast: 4.5:1 body, 3:1 large** | (measured) | `taste.md`, Colour — identical numbers |
| **Never nest cards** | Banned outright | "Never nest cards" |
| **Gradient text** | Banned outright | Refuse list, and the hard-rules table |
| **Emoji as iconography** | Banned outright | "Emoji standing in for an icon system. Use a real icon library" |
| **Violet/indigo gradients** | Banned outright | "The AI-purple trap" |
| **Elevation must be earned** | No broad `shadow-lg` | "Three elevation steps and no more. If everything is elevated, nothing is" |
| **Real copy, no filler** | Real copy about real titles | "Real copy, not lorem. Real names, not 'John Doe'. Real numbers or no numbers" |
| **One accent** | Exactly one across the page | Six colour roles, one accent, locked for the page |

Two near-misses worth noting rather than counting:

- **The banned-word lists overlap but are not the same.** Shared: elevate, seamless,
  revolutionize, supercharge. Only here: empower, effortless, unlock. Only scrollcraft:
  unleash, next-gen. Merging the two lists is free.
- **`CLAUDE.md` has no em dash rule.** scrollcraft bans the em dash in any visible copy.

---

## 4. What scrollcraft has that this repo does not

Ranked by what it would be worth here.

**1. A fingerprint gate against your own prior output.** A registry of every build on six
dimensions — grammar, nav treatment, hero device, act-sequence shape, close pattern,
signature move — and a new build must differ from **every existing row on at least 4 of the
6, individually, not on average.** The rule that makes it work is the one about the record:
*"If the planned build fails the gate, change the plan, not the log."*

This repo has nothing about not repeating itself, and it has the same disease. `v0`–`v7` are
eight builds of one page and their convergence was never gated, only observed afterward in
`RANKING.md`. The gate is the cheapest idea in scrollcraft and the most portable.

**2. Structure as a named, mutually exclusive choice.** Eight page grammars, each one
listing what it **forbids**, on the argument that a grammar which is a preference instead of
a constraint drifts back to the default halfway through. The finding behind it is the one
this repo would recognise instantly:

> The world changes how a page LOOKS. The grammar changes what a page IS. A build that only
> changes world is a re-skin.

That is `RANKING.md`'s finding — the best-scoring page was not the best product — arrived at
from the other side, and scrollcraft turned it into a gate where this repo turned it into a
write-up.

**3. The feeling curve, one engineered peak, and the cold feel-check.** Emotion per act
written *before* devices are chosen; two adjacent acts with the same feeling means one is
filler; the peak-end rule applied literally, with the peak taking the asset budget, the
silence in front of it, and the most scroll room. Then the check: scroll the page cold, write
one word per act, **and only then** open the brief and diff. *"Where they disagree, the page
is wrong, not the brief."* That last clause is the same discipline as this repo's rule about
not rewriting a fingerprint row, applied to intent.

**4. Known limitations published alongside the harness.** `verify.md` lists five things its
own contrast pass cannot see, including a lovely one: cues are keyed by their text, so two
cues sharing a string — which its own "one label per intent" rule encourages — collapse into
one row. This repo's (v7) rule says a defect count is a reading of one tool at one version;
scrollcraft goes further and ships the tool's blind spots next to the tool.

**5. Epistemics about its own numbers.** The credit accounting is the best-argued page in the
skill: a probe reports a balance not a delta, parallel builds each claim each other's spend,
the per-call sum overstates by ~2.5x against the ledger, so *"the probe delta bounds a
parallel run from above, the per-call sum bounds a serial one from above, and only a ledger
read with a single consumer settles it."* That is exactly the reasoning this repo's (v7)
defect-count rule wants, applied to a different quantity.

**6. Interview before generation, as a ship-blocker.** Eight questions, answers written
verbatim into `BRIEF.md`, and a self-authored brief must be marked as such in the file and in
the final report. This repo's `03-prompt-patterns.md` covers making a brief bite; it has no
rule that the brief must come from a human, and no requirement to label the fallback.

**7. Smaller craft rules with no equivalent here**, all of which would survive import:
more space above a heading than below it; tracking tightens as size grows; light-on-dark type
compensated on three axes (leading, tracking, weight); depth as five tools rather than one;
`ease-in` never on UI; never `scale(0)`; reduced motion means fewer and gentler, not zero;
the browser surfaces nobody themes (selection, caret, scrollbar, underline offset, tabular
numerals); and the squint test.

**8. The premium-consumer palette trap.** Cream, brass, espresso — named as the default reach
for every artisan/food/wellness brief, with five rotations offered. This repo bans default
Tailwind palette colours; it does not name the *tasteful* default, which is the harder one to
see.

---

## 5. What this repo has that scrollcraft does not

The pattern here is one-directional and it is the whole reason the two documents are not
substitutes.

**1. Everything about the shape of real data.** scrollcraft has no rule about group sizes,
longest title, missing fields, or a layout checked against the data it will actually carry.
It cannot: its pages are authored, every string is written by the builder, and the content is
known at build time. This repo's most expensive findings live here — `v3`'s platform
grouping, `v4`'s marooned single items, `v6`'s nine groups of one — and none of them are
reachable from scrollcraft's position.

**2. Empty, missing and partial states as designed surfaces.** scrollcraft covers *interactive*
states thoroughly (hover, focus-visible, active, disabled on everything) and data states not
at all. The one mention of "empty states" is as copy idiom inside the live-surface grammar.

**3. Never index a lookup with uncontrolled data** — (v7)'s `PLATFORMS[release.platform]`
crash. No analogue, and again none needed at their altitude.

**4. Both light and dark designed, not inherited.** Confirmed by grep:
`prefers-color-scheme` appears **zero times** in the entire skill. scrollcraft's "light
canvas" means the page's chosen ground, not the reader's preference. `worlds.md` has a good
section on what inverts when the canvas is light — scrim direction, ink over media, edge
light, shadow alphas — but it is about authoring one page light, not about supporting both.

**5. Self-host web fonts.** This is the sharpest unforced gap, because scrollcraft has
already written down the general form of the bug and did not apply it to fonts.
`template.html` names `"Archivo"` and `"Geist"` with **no `@font-face`, no `<link>`, and no
font host anywhere in the repo** — grep returns nothing. On any machine without those faces
installed, every scrollcraft page silently renders `system-ui`, and the review instrument is
a screenshot. That is the same failure the skill catches three times for video (poster
fallback, missing decoder, blocked fetch), missed once for type.

**6. Negative testing.** (v6): a check restored to green proves nothing until you have
watched it go red on purpose. (v7): restore the broken input from a byte-copy, never by
re-applying an edit. scrollcraft has nothing on deliberately breaking its own harness, and
`verify.md`'s scrim-as-child section is a case where it would have found the hole in minutes
instead of shipping it.

**7. Documentation staleness.** (measured): after changing a convention, grep for everything
that documents it. scrollcraft carries eight cross-referencing files and a changelog with no
such rule.

**8. Three rounds, not one.** scrollcraft says "fix what you found and shoot it again" and
adds "fresh eyes, look again later", which implies two. This repo measured that one round
ships the regressions it just introduced: 8 of 16 `v4` defects were caused by the loop's own
earlier fixes.

**9. Lint and test hygiene.** `no-undef` must be enabled; every test file needs a documented
command that runs it. scrollcraft has no lint and no tests — its verification is entirely the
screenshot harness, which is coherent for a static page but leaves the engine
itself — a 1,000-line file with branches for reduced motion, missing
`IntersectionObserver`, worldflight mode and mobile sources — unexercised by anything except
whichever page happens to be under test.

---

## 6. What to do with it

Nothing here changes `CLAUDE.md` yet. Three things are worth proposing, in this order:

1. **Import the fingerprint gate.** It is six columns and one rule about not editing the
   record, it needs no engine, and this repo has eight builds that would have failed it.
2. **Scope the entrance-animation rule.** As written it reads absolute and is violated by
   any scroll-driven page. Either say it holds for content pages and name the exemption's
   price (a harness that detects never-peaked content), or say it holds always and accept
   that this repo will not build a scrub page.
3. **Split the reference rule in two.** Measurements for craft, non-site references for
   direction. Both halves are already earned; they are currently one rule doing one of the
   two jobs.

The Geist collision needs no action beyond noting it: this repo's ban is measured and
scrollcraft's recommendation is a preference, so the ban wins here and the skill would need
its theme tokens overridden before any of its output could ship into this repo.

---

## 7. What was applied to `/v7`, 2026-08-23

`v0`–`v6` are frozen by the append-only rule. `v7` is the live route, so it is the only
place any of this could land. Every change below is from scrollcraft's taste floor and has
no equivalent in `CLAUDE.md`.

**The premise for doing it at all:** `impeccable` scores `/v7` at **0 findings**, and
`verify:v7` and `contrast:v7` both pass. So anything worth changing had to be something no
instrument here can see, which is exactly the category scrollcraft's taste floor covers.

| Applied | Was |
|---|---|
| Nine hover blocks gated behind `@media (hover: hover) and (pointer: fine)` | Ungated. On a phone, a tap left a stuck hover state |
| Press feedback (`:active`) on buttons, week rows, nav links, calendar days | Absent. On touch — where the hover half never fires — this is the only feedback there is |
| `::selection`, `caret-color`, `scrollbar-color`, underline offset and thickness | All absent. `v5` and `v6` already themed selection; `v7` was the odd one out |
| `text-wrap: balance` on headings, `pretty` on the two prose blocks | Absent |
| Poster zoom `0.5s ease-in-out` → `0.32s cubic-bezier(0.23, 1, 0.32, 1)`; card meta → `0.18s` | `ease-in-out` delays the moment the eye is already on, and 500ms sat oddly against the page's own 150ms buttons. The curve is one the file already used |

### What was checked and deliberately not changed

- **Display tracking.** `letter-spacing: 0.005em` on the hero means tracking *loosens* as
  size grows, which inverts scrollcraft's rule. Left alone: the face is Abril Fatface, a fat
  didone whose counters close up, and on the render at 1440 and 390 it reads correctly.
  Applying the rule blind would have been a regression. **Verify against the render.**
- **The reduced-motion block.** Read as thin at first glance; it is not. It inventories
  everything on the page that moves, with a comment saying so.
- **`:focus-visible`.** One rule at `.v7-page :focus-visible`, which is a descendant
  selector covering every control. Not the gap it looked like.
- **The marooned last card.** 13 titles in a 3-column grid leaves one alone on the last row,
  and scrollcraft's "if a multi-cell grid has an empty trailing cell, the grid was planned
  wrong" applies. Reshaping the slate is a real design change with real risk, and
  `feed:shapes` already covers ten grid shapes. **Flagged, not silently redesigned.**

### The check, and watching it fail

The new suite is `pnpm states:v7` (`lab/scripts/states-v7.mjs`). It runs the page twice,
once at 1440 with a fine pointer and once as a Pixel 7, and asserts the hover applies in the
first and not the second.

**Two things it got wrong before it got them right,** both found by running it rather than
reading it:

1. **`dispatchEvent('mouseover')` does not drive CSS `:hover`.** It fires the JS event and
   leaves the pointer where it was. With the gating deliberately deleted, the touch check
   still passed. `locator.hover()` moves the virtual mouse and does drive it. This is the
   `(v6)` trap — a check that means nothing — caught only because the negative test was run.
2. **A rule whose value is a `var()` reads back empty from `.style.backgroundColor`.** The
   `::selection` check reported the rule absent when it was present. And the caret check
   hardcoded the dark palette's `#e6ff41` while headless defaults to light, where the accent
   is `#4f5a00`. Two false failures on a correct page.

The gate was then sabotaged on purpose, watched go red naming the mismatch, and restored
**from a byte-copy** — `md5sum` identical before and after — never by re-applying the edit.

### The screenshots were reverted on purpose

`pnpm shoot v7` overwrites `lab/shots/v7/`, and **the committed shots there were taken with
real posters from the harvest.** Regenerating them in this sandbox replaces what a reader
sees with what this sandbox sees — the `(posters)` trap, one turn after writing it down.
They were restored byte-identically (`md5sum` confirmed) and the new renders were used for
review only. Anyone shooting `/v7` here should do the same, or serve a harvest first.

Comparing the two did pay for itself once: `text-wrap: balance` visibly rewrapped the hero
from `Em chustunnaru e / vaaram?` to `Em chustunnaru / e vaaram?`. Two even lines instead of
a long one and a stub. That is the only change in this batch that shows up in a screenshot
at all.

### What could not be verified here

`.v7-poster` and `.v7-card__meta` never mount in this sandbox: `image.tmdb.org` is blocked,
so every card renders the designed fallback tile. The poster-zoom timing change is asserted
from the CSSOM and **has not been watched move.** Anyone with a reachable poster host should
look at it before trusting it.
