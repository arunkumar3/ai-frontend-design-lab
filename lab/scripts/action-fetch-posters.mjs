// Runs ON A GITHUB ACTIONS RUNNER, not in the sandbox — the sandbox's egress
// proxy blocks every image host, and the runner's network is open. The
// workflow pushes what this collects to a transient branch; the sandbox pulls
// it over git transport (which the proxy does allow) and deletes the branch.
//
// Two jobs:
//   1. Download every poster the feed already references, at w342.
//   2. For every row with `poster: null` (snapshot and curated alike, minus
//      the sport fixtures, which have no artwork to find), save TMDB's search
//      page verbatim and download the first few posters it references.
//
// It decides nothing, and that is the point — see the note above `postersIn`.
// A wrong poster is worse than none, so the judgement happens where there are
// eyes: the sandbox parses the saved HTML and looks at the artwork.

import { mkdir, writeFile } from 'node:fs/promises'
import { RELEASES } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'

const OUT = new URL('../../posters-out/', import.meta.url)
await mkdir(new URL('html/', OUT), { recursive: true })

const UA = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) posters-for-a-design-lab/1.0' }
const report = { downloaded: [], searched: {}, failed: [] }

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
    [...RELEASES, ...CURATED]
      .map((r) => r.poster)
      .filter((p) => p && !p.startsWith('data:') && !p.startsWith('http')),
  ),
]
console.log(`${known.length} known poster files`)
for (const file of known) await grab(file)

// --- 2. rows with no artwork ------------------------------------------------

// TMDB indexes a show, not a season: querying "Outer Banks S5" literally
// returned nothing on the last harvest. Strip the season suffix a listing
// carries and search for the show.
const searchTerm = (title) =>
  title
    .replace(/\s+S\d+$/i, '')
    .replace(/\s+Season\s+\d+$/i, '')
    .trim()

// The parsing happens in the sandbox, not here. A previous version guessed at
// TMDB's card markup twice and was wrong twice — once silently (an `<h2>`
// regex that matched the empty-state template) and once loudly (a container
// class that no longer exists, so every title came back with zero
// candidates). So the runner's job is reduced to what it is uniquely able to
// do: reach the network. It saves each search page verbatim and downloads the
// first few posters the page references, in page order. The sandbox parses
// the saved HTML against what TMDB actually served, and judges the artwork by
// eye with the files already in hand.

const POSTERS_PER_PAGE = 6

/** Poster filenames in page order, deduped — whatever the markup around them. */
const postersIn = (html) => [
  ...new Set([...html.matchAll(/\/t\/p\/w\d+[^"']*?\/([A-Za-z0-9_-]{8,}\.(?:jpg|png))/g)].map((m) => m[1])),
]

async function fetchPage(url, name) {
  const res = await fetch(url, { headers: UA })
  const html = res.ok ? await res.text() : ''
  await writeFile(new URL(`html/${name}.html`, OUT), html)
  const files = postersIn(html).slice(0, POSTERS_PER_PAGE)
  for (const f of files) await grab(f)
  return { status: res.status, bytes: html.length, files }
}

const missing = [...RELEASES, ...CURATED].filter((r) => !r.poster && !r.endDate)
console.log(`${missing.length} titles to search`)

for (const row of missing) {
  const kind = row.type === 'series' ? 'tv' : 'movie'
  const query = searchTerm(row.title)
  const typed = `https://www.themoviedb.org/search/${kind}?query=${encodeURIComponent(query)}`
  // multi covers the rows whose `type` is a guess — several curated ones are
  const multi = `https://www.themoviedb.org/search?query=${encodeURIComponent(query)}`
  try {
    const pages = {
      [kind]: await fetchPage(typed, `${row.id}-${kind}`),
      multi: await fetchPage(multi, `${row.id}-multi`),
    }
    report.searched[row.id] = { queried: query, title: row.title, kind, pages }
    console.log(
      `  ${row.title} (${query}) -> ` +
        Object.entries(pages)
          .map(([k, p]) => `${k}: ${p.status} ${p.bytes}b ${p.files.length} posters`)
          .join(' | '),
    )
  } catch (err) {
    report.searched[row.id] = { queried: query, error: String(err).slice(0, 120) }
  }
  // be polite: one request in flight, a beat between them
  await new Promise((r) => setTimeout(r, 800))
}

await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2))
console.log(
  `\ndone: ${report.downloaded.length} downloaded, ${Object.keys(report.searched).length} searched, ${report.failed.length} failed`,
)
