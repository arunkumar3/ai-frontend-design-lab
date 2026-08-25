// Artwork resolved for rows that shipped without any, keyed by release id.
//
// It is an overlay rather than an edit to `data/releases.js` for the same
// reason `curated.js` is a second source: `v0`–`v6` render that table directly
// and are scored, frozen measurements. Filling in `in-uri`'s poster there
// would silently change six pages nobody re-reviewed. `v7` reads through the
// boundary, so the overlay lands on `v7` alone.
//
// Every entry below was found by the fetch-posters Actions runner (the sandbox
// reaches no image host) and then LOOKED AT on a contact sheet before it was
// written down. That order matters: the first harvest's textual match asserted
// on TMDB's empty-state template, so it reported a hit for every miss, and
// half of what it accepted was a title collision.
//
// Rejected, and still carrying the designed tile — a wrong poster is worse
// than none:
//
//   in-bharat    only "Bharat Bhagya Vidhata" (2002). Twenty-four years off.
//   in-bb-te     TMDB has the show, but its key art is season 9's, and that
//                art has "STARTS AUGUST 22" set into it. The card beside it
//                says Sat 15 Aug. A poster that argues with its own caption is
//                worse than no poster; the existing `in-bb-ta` approximation
//                is franchise art carrying no date, which is why that one is
//                allowed to stand as `posterApprox`.
//   cw-eggshells six "Eggshells", none of them a 2026 Telugu film.
//   cw-raajaraja The Rajasaab, Run Raja Run, Seemaraja, Rajakili, Rajavamsam —
//                a shelf of near-rhymes and no match.
//   cw-ghosts    Ghost in the Shell twice, Ghost in the Cell, two haunted-
//                tower films. Nothing that is this title.
//
// The first pass recorded `cw-ghosts` and `cw-outerbanks` as "no results at
// all" when TMDB had in fact answered 429 with an empty body. A throttle and
// an absence are the same shape downstream — the same trap as a fetch where
// every request failed reading as a week with no releases — so the runner now
// backs off and retries, and Outer Banks turned out to be there all along.
//
// The two sport fixtures are not searched at all: a cricket tour has no poster
// to find, and the tile is the honest surface for it.

export const ARTWORK = {
  // exact title, exact date (TMDB: 2026-08-15)
  'in-uri': { tmdbId: 328818, poster: 's2zF4NDPU0xTPKb5wrOhsFdYARR.jpg' },
  // exact title, exact date (TMDB: 2026-08-21)
  'in-ppk': { tmdbId: 1538273, poster: 'AjaNAeMXOrK9n0YqGqX0Lz5qxYu.jpg' },
  // the Hindi ensemble film, not Jumanji — which is what the first harvest
  // picked, and why nothing here is accepted on a title match alone. TMDB
  // dates it 2026-06-25 (theatrical); the row is its 21 Aug streaming date.
  'cw-jungle': { tmdbId: 1169516, poster: '1JlfUuvvX5xLP2LIDah4JhWUtTx.jpg' },
  // exact title, exact date, and the artwork itself reads "prime video"
  'cw-cleanup': { tmdbId: 332299, poster: 'sVMcco0EdfDvFpyPlHU9n6RPrQj.jpg' },
  // the show, not the season — TMDB indexes "Outer Banks", and the row is its
  // fifth season. The key art carries no date to argue with the card, which
  // is the line an approximation has to clear; the card labels it as one.
  'cw-outerbanks': { tmdbId: 100757, poster: 'ovDgO2LPfwdVRfvScAqo9aMiIW.jpg', posterApprox: true },
}

/**
 * Fills artwork into records that have none, before validation.
 *
 * It never overwrites: a row that already carries a poster keeps it, so this
 * can only add. `unused` names entries whose id no longer exists in the feed —
 * dead overlay rows are exactly the kind of thing that rots silently, so the
 * page reports them the same way it reports rejected records.
 */
export function applyArtwork(records, artwork = ARTWORK) {
  const used = new Set()
  const filled = records.map((r) => {
    const patch = artwork[r.id]
    if (!patch || r.poster) return r
    used.add(r.id)
    return { ...r, ...patch }
  })
  return { records: filled, unused: Object.keys(artwork).filter((id) => !used.has(id)) }
}
