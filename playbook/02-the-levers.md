# The levers

Six versions of the same page, one variable each, measured against a 17-item tell list and
a live-browser audit. This is what each lever actually bought.

Ordered by measured value, not by how good they sound.

---

## 1. The screenshot loop — the highest-value lever, and it is free

**What it is:** render the page, look at the captures, write down specific defects, fix
only those, then render and look **again**.

**Measured:** 15 of 17 tells fixed. Page height 7102px → 3742px. Killed the orphan-row
problem that a constitution, a token system, and a reference pipeline had all failed on.

**Why it wins:** every other lever operates on your *intent*. This one operates on the
*output*. Three separate times in this lab, an implementer verified its own work and was
wrong — a font that never loaded, a date range the data contradicted, an audit run against
source instead of the render. Each was invisible to inspection and obvious on screen.

**The non-obvious part: one round is worse than none.** Roughly 10 of 16 defects found
across three rounds were *introduced by the loop's own earlier fixes*. In the implementer's
words: *"every fix I made broke something else that I only caught on the next round's fresh
screenshot, never in my own immediate spot-check right after editing."*

A single round finds real defects, fixes them, creates new ones, and ships them unseen —
leaving you broken in different places while feeling verified. **The value is not in
looking. It is in looking again after you fix.** Budget three rounds or don't start.

**What it cannot do — three blind spots:**

| Blind spot | Example from this lab | Why |
|---|---|---|
| Absence | no chronological axis on a page about a week | what is missing leaves no pixels |
| Cross-state relationships | the same title in both regions, unexplained | a capture is one state |
| Stale self-reference | a footer explaining a symbol no longer used | attention follows the last fix |

The third is the cruellest: it was fully visible in every capture. Four passes looked
straight at it. As the agent that finally fixed it put it — *"pixel judgment can confirm a
line is crisp and correctly kerned; it can't confirm the line is still true."*

**How to run it:** capture at three widths (390 / 768 / 1440) in both themes. Write the
critique to a file **before** editing anything. Reject vague impressions — a defect names an
element and a viewport. "The layout feels unbalanced" is not a defect; "at 390px the group
header wraps and the count sits alone on line 2" is.

---

## 2. References — the only lever that produces structural moves

**What it is:** extract the design decisions of real sites that already solved your problem,
and the reasoning behind them. The `taste` skill (`senlindesign/taste-skill`) automates this
into token + rationale files from any URL.

**Measured:** 13 of 17. But the raw count misses the point — it delivered the single change
no amount of iteration produced.

**Why it wins:** the platform-badge problem survived three drills. `v0` let eleven brand
colours *be* the palette; `v1` shrank them to tints; `v2` to 8px dots. All three kept brand
colour **inside** the grid. JustWatch stamps the platform once on a group header, and the
grid carries no brand colour at all — 22 marks became 7.

Iteration makes a bad component smaller. **A reference replaces it.**

**Pick references by problem, not by beauty.** Design galleries are overwhelmingly
marketing pages. For a poster catalog, the right references were MUBI, Letterboxd,
JustWatch and Criterion — including the direct competitor. Going straight to best-in-class
examples of *your* problem beats browsing award galleries.

**The trap — and it is severe: a reference's structure encodes assumptions about its own
data.** JustWatch groups by provider because it has hundreds of titles per provider. This
product has 13 across 7, so the same structure produced five single-poster groups and cost
the page its chronological axis. "Take the systems, not the pixels" is not a strong enough
warning: **structure is neither system nor pixel, and that is exactly where the trap is.**
Before adopting a reference's layout, check its data shape against yours.

**Also valuable: what the references could not solve.** None of the four handled missing
artwork — all run curated, complete catalogs. That silence identified the one problem that
was genuinely ours and required original work.

---

## 3. Design system first — makes a rule into a constraint

**What it is:** commit concrete token values — typefaces, modular scale, spacing, one
accent, radius and elevation rules, motion timings — to a file **before** writing markup.

**Measured:** 14 of 17, and it resolved the deepest tell on the list.

**Why it wins:** compare with the constitution on the identical rule. Both had "exactly one
accent colour" available. The constitution *stated* it and got a partial result — chrome
obeyed, eleven brand colours still tinted content. The token system wrote the palette down
as committed values before any component existed, and got a complete one.

**A rule tells you what not to do. A token system removes the opportunity.**

Second-order effect worth knowing: **"no arbitrary values" forces you to justify a number,
and justifying it means measuring it.** The implementer's first featured-card attempt used
an ad hoc `1.6fr` grid track that, when actually measured, rendered identically to a normal
card. The discipline caught it.

**What it cannot do:** govern layout invariants. Nothing expressible in `tokens.md` says
"metadata rows in a row must align," so ragged card heights regressed here.

---

## 4. The constitution (`CLAUDE.md`) — cheap, automatic, and does more than it says

**What it is:** a repo-root file naming banned defaults and required properties.

**Measured:** 9 of 17.

**Verified mechanism:** it was never mentioned in the build prompt. The implementer was
asked afterwards and confirmed receiving it automatically, naming the decisions it drove.
**A standing `CLAUDE.md` does reach delegated subagents without being restated.**

**The surprising part: only 3 of its 9 fixes correspond to a rule it contains.** Ragged
heights, the fallback state, fallback dominance, flat metadata and the duplicated date are
nowhere in the document and improved anyway. Declaring that design is being taken seriously
appears to raise the general standard. **You cannot predict its effect by reading it.**

**What it cannot do:** a ban list only bans what its author already imagined. And **the
escape from a banned default is itself a default** — the constitution said *not Inter*, so
`v2` chose Fraunces and `v3` chose Instrument Serif, both of which the Impeccable audit
flags as equally overused in AI-generated UIs. Banning one cliché routes you to the next.

Note the baseline effect too: `v0` independently avoided four of six banned defaults with no
constitution at all. Measure your own baseline before crediting a ban list.

---

## 5. Community skill packs — worth installing, oversold

**What they are:** `emilkowalski/skill` (motion), `pbakaus/impeccable` (anti-patterns),
`Leonxlnx/taste-skill` (anti-slop).

**Measured:** no change from `v4` — identical page height, identical audit score.

**They did not load.** All seven returned `Unknown skill`, verified from the main session.
Project-local installs (`.claude/skills/`, `.agents/skills/`) do **not** hot-reload;
a global `~/.claude/skills/` clone does. **Install, then restart Claude Code** — nothing
warns you, and a silent no-op looks exactly like success.

**What they genuinely earned:** one real WCAG contrast failure — an active toggle pill at
**4.03:1**, present since `v3` — that `impeccable detect` reported clean in both modes. It
was caught by following the pack's own `craft-floor.md` instruction to compute the values.
**The checklist beat the scanner, inside the same product.**

**What to take:** Impeccable's CLI is genuinely useful — but run it against the live URL.
The opinionated taste packs were overridden on all three of their strongest opinions, since
each was formed without knowledge of this product's constraints.

---

## Reading the audit correctly

`impeccable detect` has two modes and they disagree violently:

| Route | Source scan | Live-browser scan |
|---|---|---|
| `v0` | 0 | 7 |
| `v1` | 0 | **28** |
| `v2` | 1 | 14 |
| `v3`–`v5` | 1 | 3 |

The source scan called the two least-designed pages perfect. **Always
`detect http://localhost:5173/<route>`, never `detect src/`.**

And note what the audit rewards: `v0` scores 7 while `v2` scores 14. An anti-pattern
detector cannot distinguish "avoided the cliché" from "never made a decision." **Absence of
a tell is not presence of design.**
