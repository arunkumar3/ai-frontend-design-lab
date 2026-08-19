// Pull a real feed from TMDB, run it through the same boundary the app uses,
// and write the result out with a report of what did not survive.
//
// This does NOT make the fetched file the app's source. Whether the weekly run
// publishes a static file per week or the page fetches at runtime is an open
// question in PHASE-2 §6, and answering it by side effect here would be the
// wrong way to decide it. The script's job is to prove the pipeline end to end
// and to show what a real payload does to the boundary.
//
//   TMDB_TOKEN=... pnpm feed:fetch -- --from 2026-08-13 --to 2026-08-19
//
// The token is a TMDB v4 read access token (Settings -> API -> "API Read
// Access Token"), not the v3 key.

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { fetchTmdbFeed } from '../src/feed/sources/tmdb.js'
import { normaliseFeed, derivedPlatforms } from '../src/feed/normalise.js'

const RUN_DAY = 4 // Thursday
const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

// Default window: the current publishing week, Thursday to Wednesday.
const today = new Date()
const start = new Date(today)
start.setDate(start.getDate() - ((start.getDay() - RUN_DAY + 7) % 7))
const end = new Date(start)
end.setDate(end.getDate() + 6)

const from = arg('from', isoOf(start))
const to = arg('to', isoOf(end))
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
if (!records.length && failures.length) {
  console.error(`\nEvery request failed (${failures.length}). Nothing was written.`)
  for (const f of failures.slice(0, 5)) console.error('  ', JSON.stringify(f))
  if (failures.some((f) => /ENOTFOUND|EAI_AGAIN|fetch failed|ECONNREFUSED|403/.test(String(f.error ?? f.status)))) {
    console.error(
      '\napi.themoviedb.org looks unreachable from here. It is blocked on the network this\n' +
        'repo was built on, which is why the fetch half of the TMDB source has no test\n' +
        'coverage — see playbook/findings/v7.md and src/feed/sources/tmdb.js.',
    )
  }
  process.exit(1)
}

const { releases, platforms, rejected, duplicates } = normaliseFeed(records)
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

await writeFile(
  out,
  JSON.stringify({ fetchedFor: { from, to }, source: 'tmdb', releases }, null, 2) + '\n',
)
console.log(`\nwrote ${releases.length} releases to ${out}`)
console.log('This file is not yet wired as the app source — see PHASE-2 §6.')
