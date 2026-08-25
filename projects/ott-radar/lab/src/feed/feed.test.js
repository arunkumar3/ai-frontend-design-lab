import { test, expect } from 'vitest'
import { RELEASES, PLATFORMS } from '../data/releases.js'
import { validateRelease, isRealDate, humanisePlatform } from './schema.js'
import { normaliseFeed, derivedPlatforms } from './normalise.js'
import { loadFeed, forRegion, titlesInBothRegions, regionsIn } from './index.js'
import { CURATED } from './sources/curated.js'
import { generatedSource } from './sources/generated.js'
import { ARTWORK, applyArtwork } from './sources/artwork.js'
import { mapTmdbRecord, discoverUrl, PROVIDERS } from './sources/tmdb.js'

const valid = {
  id: 'x-1',
  title: 'A Real Title',
  date: '2026-08-14',
  region: 'IN',
  type: 'movie',
  platform: 'netflix',
}

/* -------------------------------------------------------------- schema --- */

test('a well-formed record passes and comes back canonical', () => {
  const r = validateRelease(valid)
  expect(r.ok).toBe(true)
  // optional fields are normalised to one absent representation, not left
  // as a mix of undefined / '' / null
  expect(r.value.language).toBeNull()
  expect(r.value.poster).toBeNull()
  expect(r.value.tmdbId).toBeNull()
  expect(r.value.posterApprox).toBe(false)
  expect(r.value).not.toHaveProperty('endDate')
})

test('every missing required field is reported, not just the first', () => {
  const r = validateRelease({})
  expect(r.ok).toBe(false)
  expect(r.reasons.length).toBeGreaterThanOrEqual(6)
  expect(r.reasons.join(' ')).toMatch(/id/)
  expect(r.reasons.join(' ')).toMatch(/title/)
  expect(r.reasons.join(' ')).toMatch(/date/)
})

test('a date that matches the pattern but is not a real day is rejected', () => {
  expect(isRealDate('2026-02-31')).toBe(false)
  expect(isRealDate('2026-13-01')).toBe(false)
  expect(isRealDate('2026-08-14')).toBe(true)
  expect(validateRelease({ ...valid, date: '2026-02-31' }).ok).toBe(false)
})

test('a backwards date range is a defect, not an absence', () => {
  const r = validateRelease({ ...valid, date: '2026-08-15', endDate: '2026-08-07' })
  expect(r.ok).toBe(false)
  expect(r.reasons.join(' ')).toMatch(/before/)
})

test('non-objects and nulls are rejected rather than throwing', () => {
  for (const junk of [null, undefined, 42, 'a string', []]) {
    expect(validateRelease(junk).ok).toBe(false)
  }
})

test('humanisePlatform turns a key into something showable', () => {
  expect(humanisePlatform('jiohotstar')).toBe('Jiohotstar')
  expect(humanisePlatform('apple_tv_plus')).toBe('Apple Tv Plus')
  expect(humanisePlatform('sun-nxt')).toBe('Sun Nxt')
})

/* ----------------------------------------------------------- normalise --- */

test('the frozen snapshot passes its own boundary with nothing rejected', () => {
  const { releases, rejected, duplicates } = normaliseFeed(RELEASES)
  expect(rejected).toEqual([])
  expect(duplicates).toEqual([])
  expect(releases.length).toBe(RELEASES.length)
})

test('an unknown platform is registered rather than left to throw', () => {
  const { releases, platforms } = normaliseFeed([{ ...valid, platform: 'mubi' }])
  expect(releases[0].platform).toBe('mubi')
  // the invariant every route depends on
  expect(platforms.mubi.label).toBe('Mubi')
  expect(derivedPlatforms(platforms)).toEqual([{ key: 'mubi', label: 'Mubi' }])
})

test('discovering a platform never mutates the curated map', () => {
  normaliseFeed([{ ...valid, platform: 'mubi' }])
  expect(PLATFORMS.mubi).toBeUndefined()
})

test('every surviving release resolves to a platform in the returned map', () => {
  const { releases, platforms } = normaliseFeed([
    ...RELEASES,
    { ...valid, id: 'odd', platform: 'some-new-service' },
  ])
  for (const r of releases) expect(platforms[r.platform]).toBeDefined()
})

test('a duplicate id keeps the first and reports the collision', () => {
  const { releases, duplicates } = normaliseFeed([
    valid,
    { ...valid, title: 'A Different Title' },
  ])
  expect(releases).toHaveLength(1)
  expect(releases[0].title).toBe('A Real Title')
  expect(duplicates).toEqual([
    { id: 'x-1', title: 'A Different Title', keptTitle: 'A Real Title' },
  ])
})

test('bad records are rejected with reasons and good ones still come through', () => {
  const { releases, rejected } = normaliseFeed([
    valid,
    { id: 'bad', title: '', date: 'nonsense', region: 'ZZ', type: 'film', platform: '' },
    { ...valid, id: 'x-2', title: 'Another' },
  ])
  expect(releases.map((r) => r.id)).toEqual(['x-1', 'x-2'])
  expect(rejected).toHaveLength(1)
  expect(rejected[0].index).toBe(1)
  expect(rejected[0].reasons.length).toBeGreaterThan(3)
})

test('output is date-ordered, with ties broken by title', () => {
  const { releases } = normaliseFeed([
    { ...valid, id: 'c', title: 'Zebra', date: '2026-08-14' },
    { ...valid, id: 'a', title: 'Apple', date: '2026-08-14' },
    { ...valid, id: 'b', title: 'Middle', date: '2026-08-01' },
  ])
  expect(releases.map((r) => r.title)).toEqual(['Middle', 'Apple', 'Zebra'])
})

test('a non-array source degrades to an empty feed rather than throwing', () => {
  for (const junk of [null, undefined, {}, 'nope']) {
    expect(normaliseFeed(junk).releases).toEqual([])
  }
})

/* --------------------------------------------------------------- index --- */

test('loadFeed combines the snapshot, the curated week and the live feed, nothing rejected', () => {
  const feed = loadFeed()
  expect(feed.sourceId).toBe('snapshot+curated-2026-08-20+generated')
  expect(feed.releases.length).toBe(22 + CURATED.length + generatedSource.read().length)
  expect(feed.rejected).toEqual([])
  expect(feed.duplicates).toEqual([])
})

test('every curated row passes the same boundary as the snapshot', () => {
  const feed = loadFeed()
  for (const row of CURATED) {
    expect(feed.releases.some((r) => r.id === row.id), row.id).toBe(true)
    expect(feed.platforms[row.platform], `${row.id} -> ${row.platform}`).toBeDefined()
  }
  // and none of them leaked in as a derived platform — curated means curated
  expect(feed.derived).toEqual([])
})

test('forRegion is date-ordered and covers both catalogs', () => {
  const feed = loadFeed()
  expect(regionsIn(feed)).toEqual(['IN', 'US'])
  for (const region of ['IN', 'US']) {
    const dates = forRegion(feed, region).map((r) => r.date)
    expect(dates).toEqual([...dates].sort())
    expect(dates.length).toBeGreaterThan(5)
  }
})

test('cross-region titles are found through the feed, not the raw table', () => {
  expect(titlesInBothRegions(loadFeed())).toContain('Lanterns')
})

test('the generated source reads whatever fetch-feed.yml last committed, and its label names the state honestly', () => {
  const releases = generatedSource.read()
  expect(Array.isArray(releases)).toBe(true)
  // Empty (no CI run yet) and populated (a run landed) are both legitimate —
  // the label says which, rather than a blank read looking like a failure.
  if (releases.length === 0) {
    expect(generatedSource.label).toBe('TMDB live (no run yet)')
  } else {
    expect(generatedSource.label).toMatch(/^TMDB live \(\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}\)$/)
  }
})

/* -------------------------------------------------------------- artwork --- */

test('the overlay fills artwork the sources never carried', () => {
  const feed = loadFeed()
  for (const [id, art] of Object.entries(ARTWORK)) {
    const release = feed.releases.find((r) => r.id === id)
    expect(release, id).toBeDefined()
    expect(release.poster, id).toBe(art.poster)
    expect(release.tmdbId, id).toBe(art.tmdbId)
  }
  // and the frozen table v0–v6 render is untouched by all of it
  for (const id of Object.keys(ARTWORK)) {
    const row = RELEASES.find((r) => r.id === id)
    if (row) expect(row.poster, `${id} must stay null in the snapshot`).toBe(null)
  }
})

test('the overlay adds, never overwrites', () => {
  const { records } = applyArtwork(
    [{ id: 'a', poster: 'already.jpg' }, { id: 'b', poster: null }],
    { a: { poster: 'overlay.jpg' }, b: { poster: 'overlay.jpg' } },
  )
  expect(records.map((r) => r.poster)).toEqual(['already.jpg', 'overlay.jpg'])
})

test('an overlay entry for an id the feed no longer has is reported, not silent', () => {
  const { unused } = applyArtwork([{ id: 'a', poster: null }], {
    a: { poster: 'x.jpg' },
    gone: { poster: 'y.jpg' },
  })
  expect(unused).toEqual(['gone'])
  // the live overlay has to be clean, or the page is carrying dead data
  expect(loadFeed().artworkUnused).toEqual([])
})

test('an injected feed is passed through untouched by the overlay', () => {
  const id = Object.keys(ARTWORK)[0]
  globalThis.__FEED__ = [
    { id, title: 'Injected', platform: 'netflix', region: 'IN', date: '2026-08-21', type: 'movie' },
  ]
  try {
    const feed = loadFeed()
    expect(feed.sourceId).toBe('injected')
    expect(feed.releases[0].poster).toBe(null)
  } finally {
    delete globalThis.__FEED__
  }
})

/* ---------------------------------------------------------------- tmdb --- */

// A recorded shape, not a live call. api.themoviedb.org is blocked on the
// network this was written on, so the mapper is covered and the fetch is not.
const TMDB_TV = {
  id: 95350,
  name: 'Lanterns',
  first_air_date: '2026-08-17',
  poster_path: '/rb94rKVIzLyfWufIN7WqLvadBDH.jpg',
  original_language: 'en',
}
const TMDB_MOVIE = {
  id: 1749087,
  title: 'Mr. Work From Home',
  release_date: '2026-08-14',
  poster_path: '/2fGML9MV1iODxPctkAKfggUO722.jpg',
  original_language: 'te',
}

test('a TMDB series maps to a record that passes the boundary', () => {
  const raw = mapTmdbRecord(TMDB_TV, { region: 'IN', platform: 'jiohotstar', kind: 'series' })
  const r = validateRelease(raw)
  expect(r.ok).toBe(true)
  expect(r.value).toMatchObject({
    title: 'Lanterns',
    date: '2026-08-17',
    type: 'series',
    language: 'English',
    // the leading slash is TMDB's; posterUrl adds its own separator
    poster: 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg',
    tmdbId: 95350,
  })
})

test('a TMDB movie maps title/release_date rather than name/first_air_date', () => {
  const raw = mapTmdbRecord(TMDB_MOVIE, { region: 'IN', platform: 'sunnxt', kind: 'movie' })
  expect(validateRelease(raw).ok).toBe(true)
  expect(raw.title).toBe('Mr. Work From Home')
  expect(raw.language).toBe('Telugu')
})

test('ids are namespaced so the same title in two regions cannot collide', () => {
  const inRow = mapTmdbRecord(TMDB_TV, { region: 'IN', platform: 'jiohotstar', kind: 'series' })
  const usRow = mapTmdbRecord(TMDB_TV, { region: 'US', platform: 'hbomax', kind: 'series' })
  expect(inRow.id).not.toBe(usRow.id)
  const { releases, duplicates } = normaliseFeed([inRow, usRow])
  expect(releases).toHaveLength(2)
  expect(duplicates).toEqual([])
})

test('a result with no poster or unknown language maps to nulls, not to junk', () => {
  const raw = mapTmdbRecord(
    { id: 1, name: 'Untitled', first_air_date: '2026-08-14', poster_path: null, original_language: 'xx' },
    { region: 'IN', platform: 'netflix', kind: 'series' },
  )
  expect(raw.poster).toBeNull()
  expect(raw.language).toBeNull()
  expect(validateRelease(raw).ok).toBe(true)
})

test('a result missing its date is rejected at the boundary, not rendered blank', () => {
  const raw = mapTmdbRecord({ id: 2, name: 'No Date' }, { region: 'IN', platform: 'netflix', kind: 'series' })
  expect(validateRelease(raw).ok).toBe(false)
})

test('discoverUrl uses the right date field per kind and stays region-scoped', () => {
  const tv = discoverUrl({ region: 'IN', kind: 'series', providerId: 122, from: '2026-08-13', to: '2026-08-19' })
  expect(tv).toContain('discover/tv')
  expect(tv).toContain('first_air_date.gte=2026-08-13')
  expect(tv).toContain('watch_region=IN')

  const movie = discoverUrl({ region: 'US', kind: 'movie', providerId: 9, from: '2026-08-13', to: '2026-08-19' })
  expect(movie).toContain('discover/movie')
  expect(movie).toContain('primary_release_date.lte=2026-08-19')
})

test('Prime Video has a different provider id per region', () => {
  expect(PROVIDERS.IN.prime).not.toBe(PROVIDERS.US.prime)
})

test('every provider key maps to a platform the curated table knows', () => {
  for (const region of Object.keys(PROVIDERS)) {
    for (const key of Object.keys(PROVIDERS[region])) {
      expect(PLATFORMS[key], `${region}/${key}`).toBeDefined()
    }
  }
})

/* ------------------------------------------------------------- posterUrl --- */

import { posterUrl, POSTER_BASE } from '../data/releases.js'

test('posterUrl builds TMDB paths but passes resolved URIs through untouched', () => {
  expect(posterUrl({ poster: 'abc.jpg' })).toBe(`${POSTER_BASE}/abc.jpg`)
  expect(posterUrl({ poster: null })).toBeNull()
  expect(posterUrl({ poster: 'data:image/jpeg;base64,xyz' })).toBe('data:image/jpeg;base64,xyz')
  expect(posterUrl({ poster: 'https://elsewhere.example/p.jpg' })).toBe('https://elsewhere.example/p.jpg')
})
