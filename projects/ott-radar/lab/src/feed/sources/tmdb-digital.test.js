import { describe, expect, it } from 'vitest'
import {
  DIGITAL_RELEASE_TYPE,
  digitalDiscoverUrl,
  mapDigitalRecord,
  resolvePlatform,
} from './tmdb-digital.js'

describe('digitalDiscoverUrl', () => {
  it('asks for digital releases, not theatrical ones', () => {
    // The whole point of this source. Without with_release_type=4 it is just
    // the provider query again with extra steps.
    const u = new URL(digitalDiscoverUrl({ region: 'IN', language: 'te', from: 'a', to: 'b' }))
    expect(u.searchParams.get('with_release_type')).toBe(DIGITAL_RELEASE_TYPE)
    expect(u.searchParams.get('with_original_language')).toBe('te')
    expect(u.searchParams.get('region')).toBe('IN')
  })

  it('bounds the window on both ends', () => {
    const u = new URL(
      digitalDiscoverUrl({ region: 'IN', language: 'hi', from: '2026-08-24', to: '2026-08-30' }),
    )
    expect(u.searchParams.get('release_date.gte')).toBe('2026-08-24')
    expect(u.searchParams.get('release_date.lte')).toBe('2026-08-30')
  })
})

describe('resolvePlatform', () => {
  it('matches on provider id, not name', () => {
    // TMDB returned "Amazon Prime Video with Ads" for the first Telugu title
    // this source found. A name match would have dropped it.
    expect(
      resolvePlatform(
        { results: { IN: { flatrate: [{ provider_id: 119, provider_name: 'Amazon Prime Video with Ads' }] } } },
        'IN',
      ),
    ).toBe('prime')
  })

  it('is region-scoped — Prime is a different id in each region', () => {
    const us = { results: { US: { flatrate: [{ provider_id: 9, provider_name: 'Amazon Prime Video' }] } } }
    expect(resolvePlatform(us, 'US')).toBe('prime')
    // 9 is not India's Prime id (119), so asking IN of a US payload finds nothing.
    expect(resolvePlatform({ results: { IN: { flatrate: [{ provider_id: 9 }] } } }, 'IN')).toBe(null)
  })

  it('returns null rather than inventing a platform', () => {
    expect(resolvePlatform({ results: { IN: { flatrate: [{ provider_id: 99999 }] } } }, 'IN')).toBe(null)
    expect(resolvePlatform({ results: {} }, 'IN')).toBe(null)
    expect(resolvePlatform(undefined, 'IN')).toBe(null)
  })

  it('skips unmapped providers to find one it knows', () => {
    const mixed = {
      results: { IN: { flatrate: [{ provider_id: 99999 }, { provider_id: 8, provider_name: 'Netflix' }] } },
    }
    expect(resolvePlatform(mixed, 'IN')).toBe('netflix')
  })
})

describe('mapDigitalRecord', () => {
  const result = {
    id: 12345,
    title: 'KJQ',
    release_date: '2026-08-28',
    poster_path: '/abc.jpg',
  }

  it('produces a record the boundary accepts', () => {
    const r = mapDigitalRecord(result, { region: 'IN', platform: 'prime', language: 'Telugu' })
    expect(r).toMatchObject({
      id: 'tmdbdig-in-movie-12345',
      title: 'KJQ',
      date: '2026-08-28',
      region: 'IN',
      type: 'movie',
      platform: 'prime',
      language: 'Telugu',
      poster: 'abc.jpg',
      tmdbId: 12345,
    })
  })

  it('namespaces its ids away from the provider source', () => {
    // Both sources can return the same film. Colliding ids would make
    // normaliseFeed drop one as a duplicate of the other, which is fine — but
    // only if that is deliberate. These are deliberately distinct, so the
    // dedupe happens on merge rather than by accident of naming.
    const r = mapDigitalRecord(result, { region: 'IN', platform: 'prime', language: 'Telugu' })
    expect(r.id.startsWith('tmdbdig-')).toBe(true)
    expect(r.id).not.toBe('tmdb-in-movie-12345')
  })

  it('leaves a missing poster null rather than guessing a filename', () => {
    const r = mapDigitalRecord({ id: 1, title: 'x', release_date: '2026-08-28' }, { region: 'IN', platform: 'prime', language: 'Telugu' })
    expect(r.poster).toBe(null)
  })
})
