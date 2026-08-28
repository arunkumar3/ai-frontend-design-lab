import { describe, expect, it } from 'vitest'
import { fetchWindow, isoOf, mondayOf } from './window.js'

const AUG = 7 // month index

describe('mondayOf', () => {
  it('is stable for every day of one Monday-to-Sunday week', () => {
    // Mon 24 Aug 2026 .. Sun 30 Aug 2026 must all resolve to the same Monday,
    // Sunday included — the off-by-one that puts Sunday in the next week is
    // the classic way this breaks.
    for (let day = 24; day <= 30; day += 1) {
      expect(isoOf(mondayOf(new Date(2026, AUG, day)))).toBe('2026-08-24')
    }
  })

  it('puts Sunday at the END of its week, not the start', () => {
    expect(isoOf(mondayOf(new Date(2026, AUG, 30)))).toBe('2026-08-24')
    expect(isoOf(mondayOf(new Date(2026, AUG, 31)))).toBe('2026-08-31')
  })
})

describe('fetchWindow', () => {
  it('covers the whole current week, not just up to today', () => {
    // The defect this replaces: a window ending today meant a Thursday run
    // never asked for its own Fri/Sat/Sun, and the next run had moved on.
    const { to } = fetchWindow(new Date(2026, AUG, 27)) // a Thursday
    expect(to).toBe('2026-08-30') // the Sunday that closes that week
  })

  it('reaches back a full extra week so the previous weekend is backfilled', () => {
    const { from } = fetchWindow(new Date(2026, AUG, 28))
    expect(from).toBe('2026-08-17') // Monday of the previous week
  })

  it('is identical on every day of the same week', () => {
    const week = [24, 25, 26, 27, 28, 29, 30].map((d) => fetchWindow(new Date(2026, AUG, d)))
    for (const w of week) expect(w).toEqual({ from: '2026-08-17', to: '2026-08-30' })
  })

  it('spans 14 days inclusive', () => {
    const { from, to } = fetchWindow(new Date(2026, AUG, 28))
    const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000
    expect(days).toBe(13)
  })

  it('crosses month and year boundaries by calendar, not day-number arithmetic', () => {
    expect(fetchWindow(new Date(2026, 8, 3))).toEqual({ from: '2026-08-24', to: '2026-09-06' })
    expect(fetchWindow(new Date(2027, 0, 5))).toEqual({ from: '2026-12-28', to: '2027-01-10' })
  })

  it('the window contains the week the page will show', () => {
    // The contract that actually matters: whatever Monday the page groups on,
    // the fetch must have asked for that whole week.
    const today = new Date(2026, AUG, 28)
    const { from, to } = fetchWindow(today)
    const monday = isoOf(mondayOf(today))
    const sunday = '2026-08-30'
    expect(from <= monday).toBe(true)
    expect(to >= sunday).toBe(true)
  })
})
