# v6, rebuilt under Anthropic's `frontend-design` skill

Route `/v6`, branch `claude/frontend-design-v6-18py7n`. The page before this pass is at
commit `330ead5` (its captures included, under `lab/shots/v6/`).

## 0. First, the question that started it: no, the skill was not used for `v6`

`skills-lock.json` records what this lab has installed: the `emilkowalski/skill` set and
the `Leonxlnx/taste-skill` set, both pulled for the `v5` drill. `compound-engineering`
appears twice in `docs/superpowers/` — as the plugin supplying the `design-iterator` agent
used against `v4`, and in a design note. Anthropic's `frontend-design` skill
(`anthropics/claude-code`, `plugins/frontend-design`) is not in the lock file, not in
`.claude/skills/`, and not referenced anywhere in the playbook.

`v6` was built from `RANKING.md`'s verdict plus three rounds of human direction. That is
what `playbook/findings/v6.md` §"What this drill is not" says, and it is accurate.

## 1. The finding that matters: the derivation was right, the conclusion was the default

`v6`'s palette was its best idea — quantised from the real poster art rather than picked,
with the provenance in the CSS header so the next person could check it instead of
trusting it. That part survives untouched.

What it produced was `#F4EDE2` warm cream paper with a `#8C4711` rust accent.

The skill's calibration section names three looks AI-generated design converges on
"regardless of subject". The first is: *a warm cream background (near #F4F1EA) with a
high-contrast serif display and a terracotta accent.* Minus the serif, that is the page.

This is the sharper version of a trap the lab already knew about. `v6.md` §4 recorded that
restoring `v0`'s date grouping *literally* re-imported `v3`'s orphan-row bug — a sound
premise carried into a bad implementation. Here the premise is even stronger, because the
palette is measured rather than remembered, and it still lands on a default. **Evidence
behind a choice does not stop the choice being the reflex answer.** Nothing in this lab's
toolkit had a name for the result; the skill did, in one sentence, before any code was
written.

The derivation also contained an argument against itself. The recorded numbers are a
dominant 10–40° amber band (12,757px) and a minority 180–210° cyan band (5,476px). `v6`
gave the chrome the dominant band, reasoning that the accent would then harmonise and
leave the cyan to the artwork. But the majority hue is the *artwork's* hue: an amber page
is the one page a gold poster (`Bigg Boss: The Common Man`, 54% `#FEC60D`) and a rust one
(`Lanterns`, `#5A331B`) cannot stand on. Same evidence, inverted:

| | before | after |
|---|---|---|
| ground | the dominant hue at high lightness — warm cream | the dominant hue at near-zero chroma — a grey card, mid-toned in both themes because mean lightness is 39 |
| accent | mid-band amber, `#8C4711` / `#E0983F` | the **minority** band, `#09545B` / `#5FC3CE` — the hue the posters use least, so one interface colour can never be mistaken for poster colour |

## 2. What else changed, and why

| | before | after | why |
|---|---|---|---|
| hero | h1 + a mono data line + controls | a seven-day ruler: day name, day numeral at the largest size on the page, one countable mark per title landing that day, today's column in the accent | The skill: *the hero is a thesis; open with the most characteristic thing in the subject's world.* For a weekly release feed that is the shape of the week — which the grid cannot show. Eleven cards cannot tell you five of them land on the Saturday. |
| type scale | headline largest | **day numerals largest, headline second** | The one deliberate risk. On a page whose job is *when*, the date outranks the sentence. |
| faces | Archivo + IBM Plex Mono | Familjen Grotesk + Spline Sans Mono | Neither original face was flagged, so this was not a defect. `IBM Plex` is on impeccable's own "you stopped looking" list in `reference/new-work.md`, and Archivo is a workhorse; the pairing was competent rather than chosen. |
| archive | only the weeks that had titles | the whole run, quiet weeks included | See §4. |
| quiet week | no such surface | a designed one, reachable | See §4. |
| footer | three lines, the first about the palette | two | Chanel's rule, which the skill quotes. A page explaining its own colour choices in its own footer is the design talking about itself. The provenance belongs in the CSS header and in this file. |
| headline | "What's new in India" | "What lands in India" | Active, and it drops a time claim the page cannot always honour: on an archive week nothing is "new". |

## 3. Two instruments this pass found to be lying

### 3a. The live audit was scanning six other drills' stylesheets

`main.jsx` imported all seven routes eagerly, so every route's CSS was attached to every
page. Rules that scan rendered pixels were unaffected; rules that regex the concatenated
stylesheet text were reading `v1`–`v5` while pointed at `/v6`.

It surfaced as a `monotonous-spacing` finding on `/v6` — *~4px used 18/18 times* — which
survived two rounds of trying to fix the page. Reproducing the detector's own sampling
showed where the 18 values came from:

```
4 <- padding: 4px      (v6)      4 <- padding: 5px      (v4, v5)
4 <- margin-left: 2px  (v3,4,5)  4 <- gap: 2px          (v3, v4, v5, v6)
```

Three of the four declaration shapes belong to pages that were not on screen. The same
finding fires on `/v4`, from the same foreign declarations.

Splitting the routes with `React.lazy` dropped `/v4` from 4 findings back to **3 — exactly
the number `RANKING.md` recorded for it** — and `/v6` to 0 with an empty sample. That match
is the confirmation: the extra finding was never about either page.

**Every Phase-1 audit number produced by a CSS-text rule is suspect.** The pixel-level
findings that drove the ranking (`v1`'s 28, overwhelmingly contrast and padding measured on
the render) are not affected. `RANKING.md` §1's conclusion — audit the running page, not
the repository — stands; it just needs one more clause. *The running page has to be only
the page.*

Two smaller cautions from the same run. `impeccable` is invoked via `npx -y`, so it is
whatever version npm resolves that day: today's build has rules the recorded numbers were
never scored against. And a clean run prints nothing at all — `--json` returning `[]` is
what "0 findings" actually looks like, and is worth using rather than reading silence.

### 3b. A check that only *looked* portable

`verify:v6` compared each card's date against `Intl.DateTimeFormat('en-GB', …)` computed in
Node. Node's ICU renders `Wed 12 Aug`; the browser's renders `Wed, 12 Aug`. Two of the 27
checks failed on a page that was correct, at the commit `PHASE-2.md` certifies as green.

`v6.md` §6 already recorded a failing check that meant nothing — an assertion looking for
CSS `::after` separators in `textContent`. That one was simply wrong. This one is worse,
because it is *right* and still fails: the same expression, evaluated in two runtimes one
process apart, disagrees. The fix flattens both sides before comparing, since the
assertion is about which date a card shows and not about a comma.

## 4. The quiet week: making the empty state real instead of writing one

`PHASE-2.md` §5 listed "no empty state" as gap 2, and the constitution requires empty
states to be designed surfaces. Writing one would have satisfied both — and produced a
branch nothing renders, which is the failure mode `CLAUDE.md` already names from the other
direction ("a function with full coverage and zero callers").

So the archive changed instead. It now lists the whole run of publishing weeks from the
first with a title to the last, quiet weeks included, because that is what a weekly run is:
the US feed has three weeks where nothing landed, and listing only the other six presents a
feed with holes punched in it as if it were continuous.

That makes the empty surface something a reader reaches in normal use, and it changes a
behaviour for the better on the way. Previously, switching region while parked on a week
the other region did not publish silently moved you to a different week. Now the reader
keeps their place in time and the page says what happened:

> **Nothing landed in the United States in 6–12 Aug 2026.**
> The run publishes every Thursday, whether or not the week has titles. The seven days
> above are that week.
> [ Show 30 Jul – 5 Aug 2026 · 3 titles ]

The ruler carries this without special-casing: seven days, seven empty marks. A week with
nothing in it is drawn, not skipped.

## 5. Defects across three rounds

| # | Defect | Found by | Origin |
|---|---|---|---|
| 1 | Five stacked full-width rules read as hatching — a magnitude to estimate, not a count | screenshot | original |
| 2 | Fallback panels within one tonal step of the new canvas, reading as holes | screenshot | **re-import** — the exact defect `v6` had already fixed, reintroduced by changing the palette under it |
| 3 | `1px border + 18px shadow` on five fallback panels | live audit | original |
| 4 | The standing flag pushed to the far end of a 1170px bar, orphaned from the date it qualifies | screenshot | original |
| 5 | A quiet week's header reading "0 new titles · 0 platforms" | screenshot | original |
| 6 | 768px collapsed to two columns; an 11-title week grew to 7,722px | screenshot | **self-inflicted** — `auto-fill` counts repetitions against a *definite* max track size, so raising the card ceiling from 200px to 280px halved the tablet column count |
| 7 | Controls right-aligned inside a full-width box once they wrapped, leaving the toggle mid-page | screenshot | original |
| 8 | A poster URL that fails renders as the browser's broken-image box with alt text beside it | the blocked CDN, by accident | pre-existing, all versions |

One self-inflicted of eight, against `v4`'s 8 of 16 and `v6`'s 4 of 7. The plausible reason
is the skill's two-pass process: palette, type, layout and signature were settled in one
plan and critiqued against the brief *before* any CSS existed, so most rounds were spent
finding defects rather than patching earlier patches. n=8 in one session is not a
measurement, but the mechanism is at least legible.

Defect 2 is the more interesting entry. It is not a new mistake — it is a *fixed* mistake
that came back because the fix lived in numbers (`#E8DECE` against `#F4EDE2`) rather than
in a rule. `contrast:v6` now asserts the separation directly, alongside the contrast pairs,
so the next palette edit cannot quietly undo it again.

Defect 8 is the one no round of review would have found here. The sandbox blocks
`image.tmdb.org`, every poster 403s, and the page fell back to the browser's own broken
image rather than to the surface designed for exactly that. `poster: null` and *poster URL
did not resolve* are two different absences and only one of them was handled; a live feed
hits the second constantly. Both now land on the designed panel, labelled for which
happened.

## 6. What the screenshots in this repo can and cannot show

`image.tmdb.org` is unreachable from the build environment, so `pnpm shoot v6` captures
every card on the no-artwork path, and `pnpm palette:v6` cannot re-derive — the figures in
the CSS header are the recorded ones from 2026-08-16, cited as recorded rather than fresh.
See `lab/shots/v6/README.md`.

The poster grid was reviewed by intercepting the TMDB requests in the review harness and
serving flat two-tone stand-ins in colours the derivation actually measured in the real
slate. That is enough to judge column rhythm, card size, and whether artwork sits on the
ground or sinks into it. It is not enough to judge the palette against real photography,
and no claim here rests on it.

## 7. Scoring, honestly

Not a seventh lever, for the same reason `v6` was not: this was a supervised rebuild of an
existing page, not one variable isolated against a fixed brief. What can be stated:

| | before | after |
|---|---|---|
| live audit, `/v6` | 0 findings *(on a contaminated scan, older detector)* | 0 findings, desktop and 390px, on an isolated scan |
| `verify:v6` | 27 checks, **2 failing** on a correct page | 42 checks, 0 failing — now covering the ruler against per-day counts, the whole-run picker, the quiet week, and both region-switch behaviours |
| `contrast:v6` | 20 pairs, tightest 4.53:1 | 30 pairs, tightest 4.70:1, plus three surface-separation assertions per theme |
| 1440 light, device px | 3,628 | 4,382 |

The height went up and that is not a regression: cards went from 200px to 280px wide, which
at 1440 fills the row instead of leaving 300px of the grid empty, and three rows of taller
artwork account for most of the difference. `v6.md` §2 already argued this number is
arithmetic rather than craft, in the opposite direction. It is still true here.

What the skill did not do: it has nothing to say about whether the week is the right unit,
whether Thursday is the right anchor, or whether the archive should list quiet weeks. Those
came from the data and from what the page is for — still the only instrument in this lab
that has ever found an absence.

What it did do is name a default the lab could not see itself standing in, and insist the
naming happen before the code.
