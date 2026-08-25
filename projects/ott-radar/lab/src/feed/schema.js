// The boundary. Nothing reaches a route that has not been through here.
//
// `releases.js` is a hand-checked snapshot of 22 rows: every field is present
// because a person put it there. A live feed is the opposite — fields go
// missing, dates arrive in three formats, a platform appears that this codebase
// has never heard of, and the same title turns up twice under different ids.
// Routes `v0`-`v6` would each break differently on that, and `v7` would break
// on the first unknown platform, because `PLATFORMS[key].label` throws.
//
// So this module answers one question per record — is this renderable? — and a
// record that is not renderable is rejected *with a reason*, never silently
// dropped and never passed through half-formed.

export const REGIONS = ['IN', 'US']
export const TYPES = ['movie', 'series', 'sport']

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A date that is well-formed *and* real: 2026-02-31 matches the regex. */
export function isRealDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0

/**
 * Validate and coerce one raw record into the canonical shape.
 *
 * Returns `{ ok: true, value }` or `{ ok: false, reasons }`. Reasons are
 * plural on purpose: reporting only the first problem with a record means
 * fixing a feed takes as many round trips as it has broken fields.
 */
export function validateRelease(raw) {
  const reasons = []
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, reasons: ['not an object'] }
  }

  if (!nonEmpty(raw.id)) reasons.push('id is missing or blank')
  if (!nonEmpty(raw.title)) reasons.push('title is missing or blank')
  if (!isRealDate(raw.date)) reasons.push(`date "${raw.date}" is not a real YYYY-MM-DD date`)
  if (!REGIONS.includes(raw.region)) reasons.push(`region "${raw.region}" is not one of ${REGIONS.join('/')}`)
  if (!TYPES.includes(raw.type)) reasons.push(`type "${raw.type}" is not one of ${TYPES.join('/')}`)
  if (!nonEmpty(raw.platform)) reasons.push('platform is missing or blank')

  // An end date is optional, but a malformed or backwards one is a defect, not
  // an absence — a fixture that ends before it starts renders as "Sat 15 – Fri
  // 7 Aug" and nothing else in the stack would notice.
  if (raw.endDate !== undefined && raw.endDate !== null) {
    if (!isRealDate(raw.endDate)) {
      reasons.push(`endDate "${raw.endDate}" is not a real YYYY-MM-DD date`)
    } else if (isRealDate(raw.date) && raw.endDate < raw.date) {
      reasons.push(`endDate ${raw.endDate} is before date ${raw.date}`)
    }
  }

  if (reasons.length) return { ok: false, reasons }

  return {
    ok: true,
    value: {
      id: raw.id.trim(),
      title: raw.title.trim(),
      date: raw.date,
      ...(raw.endDate ? { endDate: raw.endDate } : {}),
      region: raw.region,
      type: raw.type,
      platform: raw.platform.trim(),
      // Optional fields are normalised to a single absent representation.
      // `language: ''` and `language: undefined` rendering differently is the
      // kind of difference that only shows up on one card, months later.
      language: nonEmpty(raw.language) ? raw.language.trim() : null,
      poster: nonEmpty(raw.poster) ? raw.poster.trim() : null,
      posterApprox: raw.posterApprox === true,
      tmdbId: Number.isInteger(raw.tmdbId) ? raw.tmdbId : null,
    },
  }
}

/**
 * "jiohotstar" -> "Jiohotstar", "apple_tv_plus" -> "Apple Tv Plus".
 *
 * Only ever used for a platform this codebase has not seen. It will sometimes
 * be wrong about casing, and that is the point: a slightly-off label on the
 * card is a visible prompt to add the platform properly, where a crash or a
 * blank is not.
 */
export function humanisePlatform(key) {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}
