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

All three packs installed successfully — 23 skill directories on disk. Then:

```
Skill(impeccable) → Unknown skill: impeccable
```

All seven returned `Unknown skill`, verified from the main session, not just a subagent.

**The mechanism:**

| Location | Hot-reloads mid-session |
|---|---|
| `~/.claude/skills/` | **yes** |
| `.claude/skills/`, `.agents/skills/` (project-local) | **no** |

Both installs happened minutes apart in the same session. The globally-cloned one was usable
immediately; the project-local ones never registered.

**So: install, then restart Claude Code.** Nothing warns you. A skill that never loads
produces output that looks exactly like a skill that loaded and had no opinion.

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
