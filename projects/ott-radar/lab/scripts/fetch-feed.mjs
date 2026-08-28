// Pull a real feed from TMDB, run it through the same boundary the app uses,
// and write the result out with a report of what did not survive.
//
// HANDOFF §8 is resolved: the weekly run publishes a static file, committed
// by `.github/workflows/fetch-feed.yml` on a GitHub runner (open network) and
// read by `src/feed/sources/generated.js` (the sandbox's egress proxy still
// blocks `api.themoviedb.org`, so this script has still never run against the
// live API from inside this repo's own dev environment).
//
// Run with `--out` pointed at the tracked file, this MERGES with whatever is
// already there rather than overwriting it — each weekly run adds a week to
// the archive instead of replacing the last one. `normaliseFeed`'s dedupe-by-
// id makes re-running an overlapping window safe.
//
//   TMDB_TOKEN=... pnpm feed:fetch -- --from 2026-08-13 --to 2026-08-19
//
// The token is a TMDB v4 read access token (Settings -> API -> "API Read
// Access Token"), not the v3 key.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { fetchTmdbFeed } from '../src/feed/sources/tmdb.js'
import { normaliseFeed, derivedPlatforms } from '../src/feed/normalise.js'
import { fetchWindow } from '../src/feed/window.js'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

// Default window: the eight days ending today. It trails deliberately — see
// `src/feed/window.js` for the two runs that measured why a forward-looking
// window returns nothing.
const defaults = fetchWindow()

const from = arg('from', defaults.from)
const to = arg('to', defaults.to)
const out = arg('out', fileURLToPath(new URL('../src/data/feed.generated.json', import.meta.url)))
const token = process.env.TMDB_TOKEN

if (!token) {
  console.error(
    'TMDB_TOKEN is not set.\n' +
      '  Get a v4 read access token at https://www.themoviedb.org/settings/api\n' +
      '  then: TMDB_TOKEN=... pnpm feed:fetch',
  )
  process.exit(2)
}

console.log(`window ${from} .. ${to}`)

const { records, failures } = await fetchTmdbFeed({ from, to, token })

// Distinguish "the feed is empty" from "nothing got through". A run where every
// request failed and a run where the week genuinely has no releases both end
// with zero records, and treating them the same is how a broken pipeline ships
// as a quiet week.
//
// Zero records is a failure either way. The transport-failure half was always
// caught here; the half that got through with 200s and empty bodies was not,
// and on 2026-08-28 it sailed into a green run and a commit that read like a
// refresh. Across two regions, fourteen provider pairs and both kinds over an
// eight-day window, zero results is a broken query — a wrong window, a stale
// provider id, a revoked token — never a quiet week.
if (!records.length) {
  if (failures.length) {
    console.error(`\nEvery request failed (${failures.length}). Nothing was written.`)
    for (const f of failures.slice(0, 5)) console.error('  ', JSON.stringify(f))
    if (failures.some((f) => /ENOTFOUND|EAI_AGAIN|fetch failed|ECONNREFUSED|403/.test(String(f.error ?? f.status)))) {
      console.error(
        '\napi.themoviedb.org looks unreachable from here. It is blocked on the network this\n' +
          'repo was built on, which is why the fetch half of the TMDB source has no test\n' +
          'coverage — see playbook/findings/v7.md and src/feed/sources/tmdb.js.',
      )
    }
  } else {
    console.error(
      `\nEvery request succeeded and returned nothing for ${from}..${to}. Nothing was written.\n` +
        '\nThat is a broken query, not a quiet week. Check, in this order:\n' +
        '  - is the window in the future? `with_watch_providers` only matches titles a\n' +
        '    service already carries, so a forward window is always empty (src/feed/window.js)\n' +
        '  - are the provider ids in src/feed/sources/tmdb.js still current?\n' +
        '  - is TMDB_TOKEN a v4 read access token that still works?',
    )
  }
  process.exit(1)
}

// Fold in whatever a previous run already wrote, so the archive accumulates
// weeks instead of each run discarding the last one. A first run, or a
// missing/unreadable file, just means an empty history to fold onto.
let previous = []
try {
  const prior = JSON.parse(await readFile(out, 'utf8'))
  if (Array.isArray(prior.releases)) previous = prior.releases
} catch {
  // no prior file — first run
}

const { releases, platforms, rejected, duplicates } = normaliseFeed([...previous, ...records])
const derived = derivedPlatforms(platforms)

console.log(`\nfetched   ${records.length} raw records`)
console.log(`accepted  ${releases.length}`)
console.log(`rejected  ${rejected.length}`)
console.log(`duplicate ${duplicates.length}`)

if (failures.length) {
  console.log(`\n${failures.length} request(s) failed — this feed is incomplete:`)
  for (const f of failures.slice(0, 10)) console.log('  ', JSON.stringify(f))
}
if (rejected.length) {
  console.log('\nrejected:')
  for (const r of rejected.slice(0, 20)) {
    console.log(`   ${r.title ?? r.id ?? `#${r.index}`} — ${r.reasons.join('; ')}`)
  }
}
if (derived.length) {
  console.log('\nplatforms not in the curated table (labels were derived):')
  for (const p of derived) console.log(`   ${p.key} -> "${p.label}"  — add it to PLATFORMS`)
}

// Sport is not in TMDB at all. Saying so on every run is cheaper than
// rediscovering it when the cricket quietly stops appearing.
if (!releases.some((r) => r.type === 'sport')) {
  console.log(
    '\nnote: no sport in this feed. TMDB has no fixtures — the snapshot\'s two cricket and\n' +
      '      football rows come from elsewhere, and a real build needs a second source for\n' +
      '      them. normaliseFeed takes a concatenated array so sources can be mixed.',
  )
}

// Do not rewrite the file when the only thing that would change is the
// `fetchedFor` label. That two-line diff is what the workflow's `git diff
// --cached --quiet` guard sees as a change, so it produced a commit titled
// "feed: weekly TMDB fetch" carrying no new titles — a refresh that refreshed
// nothing, indistinguishable in the log from one that worked. Both sides of
// this comparison are `normaliseFeed` output, which sorts by (date, title),
// so it is a content comparison and not an ordering accident.
if (JSON.stringify(previous) === JSON.stringify(releases)) {
  console.log(
    `\nno new titles — the same ${releases.length} releases as the last run.\n` +
      `left ${out} untouched, so there is nothing to commit.`,
  )
  process.exit(0)
}

await writeFile(
  out,
  JSON.stringify({ fetchedFor: { from, to }, source: 'tmdb', releases }, null, 2) + '\n',
)
console.log(`\nwrote ${releases.length} releases (${previous.length} carried over) to ${out}`)
