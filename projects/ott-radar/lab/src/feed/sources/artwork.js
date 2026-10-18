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

  // ---- the week of 12–18 Oct 2026 -----------------------------------------
  //
  // Found through TMDB's search API rather than its HTML, and every one of
  // the 57 candidates was looked at on a contact sheet before it was written
  // down here. Five were refused:
  //
  //   in-bb-te     still the season-9 key art with "STARTS AUGUST 22" set
  //                into the image, beside a card that says Sat 15 Aug.
  //   ow-disciple  TMDB's "The Disciple" is the 2020 Marathi film. The row is
  //                an English documentary on Netflix this week. Same words,
  //                different work — the exact shape of collision that got
  //                four titles wrong in August.
  //   ow-traitors  dropped from the source instead: the live fetch carries
  //                the same show as "The Traitors Telugu", with the real date
  //                and the right artwork.
  //   cw-ghosts    "Haunted Tales", a 1980 Chinese film.
  //   cw-raajaraja "Rajathi Raaja" (2013). A near-rhyme, not the film.
  //
  // Eight carry `posterApprox` because TMDB indexes a show and the row is one
  // of its seasons: the art is right about the programme and silent about the
  // season, which is the line an approximation has to clear. The card says so.
  'ow-aasha': { tmdbId: 1513475, poster: 'dZyMVwRhI0Y1ANDRM4sAk7P4hYC.jpg' }, // Aasha [2026]
  'ow-clownpanic': { tmdbId: 1776531, poster: 'pZ15WSO7UzzJ297SLBMvxHNQDC1.jpg' }, // Clown Panic [2026]
  'ow-cocoons': { tmdbId: 1799453, poster: 'r0bpIupxdEk64Qm4kDbttQ8OQf8.jpg' }, // Cocoons [2026]
  'ow-corregidora': { tmdbId: 337911, poster: 'aYQDNPmBifsiNdLFrvWLT19lb6w.jpg' }, // Corregidora: The Darkest Night in Mexican Soccer [2026]
  'ow-dbsuper': { tmdbId: 312359, poster: 'AojgldgsOlzZV8ahyOzaiAjJWvV.jpg' }, // Dragon Ball Super: Beerus [2026]
  'ow-disclosure': { tmdbId: 1275779, poster: 'AnJ8IQJI23hNpYXVNaythu061Ru.jpg' }, // Disclosure Day [2026]
  'ow-ennavilai': { tmdbId: 1686999, poster: 'NkklX4xp3BlLmlMT0LXehkStJZ.jpg' }, // Enna Vilai [2026]
  'ow-evildead': { tmdbId: 1212763, poster: 'uRxrNXQWkHoENm3nwVOZDYSCx2F.jpg' }, // Evil Dead Burn [2026]
  'ow-hokum': { tmdbId: 1430077, poster: 'x6rHcQFiYcczLQPrmxXPAicm54E.jpg' }, // Hokum [2026]
  'ow-instadocs': { tmdbId: 1790935, poster: 'ybMAd7Tkd3T7XlCv4Ps54r1yC1M.jpg' }, // Instadocs: AI Gone Wild [2026]
  'ow-ironmaiden': { tmdbId: 1642859, poster: 'yZqhFJDenLfgF1VygOOCNmAdS1P.jpg' }, // Iron Maiden: Burning Ambition [2026]
  'ow-kaagitham': { tmdbId: 1799441, poster: '7DNkD54Ubo547C5PJjXO81QhvQc.jpg' }, // Kaagitham Padavalu [2026]
  'ow-kappi': { tmdbId: 325690, poster: 'rMJvHecWS0ra4I4ZyEBczB2PU8x.jpg' }, // Kappi Squad [2026]
  'ow-konyashwant': { tmdbId: 338875, poster: '9KwQhHGl262HYDS4WPcbQ5Xsc39.jpg' }, // Kon Yashwant Pansare? [2026]
  'ow-lenin': { tmdbId: 1563192, poster: 'qhvvef3ayMfnuA4wQcPscC8em0A.jpg' }, // Lenin Pandiyan [2026]
  'ow-lorne': { tmdbId: 1634949, poster: '3n3mGGQI1HkmzUlcPubMZ9QvcJA.jpg' }, // Lorne [2026]
  'ow-lost10': { tmdbId: 329490, poster: 'xNYh0RLebPsb9noMdctjKTeqe0v.jpg' }, // LOST10 [2026]
  'ow-marilia': { tmdbId: 296466, poster: 'g4XB3hmoPC75AtjsRtFhRdbDxhe.jpg' }, // Marília Mendonça: All the Feels [2026]
  'ow-petcemetery': { tmdbId: 336418, poster: 'aSD3YkLuTBnoYgyTCXtZRAxezNP.jpg' }, // The Pet Cemetery Murders: A Ghost Story [2026]
  'ow-sugriva': { tmdbId: 1799570, poster: 'dtnutjXr4bXhwfniuX4jaSholLT.jpg' }, // Sugriva [2026]
  'ow-tenzing': { tmdbId: 1288069, poster: 'eI0QW02PYqhnmIvLRdn9vrfVVP7.jpg' }, // Tenzing [2026]
  'ow-therapy': { tmdbId: 1487317, poster: '2gJiHJYhPXQy4ovDD5ZvSjwYfMZ.jpg' }, // Therapy Done Right [2026]
  'ow-thundermans': { tmdbId: 1506560, poster: '16oqRrWVzQm6qdGfBxvziZ2UiMT.jpg' }, // Clash of the Thundermans [2026]
  'ow-visionquest': { tmdbId: 213375, poster: 'WGyAyBPncfuu8MZhLY9RtfZPM0.jpg' }, // VisionQuest [2026]
  'ow-yenennai': { tmdbId: 1764201, poster: 'A5B8tt7aM7SbAKs7I9jRunaAR3Q.jpg' }, // Yen Ennai Edho Seidhai [2026]
  'ow-zipwire': { tmdbId: 1482547, poster: 'cO7J0XSVKPlAjUCMWC7DVBn1Py2.jpg' }, // Zip Wire [2026]
  'ow-belowdeck': { tmdbId: 50042, poster: 'xMkYEWMGB7F7YfzJ24DPXoDj8vo.jpg', posterApprox: true }, // Below Deck [2013]
  'ow-diplomat': { tmdbId: 203857, poster: 'cUy0ZYme43lop08nOtbQLWL0dX.jpg', posterApprox: true }, // The Diplomat [2023]
  'ow-finaldest': { tmdbId: 574475, poster: '6WxhEvFsauuACfv8HyoVX6mZKFj.jpg' }, // Final Destination Bloodlines [2025]
  'ow-helluva': { tmdbId: 289892, poster: 'bcrp2ovxirKH81XSMYQZ7eEunzX.jpg', posterApprox: true }, // Helluva Boss [2020]
  'ow-httyd': { tmdbId: 1087192, poster: '53dsJ3oEnBhTBVMigWJ9tkA5bzJ.jpg' }, // How to Train Your Dragon [2025]
  'ow-koffee': { tmdbId: 14544, poster: 'xyaDqO917xzA0iQwtdMPHC5oJVV.jpg', posterApprox: true }, // Koffee with Karan [2004]
  'ow-kurla': { tmdbId: 1552357, poster: 'AnrScLMxhEXL2vUXhIiSoKsNd9X.jpg' }, // Kurla To Vengurla [2025]
  'ow-loveisblind': { tmdbId: 99353, poster: '8XhV6ke8ltRYoG4SYmibF2bGwrC.jpg', posterApprox: true }, // Love Is Blind [2020]
  'ow-oruanwesh': { tmdbId: 1274311, poster: 'wcNAQcPjD0NYVsrgtTDdSmaJjVM.jpg' }, // Oru Anweshanathinte Thudakkam [2024]
  'ow-peltier': { tmdbId: 1400778, poster: '76TemyRRwyBfzHxrR9yxj83DMyv.jpg' }, // Free Leonard Peltier [2025]
  'ow-pocoyo': { tmdbId: 2437, poster: '1fmaC3t96Napg7TR9SsfOX8q11X.jpg', posterApprox: true }, // Pocoyo [2005]
  'ow-pororo': { tmdbId: 19845, poster: 'oD2r5c3IG4C6RDx847tG8OtLutK.jpg', posterApprox: true }, // Pororo the Little Penguin [2003]
  'ow-raas': { tmdbId: 1465897, poster: 'vj6xNjxaERcNNRtQxMFPO0JNYe6.jpg' }, // Raas [2025]
  'ow-sohrab': { tmdbId: 1198380, poster: 'A3zKx7XpXY1ykL8CLbyCN0OCsT8.jpg' }, // Everybody Loves Sohrab Handa [2023]
  'ow-tulsaking': { tmdbId: 153312, poster: 'rOYLWCdAifpUtPlTf1WHxyaxeMt.jpg', posterApprox: true }, // Tulsa King [2022]
  'ow-fsg': { tmdbId: 298550, poster: 'zijeb3WqqTIYJm3mmp1sb0uNGUj.jpg' }, // Friends Sex and Games [2026]
  'ow-toystory30': { tmdbId: 1713524, poster: 'wMy1LOPWDSQzgWsxATDxLxDAKte.jpg' }, // Toy Story: 30 Years and Beyond - A Special Edition of 20/20 [2026]
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
