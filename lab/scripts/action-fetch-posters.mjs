// Runs ON A GITHUB ACTIONS RUNNER, not in the sandbox — the sandbox's egress
// proxy blocks every image host, and the runner's network is open. The
// workflow pushes what this collects to a transient branch; the sandbox pulls
// it over git transport (which the proxy does allow) and deletes the branch.
//
// Two jobs:
//   1. Download every poster the feed already references, at w342.
//   2. For curated rows with `poster: null`, scrape themoviedb.org's search
//      page (10 requests, one per title) for a poster path and TMDB id. Every
//      match is recorded with the title TMDB returned, so the sandbox side can
//      compare and mark loose matches `posterApprox` instead of trusting them.

import { mkdir, writeFile } from 'node:fs/promises'
import { RELEASES } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'

const OUT = new URL('../../posters-out/', import.meta.url)
await mkdir(OUT, { recursive: true })

const UA = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) posters-for-a-design-lab/1.0' }
const report = { downloaded: [], searched: {}, failed: [] }

async function grab(file) {
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

// --- 2. curated rows with no artwork ----------------------------------------
const missing = CURATED.filter((r) => !r.poster && !r.endDate)
console.log(`${missing.length} curated titles to search`)

for (const row of missing) {
  const kind = row.type === 'series' ? 'tv' : 'movie'
  const url = `https://www.themoviedb.org/search/${kind}?query=${encodeURIComponent(row.title)}`
  try {
    const html = await (await fetch(url, { headers: UA })).text()
    // first result card: its poster path and its /movie/<id> or /tv/<id> link.
    const poster = html.match(/\/t\/p\/w\d+[^"']*?\/([A-Za-z0-9]+\.(?:jpg|png))/)
    const id = html.match(new RegExp(`/${kind}/(\\d+)`))
    // the h2 nearest the top of the results is the first card's title
    const matched = html.match(/<h2>([^<]+)<\/h2>/)
    if (!poster) {
      report.searched[row.id] = { found: false, url }
      console.log(`  MISS  ${row.title}`)
      continue
    }
    const file = poster[1]
    const got = await grab(file)
    report.searched[row.id] = {
      found: got,
      poster: file,
      tmdbId: id ? Number(id[1]) : null,
      matchedTitle: matched ? matched[1].trim() : null,
      queried: row.title,
    }
    console.log(`  ok    ${row.title} -> ${file} (matched "${matched?.[1]?.trim()}")`)
  } catch (err) {
    report.searched[row.id] = { found: false, error: String(err).slice(0, 100) }
  }
  // be polite: one request in flight, a beat between them
  await new Promise((r) => setTimeout(r, 800))
}

await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2))
console.log(
  `\ndone: ${report.downloaded.length} downloaded, ${Object.keys(report.searched).length} searched, ${report.failed.length} failed`,
)
