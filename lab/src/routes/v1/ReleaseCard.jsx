import { PLATFORMS, posterUrl } from '../../data/releases.js'

const TYPE_LABEL = {
  series: 'Series',
  movie: 'Film',
  sport: 'Live sport',
}

function initials(title) {
  return title.trim().charAt(0).toUpperCase()
}

export default function ReleaseCard({ release, isNewToday }) {
  const platform = PLATFORMS[release.platform] ?? { label: release.platform, color: '#8E8E93' }
  const src = posterUrl(release)

  return (
    <article
      className="v1-card flex w-40 shrink-0 flex-col gap-2.5 rounded-lg border p-2 sm:w-44"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md" style={{ background: 'var(--surface-sunken)' }}>
        {src ? (
          <img
            src={src}
            alt={`${release.title} artwork`}
            className="h-full w-full object-cover"
            width={500}
            height={750}
          />
        ) : (
          <div
            className="v1-fallback flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
            style={{ '--fallback-tint': `${platform.color}33`, '--fallback-wash': `${platform.color}14` }}
          >
            <span
              className="v1-text-display"
              style={{ color: platform.color, fontFamily: 'var(--font-display)' }}
              aria-hidden="true"
            >
              {initials(release.title)}
            </span>
            <span className="v1-text-caption font-medium uppercase" style={{ color: 'var(--ink-faint)' }}>
              No artwork yet
            </span>
          </div>
        )}

        {isNewToday && (
          <span
            className="v1-text-caption absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 font-semibold uppercase"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            Today
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="v1-text-heading font-semibold" style={{ color: 'var(--ink)' }}>
          {release.title}
        </h3>

        <div className="v1-text-body flex items-center gap-1.5" style={{ color: 'var(--ink-soft)' }}>
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: platform.color }} aria-hidden="true" />
          <span className="truncate">{platform.label}</span>
        </div>

        <div className="v1-text-caption mt-auto flex flex-wrap items-center gap-x-1.5 uppercase" style={{ color: 'var(--ink-faint)' }}>
          <span>{TYPE_LABEL[release.type] ?? release.type}</span>
          {release.language && (
            <>
              <span aria-hidden="true">·</span>
              <span>{release.language}</span>
            </>
          )}
        </div>
        {release.posterApprox && (
          <span className="v1-text-caption italic normal-case" style={{ color: 'var(--ink-faint)' }}>
            Artwork approximate
          </span>
        )}
      </div>
    </article>
  )
}
