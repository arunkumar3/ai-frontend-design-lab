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
    // 2336, verified against TMDB's own provider list for IN on 2026-08-28.
    // It was 122 — an id that is not a provider in India at all, so India's
    // largest Hindi and regional service returned `200` with an empty list on
    // every run since the feed was built. Nothing reported it, because that is
    // exactly what a genuinely quiet provider looks like.
    jiohotstar: 2336,
    zee5: 232,
    sonyliv: 237,
    sunnxt: 309,
    // aha, 532, is right — confirmed against the same list, so the comment
    // that used to sit here asking someone to verify it is discharged. Its
    // catalogue in TMDB is the problem instead: one title in 120 days.
    aha: 532,
    // Added 2026-08-28, all read off TMDB's India list rather than guessed.
    // These carry the Hindi catalogue that jiohotstar's dead id was supposed
    // to be covering. MX Player is listed twice by TMDB, standalone and as a
    // Prime channel; both are queried because a title can appear under either,
    // and `normaliseFeed` dedupes by id so the overlap costs one request.
    mxplayer: 515,
    mxplayerprime: 1898,
    shemaroome: 474,
    // Removed: lionsgate, 339. TMDB does not list it as a provider in India,
    // so it was never going to return anything. It stays in PLATFORMS because
    // curated rows still use the key.
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

/** Discover URL for one provider, region, kind and date window. */
export function discoverUrl({ region, kind, providerId, from, to }) {
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
  return `${API}/${path}?${params}`
}

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
        const url = discoverUrl({ region, kind, providerId, from, to })
        try {
          const res = await fetchImpl(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          })
          if (!res.ok) {
            failures.push({ region, platform, kind, status: res.status })
            continue
          }
          const body = await res.json()
          for (const result of body.results ?? []) {
            records.push(mapTmdbRecord(result, { region, platform, kind }))
          }
        } catch (err) {
          failures.push({ region, platform, kind, error: String(err) })
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
