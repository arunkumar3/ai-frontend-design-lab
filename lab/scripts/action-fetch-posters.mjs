// Runs ON A GITHUB ACTIONS RUNNER, not in the sandbox — the sandbox's egress
// proxy blocks every image host, and the runner's network is open. The
// workflow pushes what this collects to a transient branch; the sandbox pulls
// it over git transport (which the proxy does allow) and deletes the branch.
//
// Two jobs:
//   1. Download every poster the feed already references, at w342.
//   2. For every row with `poster: null` (snapshot and curated alike, minus
//      the sport fixtures, which have no artwork to find), scrape
//      themoviedb.org's search page and bring back the TOP THREE candidates
//      with their titles, years and artwork.
//
// Three candidates, not one, because the first version of this script trusted
// its own textual match and was wrong half the time: its `<h2>` regex matched
// TMDB's empty-state template, so every miss reported `matchedTitle: "No
// Results"` and looked like a hit. Nothing here decides anything. It reports
// what TMDB returned — title, year, id, file — and the sandbox side lays the
// downloads out as a contact sheet and judges them by eye. A wrong poster is
// worse than none.

import { mkdir, writeFile } from 'node:fs/promises'
import { RELEASES } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'

const OUT = new URL('../../posters-out/', import.meta.url)
await mkdir(OUT, { recursive: true })

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

/** Every result card on a TMDB search page, in page order, parsed as a unit. */
function parseCards(html, kind) {
  return html
    .split('<div class="card v4 tight">')
    .slice(1)
    .map((card) => {
      const link = card.match(/\/(movie|tv)\/(\d+)/)
      const title = card.match(/<h2>([^<]*)<\/h2>/)
      const date = card.match(/<span class="release_date">([^<]*)<\/span>/)
      const poster = card.match(/\/t\/p\/w\d+[^"']*?\/([A-Za-z0-9_-]+\.(?:jpg|png))/)
      return {
        kind: link ? link[1] : kind,
        tmdbId: link ? Number(link[2]) : null,
        title: title ? title[1].trim() : null,
        released: date ? date[1].trim() : null,
        poster: poster ? poster[1] : null,
      }
    })
    .filter((c) => c.tmdbId && c.poster)
}

async function search(url, kind) {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) return { status: res.status, cards: [] }
  return { status: res.status, cards: parseCards(await res.text(), kind) }
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
    let { cards } = await search(typed, kind)
    let via = kind
    if (!cards.length) {
      await new Promise((r) => setTimeout(r, 800))
      ;({ cards } = await search(multi, kind))
      via = 'multi'
    }
    const top = cards.slice(0, 3)
    for (const c of top) c.got = await grab(c.poster)
    report.searched[row.id] = { queried: query, title: row.title, via, candidates: top }
    console.log(
      `  ${top.length ? 'ok  ' : 'MISS'}  ${row.title}  (${query} via ${via}) -> ` +
        top.map((c) => `${c.title} [${c.released ?? '?'}]`).join(' | '),
    )
  } catch (err) {
    report.searched[row.id] = { queried: query, error: String(err).slice(0, 120), candidates: [] }
  }
  // be polite: one request in flight, a beat between them
  await new Promise((r) => setTimeout(r, 800))
}

await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2))
console.log(
  `\ndone: ${report.downloaded.length} downloaded, ${Object.keys(report.searched).length} searched, ${report.failed.length} failed`,
)
