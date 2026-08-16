# v5: where the three design skill packs disagreed

Scope: `/v5`, a verbatim `/v4` copy with the community design skill packs
(`impeccable`, the Emil Kowalski animation packs, `design-taste-frontend` /
`high-end-visual-design`) applied against it. This file records the places
where two or more of those systems wanted different things. Each entry states
what each side wanted, which one v5 followed, and why — the disagreement
itself is the deliverable, not a tidy resolution.

Tooling note: the Skill tool could not load any of these packs by name in
this session (`Unknown skill: impeccable`, `Unknown skill: animate`, etc.)
even though they exist at `.claude/skills/*` and `.agents/skills/*` and are
listed as available in the task brief. `impeccable` was run via its
documented CLI fallback (`npx impeccable detect`, both static-file and
live-browser modes). The others have no CLI; their `SKILL.md` and reference
docs were read directly and applied literally to the code — the closest
available substitute for "invoking" them. This is a process limitation, not
a design conflict, so it isn't counted below; see the task report.

---

## 1. Typeface: keep Instrument Serif + Inter, against three signals to change them

**What each wanted:**
- `impeccable` (both `detect --json` on the source and `detect` on the live
  page) flags `overused-font`: "Instrument Serif... each new wave of
  AI-generated UIs converges on the same handful of faces." The live scan
  also names Inter as the measured primary font at 90% of text, on the same
  overused list.
- `design-taste-frontend` §4.1 is more absolute: "Specifically BANNED as
  defaults: `Fraunces` and `Instrument_Serif`" (no carve-out), and separately
  "Discouraged as default: `Inter`."
- `high-end-visual-design` §2 bans Inter outright in its "ABSOLUTE ZERO"
  list alongside Roboto/Arial/Helvetica.

**What `impeccable`'s own philosophy wanted, pulling the other way:**
Its `SKILL.md` states "The brief wins. Honor pinned aesthetics, eras,
materials, fonts, and palettes even when they conflict with a
saturated-pattern warning. Redirecting a clear brief toward your taste is
failure," and "when torn between refined and committed, commit." v4's CSS
documents a deliberate serif-for-editorial / sans-for-functional split,
reasoned through multiple prior rounds (the `R1`/`R2`/`R3` comments already
in `v4.css`) — a committed, not-default choice, which is exactly the case
`impeccable`'s own text says a detector warning shouldn't override.

**Followed:** kept both faces unchanged in v5. Three reasons: (1) the task
brief explicitly warns that earlier drills already tried rotating to
Fraunces and hit the same detector flag — satisfying the taste packs'
literal ban here means picking a new serif from their own suggested pool
(PP Editorial New, GT Sectra, Recoleta, ...), which *is* the "rotate to
another fashionable face" the brief says not to do; (2) `impeccable`'s
severity for this is `warning`, and its stated philosophy explicitly favors
a documented, committed choice over a frequency-based detector; (3) fixing
this "correctly" would mean replacing both the display and body face
simultaneously, since Inter is flagged too, which is a bigger, riskier
change than the finding justifies on its own.

---

## 2. The eyebrow ("OTT release radar"): three-way split, kept it

**What each wanted:**
- `impeccable`'s `craft-floor.md` bans it outright and says so explicitly:
  "A kicker or eyebrow above a heading. This one is a ban, not a default:
  no brief earns it back. The heading carries its own weight; delete the
  label and let the heading speak." Its live-browser detector independently
  flags the exact element: `[hero-eyebrow-chip] eyebrow chip (tracked-caps)
  "OTT release radar" above h1 "What's new in India"` — on **both** `/v4`
  and `/v5`, confirming this is pre-existing, not something v5 introduced.
- `design-taste-frontend` §4.7 sets a *quota* instead of a ban: "Maximum 1
  eyebrow per 3 sections... Hero counts as 1." A one-hero page is inside
  that budget.
- `high-end-visual-design` §4.C treats the eyebrow as a required signature
  of premium craft: "Eyebrow Tags: Precede major H1/H2s with a microscopic,
  pill-shaped badge" — listed as part of the "$150k agency" checklist.

**Followed:** kept the eyebrow. Two reasons beyond just picking a side.
First, this eyebrow isn't decorative filler — "OTT release radar" is the
persistent product identity, while the H1 changes text on every region
toggle ("What's new in India" / "...the United States"); removing it would
delete real, distinct information, not just an ornament, which is a
different case than the templated-SaaS-hero pattern the ban is aimed at.
Second, `impeccable`'s own critique methodology (`critique.md`) deliberately
separates a mode-aware design review from the mechanical detector, because
the detector "still anchors judgment" but can't itself distinguish a
Persuade-mode SaaS hero (what the detector's justification text names) from
this page's Operate-mode data listing. Followed `design-taste-frontend`'s
contextual tolerance over `craft-floor`'s absolute ban and
`high-end-visual-design`'s blanket endorsement — a real, acknowledged
override of the strictest of the three, not a reinterpretation of it.

---

## 3. Entrance motion: mount-time 300ms stagger, not cinematic scroll choreography

**What each wanted:**
- `design-taste-frontend` §5 ("Motion claimed, motion shown") and
  `high-end-visual-design` §5.C both mandate scroll-triggered entrance
  animation as non-negotiable: "Elements never appear statically on load. As
  they enter the viewport, they must execute a gentle, heavy fade-up
  (`translate-y-16 blur-md opacity-0` resolving... over 800ms+)." The
  pre-output checklist in `high-end-visual-design` lists "Scroll entry
  animations are present — no element appears statically" as a hard pass/fail
  line.
- `review-animations` / `find-animation-opportunities` (Emil Kowalski's
  standards) cap UI animation at under 300ms, prescribe a 30–80ms stagger
  for group entrances (not 800ms fades), and list "everything-at-once
  entrance where a 30–80ms stagger belongs" as an escalation trigger in the
  *other* direction — too little motion, not too much heaviness. They also
  treat decoration on "data the user is trying to read or act on" as a
  functional negative, and require a named purpose beyond "it looks cool."

**Followed:** Emil's restraint — a mount-time `initial`/`animate` fade
(`opacity 0→1`, `y: 8px→0`, 300ms, `cubic-bezier(0.23,1,0.32,1)`, 30ms/card
stagger capped at the 10th card), never `whileInView`. Two reasons, one of
them not a taste call at all: the task's own hard constraint is that
`pnpm shoot v5` takes a single full-page screenshot 1200ms after
network-idle without incrementally scrolling the viewport — a
scroll-triggered (`whileInView`) reveal would leave every below-the-fold
card frozen at its pre-entrance, invisible state in the capture, which is a
correctness bug against the verification harness, not a style preference.
Separately, this page is squarely `impeccable`'s own "Operate" mode (task
completion over cinematic expression), where `craft-floor` ("one authored
moment, not scattered effects") and Emil's packs agree with each other and
against the two taste packs' marketing-page defaults.

---

## Not a conflict, but worth recording: the detector missed a real bug

`impeccable detect` (file scan and live-browser scan, on both `/v4` and the
pre-fix `/v5`) reported zero contrast findings. Manually computing WCAG
contrast for the region-toggle's active-pill text against v4's accent color
(`#F5FFFE` on `#0E8C86`) gives **4.03:1** — under the 4.5:1 floor
`craft-floor.md` itself states for body text (14px/600-weight doesn't
qualify as "large text"). Fixed in v5 by darkening the light-mode accent to
`#0A6E69` (5.98:1). This isn't a disagreement between packs — nobody
disputes the WCAG floor — but it's evidence that a clean `impeccable detect`
run is not proof of `craft-floor` compliance; the floor's own "read the
computed values" instruction caught something the automated scan didn't.
