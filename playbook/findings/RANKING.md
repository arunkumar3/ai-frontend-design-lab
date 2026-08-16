# Verdict pass — ranking all six drills

## 1. The audit's own finding: how you run it changes the answer completely

`impeccable detect` has two modes. Same tool, same six pages, run minutes apart:

| Route | Lever | Source-file scan | **Live-browser scan** |
|---|---|---|---|
| `v0` | none | 0 | **7** |
| `v1` | constitution | 0 | **28** |
| `v2` | token system | 1 | **14** |
| `v3` | references | 1 | **3** |
| `v4` | screenshot loop | 1 | **3** |
| `v5` | community skills | 1 | **3** |

**The source scan is worthless here and actively misleading.** It reported `v0` and `v1` as
perfect, because all it can do is regex source text for known font names. The live scan
renders the page and computes actual values — contrast ratios, padding, overflow, line
length — and finds `v1` to be the worst page in the lab by a factor of nine.

`v1`'s 28 findings are overwhelmingly **cramped padding** and **low-contrast text**. Neither
is visible in source. Both are obvious once rendered.

**Rule: audit the running page, not the repository.** `npx impeccable detect http://localhost:5173/v1`, not `npx impeccable detect src/`.

This is the third time in this lab the same failure has appeared — a check that inspects
intent rather than output:

| Failure | What was checked | What was true |
|---|---|---|
| `v1`'s inert `@theme` | the CSS said `--font-display` | the browser resolved it to `""` |
| `v3`'s date range | the string looked plausible | the data contradicted it |
| the source-mode audit | the source had no bad font names | the render had 28 defects |

## 2. Ranking by audit score

`v3` = `v4` = `v5` (3) → `v0` (7) → `v2` (14) → `v1` (28)

The three remaining findings are identical across `v3`, `v4`, and `v5`: *hero eyebrow /
pill chip*, *line length too long*, *overused font*. Neither the screenshot loop nor the
community skills moved the audit needle from where references left it.

## 3. Ranking by eye

Mine, before writing the numbers above into it:

1. **`v4` / `v5`** — compact, coherent, honest fallbacks, one accent, brand colour out of the grid
2. **`v2`** — best typography of the six, but 8002px tall and its featured-card rule fires once in three
3. **`v3`** — sound system, wrecked by five single-title groups
4. **`v1`** — real improvement over baseline, undermined by the hatched fallbacks
5. **`v0`** — the specimen

The audit and the eye agree at the top and disagree sharply in the middle: the audit ranks
`v0` above `v2` and `v1`, my eye ranks both above `v0`. The audit is counting defects; the
eye is judging whether a decision was made at all. **`v0` scores well by never trying.**

## 4. What neither measure catches — and it is the most important thing here

**No ranking above penalises the loss of the chronological axis.**

`v0`, `v1`, and `v2` group by date. `v3` replaced that with platform grouping, copied from
JustWatch, and `v4` and `v5` inherited it. The product is *"this week's new releases"* —
the question a visitor arrives with is *what drops when*. On the three highest-ranked
pages, answering it means reading grey metadata on every card across seven sections.

- The **audit** does not catch it: no anti-pattern fires for a missing organising axis.
- The **screenshot loop** did not catch it across 16 defects and four passes — an absence
  leaves no pixels.
- The **community skills** did not catch it.
- My **eye** ranked those pages first anyway, because they are better *looking*.

The only thing that caught it was reading the data and asking what the page is for.

**So the honest overall verdict is that the best-scoring page is not the best product.**
A hypothetical `v6` — `v4`'s layout with `v0`'s date grouping — would beat everything here,
and nothing in this lab's toolkit would have proposed it.

## 5. Delta per lever, in one line each

| Lever | Tells fixed | What it uniquely bought | What it could not do |
|---|---|---|---|
| Constitution | 9/17 | raised the general standard well beyond its own ban list | only bans what its author already imagined |
| Token system | 14/17 | removed the *opportunity* to break the colour rule | governs values, not layout invariants |
| References | 13/17 | the one **structural** move — brand colour out of the grid | imported a structure whose data assumptions did not transfer |
| Screenshot loop | 15/17 | killed the orphan rows three drills had failed on | cannot see absences or cross-state relationships |
| Community skills | 15/17 | one real WCAG contrast bug the scanner missed | not discoverable without a restart; strongest opinions all overridden |
