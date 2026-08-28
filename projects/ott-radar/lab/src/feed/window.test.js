import { describe, expect, it } from 'vitest'
import { fetchWindow, isoOf, TRAILING_DAYS } from './window.js'

// The defect these cover: the window used to be the *current* publishing week,
// Thursday to Wednesday, computed forward from today. On its own Thursday cron
// that asked TMDB for a week which had not happened yet, and a provider-filtered
// discover can only ever answer for titles a service already carries. The
// 2026-08-28 run fetched 0 records with 0 failures and still committed.
describe('fetchWindow', () => {
  it('never asks for a date past today', () => {
    // Every weekday, not just the cron's own, because --from/--to-less manual
    // runs happen on whatever day someone is debugging.
    for (let day = 20; day <= 26; day += 1) {
      const today = new Date(2026, 7, day)
      expect(fetchWindow(today).to).toBe(isoOf(today))
    }
  })

  it('covers the publishing week that just closed when it runs on Thursday', () => {
    // Thu 2026-08-27. The week Thu 08-20 .. Wed 08-26 must be inside the
    // window, or the titles the page is about fall outside the fetch.
    expect(fetchWindow(new Date(2026, 7, 27))).toEqual({
      from: '2026-08-20',
      to: '2026-08-27',
    })
  })

  it('spans TRAILING_DAYS + 1 days inclusive', () => {
    const { from, to } = fetchWindow(new Date(2026, 7, 28))
    const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000
    expect(days).toBe(TRAILING_DAYS)
  })

  it('crosses month and year boundaries by calendar, not by arithmetic on the day number', () => {
    expect(fetchWindow(new Date(2026, 8, 3)).from).toBe('2026-08-27')
    expect(fetchWindow(new Date(2027, 0, 5)).from).toBe('2026-12-29')
  })
})
