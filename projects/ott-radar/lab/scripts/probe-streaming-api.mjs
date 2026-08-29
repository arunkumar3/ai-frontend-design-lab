// Does Movie of the Night's Streaming Availability API cover the Indian
// services this page is about, and can its /changes feed name the platform
// for the titles TMDB cannot place?
//
// This runs BEFORE anything is built on it, and it is the only thing that
// should run until its two questions are answered:
//
//   1. Does India's service list include aha, ETV Win, Sun NXT, ZEE5, SonyLIV
//      and JioHotstar? The majors are certain; the regional ones are the whole
//      reason for adding a second source, and nobody has confirmed them.
//   2. Does `/changes` with changeType=new actually return this week's Indian
//      titles, with a service and a timestamp?
//
// If either answer is no, the hand-filled override file already in the repo is
// the honest fix and this dependency should not be taken on.
//
// Base URL and auth verified against the vendor's own docs on 2026-08-28:
// https://api.movieofthenight.com/v4 with the key in an X-API-Key header.
// Free plan is 100 requests/day; this probe spends about five.
//
// Field names are NOT assumed. The docs host is blocked from the sandbox this
// was written in, so the probe prints the shape of the first result it gets
// and matches defensively — the alternative is guessing at a schema, which is
// how `primary_release_date` got read as a result field earlier today.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const key = process.env.STREAMING_API_KEY
if (!key) {
  console.error(
    'STREAMING_API_KEY is not set.\n' +
      '  Get a free key at https://docs.movieofthenight.com/guide/authentication\n' +
      '  (no card; 100 requests/day), then add it as a repository secret named\n' +
      '  STREAMING_API_KEY under Settings -> Secrets and variables -> Actions.',
  )
  process.exit(2)
}

const API = 'https://api.movieofthenight.com/v4'
const get = async (path) => {
  const res = await fetch(`${API}${path}`, { headers: { 'X-API-Key': key } })
  if (!res.ok) {
    console.error(`  HTTP ${res.status} on ${path}`)
    console.error(`  ${(await res.text()).slice(0, 300)}`)
    return null
  }
  return res.json()
}

// The services this page renders, by the name they are likely to carry.
const WANTED = [
  ['jiohotstar', /jio\s*hotstar|hotstar|jio\s*cinema/i],
  ['zee5', /zee\s*5/i],
  ['sonyliv', /sony\s*liv/i],
  ['sunnxt', /sun\s*nxt/i],
  ['aha', /^aha$|\baha\b/i],
  ['etvwin', /etv\s*win/i],
  ['mxplayer', /mx\s*player/i],
  ['shemaroome', /shemaroo/i],
  ['netflix', /netflix/i],
  ['prime', /prime\s*video|amazon/i],
]

const out = []

// --- 1. India's service list -------------------------------------------
const countries = await get('/countries')
const india = countries?.IN ?? countries?.in ?? null
if (!india) {
  out.push('  /countries did not return an IN entry. Keys seen: ' + Object.keys(countries ?? {}).slice(0, 12).join(', '))
} else {
  const services = india.services ?? []
  out.push(`  India lists ${services.length} services.`)
  const names = services.map((s) => `${s.id ?? '?'}  ${s.name ?? '?'}`)
  for (const [key_, re] of WANTED) {
    const hit = services.find((s) => re.test(s.name ?? '') || re.test(s.id ?? ''))
    out.push(`    ${key_.padEnd(12)} ${hit ? `FOUND  id="${hit.id}"  "${hit.name}"` : 'NOT LISTED'}`)
  }
  out.push('\n  Every service India lists, so a rename or a miss above is visible:')
  for (const n of names) out.push(`    ${n}`)
}

// --- 2. What became newly available in India recently ------------------
const since = Math.floor((Date.now() - 14 * 86400000) / 1000)
const changes = await get(`/changes?country=in&change_type=new&item_type=show&order_direction=desc`)
const items = changes?.changes ?? changes?.shows ?? null

if (!items) {
  out.push('\n  /changes returned no recognisable list. Top-level keys: ' + Object.keys(changes ?? {}).join(', '))
} else {
  const list = Array.isArray(items) ? items : Object.values(items).flat()
  out.push(`\n  /changes?country=in&change_type=new returned ${list.length} item(s).`)
  out.push('  Shape of the first, so the field names are read rather than assumed:')
  out.push('    ' + JSON.stringify(list[0] ?? null).slice(0, 600))

  const recent = list.filter((c) => (c.timestamp ?? 0) >= since)
  out.push(`\n  ${recent.length} of them are within the last 14 days.`)
  for (const c of recent.slice(0, 15)) {
    const when = c.timestamp ? new Date(c.timestamp * 1000).toISOString().slice(0, 10) : '(no ts)'
    out.push(`    ${when}  ${(c.service?.id ?? c.service?.name ?? '?').toString().padEnd(14)} ${c.showId ?? ''}`)
  }
}

// --- 3. Can it place the titles TMDB could not? ------------------------
try {
  const worklist = JSON.parse(
    await readFile(fileURLToPath(new URL('../src/data/needs-platform.json', import.meta.url)), 'utf8'),
  )
  out.push(`\n  The ${worklist.titles.length} titles TMDB could not place, looked up by TMDB id:`)
  for (const t of worklist.titles.slice(0, 10)) {
    const show = await get(`/shows/tmdb%2Fmovie%2F${t.tmdbId}?country=in`)
    const opts = show?.streamingOptions?.in ?? []
    const named = [...new Set(opts.map((o) => o.service?.name ?? o.service?.id).filter(Boolean))]
    out.push(`    ${t.title.padEnd(28)} ${named.length ? named.join(', ') : '(not found / no IN option)'}`)
  }
} catch {
  out.push('\n  No needs-platform.json to cross-check against.')
}

console.log(`\n${'='.repeat(74)}\nSTREAMING AVAILABILITY API — coverage probe (India)\n${'='.repeat(74)}`)
for (const line of out) console.log(line)
