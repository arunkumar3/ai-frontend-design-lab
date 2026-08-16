# Why the output is generic

## The mechanism

With no direction, a model regresses to the statistical centre of its training data. For
frontend work that centre is well documented: Inter or the system stack, an indigo→purple
gradient, a centred hero with two buttons, a three-column feature grid with lucide icons,
`rounded-xl shadow-lg` on every surface, `max-w-7xl mx-auto`, and copy like "Empower your
workflow."

Nothing there is broken. It is the mean. Getting better output is the work of
systematically denying the model the mean.

## But measure your own baseline before believing that

This lab built a deliberately naive baseline (`v0`) from a bare prompt with no constraints,
no references, no design skills, and only default Tailwind utilities. It was **better than
the stereotype predicts**:

- Dark mode implemented unprompted — 25 `dark:` variants, verified rendering
- Date-grouped information architecture, which is the *correct* structure for the content
- Sport date ranges rendered correctly rather than as single dates
- Four of six commonly-banned defaults avoided with nothing telling it to

If you assume the stereotype, you will credit your first intervention with fixes it did not
make. **Build the naive version once and look at it.** It costs twenty minutes and it is the
only way to know what anything afterwards was worth.

## Where it actually fails

`v0`'s 17 recorded tells cluster in three places, and none of them are the famous ones.

### 1. Invented problems

Six of 22 releases have no poster art. `v0` rendered them as saturated colour blocks with
two-letter initials: `BB`, `1B`, `IT`, `ID`. *108 Base Hospital: Uri* became `1B`. Two
different shows both became `BB`, one row apart.

The abbreviation was **invented**. The data always had the full title. Two subsequent drills
were spent refining a fallback for a thing that never needed to exist, before `v2` simply
set the real title in display type.

**When a fallback is hard to design, check whether you invented the thing being fallen back
to.**

### 2. Decisions never made

`v0` had no colour identity. Not wrong colours — *no colour decision*. Neutral greys plus
eleven borrowed platform brand colours, so Netflix red and ZEE5 purple became the accent by
default.

This is the characteristic failure, and it is invisible to ban lists. No rule against purple
gradients catches "the palette is whatever the content happened to contain."

### 3. Structure applied without checking the data

Three of six date groups contained a single release, so a fixed-column grid left three rows
~80% empty. The grid was chosen once and applied uniformly to groups of wildly varying
length.

This one recurred at the *other* end of the lab: `v3` copied JustWatch's platform grouping
and produced five single-poster rows. **The same class of mistake — a layout chosen without
consulting the shape of the data — appeared in both the least and the most sophisticated
drill.**

## The uncomfortable finding

An automated anti-pattern audit ranked `v0` **above** two of the designed versions.

It scores zero on "overused font" because the system font stack is not a choice, so it
cannot be a bad one. `v2` and `v3` picked distinctive-feeling display serifs that are, per
the same audit, exactly what every AI-generated UI now picks.

**Absence of a tell is not presence of design.** Any tool that detects clichés will reward
abstention. That is why the levers in this playbook are measured against before/after
captures and a hand-written tell list, not against a score.
