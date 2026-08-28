// The date window a live fetch asks TMDB for: Monday to Sunday of the week the
// run happens in — the same week the page groups on (`src/routes/v7/week.js`).
//
//   run Thu 2026-08-27  ->  2026-08-24 .. 2026-08-30
//   run Thu 2026-09-03  ->  2026-08-31 .. 2026-09-06
//
// One run, one whole calendar week, no overlap between runs. The window is the
// week; it is not derived from the run day, which is only a schedule.
//
// This replaced a window that counted *forward* from the run day. That version
// asked for a week that had not happened, and a `discover` call filtered by
// `with_watch_providers` matches only titles a service already carries, so it
// came back empty however healthy the pipeline was. Measured, same code and
// token:
//
//   2026-08-25, window 2026-08-20..08-26 (past)          -> 17 raw records
//   2026-08-28, window 2026-08-27..09-02 (today+future)  ->  0 raw records, 0 failures
//
// A Monday-to-Sunday window does not have that problem on its Thursday run:
// Monday through Wednesday are already past, so there is always real data to
// return. The tail of the week is not, and that has a documented consequence —
// see the note in HANDOFF: a title landing on the Friday, Saturday or Sunday
// after a Thursday run is not in TMDB's provider data yet, and the next run's
// window has moved on to the following week. Closing that needs a second run
// over the completed week, not a wider window here.

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

/**
 * Monday to Sunday of the week containing `today`.
 *
 * @param {Date} [today]
 * @returns {{ from: string, to: string }} inclusive ISO date bounds
 */
export function fetchWindow(today = new Date()) {
  const monday = mondayOf(today)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  return { from: isoOf(monday), to: isoOf(sunday) }
}
