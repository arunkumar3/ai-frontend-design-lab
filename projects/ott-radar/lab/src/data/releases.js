export const PLATFORMS = {
  netflix:      { label: 'Netflix',       color: '#E50914' },
  prime:        { label: 'Prime Video',   color: '#00A8E1' },
  jiohotstar:   { label: 'JioHotstar',    color: '#1F80E0' },
  zee5:         { label: 'ZEE5',          color: '#8230C6' },
  sonyliv:      { label: 'SonyLIV',       color: '#CF2027' },
  sunnxt:       { label: 'Sun NXT',       color: '#D5222B' },
  lionsgate:    { label: 'Lionsgate Play',color: '#F5C518' },
  aha:          { label: 'Aha',           color: '#FF6C2F' },
  mxplayer:     { label: 'MX Player',     color: '#00B0F0' },
  mxplayerprime:{ label: 'MX Player',     color: '#00B0F0' },
  shemaroome:   { label: 'ShemarooMe',    color: '#E23744' },
  etvwin:       { label: 'ETV Win',       color: '#7B2E8E' },
  hbomax:       { label: 'HBO Max',       color: '#7B2BF9' },
  disneyplus:   { label: 'Disney+',       color: '#113CCF' },
  hulu:         { label: 'Hulu',          color: '#1CE783' },
  appletv:      { label: 'Apple TV+',     color: '#8E8E93' },
}

export const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

/**
 * Where poster files are read from. `VITE_POSTER_BASE` points it somewhere
 * else — the reason it exists is that this development sandbox cannot reach
 * image.tmdb.org at all, so every screenshot review ran against a page whose
 * artwork had silently fallen back to the designed tile. Serving the harvested
 * files locally (`VITE_POSTER_BASE=/tmdb pnpm dev`) is what makes `pnpm shoot`
 * show the page a reader with an ordinary network sees. Same class of trap as
 * the unreachable font host: the review instrument cannot tell "absent" from
 * "designed that way".
 */
const posterBase = () =>
  (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_POSTER_BASE) || POSTER_BASE

/** Full poster URL, or null when no artwork exists. Cards must handle null.
 *  A poster that is already a resolved URI (data: or https:) passes through —
 *  the published sandbox preview embeds artwork as data URIs at bundle time,
 *  and this seam is what lets it do that without touching any route. */
export function posterUrl(release) {
  if (!release.poster) return null
  if (release.poster.startsWith('data:') || release.poster.startsWith('http')) {
    return release.poster
  }
  return `${posterBase()}/${release.poster}`
}

// Week of 15–21 Aug 2026. Sources: FilmiBeat, myvi.in, FilmyChill, Boston.com.
// Posters + tmdbId scraped from themoviedb.org search pages, 2026-08-15.
// `poster: null` is real and must render a designed fallback — see plan.
// `posterApprox: true` means the artwork is a best-effort match.
// US dates are less reliable than IN — sources disagreed. Corrected in Phase B.
export const RELEASES = [
  // ---- India ----
  { id: 'in-reacher4',   title: 'Reacher S4',                platform: 'prime',      region: 'IN', date: '2026-08-12', language: 'English',   type: 'series', tmdbId: 108978, poster: 'f1VCQIG2iCyOookdgOzwtUpwWC0.jpg' },
  { id: 'in-bharat',     title: 'Bharat Bhagya Vidhaata',    platform: 'zee5',       region: 'IN', date: '2026-08-14', language: 'Hindi',     type: 'movie',  tmdbId: null,   poster: null },
  { id: 'in-aakhri',     title: 'Aakhri Sawal',              platform: 'lionsgate',  region: 'IN', date: '2026-08-14', language: 'Hindi',     type: 'movie',  tmdbId: 1173397, poster: '28xV2X07CfoXGSRvO288AgECsQI.jpg', posterApprox: true },
  { id: 'in-wfh',        title: 'Mr. Work From Home',        platform: 'sunnxt',     region: 'IN', date: '2026-08-14', language: 'Telugu',    type: 'movie',  tmdbId: 1749087, poster: '2fGML9MV1iODxPctkAKfggUO722.jpg' },
  { id: 'in-uri',        title: '108 Base Hospital: Uri',    platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Hindi',     type: 'series', tmdbId: null,   poster: null },
  { id: 'in-bb-ml',      title: 'Bigg Boss Agnipareeksha',   platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Malayalam', type: 'series', tmdbId: 39323,  poster: '1GboWZREUaFkx11V4DtkLpQsiOs.jpg' },
  { id: 'in-bb-te',      title: 'Bigg Boss Agnipariksha',    platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Telugu',    type: 'series', tmdbId: null,   poster: null },
  { id: 'in-slcricket',  title: 'India Tour of Sri Lanka',   platform: 'sonyliv',    region: 'IN', date: '2026-08-15', endDate: '2026-08-21', type: 'sport',  tmdbId: null,   poster: null },
  { id: 'in-durand',     title: 'IndianOil Durand Cup 2026', platform: 'sonyliv',    region: 'IN', date: '2026-08-15', endDate: '2026-08-21', type: 'sport',  tmdbId: null,   poster: null },
  { id: 'in-bb-kn',      title: 'Bigg Boss Agniparikshe',    platform: 'jiohotstar', region: 'IN', date: '2026-08-16', language: 'Kannada',   type: 'series', tmdbId: 207608, poster: 'cJZcrPPDcE4QmvRIg7540c46bth.jpg' },
  { id: 'in-bb-ta',      title: 'Bigg Boss: The Common Man', platform: 'jiohotstar', region: 'IN', date: '2026-08-16', language: 'Tamil',     type: 'series', tmdbId: 72908,  poster: 'pzu8AWFRvOlNys4fStVqd4kDpGO.jpg', posterApprox: true },
  { id: 'in-lanterns',   title: 'Lanterns',                  platform: 'jiohotstar', region: 'IN', date: '2026-08-17', language: 'English',   type: 'series', tmdbId: 95350,  poster: 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg' },
  { id: 'in-ppk',        title: 'Pyaar Prema Kalyanam',      platform: 'netflix',    region: 'IN', date: '2026-08-21', language: 'Tamil',     type: 'movie',  tmdbId: null,   poster: null },

  // ---- US ----
  { id: 'us-silo',       title: 'Silo',                          platform: 'appletv',    region: 'US', date: '2026-07-02', type: 'series', tmdbId: 125988, poster: 'gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg' },
  { id: 'us-daughter',   title: "My Daughter's Father",          platform: 'netflix',    region: 'US', date: '2026-07-22', type: 'series', tmdbId: 329394, poster: 'wUUS9lwm82R8nlYMIaijt8dQbIz.jpg' },
  { id: 'us-soyluna',    title: "Soy Luna: Let's Roll Again",    platform: 'disneyplus', region: 'US', date: '2026-07-24', type: 'series', tmdbId: 66203,  poster: '4JDmIzhNF7aMsDGlxVwkQ9kv9E6.jpg' },
  { id: 'us-lioness',    title: 'Lioness',                       platform: 'prime',      region: 'US', date: '2026-08-02', type: 'series', tmdbId: 113962, poster: 'rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg' },
  { id: 'us-futurama',   title: 'Futurama',                      platform: 'hulu',       region: 'US', date: '2026-08-03', type: 'series', tmdbId: 615,    poster: 'eM8bbTn8C8vUwwS6upzzm7gX31u.jpg' },
  { id: 'us-tedlasso',   title: 'Ted Lasso',                     platform: 'prime',      region: 'US', date: '2026-08-04', type: 'series', tmdbId: 97546,  poster: 'uRHsiw1wLxPHFXkkv4Ix1s0O6f4.jpg' },
  { id: 'us-reacher4',   title: 'Reacher S4',                    platform: 'prime',      region: 'US', date: '2026-08-14', type: 'series', tmdbId: 108978, poster: 'f1VCQIG2iCyOookdgOzwtUpwWC0.jpg' },
  { id: 'us-lanterns',   title: 'Lanterns',                      platform: 'hbomax',     region: 'US', date: '2026-08-16', type: 'series', tmdbId: 95350,  poster: 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg' },
  { id: 'us-whisper',    title: 'The Whisper Man',               platform: 'netflix',    region: 'US', date: '2026-08-28', type: 'movie',  tmdbId: 860508, poster: '6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg' },
]
