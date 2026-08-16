import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { REGIONS, releasesForRegion } from '../../lib/regions.js'
import { PLATFORMS, posterUrl } from '../../data/releases.js'
import './v3.css'

const TYPE_LABEL = { movie: 'Movie', series: 'Series', sport: 'Live sport' }

// India first: it carries the larger slate this week (13 vs 9) and is the
// default a returning visitor from the IN catalog would expect.
const REGION_NAME = { IN: 'India', US: 'the United States' }

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function fmtDate(iso) {
  return dateFmt.format(new Date(`${iso}T00:00:00`))
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
    <div className="v3-toggle" role="group" aria-label="Region">
      {REGIONS.map((r) => {
        const active = r.code === region
        return (
          <button
            key={r.code}
            type="button"
            className={`v3-toggle-btn${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(r.code)}
          >
            {active && (
              <motion.span
                className="v3-toggle-pill"
                layoutId="v3-toggle-pill"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="v3-toggle-label">{r.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function ReleaseCard({ release }) {
  const url = posterUrl(release)
  const isRange = Boolean(release.endDate)
  const label = TYPE_LABEL[release.type]

  return (
    <figure className="v3-card">
      {url ? (
        <img
          className="v3-poster"
          src={url}
          alt={`${release.title} poster`}
          width={342}
          height={513}
        />
      ) : (
        <div
          className={`v3-fallback v3-tone-${toneFor(release.id)}`}
          role="img"
          aria-label={`${release.title} — artwork not available`}
        >
          <span className="v3-fallback-title">{release.title}</span>
        </div>
      )}
      <figcaption>
        <h3 className="v3-title">
          {release.title}
          {release.posterApprox && (
            <span className="v3-approx" title="Approximate artwork">
              {' '}~
            </span>
          )}
        </h3>
        <p className="v3-meta">
          <span className="v3-type">{label}</span>
          {release.language && <span className="v3-lang">{release.language}</span>}
          {isRange ? (
            <span className="v3-range">
              {fmtDate(release.date)}–{fmtDate(release.endDate)}
            </span>
          ) : (
            <time className="v3-date" dateTime={release.date}>
              {fmtDate(release.date)}
            </time>
          )}
        </p>
      </figcaption>
    </figure>
  )
}

export default function V3() {
  const [region, setRegion] = useState('IN')
  const releases = useMemo(() => releasesForRegion(region), [region])
  const groups = useMemo(() => groupByPlatform(releases), [releases])

  return (
    <div className="v3-page">
      <div className="v3-shell">
        <header className="v3-head">
          <div className="v3-head-copy">
            <p className="v3-eyebrow">OTT release radar</p>
            <h1 className="v3-h1">This week in {REGION_NAME[region]}</h1>
            <p className="v3-sub">
              {releases.length} new title{releases.length === 1 ? '' : 's'} across{' '}
              {groups.length} platform{groups.length === 1 ? '' : 's'} · Aug 15–21, 2026
            </p>
          </div>
          <RegionToggle region={region} onChange={setRegion} />
        </header>

        <main>
          {groups.map((group) => (
            <section className="v3-group" key={group.platform}>
              <header className="v3-group-header">
                <span
                  className="v3-group-dot"
                  style={{ background: PLATFORMS[group.platform].color }}
                  aria-hidden="true"
                />
                <h2>{PLATFORMS[group.platform].label}</h2>
                <span className="v3-group-count">
                  {group.items.length} title{group.items.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="v3-grid">
                {group.items.map((r) => (
                  <ReleaseCard key={r.id} release={r} />
                ))}
              </div>
            </section>
          ))}
        </main>

        <footer className="v3-foot">
          <p>Sources: FilmiBeat, myvi.in, FilmyChill, Boston.com. Poster art via TMDB.</p>
          <p>
            “~” marks approximate artwork. Titles without confirmed art show their name in
            place of a poster.
          </p>
        </footer>
      </div>
    </div>
  )
}
