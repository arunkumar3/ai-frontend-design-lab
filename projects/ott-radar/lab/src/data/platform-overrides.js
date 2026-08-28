// Platform answers filled in by hand, keyed by TMDB id.
//
// Why this exists: TMDB records an Indian film's digital release the day it
// happens, but often has no idea which service it landed on for weeks. On
// 2026-08-28 eleven Indian-language films had a digital release inside the
// week and only one — KJQ, on Prime — carried a provider TMDB could name. The
// other ten are real, correctly dated, in the right languages, and unshowable
// on a page that groups by platform.
//
// So a person looks them up and writes the answer here. Everything else about
// the title — name, date, language, poster, TMDB id — is already fetched; the
// only missing field is where to watch it, and that is the one field a human
// can settle in fifteen seconds and an API cannot.
//
// `src/data/needs-platform.json` is the worklist. Each weekly run rewrites it
// with the titles it had to drop, each one carrying a themoviedb.org link.
// Fill a row in here and it appears on the next run.
//
// An override WINS over whatever TMDB later says. That is deliberate: a person
// who checked the service is a better source than a mapping that was empty
// when asked. If TMDB catches up and disagrees, the human answer stands until
// someone changes it here.
//
// Keys must be TMDB ids (numbers), values a platform key from PLATFORMS in
// `./releases.js` — netflix, prime, jiohotstar, zee5, sonyliv, sunnxt, aha,
// etvwin, mxplayer, shemaroome, lionsgate. An unknown key still renders, with
// a label derived from the key itself, which is a visible prompt to add it
// to PLATFORMS properly rather than a crash.

export const PLATFORM_OVERRIDES = {
  // 1234567: 'aha',
}
