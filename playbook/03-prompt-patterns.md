# Prompt patterns

Quoted from what was actually run in this lab, with the resulting capture named. Nothing
here is hypothetical.

---

## The baseline prompt — what to say when you want the mean

Run this once, deliberately, at the start of any project:

> Build a modern, clean landing page that shows this week's new OTT releases. It should have
> a toggle to switch between India and US. Make it look professional and modern.

→ `projects/ott-radar/lab/shots/v0/`

"Modern," "clean," and "professional" are the three words that guarantee the statistical
centre. Keep the result. It is your control, and without it every later claim of improvement
is unfalsifiable.

---

## Naming what you don't want — put it in `CLAUDE.md`, not the prompt

The constitution that produced `v1` — never mentioned in the build prompt, delivered
automatically:

```markdown
## Banned outright
- Indigo→purple (or any violet) gradient as a background or accent.
- Centered hero with a headline, subhead, and two buttons.
- Emoji used as iconography.
- `shadow-lg` (or heavier) applied broadly. Elevation must be earned by one or two elements.
- `max-w-7xl mx-auto` as the reflexive container.
- Gradient text.  - Cards nested inside cards.
- Copy containing: seamless, empower, effortless, unlock, elevate, revolutionize, supercharge.
- Default Tailwind palette colors as brand colors.

## Required
- Exactly one accent color across the page.
- A deliberate type scale — no more than four sizes on one screen.
- Asymmetry somewhere. A page where every section is centered is a failed page.
- Real copy about real titles. No filler.
- Both light and dark must be designed, not inherited.
```

→ `projects/ott-radar/lab/shots/v1/` · 9 of 17 tells fixed

Put it in the file, not the prompt. It reaches subagents automatically, it applies to every
future session in that directory, and you never retype it.

---

## Forcing the system before the markup

> Write `projects/ott-radar/lab/design/tokens.md` **before you write a single line of markup or component
> code.** It must specify, with concrete committed values — not ranges, not options:
> a typeface pairing (**not Inter**); a modular type scale with base, ratio and four steps;
> a spacing scale; one accent colour with light and dark variants; a radius rule stated as a
> rule rather than a list; an elevation rule; motion timings with named easing curves.
>
> Then build so that **every** colour, size, spacing, radius and duration resolves to one of
> those tokens. No arbitrary values anywhere — no `text-[13px]`, no `bg-[#1a1a1a]`, no
> one-off `px` in JSX. If you need a value the system doesn't have, add it to `tokens.md`
> first, then use it.

→ `projects/ott-radar/lab/shots/v2/` · 14 of 17

The load-bearing clause is **"no arbitrary values."** It forces a justification for every
number, and justifying a number means measuring it.

---

## Making references bite

Extraction, per site:

> Invoke the `taste` skill for `https://justwatch.com/us/new`.
>
> We are designing a poster-driven **catalog/browse grid** — releases grouped by date, 2:3
> artwork, platform badges, a region toggle. Weight these heavily: how poster grids are
> structured (columns, gutters, aspect handling, row ends); how metadata attaches to a
> poster; type treatment for long titles at small sizes; how density is controlled; how a
> page full of clashing artwork is kept coherent. Also note how they handle items with
> **missing or poor artwork** — that is a specific problem we have.

Then the build:

> **Do not clone any single reference.** Cloning one produces a worse copy of it. Compose an
> original system from their reasoning. If you find yourself reproducing a specific site's
> layout, stop.

→ `projects/ott-radar/lab/shots/v3/`

**Add the warning this lab learned the hard way**, which the above is missing:

> Before adopting a reference's *structure*, check its data shape against yours. A layout
> encodes an assumption about volume. Confirm that assumption holds for your data.

Without it, `v3` inherited platform-grouping from a site with hundreds of titles per
platform and produced five single-poster rows.

---

## The screenshot loop

> Run three rounds. Each round, in this order:
>
> 1. `pnpm shoot v4` — six PNGs at 390/768/1440 in light and dark.
> 2. **Actually look at all six.** Downscale first so you can view them all:
>    `for f in projects/ott-radar/lab/shots/v4/*.png; do sips -Z 1200 "$f" --out "/tmp/look/$(basename $f)"; done`
> 3. **Write your critique to a file BEFORE you edit any code.** At least five specific
>    defects per round. A defect names the element and the viewport:
>    - ✗ "the layout feels unbalanced"
>    - ✓ "at 390px the platform group header wraps to two lines, so the title count sits alone on line 2"
> 4. Fix **only** what you listed. Do not make changes you did not first write down.

→ `projects/ott-radar/lab/shots/v4/` · 15 of 17, page height halved

Two clauses do the work. **Write before you edit** stops the loop degenerating into
fiddle-and-feel-better. **Reject vague impressions** is what makes a finding auditable.

---

## Asking an agent to tell you the truth

The most useful line in this entire lab, appended to a build prompt:

> Were you given any project-level or repository-level instructions beyond this message? If
> so, state that you received them, quote them, and say specifically which of your design
> decisions they changed. If you received none, say so plainly.

That is how we verified `CLAUDE.md` actually reaches subagents rather than assuming it.

The companion, after a failure:

> You ran a full pass over this page and did not catch this, and neither did three rounds of
> manual critique before you. It was visible in every capture. Why do you think it was
> missed? I am studying where screenshot-based review fails, and a candid answer is more
> useful to me than a tidy one.

That produced the sharpest sentence in the playbook: *"pixel judgment can confirm a line is
crisp and correctly kerned; it can't confirm the line is still true."*

---

## Prompt hygiene that mattered

- **Freeze scope explicitly when you want one thing changed.** "Do not restructure the
  layout, do not revisit the grouping, do not adjust styling. This round is the date range
  only." Without it, a fix round quietly improves things you were measuring.
- **Forbid reading the answer.** Every drill implementer was blocked from `docs/`,
  `playbook/`, and sibling routes. A baseline built by an agent that has read the critique is
  not a baseline.
- **License the disappointing answer.** "Be honest if the answer is 'little' — that is a
  legitimate and useful result." Otherwise you get a report that flatters the tool.
