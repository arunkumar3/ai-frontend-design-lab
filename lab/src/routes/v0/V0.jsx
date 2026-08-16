import { useMemo, useState } from 'react'
import { REGIONS, releasesForRegion } from '../../lib/regions.js'
import { PLATFORMS, posterUrl } from '../../data/releases.js'

const TYPE_LABELS = {
  series: 'Series',
  movie: 'Movie',
  sport: 'Sport',
}

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateRange(release) {
  if (!release.endDate) return formatShortDate(release.date)
  return `${formatShortDate(release.date)} – ${formatShortDate(release.endDate)}`
}

function initials(title) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function RegionToggle({ region, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Region"
      className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {REGIONS.map((r) => {
        const active = r.code === region
        return (
          <button
            key={r.code}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r.code)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}

function PlatformBadge({ platformKey }) {
  const platform = PLATFORMS[platformKey]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: platform?.color ?? '#737373' }}
      />
      {platform?.label ?? platformKey}
    </span>
  )
}

function PosterFallback({ title, platformKey }) {
  const color = PLATFORMS[platformKey]?.color ?? '#525252'
  return (
    <div
      className="flex aspect-2/3 w-full items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <span className="text-3xl font-bold text-white drop-shadow-sm">{initials(title)}</span>
    </div>
  )
}

function ReleaseCard({ release, isToday }) {
  const [imgFailed, setImgFailed] = useState(false)
  const src = posterUrl(release)
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative">
        {src && !imgFailed ? (
          <img
            src={src}
            alt={`${release.title} poster`}
            onError={() => setImgFailed(true)}
            className="aspect-2/3 w-full object-cover"
          />
        ) : (
          <PosterFallback title={release.title} platformKey={release.platform} />
        )}
        {isToday && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow dark:bg-neutral-950/90 dark:text-white">
            New today
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
          {release.title}
        </h3>
        <div>
          <PlatformBadge platformKey={release.platform} />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{TYPE_LABELS[release.type] ?? release.type}</span>
          {release.language && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{release.language}</span>
            </>
          )}
          <span aria-hidden="true">&middot;</span>
          <span>{formatDateRange(release)}</span>
        </div>
      </div>
    </article>
  )
}

export default function V0() {
  const [region, setRegion] = useState(REGIONS[0].code)
  const releases = useMemo(() => releasesForRegion(region), [region])
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const groups = useMemo(() => {
    const map = new Map()
    for (const release of releases) {
      if (!map.has(release.date)) map.set(release.date, [])
      map.get(release.date).push(release)
    }
    return [...map.entries()]
  }, [releases])

  const regionLabel = REGIONS.find((r) => r.code === region)?.label ?? region

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              This week on streaming
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
              New OTT Releases
            </h1>
          </div>
          <RegionToggle region={region} onChange={setRegion} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          {releases.length} title{releases.length === 1 ? '' : 's'} releasing in {regionLabel} this
          week
        </p>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No releases found for {regionLabel} this week.
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map(([date, items]) => (
              <section key={date}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {formatDate(date)}
                </h2>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {items.map((release) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      isToday={release.date === today}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200 py-8 dark:border-neutral-800">
        <p className="mx-auto max-w-6xl px-6 text-xs text-neutral-400 dark:text-neutral-600">
          Release dates are best-effort and may shift closer to launch.
        </p>
      </footer>
    </div>
  )
}
