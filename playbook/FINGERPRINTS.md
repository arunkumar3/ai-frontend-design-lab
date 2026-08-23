# Fingerprints

A record of what each build in this lab already is, so the next one has to be something
else. Imported from `scrollcraft`'s fingerprint gate — see `playbook/findings/scrollcraft.md`
§4 — with the dimensions re-derived, because copying its six columns literally would be the
exact mistake `CLAUDE.md`'s `(v7)` reference rule warns about. Its dimensions encode the
shape of a scroll-driven film. Ours have to encode the shape of a weekly release feed.

## The gate

**A new build must differ from every existing row on at least four of the six dimensions.
Four against each row individually, not four on average across the table.**

Dimension 6 is free — a signature move is unique by definition — so the gate really asks
for three more out of the remaining five, against every row. A build that changes only the
palette and the type pairing fails it.

**If a planned build fails the gate, change the plan, not the table.** Rewriting a row to
make a new build fit is the one thing that makes this file worthless. It records what
exists, not what you wish existed.

## Scope

**The gate applies from `v8` forward.** It cannot be applied retroactively and it is not a
criticism of `v0`–`v5`: those six were *designed* to be near-identical, one lever changed at
a time against a fixed brief, and that was the experiment. The gate exists for what comes
after the measurement, where repetition is no longer the method.

## The dimensions

| # | Dimension | What it records |
|---|---|---|
| 1 | Organising axis | The top-level grouping the page is built around |
| 2 | Unit | The repeating element a reader scans |
| 3 | Grid shape | How units are laid out, and what varies between groups |
| 4 | Opening | What occupies the first screen |
| 5 | Navigation | How a reader moves between weeks, regions, and detail |
| 6 | Signature move | The one thing this build does that no other build here does |

## The table

Rows for `v0`–`v5` are read from `playbook/findings/`; `v6` and `v7` from their components.
**They have had one pass, not two.** Before the gate is enforced on `v8`, walk the running
routes and correct anything here that does not match the render — this file is subject to
the same rule as every other document in the repo, and a fingerprint row nobody verified is
a stale legend that looks authoritative.

| | Axis | Unit | Grid | Opening | Navigation | Signature move |
|---|---|---|---|---|---|---|
| `v0` | Date | Card, monogram fallback | One uniform responsive grid | Filter pills | Region pills | *None — no decision was made* |
| `v1` | Date | Card, hatched fallback | One uniform grid | Serif masthead | Region pills | *None* |
| `v2` | Date | Card, plus a featured variant | Uniform with one featured cell | Display masthead | Region pills | The featured-card rule, which fired once in three |
| `v3` | Platform | Card | Per-platform groups, uniform | Hero eyebrow | Region pills | Brand colour out of the grid, one mark per group |
| `v4` | Platform | Card | Per-platform, reshaped so groups of one cannot strand | Hero eyebrow | Region pills | Designed empty, missing and partial states |
| `v5` | Platform | Card | Unchanged from `v4` | Unchanged from `v4` | Region pills | *None — layout unchanged from `v4`* |
| `v6` | Week, then day | Poster card | Week grid, day-grouped | `h1` naming the region | Week picker with arrows, plus a region toggle | The archive picker: any week on record, reachable |
| `v7` | Week | Poster tile and list card | Slate beside a calendar column | Full hero, Telugu headline | Calendar, week list, and a detail sheet | The detail sheet, and the ticker |

### What the table already shows

`v3`, `v4` and `v5` differ from each other on **one** dimension and **zero** dimensions
respectively. `v5` would fail this gate against `v4` outright, which is correct and expected:
`v5`'s lever was a skill pack that left the layout untouched, and the finding was that the
layout was untouched. The gate would have made that visible on day one rather than in the
verdict pass.

`v6` and `v7` clear each other comfortably — five of six — which is what a build driven by a
decision rather than by a single lever looks like.

## Appending a row

After shipping, add one row and fill all six columns. Then say plainly, in the build's
findings document, what the build **shares** with prior rows. The shared columns are what
the next build has to avoid, and they are the only part of this file that does any work.
