// Can a source outside TMDB name the streaming platform for the titles TMDB
// could not? Read-only, and a measurement rather than a build: if the answer
// is no, ten minutes of a person's time is the cheaper fix and nobody should
// be maintaining a scraper for it.
//
// Reads `src/data/needs-platform.json` — the titles this week's run had to
// drop — and asks two open, documented APIs about each one:
//
//   Wikidata   via TMDB's own /external_ids, so the join is on an id rather
//              than on a title, which is how "Welcome to the Jungle" became
//              Jumanji in this repo's poster harvest.
//   Wikipedia  by search, which IS a title join and therefore reported
//              separately and never trusted on its own.
//
// Both permit automated access with a real User-Agent, which is set below.
// JustWatch is deliberately NOT queried: it is the source that would actually
// know, and its API is unofficial with no public terms permitting this, so
// that is a decision for a person rather than a default in a script.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const token = process.env.TMDB_TOKEN
if (!token) {
  console.error('TMDB_TOKEN is not set.')
  process.exit(2)
}
const UA = 'cheddy-buddys-ott-radar/1.0 (github.com/arunkumar3/ai-frontend-design-lab)'

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } })
  if (!res.ok) return null
  return res.json()
}

// The services this page can render. Matching is on these names appearing in
// prose, so it is a hint to be confirmed, never an authority.
const PLATFORM_PATTERNS = [
  [/jio\s*hotstar|jiohotstar|\bhotstar\b|jio\s*cinema/i, 'jiohotstar'],
  [/\bnetflix\b/i, 'netflix'],
  [/prime\s*video|amazon\s*prime/i, 'prime'],
  [/\bzee\s*5\b|\bzee5\b/i, 'zee5'],
  [/sony\s*liv/i, 'sonyliv'],
  [/sun\s*nxt/i, 'sunnxt'],
  [/\baha\b/i, 'aha'],
  [/etv\s*win/i, 'etvwin'],
  [/mx\s*player/i, 'mxplayer'],
  [/shemaroo/i, 'shemaroome'],
]
const sniff = (text) => {
  if (!text) return null
  for (const [re, key] of PLATFORM_PATTERNS) if (re.test(text)) return key
  return null
}

const worklist = JSON.parse(
  await readFile(fileURLToPath(new URL('../src/data/needs-platform.json', import.meta.url)), 'utf8'),
)

const rows = []
for (const t of worklist.titles) {
  const ext = await getJson(`https://api.themoviedb.org/3/movie/${t.tmdbId}/external_ids`, {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  })
  const qid = ext?.wikidata_id ?? null

  // --- Wikidata, joined on id ---
  let wikidata = qid ? 'no platform statement' : 'no wikidata id'
  if (qid) {
    const entity = await getJson(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`)
    const claims = entity?.entities?.[qid]?.claims ?? {}
    // P750 distributed by, P449 original broadcaster, P437 distribution format
    const ids = []
    for (const prop of ['P750', 'P449']) {
      for (const c of claims[prop] ?? []) {
        const id = c.mainsnak?.datavalue?.value?.id
        if (id) ids.push(id)
      }
    }
    if (ids.length) {
      const labels = []
      for (const id of ids) {
        const e = await getJson(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`)
        labels.push(e?.entities?.[id]?.labels?.en?.value ?? id)
      }
      wikidata = `${labels.join(', ')}  -> ${sniff(labels.join(' ')) ?? 'no match'}`
    }
  }

  // --- Wikipedia, joined on title (weaker, reported as such) ---
  let wikipedia = 'no article found'
  const year = (t.date ?? '').slice(0, 4)
  const search = await getJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${t.title} ${year} film`)}&srlimit=1&format=json`,
  )
  const hit = search?.query?.search?.[0]?.title
  if (hit) {
    const page = await getJson(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(hit)}&format=json`,
    )
    const pages = page?.query?.pages ?? {}
    const extract = Object.values(pages)[0]?.extract ?? ''
    const found = sniff(extract)
    wikipedia = `"${hit}" -> ${found ?? 'no platform named'}`
  }

  rows.push({ t, qid, wikidata, wikipedia })
}

console.log(`\n${'='.repeat(74)}\nSECOND-SOURCE CHECK — ${worklist.titles.length} titles TMDB could not place\n${'='.repeat(74)}`)
let wdHits = 0
let wpHits = 0
for (const { t, qid, wikidata, wikipedia } of rows) {
  console.log(`\n  ${t.date}  ${t.language.padEnd(10)} ${t.title}`)
  console.log(`      wikidata  (${qid ?? 'no qid'})  ${wikidata}`)
  console.log(`      wikipedia ${wikipedia}`)
  if (!/no match|no platform statement|no wikidata id/.test(wikidata)) wdHits += 1
  if (!/no article|no platform named/.test(wikipedia)) wpHits += 1
}
console.log(`\n  Wikidata named a platform for ${wdHits}/${rows.length}`)
console.log(`  Wikipedia named a platform for ${wpHits}/${rows.length}`)
