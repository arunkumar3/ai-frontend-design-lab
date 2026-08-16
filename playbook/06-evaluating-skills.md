# Evaluating a skill someone recommends

This project started from an Instagram carousel recommending three design skills. The method
below is what it took to check it, and the carousel is the worked example throughout.

## The method

**1. Verify every handle and command resolves. Do this first, it costs seconds.**

```bash
curl -s -o /dev/null -w '%{http_code}' https://github.com/<owner>/<repo>
npm view <package> version description
<cli> --help
```

**2. Read the README and the `SKILL.md` frontmatter.** What does it claim to do, and what
does it require? The `taste` skill states plainly that it needs Playwright MCP — worth
knowing before, not during.

**3. Install it in isolation, as one variable, on a page you have already measured.**
Not alongside four other changes.

**4. Measure the delta against a baseline you captured earlier.** Before/after screenshots
and a hand-written defect list. Not a score, and not your impression after the fact.

**5. Confirm it actually loaded.** This is the step everyone skips. See below.

## The worked example

Four of the carousel's five commands were wrong as printed:

| Post says | Reality |
|---|---|
| `npx skills add emilkowal/skill` | 404 → **`emilkowalski/skill`** |
| `npx skills add Leonxlnx/taste` | 404 → **`Leonxlnx/taste-skill`** |
| `npx impeccable install` | not a command → **`impeccable skills install`** |
| `claude mcp add figma` / `playwright` | invalid syntax — needs `<name> <commandOrUrl>` |
| `/plugin marketplace add pbakaus/impeccable` | correct |

The post even hedged on one (*"check the exact handle on his site"*). The packages are all
real and the recommendations are reasonable. The instructions were simply not run before
being published. **That is the normal state of tutorial content.**

## The step everyone skips: confirm it loaded

All three packs installed successfully — 24 skill directories on disk (seven of those were
actually invoked and checked by name; the other 17 were not individually tested, but sit in
the same locations and share the same non-discovery). Then:

```
Skill(impeccable) → Unknown skill: impeccable
```

All seven tested returned `Unknown skill`, verified from the main session, not just a
subagent.

**An observation, not a confirmed mechanism.** One global `~/.claude/skills/` clone
(`git clone`) worked immediately; two project-local installs (`npx skills add`,
`impeccable skills install`, landing in `.claude/skills/` and `.agents/skills/`) did not.
But install method and location were never varied independently, so this does not isolate
a cause. Live alternative explanations that were not ruled out:

- **Install method** — `git clone` vs. package-manager install may behave differently
  regardless of where the files land.
- **Symlinks** — 23 of the 24 entries in `.claude/skills/` are symlinks into
  `../../.agents/skills/`; only `impeccable` is a real directory. A symlinked skill
  directory is a plausible, untested reason project-local discovery could fail even if the
  global clone would not.
- **Project-local discovery may simply not be supported** in this session's Claude Code
  version, independent of install method or symlinking.

**What is actually confirmed:** installation does not imply availability, and no warning is
raised. The cause of *why* project-local skills didn't load is unconfirmed. What is
confirmed is narrower and still useful — **test with a direct invocation before relying on
a pack.** "Install, then restart Claude Code" was never actually tested when it was first
written — and a direct check in a brand-new session (`Skill(impeccable)`, `Skill(animate)`,
both project-local) still returns `Unknown skill`. A fresh session is the strongest form of
"restart" available, so the prescription is not a reliable remedy; treat it as
false/unconfirmed rather than repeat it.

This is the same failure shape as an inert `@theme` block — a silent no-op indistinguishable
from success. Whenever a tool's effect is invisible, **make it prove it ran.** The direct
test is one call: invoke it and see whether it exists.

## Judge the claim, not the vibe

The carousel's claim: *"The skills get you 90% there."*

Measured on a page that had already been through a constitution, a token system, references,
and a screenshot loop:

- Page height: unchanged from `v4`
- Live audit findings: unchanged from `v4`
- Genuine contribution: **one real WCAG contrast failure** — a toggle pill at 4.03:1,
  present since `v3` — that the pack's own automated scanner reported clean, caught by
  following its `craft-floor.md` instruction to compute the values
- All three of the packs' strongest opinions (typeface, eyebrow copy, cinematic scroll
  motion) were **overridden**, because each was formed without knowledge of this product's
  constraints

Verdict: worth installing, nowhere near 90%. The screenshot loop contributed far more and
costs nothing.

## The general lessons

**A tool can be right and its scanner still wrong.** Impeccable's checklist caught a bug its
own detector missed. If you install a linter and only run the linter, you get the weaker
half.

**Ask how the tool is run, not just whether it is installed.** The same `impeccable detect`
reported 0 findings against source files and 28 against the live URL for the same page.
The mode was the entire difference between "flawless" and "worst page in the lab."

**An anti-pattern detector rewards abstention.** The naive baseline outscored two designed
versions because it never chose a font, so it could not choose a fashionable one. Absence of
a tell is not presence of design.

**Banning a default routes you to the next default.** "Not Inter" produced Fraunces and
Instrument Serif in independent drills — both flagged by the same audit as equally overused.
A ban list moves the cliché; it does not remove it.
