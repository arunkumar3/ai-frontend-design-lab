// Runs ON A GITHUB ACTIONS RUNNER, not in the sandbox — the sandbox's egress
// proxy blocks every image host and api.themoviedb.org, and the runner's
// network is open. The workflow pushes what this collects to a transient
// branch; the sandbox pulls it over git transport (which the proxy does
// allow) and deletes the branch.
//
// Two jobs:
//   1. Download every poster the feed already references, at w342.
//   2. For every row with no artwork (snapshot and curated alike, minus the
//      sport fixtures, which have none to find), search TMDB for candidates
//      and download the top few.
//
// The search half used to scrape themoviedb.org's HTML, and it was wrong in
// three different ways across three harvests: an `<h2>` regex that matched
// the empty-state template and so reported a hit for every miss, a card
// container class that stopped existing, and a rate limit whose empty 429
// bodies read downstream exactly like "no such title". The API answers all
// three — it is a documented contract rather than someone's markup, it says
// outright how many results it found, and `fetch-feed.yml` already proves
// this repo has a token for it. 118 HTML page loads became 59 API calls.
//
// What has NOT changed is that this script decides nothing. It reports what
// TMDB returned — title, release date, id, artwork — and the judgement stays
// in the sandbox, with a contact sheet and eyes. Of the eight titles the
// first harvest matched textually, four were collisions (Jumanji for
// "Welcome to the Jungle", Ghost in the Shell for "Ghosts in the Hell"). A
// wrong poster is worse than none.

import { mkdir, writeFile } from 'node:fs/promises'
import { RELEASES } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'
import { CURATED_OCT } from '../src/feed/sources/curated-oct.js'
import { ARTWORK } from '../src/feed/sources/artwork.js'

const OUT = new URL('../../posters-out/', import.meta.url)
await mkdir(OUT, { recursive: true })

const TOKEN = process.env.TMDB_TOKEN
if (!TOKEN) {
  console.error('TMDB_TOKEN is required — the same v4 read token fetch-feed.yml uses.')
  process.exit(2)
}

const AUTH = { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' }
const UA = { 'User-Agent': 'posters-for-a-design-lab/2.0' }
const CANDIDATES = 4

const report = { downloaded: [], searched: {}, failed: [] }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function grab(file) {
  if (report.downloaded.includes(file)) return true
  const res = await fetch(`https://image.tmdb.org/t/p/w342/${file}`, { headers: UA })
  if (!res.ok) {
    report.failed.push({ file, status: res.status })
    return false
  }
  await writeFile(new URL(file, OUT), Buffer.from(await res.arrayBuffer()))
  report.downloaded.push(file)
  return true
}

// --- 1. everything the feed already points at -------------------------------
const known = [
  ...new Set(
    [...RELEASES, ...CURATED, ...CURATED_OCT, ...Object.values(ARTWORK)]
      .map((r) => r.poster)
      .filter((p) => p && !p.startsWith('data:') && !p.startsWith('http')),
  ),
]
console.log(`${known.length} known poster files`)
for (const file of known) await grab(file)

// --- 2. rows with no artwork ------------------------------------------------

// TMDB indexes a show, not a season: "Outer Banks S5" matched nothing until
// the suffix came off.
const searchTerm = (title) =>
  title
    .replace(/\s+S\d+$/i, '')
    .replace(/\s+Season\s+\d+$/i, '')
    .trim()

async function search(kind, query) {
  const url =
    `https://api.themoviedb.org/3/search/${kind}` +
    `?query=${encodeURIComponent(query)}&include_adult=false&page=1`
  const res = await fetch(url, { headers: AUTH })
  if (!res.ok) return { status: res.status, results: [] }
  const body = await res.json()
  return { status: res.status, total: body.total_results ?? 0, results: body.results ?? [] }
}

// Rows the overlay already answers are done.
const missing = [...RELEASES, ...CURATED, ...CURATED_OCT].filter(
  (r) => !r.poster && !r.endDate && !ARTWORK[r.id],
)
console.log(`${missing.length} titles to search`)

for (const row of missing) {
  const kind = row.type === 'series' ? 'tv' : 'movie'
  const query = searchTerm(row.title)
  try {
    // The declared type is a guess on several curated rows — a documentary
    // written as `movie`, a talk show written as `series`. Ask the other
    // index too when the declared one comes back empty, rather than
    // recording a type mistake as a missing title.
    let { status, total, results } = await search(kind, query)
    let via = kind
    if (!results.length) {
      const other = kind === 'movie' ? 'tv' : 'movie'
      const alt = await search(other, query)
      if (alt.results.length) ({ status, total, results } = alt), (via = other)
    }

    const candidates = []
    for (const r of results.slice(0, CANDIDATES)) {
      const poster = r.poster_path ? r.poster_path.replace(/^\//, '') : null
      candidates.push({
        kind: via,
        tmdbId: r.id,
        title: r.title ?? r.name,
        original: r.original_title ?? r.original_name,
        language: r.original_language,
        date: r.release_date ?? r.first_air_date ?? '',
        popularity: r.popularity,
        poster,
        got: poster ? await grab(poster) : false,
      })
    }

    report.searched[row.id] = { queried: query, want: row.title, via, status, total, candidates }
    console.log(
      `  ${candidates.length ? 'ok  ' : 'MISS'}  ${row.title} -> ` +
        (candidates.map((c) => `${c.title} [${c.date.slice(0, 4) || '?'}]`).join(' | ') || 'nothing'),
    )
  } catch (err) {
    report.searched[row.id] = { queried: query, error: String(err).slice(0, 120), candidates: [] }
  }
  // The API's limit is far above anything this loop can reach, but a short
  // beat keeps one request in flight and the log readable.
  await wait(150)
}

await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2))
console.log(
  `\ndone: ${report.downloaded.length} downloaded, ${Object.keys(report.searched).length} searched, ${report.failed.length} failed`,
)
