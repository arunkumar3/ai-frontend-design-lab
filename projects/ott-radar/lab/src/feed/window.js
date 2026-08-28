// The date window a live fetch asks TMDB for.
//
// This is NOT the publishing week the page renders. It is the window the
// source can actually answer, and the two are different for a concrete reason:
// `discover` filtered by `with_watch_providers` matches only titles a service
// *already carries*, so a window running into the future is structurally empty
// however healthy the pipeline is.
//
// Measured, not assumed — two runs of the same code with the same token:
//
//   2026-08-25, window 2026-08-20..08-26 (past)          -> 17 raw records
//   2026-08-28, window 2026-08-27..09-02 (today+future)  ->  0 raw records, 0 failures
//
// The second one committed a "weekly TMDB fetch" whose entire diff was the
// `fetchedFor` label, and the page went on rendering the week before. So the
// window trails instead: the eight days ending today. Run on its Thursday
// cron that covers the publishing week which just closed (Thu..Wed) plus the
// Thursday it runs on — the newest data the provider filter can see.
//
// Pure and exported so it can be tested. The I/O half lives in
// `scripts/fetch-feed.mjs`, which is the only caller.

/** How many days back the window reaches from `today`, inclusive of both ends. */
export const TRAILING_DAYS = 7

/** A Date to `YYYY-MM-DD` in the local zone (UTC on a runner). */
export function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * @param {Date}   [today]
 * @param {number} [days]  defaults to TRAILING_DAYS
 * @returns {{ from: string, to: string }} inclusive ISO date bounds
 */
export function fetchWindow(today = new Date(), days = TRAILING_DAYS) {
  const to = new Date(today)
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  return { from: isoOf(from), to: isoOf(to) }
}
