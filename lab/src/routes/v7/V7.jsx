import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { forRegion, loadFeed, regionsIn } from '../../feed/index.js'
import { posterUrl } from '../../data/releases.js'
import {
  addDays,
  availability,
  formatFullDate,
  formatLongDay,
  formatMonth,
  formatWeekRange,
  formatWhen,
  groupByWeek,
  isoOf,
  monthGrid,
  resolveWeek,
  standingOf,
  weekStartIso,
} from './week.js'
import './v7.css'

const TYPE_LABEL = { movie: 'Movie', series: 'Series', sport: 'Live sport' }
const REGION_LABEL = { IN: 'India', US: 'United States' }

/* v0-v6 read `RELEASES` straight out of the data file. v7 goes through
   `src/feed/`, which validates every record before a route sees it — so the
   boundary a live source will land on is the one exercised on every page load,
   rather than a code path that only runs the day someone wires up TMDB.

   Read once at module scope: the snapshot is a static import, and re-validating
   22 rows on every render would be work with no cause. A network-backed source
   would move this behind state. */
const FEED = loadFeed()

/* The nav offers the regions the feed actually carries. Hardcoding both would
   render a United States button that opens an empty page the moment a source
   returns one region — the kind of control that looks fine in a screenshot and
   is broken the first time it is pressed. */
const REGIONS_PRESENT = regionsIn(FEED)
const REGION_OF = { IN: 'India', US: 'the United States' }
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* Three tonal panels, picked deterministically, so the eight titles with no
   artwork do not render as one repeated block. Greyscale only: the accent is
   spent on the schedule, never on decoration. */
function toneFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ['a', 'b', 'c'][Math.abs(hash) % 3]
}

/* ------------------------------------------------------------------ poster */

/* Two different absences, one designed surface. `poster: null` is a title the
   scrape never found artwork for — six of twenty-two. A load failure is a
   title whose artwork lives on a host this reader cannot reach, which is not
   hypothetical: image.tmdb.org is blocked on plenty of networks, and before
   this handler existed those cards rendered as a broken-image glyph.

   The failure state is held here, on the card, rather than inside the image:
   the caption has to know too. When the tile is carrying the title at display
   size, the caption repeating it underneath is not redundancy, it is two
   overlapping copies of the same words — which is exactly how round one
   rendered. */
function Card({ release, platforms }) {
  const src = posterUrl(release)
  const [failed, setFailed] = useState(false)
  const hasArt = Boolean(src) && !failed

  // A real href, not an onClick: the sheet is a URL (?release=id) for the
  // same reason the week and region are — linkable, testable, and the back
  // button closes it. The rest of the query string rides along.
  const [params] = useSearchParams()
  const open = new URLSearchParams(params)
  open.set('release', release.id)

  return (
    <article className="v7-card">
      <Link
        className={`v7-card__frame${hasArt ? '' : ' v7-card__frame--none'}`}
        to={`?${open}`}
        aria-label={`${release.title} — details`}
      >
        {hasArt ? (
          <>
            {/* No loading="lazy": the capture harness waits for network idle at
                a pre-expansion viewport, so anything below the fold captures
                blank. */}
            <img
              className="v7-poster"
              src={src}
              alt=""
              width="400"
              height="600"
              decoding="async"
              onError={() => setFailed(true)}
            />
            <div className="v7-card__meta">
              <h3 className="v7-card__name">
                {release.title}
                {release.posterApprox && <span className="v7-card__approx"> (approx. artwork)</span>}
              </h3>
              <p className="v7-card__when">
                <time dateTime={release.date}>{formatWhen(release)}</time>
              </p>
            </div>
          </>
        ) : (
          <div className={`v7-tile v7-tile--${toneFor(release.id)}`}>
            <h3 className="v7-tile__name">{release.title}</h3>
            <p className="v7-tile__when">
              <time dateTime={release.date}>{formatWhen(release)}</time>
            </p>
          </div>
        )}
      </Link>
      <p className="v7-card__tags">
        <span>{TYPE_LABEL[release.type]}</span>
        {release.language && <span>{release.language}</span>}
        <span>{platforms[release.platform].label}</span>
      </p>
    </article>
  )
}

/* -------------------------------------------------------------------- slate */

/* The reference lays every group out as a free-scrolling horizontal strip, and
   this page does not — the one structural thing it declines to copy.

   A strip is right for a browse surface: "In Theatres", "Upcoming", "Trailers"
   are open-ended categories where seeing the first four and scrubbing for more
   is the whole interaction. The featured week is not that. It is a closed set
   of eleven that the reader came here to read in full, and a strip showed three
   of them with eight behind a horizontal gesture nothing on the page announced.

   Copying a structure across without checking it against the data is the exact
   move v3 made with JustWatch's platform grouping, which cost this repo a whole
   verdict pass to find. The card craft, the palette and the type are the
   reference's. The container is the data's. */

/* Column count follows the group size rather than being fixed once: past the
   cap it avoids a trailing row of one, so an 11-title week runs 3+3+3+2 and
   never strands a single card on its own line. */
function colsFor(count, max) {
  if (count <= max) return count
  for (let c = max; c >= 2; c--) {
    if (count % c !== 1) return c
  }
  return max
}

/* colsFor's search can still fail: count % c === 1 for every c in [2, max]
   whenever count leaves remainder 1 against every candidate — e.g. at max 3,
   count ≡ 1 (mod 6), which a live weekly count will hit eventually (7, 13,
   19…). --cols is also forced independently at narrow viewports (v7.css),
   so whatever avoids the orphan has to hold at more than one column count —
   ruling out picking a different split per breakpoint. */
function isUnavoidableOrphan(count, cols) {
  return count > cols && count % cols === 1
}

function Slate({ items, platforms }) {
  const cols = colsFor(items.length, 3)
  const cornered = isUnavoidableOrphan(items.length, cols)

  return (
    <ul className="v7-slate__grid" style={{ '--cols': cols }}>
      {items.map((r, i) => (
        // The trailing card an unavoidable remainder leaves spans the row
        // instead of sitting in track 1 beside cols-1 empty ones — true at
        // any --cols value, so it holds whether the forced-narrow mobile
        // rule is in play or not.
        <li key={r.id} className={cornered && i === items.length - 1 ? 'v7-slate__grid-item--wide' : undefined}>
          <Card release={r} platforms={platforms} />
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ ticker */

/* Real titles, not a slogan. The track holds the list twice and translates
   -50%, so the loop is seamless; the duplicate is hidden from the reader that
   cannot see it, and the whole thing stops dead under reduced motion. */
function Ticker({ items }) {
  if (!items.length) return null
  const line = items.map((r) => r.title)
  return (
    <div className="v7-ticker">
      <p className="v7-ticker__sr">Landing this week: {line.join(', ')}.</p>
      <div className="v7-ticker__window" aria-hidden="true">
        <div className="v7-ticker__track">
          {[0, 1].map((copy) => (
            <ul className="v7-ticker__list" key={copy}>
              {line.map((title, i) => (
                <li key={`${copy}-${i}`}>{title}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- calendar */

function Calendar({ anchor, byDay, todayIso, onPick }) {
  const cells = useMemo(() => monthGrid(anchor), [anchor])
  return (
    <div className="v7-cal">
      <h3 className="v7-cal__month">{formatMonth(anchor)}</h3>
      <ol className="v7-cal__head" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <li key={d}>{d.slice(0, 1)}</li>
        ))}
      </ol>
      <ol className="v7-cal__grid">
        {cells.map(({ iso, outside }) => {
          const count = byDay.get(iso)?.length ?? 0
          const day = Number(iso.slice(8))
          const classes = [
            'v7-cal__cell',
            outside && 'v7-cal__cell--outside',
            iso === todayIso && 'v7-cal__cell--today',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <li key={iso} className={classes}>
              {count ? (
                <button
                  type="button"
                  className="v7-cal__hit"
                  onClick={() => onPick(iso)}
                  aria-label={`${formatLongDay(iso)} — ${count} title${count === 1 ? '' : 's'}`}
                >
                  {day}
                </button>
              ) : (
                <span className="v7-cal__num">{day}</span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="v7-cal__key">
        Marked days carry a release. Pick one to open the week it belongs to.
      </p>
    </div>
  )
}

/* --------------------------------------------------------------------- nav */

/* Filmhood's magnetic link and travelling pill, with two guards it does not
   need but this page does: the effect only arms on a real hover device, and it
   never arms under reduced motion. */
function Nav({ region, regions, onRegion }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const list = ref.current
    if (!list || !window.matchMedia('(hover: hover)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const item = e.target.closest('.v7-nav__item')
    if (!item) return
    const r = item.getBoundingClientRect()
    const lr = list.getBoundingClientRect()
    list.style.setProperty('--al', `${r.left - lr.left}px`)
    list.style.setProperty('--at', `${r.top - lr.top}px`)
    list.style.setProperty('--aw', `${r.width}px`)
    list.style.setProperty('--ah', `${r.height}px`)
    list.style.setProperty('--ao', '1')
    item.style.setProperty('--magnet-x', ((e.clientX - (r.left + r.width / 2)) / r.width).toFixed(3))
    item.style.setProperty('--magnet-y', ((e.clientY - (r.top + r.height / 2)) / r.height).toFixed(3))
  }

  const onLeave = () => {
    const list = ref.current
    if (!list) return
    list.style.setProperty('--ao', '0')
    list.querySelectorAll('.v7-nav__item').forEach((n) => {
      n.style.setProperty('--magnet-x', '0')
      n.style.setProperty('--magnet-y', '0')
    })
  }

  return (
    <header className="v7-nav">
      <a className="v7-nav__mark" href="#v7-top">
        Cheddy buddy&rsquo;s
      </a>
      <nav className="v7-nav__links" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
        <ul>
          {regions.map((code) => (
            <li className="v7-nav__item" key={code}>
              <button
                type="button"
                className="v7-nav__link"
                aria-pressed={region === code}
                onClick={() => onRegion(code)}
              >
                <span>{REGION_LABEL[code]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------- sheet */

/* The release sheet — filmhood's detail surface, sized to what this data can
   honestly say. No synopsis, no cast, no filler copy: the sheet answers the
   questions the data can answer in full — the exact date and whether it is
   watchable yet, the publishing week it belongs to, the platform, and the
   same title's release in the other region, which no card has room for.

   A native <dialog> for the same reason v6 used a native <select>: focus
   trapping, Escape, the top layer and focus restoration come free, and a
   hand-rolled overlay would have to earn each one back. */
/* The sheet's artwork: same two-absences contract as the card — no path and a
   failed load both land on the designed tile, at sheet size. */
function SheetArt({ release }) {
  const src = posterUrl(release)
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`v7-tile v7-tile--${toneFor(release.id)}`}>
        <span className="v7-tile__name">{release.title}</span>
      </div>
    )
  }
  return (
    <img
      className="v7-poster"
      src={src}
      alt=""
      width="400"
      height="600"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

function ReleaseSheet({ release, platforms, feed, todayIso, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (release && !dialog.open) dialog.showModal()
    if (!release && dialog.open) dialog.close()
  }, [release])

  if (!release) return null

  const platform = platforms[release.platform].label
  const weekOf = formatWeekRange(weekStartIso(release.date))
  const elsewhere = feed.releases.find(
    (r) => r.title === release.title && r.region !== release.region,
  )
  const tmdbHref = release.tmdbId
    ? `https://www.themoviedb.org/${release.type === 'movie' ? 'movie' : 'tv'}/${release.tmdbId}`
    : null

  return (
    <dialog
      className="v7-sheet"
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // a click on the backdrop is a click on the dialog element itself
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      aria-labelledby="v7-sheet-title"
    >
      <div className="v7-sheet__body">
        <div className="v7-sheet__art">
          <SheetArt key={release.id} release={release} />
        </div>
        <div className="v7-sheet__info">
          <p className="v7-sheet__standing">{availability(release, todayIso)}</p>
          <h2 className="v7-sheet__title" id="v7-sheet-title">
            {release.title}
          </h2>
          <dl className="v7-sheet__rows">
            <div>
              <dt>Date</dt>
              <dd>
                <time dateTime={release.date}>{formatFullDate(release.date)}</time>
              </dd>
            </div>
            <div>
              <dt>Week</dt>
              <dd>{weekOf}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{platform}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>
                {TYPE_LABEL[release.type]}
                {release.language ? ` · ${release.language}` : ''}
              </dd>
            </div>
            {elsewhere && (
              <div>
                <dt>{REGION_OF[elsewhere.region] === 'India' ? 'In India' : 'In the US'}</dt>
                <dd>
                  {platforms[elsewhere.platform].label} ·{' '}
                  <time dateTime={elsewhere.date}>{formatWhen(elsewhere)}</time>
                </dd>
              </div>
            )}
          </dl>
          {release.posterApprox && (
            <p className="v7-sheet__note">Artwork is a best-effort match, not official.</p>
          )}
          {tmdbHref && (
            <a className="v7-btn" href={tmdbHref} target="_blank" rel="noopener noreferrer">
              View on TMDB
            </a>
          )}
        </div>
      </div>
      <button
        type="button"
        className="v7-sheet__close"
        onClick={() => ref.current?.close()}
        aria-label="Close details"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>
  )
}

/* ------------------------------------------------------------------ notice */

function FeedNotice({ feed }) {
  const dropped = feed.rejected.length + feed.duplicates.length
  if (!dropped && !feed.derived.length) return null

  return (
    <details className="v7-notice">
      <summary>
        {dropped > 0
          ? `${dropped} record${dropped === 1 ? '' : 's'} from the feed could not be shown`
          : `${feed.derived.length} platform${feed.derived.length === 1 ? '' : 's'} in this feed are unrecognised`}
      </summary>
      <ul>
        {feed.rejected.map((r) => (
          <li key={`r-${r.index}`}>
            <b>{r.title || r.id || `record ${r.index}`}</b> — {r.reasons.join('; ')}
          </li>
        ))}
        {feed.duplicates.map((d) => (
          <li key={`d-${d.id}`}>
            <b>{d.title}</b> — duplicate id <code>{d.id}</code>, kept &ldquo;{d.keptTitle}&rdquo;
          </li>
        ))}
        {feed.derived.map((p) => (
          <li key={`p-${p.key}`}>
            <b>{p.label}</b> — platform not in the curated list, label derived from{' '}
            <code>{p.key}</code>
          </li>
        ))}
      </ul>
    </details>
  )
}

/* -------------------------------------------------------------------- page */

export default function V7() {
  const [params, setParams] = useSearchParams()
  const asked = params.get('region')
  const region = REGIONS_PRESENT.includes(asked) ? asked : (REGIONS_PRESENT[0] ?? 'IN')

  const releases = useMemo(() => forRegion(FEED, region), [region])
  const weeks = useMemo(() => groupByWeek(releases), [releases])
  const todayIso = useMemo(() => isoOf(new Date()), [])
  const currentStart = weekStartIso(todayIso)

  const week = resolveWeek(weeks, todayIso, params.get('week'))
  const standing = standingOf(week.start, currentStart)

  const byDay = useMemo(() => {
    const map = new Map()
    for (const r of releases) {
      /* A fixture that runs a week is on the calendar every day it runs, or
         the month reads as though the sport happened once. */
      const last = r.endDate ?? r.date
      for (let d = r.date; d <= last; d = addDays(d, 1)) {
        if (!map.has(d)) map.set(d, [])
        map.get(d).push(r)
      }
    }
    return map
  }, [releases])

  const setParam = (key, value, { replace = false } = {}) => {
    const next = new URLSearchParams(params)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace })
  }

  /* The open release sheet, driven by the URL like the week and the region.
     An id the feed does not carry opens nothing — the page itself is the
     fallback surface. Closing replaces history rather than pushing, so Back
     from a closed sheet leaves the page, not reopens the sheet. */
  const openRelease = FEED.releases.find((r) => r.id === params.get('release')) ?? null

  /* The next run that actually carries titles — not simply today + 7. A week
     with nothing in it is not a run worth pointing at. */
  const nextRun = weeks.find((w) => w.start > week.start)
  const peak = Math.max(...weeks.map((w) => w.items.length), 1)
  const platformCount = new Set(week.items.map((r) => r.platform)).size

  return (
    <div className="v7-page" id="v7-top">
      <Nav region={region} regions={REGIONS_PRESENT} onRegion={(code) => setParam('region', code)} />

      <ReleaseSheet
        release={openRelease}
        platforms={FEED.platforms}
        feed={FEED}
        todayIso={todayIso}
        onClose={() => setParam('release', null, { replace: true })}
      />

      <section className="v7-hero">
        <h1 className="v7-hero__title">Em chustunnaru e vaaram?</h1>
        <p className="v7-hero__sub">Every OTT drop worth a group chat message.</p>
        <Ticker items={week.items} />
      </section>

      <main>
        <section className="v7-section v7-section--split">
          <div className="v7-slate">
            <div className="v7-head">
              <h2 className="v7-head__label" id="v7-week">
                {standing === 'this week' ? 'Ee vaaram' : formatWeekRange(week.start)}
              </h2>
              <p className="v7-head__note">
                {week.items.length === 0
                  ? `Waste week — nothing dropped in ${REGION_OF[region]}`
                  : `${week.items.length} title${week.items.length === 1 ? '' : 's'} · ${platformCount} platform${platformCount === 1 ? '' : 's'} · ${week.range}`}
                {standing !== 'this week' && week.items.length > 0 && (
                  <span className="v7-flag"> {standing}</span>
                )}
              </p>
            </div>

            {/* A partial feed is a designed state, not a console warning. If
                records were dropped at the boundary the page says so where the
                list is, because the alternative is a reader counting eleven
                titles on a week that had thirteen and having no way to know.
                Collapsed by default: the reasons are for whoever maintains the
                source, the count is for everyone. */}
            <FeedNotice feed={FEED} />

            {week.items.length > 0 ? (
              <Slate items={week.items} platforms={FEED.platforms} />
            ) : (
              /* A designed surface, not an edge case. It names the week that
                 is empty, says which catalog it checked, and hands back the
                 nearest week that is not — an empty page that cannot be left
                 is the actual defect. */
              <div className="v7-empty">
                <p className="v7-empty__lead">
                  Full waste — nothing landed in {REGION_OF[region]} the week of{' '}
                  {formatWeekRange(week.start)}.
                </p>
                {nextRun ? (
                  <button
                    type="button"
                    className="v7-btn"
                    onClick={() => setParam('week', nextRun.start)}
                  >
                    Next week with releases — {formatWeekRange(nextRun.start)}
                  </button>
                ) : (
                  <button type="button" className="v7-btn" onClick={() => setParam('week', null)}>
                    Back to ee vaaram
                  </button>
                )}
              </div>
            )}
          </div>

          <Calendar
            anchor={week.start}
            byDay={byDay}
            todayIso={todayIso}
            onPick={(iso) => setParam('week', iso)}
          />
        </section>

        <section className="v7-section">
          <div className="v7-head">
            <h2 className="v7-head__label">Every week on record</h2>
            <p className="v7-head__note">
              {weeks.length} week{weeks.length === 1 ? '' : 's'} in the {REGION_OF[region]} catalog,
              newest first. The bar is that week&rsquo;s share of the busiest one — the run is
              uneven, which is the whole reason it is grouped by week and not by day.
            </p>
          </div>
          <ol className="v7-weeks">
            {[...weeks].reverse().map((w) => (
              <li key={w.start}>
                <button
                  type="button"
                  className={`v7-week${w.start === week.start ? ' v7-week--on' : ''}`}
                  aria-current={w.start === week.start ? 'true' : undefined}
                  onClick={() => setParam('week', w.start)}
                >
                  <span className="v7-week__range">{w.range}</span>
                  <span className="v7-week__standing">{standingOf(w.start, currentStart)}</span>
                  {/* The shape of the run lives on the list rather than in a
                      chart of its own. Three weeks running 1, 11, 1 make a
                      240px section that is 90% empty and reads as broken; the
                      same three numbers as bars against the rows they belong to
                      are legible at a glance and cost no extra surface. */}
                  <span className="v7-week__bar" aria-hidden="true">
                    <span style={{ '--w': `${(w.items.length / peak) * 100}%` }} />
                  </span>
                  <span className="v7-week__count">
                    {w.items.length} title{w.items.length === 1 ? '' : 's'}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>


        {/* The one inverted block. Three thousand pixels of dark listings
            resolve into a single bright object, and the lead poster breaks the
            boundary so it reads as a thing sitting on the page rather than a
            section with a different background. */}
        {nextRun && (
        <section className="v7-next">
          <div className="v7-next__inner">
            <div className="v7-next__art">
              <Card release={nextRun.items[0]} platforms={FEED.platforms} />
            </div>
            <div className="v7-next__copy">
              {/* Eyebrow and date are one heading, not a stray <p> above an
                  <h2> that reads as a bare date in the outline. */}
              <h2 className="v7-next__head">
                <span className="v7-next__eyebrow">Next run</span>
                <span className="v7-next__date">{formatWeekRange(nextRun.start)}</span>
              </h2>
              <ul className="v7-next__list">
                {nextRun.items.map((r) => (
                  <li key={r.id}>
                    <span className="v7-next__name">{r.title}</span>
                    <span className="v7-next__when">{formatWhen(r)}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="v7-btn v7-btn--ink"
                onClick={() => setParam('week', nextRun.start)}
              >
                Open that week
              </button>
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  )
}
