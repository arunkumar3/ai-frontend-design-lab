# The screenshot loop

The highest-value lever measured in this lab, and the only one that costs nothing to install.

## Why it is different from every other lever

Every other technique operates on your **intent**: a constitution states what you want, a
token system commits values you chose, references import reasoning you agree with. This one
operates on the **output**.

That distinction is not theoretical. Three separate times in this lab an implementer
verified its own work and was wrong:

| Claim | Reality | Caught by |
|---|---|---|
| "the headline uses a serif display face" | `@theme` was inert; it rendered in sans | computed style in a browser |
| "Aug 15–21, 2026" | data spanned Aug 12–21 (IN) and Jul 2–Aug 28 (US) | reading the render against the data |
| audit is clean (0 findings) | live render had 28 | running the audit on the URL |

Each was invisible to inspection and obvious once rendered.

## The harness

`lab/scripts/shoot.mjs`, run as `pnpm shoot <route>` with the dev server already running.
Six captures per route: 390 / 768 / 1440 px, each in light and dark, full-page, at
`deviceScaleFactor: 2`.

Three details in it that were learned the hard way:

**`fileURLToPath`, not `.pathname`.** `URL.pathname` stays percent-encoded, so a repo path
containing a space writes to a literal `%20` path and `ENOENT`s. Works fine until someone
clones into `~/My Projects/`.

**No `loading="lazy"` anywhere in the page.** The script waits for `networkidle` at the
initial 900px viewport, then Playwright expands for the full-page capture with no further
wait. Lazy images below the fold are never requested and capture blank. This is a property
of *this* harness, not of lazy loading — but every drill must obey it identically or the
captures are not comparable.

**A fixed settle delay after network idle.** 1200ms, so entrance animations have finished.
Anything that animates on scroll will not survive a full-page screenshot at all.

## The method

Per round, in this order — the order is the method:

1. `pnpm shoot <route>`
2. Downscale so you can view all six without exhausting context:
   ```bash
   mkdir -p /tmp/look && for f in lab/shots/<route>/*.png; do
     sips -Z 1200 "$f" --out "/tmp/look/$(basename $f)" >/dev/null
   done
   ```
3. Look at all six.
4. **Write the critique to a file before touching code.** At least five defects.
5. Fix only what you wrote down.
6. Go to 1.

### Write before you edit

Without this the loop degenerates into fiddle-render-feel-better: you fix what is easy
rather than what is wrong, and you never learn whether looking surfaced anything. Writing
first makes the finding auditable and forces you to name the problem before you know the
fix.

### A defect names an element and a viewport

- ✗ "the layout feels unbalanced"
- ✗ "the spacing could be tighter"
- ✓ "at 390px the platform group header wraps to two lines, so the title count sits alone on line 2"
- ✓ "the JioHotstar row splits 5-and-1 at 1440px, leaving the second row almost empty"

Vague impressions cannot be verified, cannot be fixed precisely, and cannot be checked next
round. **The discipline that makes the loop work is not looking — it is being forced to say
precisely what you saw.**

## Three rounds minimum. One round is worse than none.

Across three rounds this lab logged 16 defects. Roughly **10 were introduced by the loop's
own earlier fixes.**

> every fix I made broke something else that I only caught on the *next* round's fresh
> screenshot, never in my own immediate spot-check right after editing

A single round finds real defects, fixes them, creates new ones, and ships them unseen. You
end up broken in different places while feeling verified. **The value is in looking again
after you fix.** If you cannot afford three rounds, the loop is not the lever to reach for.

## What it cannot see

| Blind spot | What happened here |
|---|---|
| **Absence** | 16 defects, four passes, and not one noticed that a page titled "this week" had no chronological axis. Round 1 saw the *symptom* — "the H1's 'this week' claim is contradicted by the date range two lines below" — and rewrote the headline to match the broken structure |
| **Cross-state relationships** | Two titles appear in both regions. Toggling showed the same poster twice with no explanation. A capture is one state; the defect lives between two |
| **Stale self-reference** | A footer explained a `~` marker that an earlier round had removed. Fully visible in every capture. Four passes looked straight at it, because attention follows the last fix |

The first two have alibis. The third does not, and it is the one to guard against:
**after changing a convention, grep for everything that documents the convention.** A
screenshot loop will never catch it, because the stale text is legible, correctly styled,
properly spaced — and false.

## Pair it with something that questions structure

The loop optimises what is on the screen and cannot see what should have been there
instead. It will make the wrong information architecture beautiful, one individually-correct
fix at a time.

On this lab's evidence the complement is **references** — the one lever that produced a
structural change rather than a refinement. Run references first to decide the structure,
then the loop to make it correct.
