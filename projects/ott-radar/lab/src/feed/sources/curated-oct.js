// This week's India slate — 59 titles, 8 services, the week of 12–18 Oct 2026.
//
// Source: the @TheAakashavaani "OTT RELEASES THIS WEEK" card, handed over
// directly and taken as authoritative. It is a single source, which the
// August curation deliberately was not — those rows were cross-checked across
// four roundups. This one is one publisher's list, accepted on the user's
// instruction, and that is recorded here rather than implied.
//
// Why a source and not more rows in `data/releases.js`: `v0`–`v6` render that
// table directly and are frozen, scored pages. `v7` reads through the feed
// boundary, and `normaliseFeed` takes concatenated sources precisely so a
// week like this can join without touching a single measurement.
//
// Two fields the card does not carry, and how they were filled:
//
// DATES. The card lists no per-title date. Friday 16 Oct is this week's drop
// day and is used as the default; the five titles whose dates were
// corroborated by a second source carry their own and say so on the row.
// Every date here is inside the Mon 12 – Sun 18 week either way, which is the
// claim the page actually makes about them.
//
// LANGUAGE. The schema holds one language; the card often lists several
// ("Eng & Hin", "Mal, Tel, Tam, Kan & Hin"). The first listed is the original
// and the rest are dubs, so the first is what each row carries. A dub list is
// not a language claim.
//
// TYPE. The schema has movie | series | sport. Documentaries map to movie
// (the August curation set that precedent); docu-series, reality series,
// anime, animation and the talk show map to series. Season numbers are kept
// in the title only where the card gives one above S1 — "Hollywood Arts S1"
// would be noise, "Tulsa King S4" is information.
//
// Aha and Aha Tamil are one platform key: the card separates them because
// they are separate apps, but `aha` is one service in PLATFORMS and the
// language on each row already says which catalogue it came from.

const FRI = '2026-10-16' // the card's unstated default — this week's drop day

export const CURATED_OCT = [
  // ---- Netflix ----
  // date corroborated: North Desk and an OTT tracker both put it on 15 Oct
  { id: 'ow-ennavilai',   title: 'Enna Vilai',                      platform: 'netflix',    region: 'IN', date: '2026-10-15', language: 'Tamil',      type: 'movie',  poster: null },
  { id: 'ow-evildead',    title: 'Evil Dead Burn',                  platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-finaldest',   title: 'Final Destination Bloodlines',    platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-httyd',       title: 'How To Train Your Dragon',        platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-single2',     title: 'Seriously Single Too',            platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-legofriends', title: 'Lego Friends: Heartlake the Musical', platform: 'netflix', region: 'IN', date: FRI,         language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-therapy',     title: 'Therapy Done Right',              platform: 'netflix',    region: 'IN', date: FRI,          language: 'Spanish',    type: 'movie',  poster: null },
  { id: 'ow-thestorm',    title: 'The Storm',                       platform: 'netflix',    region: 'IN', date: FRI,          language: 'Swedish',    type: 'movie',  poster: null },
  // date corroborated: North Desk puts S4 on 15 Oct
  { id: 'ow-diplomat',    title: 'The Diplomat S4',                 platform: 'netflix',    region: 'IN', date: '2026-10-15', language: 'English',    type: 'series', poster: null },
  { id: 'ow-hollywood',   title: 'Hollywood Arts',                  platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-thetrap',     title: 'The Trap',                        platform: 'netflix',    region: 'IN', date: FRI,          language: 'German',     type: 'series', poster: null },
  { id: 'ow-lost10',      title: 'Lost 10',                         platform: 'netflix',    region: 'IN', date: FRI,          language: 'Japanese',   type: 'series', poster: null },
  { id: 'ow-dbsuper',     title: 'Dragon Ball Super: Beerus',       platform: 'netflix',    region: 'IN', date: FRI,          language: 'Japanese',   type: 'series', poster: null },
  { id: 'ow-pororo',      title: 'Pororo: The Little Penguin S9',   platform: 'netflix',    region: 'IN', date: FRI,          language: 'Korean',     type: 'series', poster: null },
  { id: 'ow-norm',        title: 'Norm: The Tale of Norm Macdonald', platform: 'netflix',   region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-disciple',    title: 'The Disciple',                    platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-instadocs',   title: 'Instadocs: AI Gone Wild',         platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-peltier',     title: 'Free Leonard Peltier',            platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-toystory30',  title: 'Toy Story: 30 Years & Beyond',    platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-tyson',       title: 'Tyson',                           platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-loveisblind', title: 'Love Is Blind S11',               platform: 'netflix',    region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },

  // ---- Prime Video ----
  { id: 'ow-cocoons',     title: 'Cocoons',                         platform: 'prime',      region: 'IN', date: FRI,          language: 'Telugu',     type: 'movie',  poster: null },
  // date corroborated: an OTT tracker lists it on 16 Oct
  { id: 'ow-lenin',       title: 'Lenin Pandiyan',                  platform: 'prime',      region: 'IN', date: FRI,          language: 'Tamil',      type: 'movie',  poster: null },
  { id: 'ow-kurla',       title: 'Kurla to Vengurla',               platform: 'prime',      region: 'IN', date: FRI,          language: 'Marathi',    type: 'movie',  poster: null },
  { id: 'ow-masterplan',  title: 'Masterplan',                      platform: 'prime',      region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-hokum',       title: 'Hokum',                           platform: 'prime',      region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-fsg',         title: 'Friends Sex & Games',             platform: 'prime',      region: 'IN', date: FRI,          language: 'German',     type: 'series', poster: null },
  { id: 'ow-tingle',      title: 'Make Me Tingle',                  platform: 'prime',      region: 'IN', date: FRI,          language: 'Korean',     type: 'series', poster: null },
  // date corroborated: North Desk dates The Traitors Telugu to 15 Oct
  { id: 'ow-traitors',    title: 'The Traitors',                    platform: 'prime',      region: 'IN', date: '2026-10-15', language: 'Telugu',     type: 'series', poster: null },
  { id: 'ow-hometown',    title: 'Home Town Giants',                platform: 'prime',      region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-marilia',     title: 'Marília Mendonça: All The Feels', platform: 'prime',      region: 'IN', date: FRI,          language: 'Portuguese', type: 'series', poster: null },

  // ---- Sun NXT ----
  { id: 'ow-kaagitham',   title: 'Kaagitham Padavalu',              platform: 'sunnxt',     region: 'IN', date: FRI,          language: 'Tamil',      type: 'movie',  poster: null },
  { id: 'ow-oruanwesh',   title: 'Oru Anweshanathinte Thudakkam',   platform: 'sunnxt',     region: 'IN', date: FRI,          language: 'Malayalam',  type: 'movie',  poster: null },

  // ---- JioHotstar ----
  { id: 'ow-sohrab',      title: 'Everybody Loves Sohrab Handa',    platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'Hindi',      type: 'movie',  poster: null },
  { id: 'ow-raas',        title: 'Raas',                            platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'Bengali',    type: 'movie',  poster: null },
  { id: 'ow-thundermans', title: 'Clash of The Thundermans',        platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-disclosure',  title: 'Disclosure Day',                  platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-zipwire',     title: 'Zip Wire',                        platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-kappi',       title: 'Kappi Squad',                     platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'Malayalam',  type: 'series', poster: null },
  { id: 'ow-visionquest', title: 'VisionQuest',                     platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-tulsaking',   title: 'Tulsa King S4',                   platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-helluva',     title: 'Helluva Boss S3',                 platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-pocoyo',      title: 'Pocoyo S2',                       platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },
  { id: 'ow-lorne',       title: 'Lorne',                           platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-corregidora', title: 'Corregidora: The Darkest Night In Mexican Soccer', platform: 'jiohotstar', region: 'IN', date: FRI, language: 'English', type: 'movie', poster: null },
  { id: 'ow-clownpanic',  title: 'Clown Panic',                     platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-ironmaiden',  title: 'Iron Maiden: Burning Ambition',   platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-petcemetery', title: 'The Pet Cemetery Murders: A Ghost Story', platform: 'jiohotstar', region: 'IN', date: FRI,  language: 'English',    type: 'series', poster: null },
  // date corroborated: iwmbuzz puts the S9 premiere on 14 Oct
  { id: 'ow-koffee',      title: 'Koffee With Karan S9',            platform: 'jiohotstar', region: 'IN', date: '2026-10-14', language: 'Hindi',      type: 'series', poster: null },
  { id: 'ow-belowdeck',   title: 'Below Deck S13',                  platform: 'jiohotstar', region: 'IN', date: FRI,          language: 'English',    type: 'series', poster: null },

  // ---- Aha (Telugu) ----
  { id: 'ow-sugriva',     title: 'Sugriva',                         platform: 'aha',        region: 'IN', date: FRI,          language: 'Telugu',     type: 'movie',  poster: null },
  { id: 'ow-vasudeva',    title: 'Vasudeva Sutham',                 platform: 'aha',        region: 'IN', date: FRI,          language: 'Telugu',     type: 'movie',  poster: null },

  // ---- Aha Tamil ----
  { id: 'ow-yenennai',    title: 'Yen Ennai Edho Seidhai',          platform: 'aha',        region: 'IN', date: FRI,          language: 'Tamil',      type: 'movie',  poster: null },
  { id: 'ow-santhayin',   title: 'Santhayin Superstar',             platform: 'aha',        region: 'IN', date: FRI,          language: 'Tamil',      type: 'series', poster: null },

  // ---- ZEE5 ----
  // date corroborated: North Desk dates the Malayalam mystery thriller to 16 Oct
  { id: 'ow-aasha',       title: 'Aasha',                           platform: 'zee5',       region: 'IN', date: FRI,          language: 'Malayalam',  type: 'movie',  poster: null },
  { id: 'ow-konyashwant', title: 'Kon Yashwant Pansare?',           platform: 'zee5',       region: 'IN', date: FRI,          language: 'Marathi',    type: 'series', poster: null },
  { id: 'ow-punjabifiles', title: 'Punjabi Files',                  platform: 'zee5',       region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
  { id: 'ow-sariska',     title: 'Sariska: Zero Se Hero',           platform: 'zee5',       region: 'IN', date: FRI,          language: 'Hindi',      type: 'movie',  poster: null },

  // ---- Apple TV ----
  { id: 'ow-tenzing',     title: 'Tenzing',                         platform: 'appletv',    region: 'IN', date: FRI,          language: 'English',    type: 'movie',  poster: null },
]

export const curatedOctSource = {
  id: 'curated-2026-10-16',
  label: 'This week in India (12–18 Oct 2026)',
  read: () => CURATED_OCT,
}
