import { useMemo, useState } from 'react'
import { REGIONS, releasesForRegion } from '../../lib/regions.js'
import { PLATFORMS, posterUrl } from '../../data/releases.js'
import './theme.css'

const DATE_FMT = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const SHORT_DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function formatDate(iso) {
  return DATE_FMT.format(new Date(`${iso}T00:00:00`))
}

function formatRange(startIso, endIso) {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  return `${SHORT_DATE_FMT.format(start)} – ${SHORT_DATE_FMT.format(end)}`
}

function groupByDate(releases) {
  const groups = []
  for (const release of releases) {
    const last = groups[groups.length - 1]
    if (last && last.date === release.date) {
      last.items.push(release)
    } else {
      groups.push({ date: release.date, items: [release] })
    }
  }
  return groups
}

function Card({ release, index, featured }) {
  const src = posterUrl(release)
  const platform = PLATFORMS[release.platform]

  return (
    <article className="v2-card" data-featured={featured} style={{ '--i': index }}>
      <div className="v2-card-media">
        {src ? (
          <img src={src} alt={`${release.title} artwork`} />
        ) : (
          <div className="v2-card-fallback">{release.title}</div>
        )}
        {platform && (
          <span className="v2-card-badge">
            <span className="v2-badge-dot" style={{ '--platform-color': platform.color }} />
            {platform.label}
          </span>
        )}
      </div>
      <h3 className="v2-card-title">{release.title}</h3>
      <div className="v2-card-meta">
        {release.type === 'sport' && release.endDate ? (
          <span className="v2-tag" data-type="sport">
            {formatRange(release.date, release.endDate)}
          </span>
        ) : (
          <span className="v2-tag">{release.type}</span>
        )}
        {release.language && <span>{release.language}</span>}
      </div>
    </article>
  )
}

export default function V2() {
  const [regionCode, setRegionCode] = useState('IN')
  const region = REGIONS.find((r) => r.code === regionCode)
  const releases = useMemo(() => releasesForRegion(regionCode), [regionCode])
  const groups = useMemo(() => groupByDate(releases), [releases])

  return (
    <div className="v2-page">
      <div className="v2-container">
        <header className="v2-header">
          <div>
            <p className="v2-eyebrow">This week&rsquo;s new releases</p>
            <h1 className="v2-title">What&rsquo;s dropping{region ? `, ${region.label}` : ''}</h1>
            <p className="v2-subtitle">
              {releases.length} title{releases.length === 1 ? '' : 's'} landing across streaming and sport this
              week — series, films, and live coverage, sorted by release date.
            </p>
          </div>
          <div className="v2-toggle" data-region={regionCode} role="group" aria-label="Region">
            <div className="v2-toggle-thumb" aria-hidden="true" />
            {REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                className="v2-toggle-btn"
                data-active={r.code === regionCode}
                aria-pressed={r.code === regionCode}
                onClick={() => setRegionCode(r.code)}
              >
                {r.code}
              </button>
            ))}
          </div>
        </header>

        {groups.map((group, groupIndex) => (
          <section className="v2-group" key={group.date}>
            <div className="v2-group-header">
              <h2 className="v2-group-date">{formatDate(group.date)}</h2>
              <span className="v2-group-count">
                {group.items.length} title{group.items.length === 1 ? '' : 's'}
              </span>
              <div className="v2-group-rule" aria-hidden="true" />
            </div>
            <div className="v2-grid">
              {group.items.map((release, itemIndex) => (
                <Card
                  key={release.id}
                  release={release}
                  index={itemIndex}
                  featured={groupIndex === 0 && itemIndex === 0}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
