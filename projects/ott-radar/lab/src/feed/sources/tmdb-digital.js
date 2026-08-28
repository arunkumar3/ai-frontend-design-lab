// A second source, asking TMDB a different question than `tmdb.js` does.
//
// `tmdb.js` asks "what does provider X carry, by release date". That leans on
// TMDB's watch-provider mapping, which is six to ten weeks stale for Indian
// services — measured on 2026-08-28, newest title per provider:
//
//   sunnxt 2026-07-17 te · zee5 2026-07-10 te · mxplayer 2026-06-26 hi
//   aha    2026-06-19 te · shemaroome 2026-05-15 gu
//
// No Monday-to-Sunday window catches any of that, which is why a page for an
// Indian audience carried no Telugu or Hindi titles at all.
//
// This asks instead "which Telugu films got a DIGITAL release in India in this
// window", using TMDB's per-country release *type* (4 = Digital). That reads
// release records rather than the provider mapping, and those are current —
// same day, the same probe found Hindi and Tamil titles dated 2026-08-28.
//
// The provider still has to be resolved, per title, through
// `/movie/{id}/watch/providers`, because the page groups by platform. Roughly
// half of the hits have a digital release record and no provider mapping yet.
// Those are dropped rather than shown with an invented platform, and the count
// is reported so "we dropped nine" never looks like "there were nine fewer".

import { PROVIDERS } from './tmdb.js'

const API = 'https://api.themoviedb.org/3'
const IMAGE_PATH_PREFIX = /^\//

/** TMDB release type 4. The others are premiere/theatrical/physical/TV. */
export const DIGITAL_RELEASE_TYPE = '4'

/**
 * The languages this page is about, as ISO 639-1 to the display names the
 * snapshot already uses. Region-scoped: a Telugu digital release is an Indian
 * release, and asking the US region for one would be a category error.
 */
export const DIGITAL_LANGUAGES = {
  IN: { te: 'Telugu', hi: 'Hindi', ta: 'Tamil', ml: 'Malayalam', kn: 'Kannada' },
  US: {},
}

/** Discover URL for one language, region and window. Pure. */
export function digitalDiscoverUrl({ region, language, from, to }) {
  const params = new URLSearchParams({
    with_original_language: language,
    region,
    with_release_type: DIGITAL_RELEASE_TYPE,
    'release_date.gte': from,
    'release_date.lte': to,
    sort_by: 'primary_release_date.desc',
    include_adult: 'false',
    page: '1',
  })
  return `${API}/discover/movie?${params}`
}

/**
 * The first flatrate provider in `region` that this page has a curated key for.
 *
 * TMDB returns provider *names* and ids; the page keys on our own short names,
 * so the id is what gets matched — a name match would break the first time
 * TMDB writes "Amazon Prime Video with Ads" instead of "Amazon Prime Video",
 * which it does for the very first Telugu hit this source found.
 *
 * @returns {string|null} our platform key, or null when nothing maps
 */
export function resolvePlatform(watchProviders, region) {
  const flatrate = watchProviders?.results?.[region]?.flatrate ?? []
  const byId = new Map(Object.entries(PROVIDERS[region] ?? {}).map(([key, id]) => [id, key]))
  for (const p of flatrate) {
    const key = byId.get(p.provider_id)
    if (key) return key
  }
  return null
}

/** One discover result to one raw release record. Pure. */
export function mapDigitalRecord(result, { region, platform, language }) {
  return {
    id: `tmdbdig-${region.toLowerCase()}-movie-${result.id}`,
    title: typeof result.title === 'string' ? result.title : '',
    date: typeof result.release_date === 'string' ? result.release_date : '',
    region,
    type: 'movie',
    platform,
    language: language ?? null,
    poster:
      typeof result.poster_path === 'string' && result.poster_path
        ? result.poster_path.replace(IMAGE_PATH_PREFIX, '')
        : null,
    tmdbId: Number.isInteger(result.id) ? result.id : null,
  }
}

/**
 * The I/O half. Same split as `tmdb.js`: everything above is pure and tested,
 * this part talks to the network and is exercised on a runner.
 */
export async function fetchTmdbDigital({
  from,
  to,
  regions = ['IN'],
  token,
  fetchImpl = fetch,
}) {
  if (!token) throw new Error('TMDB_TOKEN is required')
  const records = []
  const failures = []
  const unresolved = []

  const get = async (url, where) => {
    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) {
      failures.push({ ...where, status: res.status })
      return null
    }
    return res.json()
  }

  for (const region of regions) {
    for (const [code, label] of Object.entries(DIGITAL_LANGUAGES[region] ?? {})) {
      const body = await get(digitalDiscoverUrl({ region, language: code, from, to }), {
        region,
        language: code,
      })
      if (!body) continue

      for (const result of body.results ?? []) {
        const providers = await get(`${API}/movie/${result.id}/watch/providers`, {
          region,
          language: code,
          movie: result.id,
        })
        if (!providers) continue

        const platform = resolvePlatform(providers, region)
        if (!platform) {
          // A real digital release with no provider mapping yet. Not an error,
          // and not showable on a platform-grouped page either.
          unresolved.push({ title: result.title, date: result.release_date, language: label })
          continue
        }
        records.push(mapDigitalRecord(result, { region, platform, language: label }))
      }
    }
  }

  return { records, failures, unresolved }
}

export const tmdbDigitalSource = {
  id: 'tmdb-digital',
  label: 'TMDB digital releases, by original language',
  read: fetchTmdbDigital,
}
