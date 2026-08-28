// Ask TMDB what it actually calls each streaming service in a region, and
// cross-check that against the ids `src/feed/sources/tmdb.js` was built with.
//
// Why this exists: those ids were written from documentation, never against
// the live service, because `api.themoviedb.org` is blocked on the network
// this repo was built on — tmdb.js says so in a comment next to `aha: 532`.
// The consequence showed up in the feed. India was configured for eight
// providers and only ever returned rows from two, so a page for an Indian
// audience carried no Telugu or Hindi titles at all, and nothing anywhere
// reported a problem: a provider id that does not exist returns `200` with an
// empty `results`, which is indistinguishable from a quiet week.
//
// Runs on a GitHub runner where the network is open. Read-only — it prints a
// report and changes nothing.

import { PROVIDERS, discoverUrl } from '../src/feed/sources/tmdb.js'

const API = 'https://api.themoviedb.org/3'
const token = process.env.TMDB_TOKEN
if (!token) {
  console.error('TMDB_TOKEN is not set.')
  process.exit(2)
}

const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
const get = async (url) => {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// A wide window, so "nothing this week" cannot be mistaken for "this id is wrong".
const to = new Date()
const from = new Date(to)
from.setDate(from.getDate() - 120)
const iso = (d) => d.toISOString().slice(0, 10)
const WINDOW = { from: iso(from), to: iso(to) }

// The services worth naming in the report. Deliberately broad on spelling —
// TMDB renames these ("Hotstar" -> "JioHotstar" -> "JioCinema"), which is one
// of the ways a hardcoded id quietly stops matching anything.
// Indian-language services only. The first version of this list included
// "amazon", which matched several hundred Amazon add-on channels and buried
// the report all over again — the filter defeating its own purpose.
const INTEREST =
  /hotstar|jio|zee|sony ?liv|sun ?nxt|\baha\b|etv|voot|mx ?player|eros|altbalaji|hoichoi|manorama|chaupal|stage|klikk|addatimes|shemaroo|planet marathi|tentkotta|simply ?south/i

const summary = []

for (const region of Object.keys(PROVIDERS)) {
  console.log(`\n${'='.repeat(72)}\n${region} — configured ids checked against TMDB's own list\n${'='.repeat(72)}`)

  // TMDB's authoritative provider list for the region.
  const live = new Map()
  for (const kind of ['movie', 'tv']) {
    const body = await get(`${API}/watch/providers/${kind}?watch_region=${region}`)
    for (const p of body.results ?? []) live.set(p.provider_id, p.provider_name)
  }
  console.log(`TMDB lists ${live.size} providers in ${region}.\n`)

  for (const [key, id] of Object.entries(PROVIDERS[region])) {
    const name = live.get(id)
    let hits = 0
    for (const kind of ['movie', 'series']) {
      const body = await get(discoverUrl({ region, kind, providerId: id, ...WINDOW }))
      hits += (body.results ?? []).length
    }
    const verdict = !name
      ? 'NOT A PROVIDER IN THIS REGION'
      : hits === 0
        ? `"${name}" — id is real, but 0 results in 120 days`
        : `"${name}" — ${hits} results`
    summary.push(`  ${region}  ${key.padEnd(12)} id ${String(id).padEnd(5)} ${verdict}`)
  }

  // What a human would recognise: the region's providers by name, so a wrong
  // id can be replaced with the right one rather than guessed at again.
  //
  // Printed filtered, not whole. A region carries hundreds of providers, most
  // of them Amazon add-on channels, and dumping all of them buries the four
  // lines anybody actually needs. INTEREST is the shortlist that matters for
  // this page: the services carrying Indian-language originals.
  const configured = new Set(Object.values(PROVIDERS[region]))
  const missing = [...live.entries()]
    .filter(([id]) => !configured.has(id))
    .sort((a, b) => a[1].localeCompare(b[1]))
  const hits = missing.filter(([, name]) => INTEREST.test(name))
  summary.push(`\n  ${region} — not configured: ${missing.length} in region, ${hits.length} matching this page's services:`)
  for (const [id, name] of hits) summary.push(`    ${String(id).padStart(5)}  ${name}`)
}

// Last, deliberately. This report is read through a log tail, and the first
// two runs put the answer above a few hundred lines of provider names.
console.log(`\n${'='.repeat(72)}\nVERDICT — every configured id, ${WINDOW.from}..${WINDOW.to}\n${'='.repeat(72)}`)
for (const line of summary) console.log(line)
