import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { REGIONS, releasesForRegion, titlesInBothRegions } from '../../lib/regions.js'
import { PLATFORMS, posterUrl } from '../../data/releases.js'
import './v5.css'

const TYPE_LABEL = { movie: 'Movie', series: 'Series', sport: 'Live sport' }

// India first: it carries the larger slate this week (13 vs 9) and is the
// default a returning visitor from the IN catalog would expect.
const REGION_NAME = { IN: 'India', US: 'the United States' }

// A handful of titles (Reacher S4, Lanterns) release in both catalogs on
// different platforms and dates. Toggling the region and landing on the same
// poster again reads as a bug unless the card says why. Computed once: the
// RELEASES table is static.
const CROSS_REGION_TITLES = new Set(titlesInBothRegions())

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dayFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric' })
const yearFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric' })

function fmtDate(iso) {
  return dateFmt.format(new Date(`${iso}T00:00:00`))
}

// Real span of the releases actually rendered, not an assumed "this week."
// A release's own end (sport entries carry `endDate`) can extend the max
// past every `date` value, so both bounds are derived per-release.
function computeRange(releases) {
  let min = releases[0].date
  let max = releases[0].endDate || releases[0].date
  for (const r of releases) {
    if (r.date < min) min = r.date
    const end = r.endDate || r.date
    if (end > max) max = end
  }
  return { min, max }
}

function formatRange(min, max) {
  const minDate = new Date(`${min}T00:00:00`)
  const maxDate = new Date(`${max}T00:00:00`)
  const year = yearFmt.format(maxDate)
  const sameMonth =
    minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()
  return sameMonth
    ? `${dateFmt.format(minDate)}–${dayFmt.format(maxDate)}, ${year}`
    : `${dateFmt.format(minDate)} – ${dateFmt.format(maxDate)}, ${year}`
}

// Deterministic 3-way tone pick so six fallback panels don't render as one
// repeated block — quiet variation, still zero saturation, still on the
// canvas's own tonal family.
function toneFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ['a', 'b', 'c'][Math.abs(hash) % 3]
}

// Platform is a grouping dimension, not a per-card decoration (SYNTHESIS
// decision 1). Groups are ordered by their earliest release date so the
// page still reads "this week" chronologically, group by group.
function groupByPlatform(releases) {
  const map = new Map()
  for (const r of releases) {
    if (!map.has(r.platform)) map.set(r.platform, [])
    map.get(r.platform).push(r)
  }
  return [...map.entries()]
    .map(([platform, items]) => {
      const sorted = items.slice().sort((a, b) => a.date.localeCompare(b.date))
      return { platform, items: sorted, earliest: sorted[0].date }
    })
    .sort((a, b) => a.earliest.localeCompare(b.earliest))
}

function RegionToggle({ region, onChange }) {
  return (
    <div className="v5-toggle" role="group" aria-label="Region">
      {REGIONS.map((r) => {
        const active = r.code === region
        return (
          <button
            key={r.code}
            type="button"
            className={`v5-toggle-btn${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(r.code)}
          >
            {active && (
              <motion.span
                className="v5-toggle-pill"
                layoutId="v5-toggle-pill"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="v5-toggle-label">{r.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Explicit flex-basis so a group's row-share reflects its real item count.
// `.v5-grid`'s own `auto-fit` column count is ambiguous when measured
// intrinsically (no definite width to divide by), so flexbox would otherwise
// under-reserve space for content-heavy groups and squeeze them into a
// single column once laid out (R2 D7/D8).
const CARD_MAX = 190
const CARD_GAP = 24
function basisFor(count) {
  const cols = Math.min(count, 6)
  return cols * CARD_MAX + (cols - 1) * CARD_GAP
}

// Mount-time entrance only — never scroll-triggered. The shoot harness takes
// a single full-page screenshot 1200ms after network idle without actually
// scrolling the viewport, so a `whileInView` reveal would leave below-the-fold
// cards stuck at their initial (invisible) state in the capture. A plain
// initial->animate stagger on mount always finishes before that deadline.
// Cubic-bezier and the 30ms step are the shared vocabulary from the
// review-animations standards (strong ease-out; 30-80ms stagger floor).
const CARD_EASE = [0.23, 1, 0.32, 1]
const CARD_STAGGER_MS = 30
// Delay stops accumulating after the 10th card. Without this a 13-card IN
// region pushes the last card's delay to 360ms+300ms duration — still inside
// budget today, but the cap keeps it that way if the slate grows.
const CARD_STAGGER_CAP = 10

function ReleaseCard({ release, otherRegionName, order }) {
  const url = posterUrl(release)
  const isRange = Boolean(release.endDate)
  const label = TYPE_LABEL[release.type]
  const alsoElsewhere = CROSS_REGION_TITLES.has(release.title)
  const reduce = useReducedMotion()
  const delay = (reduce ? 0 : Math.min(order, CARD_STAGGER_CAP) * CARD_STAGGER_MS) / 1000

  return (
    <motion.figure
      className="v5-card"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.3, ease: CARD_EASE, delay }}
    >
      {url ? (
        <div className="v5-poster-frame">
          <img
            className="v5-poster"
            src={url}
            alt={`${release.title} poster`}
            width={342}
            height={513}
          />
        </div>
      ) : (
        <div
          className={`v5-fallback v5-tone-${toneFor(release.id)}`}
          role="img"
          aria-label={`${release.title} — artwork not available`}
        >
          <span className="v5-fallback-title">{release.title}</span>
        </div>
      )}
      <figcaption>
        <h3 className="v5-title">
          {release.title}
          {release.posterApprox && (
            <span className="v5-approx" title="Approximate artwork">
              {' '}(approx.)
            </span>
          )}
        </h3>
        <p className="v5-meta">
          <span className="v5-type">{label}</span>
          {release.language && <span className="v5-lang">{release.language}</span>}
          {isRange ? (
            <span className="v5-range">
              {fmtDate(release.date)}–{fmtDate(release.endDate)}
            </span>
          ) : (
            <time className="v5-date" dateTime={release.date}>
              {fmtDate(release.date)}
            </time>
          )}
        </p>
        {alsoElsewhere && (
          <p className="v5-cross-region">Also new in {otherRegionName}</p>
        )}
      </figcaption>
    </motion.figure>
  )
}

export default function V5() {
  const [region, setRegion] = useState('IN')
  const releases = useMemo(() => releasesForRegion(region), [region])
  const groups = useMemo(() => groupByPlatform(releases), [releases])
  // Chronological order across the whole page (releasesForRegion is already
  // date-sorted), reused as the entrance stagger index so cards animate in
  // roughly the same order the grid reads, not per-group from zero each time.
  const cardOrder = useMemo(
    () => new Map(releases.map((r, i) => [r.id, i])),
    [releases],
  )
  const range = useMemo(() => {
    const { min, max } = computeRange(releases)
    return formatRange(min, max)
  }, [releases])
  const otherRegionName = REGION_NAME[region === 'IN' ? 'US' : 'IN']

  return (
    <div className="v5-page">
      <div className="v5-shell">
        <header className="v5-head">
          <div className="v5-head-copy">
            <p className="v5-eyebrow">OTT release radar</p>
            <h1 className="v5-h1">What&rsquo;s new in {REGION_NAME[region]}</h1>
            <p className="v5-sub">
              {releases.length} new title{releases.length === 1 ? '' : 's'} across{' '}
              {groups.length} platform{groups.length === 1 ? '' : 's'} · {range}
            </p>
          </div>
          <RegionToggle region={region} onChange={setRegion} />
        </header>

        <main>
          {groups.map((group) => (
            <section
              className="v5-group"
              key={group.platform}
              style={{ flexBasis: `${basisFor(group.items.length)}px` }}
            >
              <header className="v5-group-header">
                <span
                  className="v5-group-dot"
                  style={{ background: PLATFORMS[group.platform].color }}
                  aria-hidden="true"
                />
                <h2>{PLATFORMS[group.platform].label}</h2>
                <span className="v5-group-count">
                  {group.items.length} title{group.items.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="v5-grid">
                {group.items.map((r) => (
                  <ReleaseCard
                    key={r.id}
                    release={r}
                    otherRegionName={otherRegionName}
                    order={cardOrder.get(r.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>

        <footer className="v5-foot">
          <p>Sources: FilmiBeat, myvi.in, FilmyChill, Boston.com. Poster art via TMDB.</p>
          <p>
            “(approx.)” marks approximate artwork. Titles without confirmed art show their name
            in place of a poster.
          </p>
        </footer>
      </div>
    </div>
  )
}
