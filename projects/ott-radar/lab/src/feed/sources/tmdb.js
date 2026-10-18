// A real source: TMDB's discover endpoints, filtered by watch provider and
// region. Split deliberately into a pure mapper and an I/O function, because
// only one of the two can be tested without a network.
//
// What this source cannot supply: live sport. Two of the snapshot's 22 rows are
// cricket and football fixtures with date ranges, and TMDB has no concept of
// either. A real build needs a second source for them, and `normaliseFeed`
// takes a concatenated array precisely so sources can be mixed. Pretending one
// source covers the whole page would be the interesting kind of wrong — the
// sport would simply stop appearing and nothing would report it.

const API = 'https://api.themoviedb.org/3'
const IMAGE_PATH_PREFIX = /^\//

/**
 * Our platform keys to TMDB watch-provider ids. Providers are region-scoped:
 * Prime Video is 119 in India and 9 in the US, so the pair is the key.
 */
export const PROVIDERS = {
  IN: {
    netflix: 8,
    prime: 119,
    jiohotstar: 122,
    zee5: 232,
    sonyliv: 237,
    sunnxt: 309,
    lionsgate: 339,
    // Aha — the Telugu-first OTT, added on request; conspicuous by absence for
    // a page inspired by filmhood.in. Id 532 is TMDB's published provider id,
    // but api.themoviedb.org is blocked on this network, so unlike the ids
    // above it has never been exercised against the live service. If Aha
    // titles are missing from a real fetch, verify this id first.
    aha: 532,
    // ETV Win is curated in PLATFORMS but deliberately absent here: its TMDB
    // provider id could not be verified from this network, and a guessed id
    // would silently fetch some other service's catalog. Curated rows on
    // etvwin render fine through the boundary; resolve the id before the
    // first live fetch is expected to cover it.
  },
  US: {
    netflix: 8,
    prime: 9,
    hbomax: 1899,
    disneyplus: 337,
    hulu: 15,
    appletv: 350,
  },
}

/** ISO 639-1 to the display names the snapshot already uses. */
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  pa: 'Punjabi',
}

/**
 * One TMDB discover result to one raw release record.
 *
 * Pure, and deliberately tolerant: it maps what is there and leaves the
 * judgement about whether the result is renderable to `validateRelease`. A
 * mapper that also validated would report the same failure in two vocabularies.
 *
 * @param {object} result   a row from `results[]`
 * @param {object} context  { region, platform, kind: 'movie'|'series' }
 */
export function mapTmdbRecord(result, { region, platform, kind }) {
  const title = kind === 'movie' ? result.title : result.name
  const date = kind === 'movie' ? result.release_date : result.first_air_date

  return {
    // Namespaced so a movie and a series that happen to share a TMDB id, or
    // the same title in both regions, cannot collide. The snapshot's own
    // Lanterns rows are exactly this case.
    id: `tmdb-${region.toLowerCase()}-${kind}-${result.id}`,
    title: typeof title === 'string' ? title : '',
    date: typeof date === 'string' ? date : '',
    region,
    platform,
    type: kind === 'movie' ? 'movie' : 'series',
    language: LANGUAGES[result.original_language] ?? null,
    // TMDB gives "/abc123.jpg"; the snapshot stores the bare filename because
    // `posterUrl` adds the base and a separator.
    poster:
      typeof result.poster_path === 'string' && result.poster_path
        ? result.poster_path.replace(IMAGE_PATH_PREFIX, '')
        : null,
    tmdbId: Number.isInteger(result.id) ? result.id : null,
  }
}

/**
 * Discover URL for one provider, region, kind and date window.
 *
 * `originCountry` narrows to titles made in that country, and it is the whole
 * reason the India side of this feed stopped being an American one. A query
 * scoped only by `watch_region: 'IN'` asks "what is streamable in India",
 * which is mostly the global Netflix and Prime catalogue: of the 49 IN rows
 * in the 2026-10-08 run, two were Indian films and the rest were stand-up
 * specials and US docuseries licensed into the territory. The page says
 * "India" and a reader reads that as "Indian". One unfiltered page of twenty,
 * sorted by date, never reaches far enough down the catalogue to disagree.
 */
export function discoverUrl({ region, kind, providerId, from, to, originCountry }) {
  const path = kind === 'movie' ? 'discover/movie' : 'discover/tv'
  const dateField = kind === 'movie' ? 'primary_release_date' : 'first_air_date'
  const params = new URLSearchParams({
    watch_region: region,
    with_watch_providers: String(providerId),
    with_watch_monetization_types: 'flatrate',
    [`${dateField}.gte`]: from,
    [`${dateField}.lte`]: to,
    sort_by: `${dateField}.asc`,
    include_adult: 'false',
    page: '1',
  })
  if (originCountry) params.set('with_origin_country', originCountry)
  return `${API}/${path}?${params}`
}

/**
 * Extra passes a region needs beyond the plain provider sweep.
 *
 * India gets a second pass per provider, restricted to Indian-origin titles.
 * A separate request rather than a filter on the first, because the two
 * answer different questions and the page wants both: what landed here, and
 * what landed here that was made here. Ids collide safely — `normaliseFeed`
 * dedupes first-id-wins, so a title both passes return appears once.
 */
export const ORIGIN_PASSES = { IN: ['IN'], US: [] }

/**
 * The I/O half. Untested in this repo, and honestly so: `api.themoviedb.org` is
 * blocked on the network this was built on, so no assertion here has ever run
 * against the real service. Everything above it is pure and covered.
 *
 * Needs a TMDB v4 read token in `TMDB_TOKEN`.
 */
export async function fetchTmdbFeed({ from, to, regions = ['IN', 'US'], token, fetchImpl = fetch }) {
  if (!token) throw new Error('TMDB_TOKEN is required')
  const records = []
  const failures = []

  for (const region of regions) {
    for (const [platform, providerId] of Object.entries(PROVIDERS[region] ?? {})) {
      for (const kind of ['movie', 'series']) {
        for (const origin of [undefined, ...(ORIGIN_PASSES[region] ?? [])]) {
          const url = discoverUrl({ region, kind, providerId, from, to, originCountry: origin })
          try {
            const res = await fetchImpl(url, {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            })
            if (!res.ok) {
              failures.push({ region, platform, kind, origin, status: res.status })
              continue
            }
            const body = await res.json()
            for (const result of body.results ?? []) {
              records.push(mapTmdbRecord(result, { region, platform, kind }))
            }
          } catch (err) {
            failures.push({ region, platform, kind, origin, error: String(err) })
          }
        }
      }
    }
  }

  return { records, failures }
}

export const tmdbSource = {
  id: 'tmdb',
  label: 'TMDB discover, by watch provider',
  read: fetchTmdbFeed,
}
