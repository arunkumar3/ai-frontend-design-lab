# Troubleshooting — symptom → missing lever

Every row traces to something observed in `v0`–`v5`. Nothing here is general design advice.

## The output looks generic

| Symptom | Missing lever | Evidence |
|---|---|---|
| Eleven brand/product colours are effectively the palette; no colour decision was ever made | **Token system.** A stated rule gets a partial fix; committed values get a complete one | `v1` stated "one accent" → chrome obeyed, content did not. `v2` wrote the palette first → complete |
| A component keeps getting smaller but never right | **References.** Iteration shrinks; a reference replaces | Platform badge: 22 dots → 8px dots → deleted, only once JustWatch showed a group-header stamp |
| Typography is technically distinctive but still reads as AI | Nothing — **the escape from a default is a default** | "Not Inter" produced Fraunces (`v2`) and Instrument Serif (`v3`), both flagged as overused |
| Fallback / empty states look like errors | Ask whether you **invented** the thing being fallen back to | Two drills polished initials for *108 Base Hospital: Uri*. The data always had the title |

## The page is broken and I didn't notice

| Symptom | Missing lever | Evidence |
|---|---|---|
| A CSS token silently does nothing, no error | **Check computed style in a browser.** `@theme` outside the module graph rooted at the file importing Tailwind is inert | `v1` shipped with `--font-display` resolving to `""`; `vite build` said `Unknown at rule: @theme` and continued |
| Copy states a fact the data contradicts | **Cross-reference displayed text against the data.** Verification checklists inherit their author's blind spots | `v3` hardcoded "Aug 15–21" over data spanning Aug 12–21 (IN) and Jul 2–Aug 28 (US) |
| Audit is clean but the page is bad | **Run the audit against the live URL, not source** | Source scan: `v1` = 0 findings. Live browser: `v1` = 28 |
| A tested function is never called | Tests prove correctness, not **wiring** | `titlesInBothRegions()` had 2 passing tests and zero callers; the region toggle showed duplicate posters unexplained |
| Contrast fails but the scanner says clean | **Compute the values.** A clean automated run is not proof of compliance | Active toggle pill at 4.03:1, reported clean by `impeccable detect` in both modes |
| Below-the-fold images capture blank | Remove `loading="lazy"` | The harness waits for network idle at a pre-expansion viewport; lazy images are never requested |

## I looked at the screenshots and it's still wrong

| Symptom | Missing lever | Evidence |
|---|---|---|
| Fixed a defect, shipped, something else broke | **Run three rounds, not one.** One round is worse than none | ~10 of 16 defects were introduced by the loop's own earlier fixes |
| The page is beautiful and answers the wrong question | **Question the structure.** The loop optimises what is on screen and cannot see what should be there instead | 16 defects, zero mentioned chronology. Round 1 saw "'this week' contradicted by the date range" and rewrote the *headline* |
| A defect only exists between two states | The loop is **single-state** | Cross-region duplicates are invisible in any one capture |
| Text describes behaviour that no longer exists | **After changing a convention, grep for what documents it** | Footer explained a `~` marker four passes had already removed |

## Process

| Symptom | Missing lever | Evidence |
|---|---|---|
| An installed skill does nothing, no error | **Restart.** Project-local skills don't hot-reload; `~/.claude/skills/` does | All 7 packs returned `Unknown skill`; the globally-cloned one worked immediately |
| Two browser agents fight over tabs mid-capture | Don't parallelise agents sharing one Playwright MCP browser | Doubled wall-clock; one DOM extraction never landed |
| A dependency's install command fails | Verify the command, don't trust the tutorial | 4 of 5 commands in the source post were wrong: `emilkowal/skill`→`emilkowalski/skill`, `Leonxlnx/taste`→`Leonxlnx/taste-skill`, `npx impeccable install`→`impeccable skills install`, `claude mcp add figma` (invalid syntax) |
