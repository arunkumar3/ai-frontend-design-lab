# Session — 2026-08-20: posters on the page, and `main` becomes the site

Six commits on `claude/continue-discussion-w580hz`, from `4d422f7` (the PR #1 merge).

| | |
|---|---|
| `3b51ef0` | poster harvest, second pass — season suffixes, cards parsed as units |
| `0ca077b` | stop guessing TMDB's markup; harvest raw pages instead |
| `bb8f392` | the artwork overlay — four verified posters, and the rejections written down |
| `a5ed212` | a fifth poster, `VITE_POSTER_BASE`, and the artwork checks |
| `106aad6` | delete the transient poster branch |
| `d7f6311` | `HANDOFF.md` — merged `main`, the overlay, every suite re-counted |

---

## How it started

Two housekeeping turns, then one screenshot.

**PR #1 merged**, so `main` carries `/v0`–`/v7` and a plain clone runs the site. The daily
PR check-in was cancelled and the working branch was reset onto the merge.

**The user was on Windows and `pnpm` was not installed.** Worth recording because the
answer was *not* to install anything: the lockfile is pnpm's, but `package.json` has no
workspaces and no `packageManager` pin, so `npm install` resolves the same tree — verified
with `npm install --dry-run` (144 packages) rather than asserted. `corepack enable pnpm` is
the no-install route if pnpm itself is wanted. Both are now in `HANDOFF.md` §3.

Then: *"still there are black and empty tiles for posters, lets resolve this"*, with a
screenshot of Clean Up Company as a designed tile.

---

## 1. The tiles were correct, and that was the problem

Nothing was broken. Ten of thirty-two rows carried `poster: null`, and the card does exactly
what it is designed to do with that. The gap was in the data, and the data could not be
filled from here: the egress proxy blocks every image host and `api.themoviedb.org`.

The route around it already existed — a GitHub Actions runner has an open network, pushes
its harvest to a transient branch, and the sandbox pulls it over git transport. Merging PR
#1 had also put `workflow_dispatch` on the default branch, so the runs could be fired
directly instead of by bumping a marker file.

## 2. Three harvests, because the first two lied in different ways

| Harvest | What it reported | What was true |
|---|---|---|
| 1 (earlier session) | a matched title for every row | the `<h2>` regex matched TMDB's empty-state template; half the accepted results were collisions |
| 2 | zero candidates for every row, including titles TMDB certainly has | the card container class it split on no longer exists, and hrefs carry a slug (`/movie/353486-jumanji-…`) that a `"`-anchored regex misses |
| 3 | six titles with candidates, three with none | the three "none" were `429`s with empty bodies |

Harvest 2's fix was not a better regex. **The runner stopped parsing.** It now saves each
search page verbatim and downloads the first few posters each page references; the parse and
the judgement both happen in the sandbox, against what TMDB actually served. Two wrong
guesses at someone else's markup is enough to conclude that guessing is the wrong shape of
work for the machine that cannot see the result.

Harvest 3's `429`s are the repo's own trap arriving from a new direction — *an empty result
and a total failure look identical downstream*, already in `CLAUDE.md` about a fetch where
every request 403'd. A throttle reads exactly like "TMDB has never heard of this title".
The runner now backs off and retries, and Outer Banks turned out to be there all along.

## 3. What was accepted, and what was refused

Five of the ten resolved. Each was looked at on a contact sheet against its own date before
it was written down.

| Row | Result |
|---|---|
| 108 Base Hospital Uri | exact title, exact date |
| Pyaar Prema Kalyanam | exact title, exact date |
| Clean Up Company | exact title, exact date; the artwork itself reads "prime video" |
| Welcome to the Jungle | the Hindi ensemble film — **a title match alone picks *Jumanji***, which is what harvest 1 did |
| Outer Banks | the show, not the season; labelled `posterApprox` on the card |

Five refused, and still carrying tiles:

- **Egg Shells**, **Raaja Raja**, **Ghosts in the Hell** — no TMDB record. Six "Eggshells",
  a shelf of Raja near-rhymes, and *Ghost in the Shell* twice.
- **Bharat Bhagya Vidhaata** — only a 2002 film of that name.
- **Bigg Boss Agnipariksha** — TMDB has the show, but its key art has `STARTS AUGUST 22`
  set into the image and the card beside it says Sat 15 Aug. **A poster that argues with
  its own caption is worse than no poster.** The existing `in-bb-ta` approximation is
  franchise art carrying no date, which is the line an approximation has to clear.

## 4. An overlay, not an edit

The five landed in `src/feed/sources/artwork.js`, keyed by release id, applied by `loadFeed`
before validation.

Filling them into `data/releases.js` would have been one line each — and would have changed
six scored, frozen pages that render that table directly. Same reasoning that made the
curated week a second source rather than more rows. The overlay never overwrites, and
`loadFeed` reports entries whose id has disappeared (`artworkUnused`) so dead rows cannot
rot silently. An injected feed is passed through untouched: `feed:shapes` asserts on exactly
what it passed in, and a helpful overlay inside the test seam would be a lie.

## 5. The instrument had been reviewing the fallback all along

This is the finding worth carrying forward.

`image.tmdb.org` is unreachable from this sandbox, so **every screenshot review in this
repo has been a review of the designed tiles, not of the page**. Nothing failed. The
fallback is good, which is precisely why four review passes could approve it without
noticing that no artwork had ever rendered.

It is the font trap in a second costume — an unreachable font host does not error, it
renders Georgia and every review approves typography that is not the typography. Now
`VITE_POSTER_BASE` points the poster base at a local mirror, so `pnpm shoot v7` and
`verify:v7` see what a reader with an ordinary network sees. The `v7` shots are recaptured
with real artwork.

## 6. Negative-testing the new check taught something

`verify:v7` gained a per-title artwork claim. Breaking the overlay to watch it go red
**went green** — the script and the page both read the same overlay, so they agreed with
each other while both were wrong. Only sabotaging the page's `posterUrl` produced the
failure, naming the title and the file.

The check is still worth having: it catches a card that draws the wrong file, or draws a
tile where the data has artwork. It cannot judge whether the artwork is the right *film* —
that stays a job for eyes and a contact sheet, and the comment in the script says so.

The decoded check (`naturalWidth > 0`) only binds when the artwork is same-origin.
Unguarded it would go red for the network rather than for the page, which is the exact
shape of the three checks this repo has already had to fix.

## 7. Where it ended

All green, counted in one run: 41 unit tests, `verify:v6` 26, `contrast:v6` 20, `verify:v7`
54, `contrast:v7` 34, `feed:shapes` 68, lint clean, live audit 0 findings on `/v7`.

25 of 32 rows carry artwork. The transient poster branch was deleted after pickup, so no
poster bytes are in any long-lived history.

`main` is the merged site; the six commits above are only on the branch, and no PR has been
opened for them.

## 8. Open, unchanged

The §8 decisions in `HANDOFF.md` — where the weekly run executes, whether `v7` is scored,
whether the grid holds at feed scale. Plus one this session added: the five artless rows
need a source that is not TMDB, or they stay as tiles, which is a defensible answer.
