// Does TMDB know about Indian-language DIGITAL releases on a weekly cadence?
//
// The provider-filtered query this feed is built on indexes Indian-language
// titles six to ten weeks late — measured, see probe-providers. That makes a
// Telugu or Hindi weekly list impossible from it. But that query asks a
// specific question: "what does provider X carry, by release date". TMDB also
// records a release TYPE per country, where 4 is Digital, and `discover`
// filters on it. So a different question is available:
//
//   "Which Telugu films got a digital release in India in this window?"
//
// That is much closer to what the page is actually about, and it does not
// depend on TMDB's provider mapping being current — only on its release
// records. This probe measures whether that is true, before anything is built
// on it. Read-only.

const API = 'https://api.themoviedb.org/3'
const token = process.env.TMDB_TOKEN
if (!token) {
  console.error('TMDB_TOKEN is not set.')
  process.exit(2)
}
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
const get = async (u) => {
  const res = await fetch(u, { headers })
  if (!res.ok) throw new Error(`${res.status} ${u}`)
  return res.json()
}

const iso = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return iso(d)
}

const LANGS = { te: 'Telugu', hi: 'Hindi', ta: 'Tamil', ml: 'Malayalam', kn: 'Kannada' }
const out = []

for (const [code, name] of Object.entries(LANGS)) {
  for (const [label, days] of [['last 14 days', 14], ['last 60 days', 60]]) {
    const params = new URLSearchParams({
      with_original_language: code,
      region: 'IN',
      with_release_type: '4', // Digital
      'release_date.gte': daysAgo(days),
      'release_date.lte': iso(new Date()),
      sort_by: 'primary_release_date.desc',
      include_adult: 'false',
      page: '1',
    })
    const body = await get(`${API}/discover/movie?${params}`)
    const rows = body.results ?? []
    out.push(`  ${name.padEnd(10)} ${label.padEnd(13)} total ${String(body.total_results ?? 0).padStart(4)}`)
    for (const r of rows.slice(0, 4)) {
      out.push(`      ${r.release_date ?? '(no date)'}  ${r.title}`)
    }
  }
}

// Does a hit actually resolve to a streaming service? A title with a digital
// release record but no provider mapping cannot be shown on a platform-grouped
// page, so this is the half that decides whether the idea is usable at all.
out.push('\n  Provider resolution for the most recent Telugu hits:')
const teParams = new URLSearchParams({
  with_original_language: 'te',
  region: 'IN',
  with_release_type: '4',
  'release_date.gte': daysAgo(60),
  'release_date.lte': iso(new Date()),
  sort_by: 'primary_release_date.desc',
  page: '1',
})
const te = await get(`${API}/discover/movie?${teParams}`)
for (const r of (te.results ?? []).slice(0, 5)) {
  const wp = await get(`${API}/movie/${r.id}/watch/providers`)
  const flat = wp.results?.IN?.flatrate ?? []
  const names = flat.map((p) => p.provider_name).join(', ') || '(no IN flatrate provider)'
  out.push(`      ${r.release_date}  ${r.title} -> ${names}`)
}

console.log(`\n${'='.repeat(72)}\nDIGITAL-RELEASE PROBE (with_release_type=4, region IN)\n${'='.repeat(72)}`)
for (const line of out) console.log(line)
