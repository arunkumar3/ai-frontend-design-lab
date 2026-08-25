import { test, expect } from 'vitest'
import { RELEASES, PLATFORMS, posterUrl } from './releases.js'
import { releasesForRegion, titlesInBothRegions } from '../lib/regions.js'

test('both regions have releases', () => {
  expect(releasesForRegion('IN').length).toBeGreaterThan(5)
  expect(releasesForRegion('US').length).toBeGreaterThan(5)
})

test('releases are sorted ascending by date', () => {
  const dates = releasesForRegion('IN').map((r) => r.date)
  expect(dates).toEqual([...dates].sort())
})

test('Lanterns exists in both regions on different platforms', () => {
  const inRow = releasesForRegion('IN').find((r) => r.title === 'Lanterns')
  const usRow = releasesForRegion('US').find((r) => r.title === 'Lanterns')
  expect(inRow.platform).toBe('jiohotstar')
  expect(usRow.platform).toBe('hbomax')
  expect(inRow.date).not.toBe(usRow.date)
})

test('titlesInBothRegions surfaces the cross-region cases', () => {
  expect(titlesInBothRegions()).toContain('Lanterns')
})

test('sport entries carry a date range', () => {
  const sport = RELEASES.find((r) => r.type === 'sport' && r.endDate)
  expect(sport.endDate > sport.date).toBe(true)
})

test('every release references a known platform', () => {
  for (const r of RELEASES) expect(PLATFORMS[r.platform]).toBeDefined()
})

test('ids are unique', () => {
  const ids = RELEASES.map((r) => r.id)
  expect(new Set(ids).size).toBe(ids.length)
})

test('16 titles have poster artwork', () => {
  expect(RELEASES.filter((r) => r.poster).length).toBe(16)
})

test('exactly six releases have no artwork — the fallback must be designed', () => {
  const missing = RELEASES.filter((r) => !r.poster).map((r) => r.id)
  expect(missing.sort()).toEqual([
    'in-bb-te', 'in-bharat', 'in-durand', 'in-ppk', 'in-slcricket', 'in-uri',
  ])
})

test('posterUrl returns a full CDN url or null', () => {
  const withArt = RELEASES.find((r) => r.poster)
  const without = RELEASES.find((r) => !r.poster)
  expect(posterUrl(withArt)).toMatch(/^https:\/\/image\.tmdb\.org\/t\/p\/w500\/.+\.jpg$/)
  expect(posterUrl(without)).toBeNull()
})
