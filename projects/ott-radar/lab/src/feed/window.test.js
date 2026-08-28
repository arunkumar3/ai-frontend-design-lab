import { describe, expect, it } from 'vitest'
import { fetchWindow, isoOf, mondayOf } from './window.js'

const AUG = 7
const SEP = 8

describe('mondayOf', () => {
  it('is stable for every day of one Monday-to-Sunday week', () => {
    for (let day = 24; day <= 30; day += 1) {
      expect(isoOf(mondayOf(new Date(2026, AUG, day)))).toBe('2026-08-24')
    }
  })

  it('puts Sunday at the END of its week, not the start', () => {
    // The classic off-by-one: JS getDay() has Sunday as 0, so a naive
    // subtraction rolls Sunday forward into the next week.
    expect(isoOf(mondayOf(new Date(2026, AUG, 30)))).toBe('2026-08-24')
    expect(isoOf(mondayOf(new Date(2026, AUG, 31)))).toBe('2026-08-31')
  })
})

describe('fetchWindow', () => {
  // The spec, in the terms it was given: the Thursday run covers that week,
  // Monday to Sunday, and the next Thursday covers the next one.
  it('a Thursday run asks for Monday to Sunday of its own week', () => {
    expect(fetchWindow(new Date(2026, AUG, 27))).toEqual({
      from: '2026-08-24',
      to: '2026-08-30',
    })
  })

  it('the following Thursday asks for the following week', () => {
    expect(fetchWindow(new Date(2026, SEP, 3))).toEqual({
      from: '2026-08-31',
      to: '2026-09-06',
    })
  })

  it('consecutive runs neither overlap nor leave a gap', () => {
    const a = fetchWindow(new Date(2026, AUG, 27))
    const b = fetchWindow(new Date(2026, SEP, 3))
    const dayAfter = (iso) => {
      const d = new Date(`${iso}T00:00:00`)
      d.setDate(d.getDate() + 1)
      return isoOf(d)
    }
    expect(dayAfter(a.to)).toBe(b.from)
  })

  it('is identical on every day of the same week', () => {
    for (const day of [24, 25, 26, 27, 28, 29, 30]) {
      expect(fetchWindow(new Date(2026, AUG, day))).toEqual({
        from: '2026-08-24',
        to: '2026-08-30',
      })
    }
  })

  it('spans exactly 7 days', () => {
    const { from, to } = fetchWindow(new Date(2026, AUG, 27))
    const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000
    expect(days).toBe(6)
  })

  it('crosses month and year boundaries by calendar, not day-number arithmetic', () => {
    expect(fetchWindow(new Date(2026, SEP, 3))).toEqual({ from: '2026-08-31', to: '2026-09-06' })
    expect(fetchWindow(new Date(2027, 0, 5))).toEqual({ from: '2027-01-04', to: '2027-01-10' })
  })

  it('asks for exactly the week the page will show', () => {
    // The contract that matters: the fetch window and the page's week are the
    // same seven days, so the featured week is never half-fetched.
    const today = new Date(2026, AUG, 28)
    const { from, to } = fetchWindow(today)
    expect(from).toBe(isoOf(mondayOf(today)))
    expect(to).toBe('2026-08-30')
  })
})
