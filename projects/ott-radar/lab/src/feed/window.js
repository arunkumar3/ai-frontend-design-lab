// The date window a live fetch asks TMDB for.
//
// Bounded by the same Monday/Sunday edges the page groups on (see
// `src/routes/v7/week.js`), because a fetch that does not cover the week the
// reader is looking at leaves that week half-empty for no visible reason.
//
// Two things this has to get right, both learned the hard way.
//
// It must not run past today by more than the current week. `discover`
// filtered by `with_watch_providers` matches only titles a service already
// carries, so a purely forward window is structurally empty however healthy
// the pipeline is. Measured, same code and token:
//
//   2026-08-25, window 2026-08-20..08-26 (past)          -> 17 raw records
//   2026-08-28, window 2026-08-27..09-02 (today+future)  ->  0 raw records, 0 failures
//
// And it must reach back a full week further than the week on display. The
// run is weekly, on a Thursday; a title landing on the Friday, Saturday or
// Sunday after it is not in TMDB's provider data yet and will not be asked
// for again until the next run — so without the reach-back, every weekend
// falls permanently through the gap. `normaliseFeed` dedupes by id, so
// re-asking for a week already fetched costs a request and changes nothing.

export const WEEK_START_DAY = 1 // Monday. Intl day index, Sun = 0.

/** A Date to `YYYY-MM-DD` in the local zone (UTC on a runner). */
export function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The Monday on or before `d`. */
export function mondayOf(d) {
  const m = new Date(d)
  m.setDate(m.getDate() - ((m.getDay() - WEEK_START_DAY + 7) % 7))
  return m
}

const shifted = (d, days) => {
  const n = new Date(d)
  n.setDate(n.getDate() + days)
  return n
}

/**
 * From the Monday of the *previous* week to the Sunday of the current one.
 *
 * @param {Date} [today]
 * @returns {{ from: string, to: string }} inclusive ISO date bounds
 */
export function fetchWindow(today = new Date()) {
  const monday = mondayOf(today)
  return { from: isoOf(shifted(monday, -7)), to: isoOf(shifted(monday, 6)) }
}
