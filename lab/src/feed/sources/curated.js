// Hand-curated releases for the publishing week of 20–26 Aug 2026 — gathered
// the same way the original snapshot was, because api.themoviedb.org is still
// blocked on this network: read the weekly roundups, cross-check, write rows.
//
// This lives as a SOURCE, not as more rows in `data/releases.js`, for one
// reason: `v0`–`v6` render that table directly and are frozen measurements —
// appending here would silently change six scored pages. `v7` reads through
// the feed boundary, and `normaliseFeed` takes concatenated sources precisely
// so a second one could join without touching the first.
//
// Scraped 2026-08-20. Sources:
//   https://www.iwmbuzz.com/digital/news-digital/ott-releases-august-17-21-2026-hindi-south-english-titles-to-watch-across-netflix-zee5-more/2026/08/19
//   https://www.filmibeat.com/top-listing/new-ott-releases-this-week-in-telugu-2026-aha-prime-video-netflix-zee5-hotstar-sunnxt-and-sonyliv-6-1079.html
//   https://www.123telugu.com/telugu/news/jai-krishna-ghattamanenis-srinivasa-mangapuram-sets-ott-premiere-on-prime-video-from-august-20.html
//   https://comicbook.com/tv-shows/news/everything-coming-to-netflix-hbo-max-peacock-and-more-in-august-2026/
//
// Poster paths and tmdbIds were found by the fetch-posters Actions runner
// (the sandbox cannot reach any image host) scraping themoviedb.org search,
// then VISUALLY verified against the downloaded artwork before acceptance —
// the runner's textual match check turned out to assert on TMDB's empty-state
// template, and 4 of 8 first-results were title collisions (Jumanji for
// "Welcome to the Jungle", Ghost in the Shell for "Ghosts in the Hell", The
// Rajasaab for "Raaja Raja", a 1992 French short for "Egg Shells"). Those
// four keep poster: null and the designed tile; a wrong poster is worse than
// none.
//
// Best-effort fields are commented on the row. Pyaar Prema Kalyanam (Netflix
// IN, 21 Aug) is NOT here — it is already in the snapshot, and a duplicate id
// would be reported by the boundary rather than rendered twice.

export const CURATED = [
  // ---- India ----
  { id: 'cw-srinivasa',  title: 'Srinivasa Mangapuram',    platform: 'prime',      region: 'IN', date: '2026-08-20', language: 'Telugu',  type: 'movie',  tmdbId: 1577326, poster: 'cN6igPJlKFuk5rTrAipQU4qUkWW.jpg' },
  { id: 'cw-jungle',     title: 'Welcome to the Jungle',   platform: 'jiohotstar', region: 'IN', date: '2026-08-21', language: 'Hindi',   type: 'movie',  poster: null },
  { id: 'cw-jana',       title: 'Jana Nayagan',            platform: 'zee5',       region: 'IN', date: '2026-08-21', language: 'Tamil',   type: 'movie',  tmdbId: 1235877, poster: 'jt8pfSIdi47YpFMMWVRr8w5u2S0.jpg' },
  // type and language: the listing names neither; best effort, verify when a
  // live source carries it
  { id: 'cw-cleanup',    title: 'Clean Up Company',        platform: 'prime',      region: 'IN', date: '2026-08-21', language: null,      type: 'series', poster: null },
  // ETV Win's first row in this repo — the reason the platform was curated
  { id: 'cw-eggshells',  title: 'Egg Shells',              platform: 'etvwin',     region: 'IN', date: '2026-08-21', language: 'Telugu',  type: 'movie',  poster: null },
  { id: 'cw-chennai',    title: 'Chennai Love Story',      platform: 'sonyliv',    region: 'IN', date: '2026-08-21', language: 'Telugu',  type: 'movie',  tmdbId: 1443136, poster: 'hACM25xigqIYeRgylB0epf34hmk.jpg' },
  { id: 'cw-raajaraja',  title: 'Raaja Raja',              platform: 'sunnxt',     region: 'IN', date: '2026-08-21', language: 'Telugu',  type: 'movie',  poster: null },
  // streams in four languages, so no single language claim
  { id: 'cw-ghosts',     title: 'Ghosts in the Hell',      platform: 'lionsgate',  region: 'IN', date: '2026-08-21', language: null,      type: 'movie',  poster: null },
  // documentary — the schema's nearest type is movie
  { id: 'cw-obsession',  title: 'A Beautiful Obsession',   platform: 'lionsgate',  region: 'IN', date: '2026-08-21', language: 'English', type: 'movie',  poster: 'sMGr6FeYhA799ZU50r4wjt5HVdV.jpg' },

  // ---- US ----
  { id: 'cw-outerbanks', title: 'Outer Banks S5',          platform: 'netflix',    region: 'US', date: '2026-08-20', language: 'English', type: 'series', poster: null },
]

export const curatedSource = {
  id: 'curated-2026-08-20',
  label: 'Hand-curated week of 20–26 Aug 2026',
  read: () => CURATED,
}
