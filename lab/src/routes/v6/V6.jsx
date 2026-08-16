import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { REGIONS, releasesForRegion, titlesInBothRegions } from '../../lib/regions.js'
import { PLATFORMS, posterUrl } from '../../data/releases.js'
import './v6.css'

const TYPE_LABEL = { movie: 'Movie', series: 'Series', sport: 'Live sport' }

// India first: it carries the larger slate this week (13 vs 9) and is the
// default a returning visitor from the IN catalog would expect.
const REGION_NAME = { IN: 'India', US: 'the United States' }
// Short form for the card badge: "Also new in the United States" wrapped to
// three lines in a 200px column and dominated the caption it belongs to.
const REGION_SHORT = { IN: 'India', US: 'the US' }

// A handful of titles (Reacher S4, Lanterns) release in both catalogs on
// different platforms and dates. Toggling the region and landing on the same
// poster again reads as a bug unless the card says why. Computed once: the
// RELEASES table is static.
const CROSS_REGION_TITLES = new Set(titlesInBothRegions())

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const dayFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric' })
const yearFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric' })
const fullDayFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
// Day-first on every schedule entry — ruler, card and header summary all read
// "15 Aug", never a mix of orders on one page.
const entryFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const entryNoMonthFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
})
const weekdayShortFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const weekdayNarrowFmt = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' })

const asDate = (iso) => new Date(`${iso}T00:00:00`)

const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// The ruler groups by week, so the exact day still has to live on the card:
// inside an 11-title week, "what drops when" has to be legible per title or
// the chronology is only visible in aggregate.
function formatWhen(release) {
  const start = asDate(release.date)
  if (!release.endDate) return entryFmt.format(start)
  const end = asDate(release.endDate)
  // Drop the repeated month from the opening half of a within-month range:
  // "Sat 15 – Fri 21 Aug", not "Sat 15 Aug – Fri 21 Aug".
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const head = sameMonth ? entryNoMonthFmt.format(start) : entryFmt.format(start)
  return `${head} – ${entryFmt.format(end)}`
}

// Deterministic 3-way tone pick so six fallback panels don't render as one
// repeated block — quiet variation, still inside the canvas's own tonal
// family.
function toneFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ['a', 'b', 'c'][Math.abs(hash) % 3]
}

// Chronology is the organising axis (v0–v2 had it; v3 traded it for
// JustWatch's platform grouping and v4/v5 inherited the trade), and the unit
// is the publishing week: this page is generated once a week, on a Thursday,
// for that week. Platform demotes to card metadata — where it still appears on
// every card, and in the header count — rather than being deleted outright.
//
// Thursday, not Monday: weeks are anchored to the run day so a title released
// the morning of a run lands in the week that run publishes, instead of at the
// tail of the week already gone out.
const RUN_DAY = 4 // Intl day index, Sun = 0

function weekStart(iso) {
  const d = asDate(iso)
  d.setDate(d.getDate() - ((d.getDay() - RUN_DAY + 7) % 7))
  return d
}

// Compact week range: "13–19 Aug 2026", or "30 Jul – 5 Aug 2026" when the week
// straddles a month.
function formatWeekRange(from, to) {
  const year = yearFmt.format(to)
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  return sameMonth
    ? `${dayFmt.format(from)}–${dateFmt.format(to)} ${year}`
    : `${dateFmt.format(from)} – ${dateFmt.format(to)} ${year}`
}

// The seven cells of the ruler. Built for every week including the quiet ones,
// because a day with nothing on it is a fact about the week and the ruler is
// the only place that fact can be seen.
function daysOf(from, items) {
  const counts = new Map()
  for (const r of items) counts.set(r.date, (counts.get(r.date) ?? 0) + 1)
  return Array.from({ length: 7 }, (_, i) => {
    const d = asDate(isoOf(from))
    d.setDate(d.getDate() + i)
    const iso = isoOf(d)
    return {
      iso,
      full: weekdayShortFmt.format(d),
      min: weekdayNarrowFmt.format(d),
      num: dayFmt.format(d),
      long: fullDayFmt.format(d),
      count: counts.get(iso) ?? 0,
    }
  })
}

// Every publishing week from the first that carries a title to the last —
// including the weeks where nothing landed. An archive that lists only the
// weeks with releases reads as a feed with holes punched in it, and it hides
// the quiet weeks that a weekly run genuinely has. It also makes the empty
// state a surface a reader can reach rather than a branch nothing renders.
//
// `releasesForRegion` is already date-sorted, so each week keeps its own
// items in date order.
function buildWeeks(releases) {
  const byWeek = new Map()
  for (const r of releases) {
    const key = isoOf(weekStart(r.date))
    if (!byWeek.has(key)) byWeek.set(key, [])
    byWeek.get(key).push(r)
  }
  const keys = [...byWeek.keys()].sort()
  if (!keys.length) return []

  const weeks = []
  const cursor = asDate(keys[0])
  const last = keys[keys.length - 1]
  while (isoOf(cursor) <= last) {
    const start = isoOf(cursor)
    const from = asDate(start)
    const to = asDate(start)
    to.setDate(to.getDate() + 6)
    const items = byWeek.get(start) ?? []
    weeks.push({
      start,
      items,
      days: daysOf(from, items),
      range: formatWeekRange(from, to),
      label: `Week of ${fullDayFmt.format(from)} to ${fullDayFmt.format(to)}`,
    })
    cursor.setDate(cursor.getDate() + 7)
  }
  return weeks
}

// Which week the page opens on. The run is weekly, so the landing view is the
// current week — resolved against the clock, not against the end of the table,
// because this data set is frozen and will age. Landing is chosen from the
// weeks that have titles: an archive week with nothing in it is a legitimate
// destination a reader can pick, but never one to open on.
function pickDefaultWeek(weeks, todayIso) {
  const filled = weeks.filter((w) => w.items.length)
  if (!filled.length) return weeks[0]
  const current = isoOf(weekStart(todayIso))
  const exact = filled.find((w) => w.start === current)
  if (exact) return exact
  const past = filled.filter((w) => w.start < current)
  return past.length ? past[past.length - 1] : filled[0]
}

// Nearest week that has something in it, measured in weeks either side. Backs
// the empty state's one control, so a quiet week is a step away from a full
// one rather than a dead end.
function nearestFilled(weeks, start) {
  const filled = weeks.filter((w) => w.items.length)
  if (!filled.length) return null
  const at = asDate(start).getTime()
  return filled.reduce((best, w) => {
    const d = Math.abs(asDate(w.start).getTime() - at)
    const bd = Math.abs(asDate(best.start).getTime() - at)
    // Ties break backwards: "the last week that had something" is the more
    // useful of two equidistant answers on a feed you read in arrears.
    return d < bd || (d === bd && w.start < best.start) ? w : best
  })
}

// One column per title, capped at what fits at full card width. Past the cap
// the column count avoids a trailing row of one: a 7-title week runs 5+2, and
// an 11-title week drops to 4+4+3 rather than 5+5+1.
const MAX_COLS = 5
const MIN_WRAP_COLS = 3

function colsFor(count) {
  if (count <= MAX_COLS) return count
  for (let c = MAX_COLS; c >= MIN_WRAP_COLS; c--) {
    if (count % c !== 1) return c
  }
  return MAX_COLS
}

// A frozen feed can carry dates on either side of today, so a week is named by
// where it sits relative to the run, not assumed to be past.
function weekStanding(start, currentStart) {
  if (start === currentStart) return 'this week'
  return start > currentStart ? 'upcoming' : 'archive'
}

function countPlatforms(releases) {
  return new Set(releases.map((r) => r.platform)).size
}

function RegionToggle({ region, onChange }) {
  return (
    <div className="v6-toggle" role="group" aria-label="Region">
      {REGIONS.map((r) => {
        const active = r.code === region
        return (
          <button
            key={r.code}
            type="button"
            className={`v6-toggle-btn${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(r.code)}
          >
            {active && (
              <motion.span
                className="v6-toggle-pill"
                layoutId="v6-toggle-pill"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span className="v6-toggle-label">{r.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// A native select, deliberately. An archive picker is a plain one-of-many
// choice, and the native control brings keyboard support, type-ahead, and the
// platform's own touch picker for free — none of which a hand-rolled listbox
// gets without focus management, escape handling and click-outside logic.
// Styled to the page rather than replaced by it.
function WeekPicker({ weeks, value, currentStart, onChange }) {
  return (
    <div className="v6-weekpick">
      <label className="v6-weekpick-label" htmlFor="v6-week">
        Week
      </label>
      <div className="v6-weekpick-field">
        <select
          id="v6-week"
          className="v6-weekpick-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {/* Newest first: the archive is browsed backwards from now. */}
          {weeks
            .slice()
            .reverse()
            .map((w) => (
              <option key={w.start} value={w.start}>
                {w.range} · {weekStanding(w.start, currentStart)} ·{' '}
                {w.items.length ? plural(w.items.length, 'title') : 'no titles'}
              </option>
            ))}
        </select>
        <span className="v6-weekpick-arrow" aria-hidden="true" />
      </div>
    </div>
  )
}

// Mount-time entrance only — never scroll-triggered. The shoot harness takes a
// single full-page screenshot 1200ms after network idle without scrolling, so
// a `whileInView` reveal would leave below-the-fold cards captured at their
// initial (invisible) state.
const CARD_EASE = [0.23, 1, 0.32, 1]
const CARD_STAGGER_MS = 30
const CARD_STAGGER_CAP = 10
// The ruler draws first and the cards follow it, so the load reads as one
// movement across the week rather than as two unrelated effects.
const TICK_STAGGER_MS = 22
const RULER_LEAD_MS = 120

// The week's shape: seven days, each carrying its own load as countable marks.
// This is the only place the distribution is visible — the grid can show that
// eleven titles landed, but not that five of them landed on the Saturday.
function WeekRuler({ week, todayIso }) {
  const reduce = useReducedMotion()
  let tickIndex = 0

  return (
    <ol className="v6-ruler" aria-label={`Titles per day — ${week.label}`}>
      {week.days.map((d) => {
        const isToday = d.iso === todayIso
        return (
          <li
            key={d.iso}
            className={`v6-day${d.count ? ' has-titles' : ''}${isToday ? ' is-today' : ''}`}
          >
            <span className="v6-sr">
              {d.long}
              {isToday ? ' (today)' : ''} — {d.count ? plural(d.count, 'title') : 'nothing lands'}
            </span>
            <span className="v6-day-name" aria-hidden="true">
              <span className="v6-day-name-full">{d.full}</span>
              <span className="v6-day-name-min">{d.min}</span>
            </span>
            <time className="v6-day-num" dateTime={d.iso} aria-hidden="true">
              {d.num}
            </time>
            <span className="v6-day-load" aria-hidden="true">
              {d.count === 0 ? (
                <span className="v6-tick is-empty" />
              ) : (
                Array.from({ length: d.count }, (_, i) => {
                  const delay = reduce ? 0 : (tickIndex++ * TICK_STAGGER_MS) / 1000
                  return (
                    <motion.span
                      key={i}
                      className="v6-tick"
                      initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: reduce ? 0.2 : 0.28, ease: CARD_EASE, delay }}
                    />
                  )
                })
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ReleaseCard({ release, otherRegionName, order }) {
  // Two different absences, one designed surface. `poster: null` is a title we
  // have no artwork for; a URL that fails is artwork the CDN did not return.
  // Without the second branch a dead poster URL renders as the browser's own
  // broken-image box with the alt text beside it — the undesigned edge case
  // the constitution rules out, and one a live feed will hit constantly.
  const [artworkFailed, setArtworkFailed] = useState(false)
  const url = artworkFailed ? null : posterUrl(release)
  const label = TYPE_LABEL[release.type]
  const platform = PLATFORMS[release.platform].label
  const alsoElsewhere = CROSS_REGION_TITLES.has(release.title)
  const reduce = useReducedMotion()
  const delay = reduce
    ? 0
    : (RULER_LEAD_MS + Math.min(order, CARD_STAGGER_CAP) * CARD_STAGGER_MS) / 1000

  return (
    <motion.figure
      className="v6-card"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.3, ease: CARD_EASE, delay }}
    >
      {url ? (
        <div className="v6-poster-frame">
          <img
            className="v6-poster"
            src={url}
            alt={`${release.title} poster`}
            width={342}
            height={513}
            onError={() => setArtworkFailed(true)}
          />
        </div>
      ) : (
        <div
          className={`v6-fallback v6-tone-${toneFor(release.id)}`}
          role="img"
          aria-label={`${release.title} — artwork not available`}
        >
          <span className="v6-fallback-flag" aria-hidden="true">
            {artworkFailed ? 'Artwork unavailable' : 'No artwork'}
          </span>
          <span className="v6-fallback-title">{release.title}</span>
        </div>
      )}
      <figcaption>
        {/* h3 under the week's h2, which is under the page h1. Removing the
            week heading is what broke this outline once already: it was the
            page's only h2, and its absence left h1 → h3. */}
        <h3 className="v6-title">
          {release.title}
          {release.posterApprox && (
            <span className="v6-approx" title="Approximate artwork">
              {' '}(approx.)
            </span>
          )}
        </h3>
        {/* The ruler answers "when" for the week; this answers it for the
            title. Ranges read as ranges: the two sport fixtures run 15–21 Aug,
            not on one day. */}
        <p className="v6-when">
          <time dateTime={release.date}>{formatWhen(release)}</time>
        </p>
        <p className="v6-meta">
          <span className="v6-type">{label}</span>
          {release.language && <span className="v6-lang">{release.language}</span>}
          <span className="v6-platform">{platform}</span>
        </p>
        {alsoElsewhere && <p className="v6-cross-region">Also new in {otherRegionName}</p>}
      </figcaption>
    </motion.figure>
  )
}

// A quiet week states what happened, in the tense the week is in, and offers
// the nearest week that has something. No apology, no shrug illustration.
function EmptyWeek({ regionName, range, upcoming, nearest, onJump }) {
  return (
    <div className="v6-empty">
      <p className="v6-empty-lead">
        {upcoming
          ? `Nothing is scheduled in ${regionName} for ${range}.`
          : `Nothing landed in ${regionName} in ${range}.`}
      </p>
      <p className="v6-empty-note">
        The run publishes every Thursday, whether or not the week has titles. The seven days
        above are that week.
      </p>
      {nearest && (
        <button type="button" className="v6-empty-jump" onClick={() => onJump(nearest.start)}>
          Show {nearest.range} · {plural(nearest.items.length, 'title')}
        </button>
      )}
    </div>
  )
}

export default function V6() {
  const [region, setRegion] = useState('IN')
  // Which week the reader has chosen, or null while they are still on the
  // landing view. Kept as the week's own start date rather than an index so it
  // survives a region switch.
  const [chosenWeek, setChosenWeek] = useState(null)

  const releases = useMemo(() => releasesForRegion(region), [region])
  const weeks = useMemo(() => buildWeeks(releases), [releases])
  const todayIso = useMemo(() => isoOf(new Date()), [])
  const currentStart = useMemo(() => isoOf(weekStart(todayIso)), [todayIso])

  // Derived, not synchronised: the two regions run over different spans, so a
  // week chosen under one may fall outside the other's run. Falling back here
  // means no effect has to race the render to correct the selection. Inside
  // both runs the week is kept across a region switch — the reader stays where
  // they were in time, and a region that published nothing that week says so.
  const week = weeks.find((w) => w.start === chosenWeek) ?? pickDefaultWeek(weeks, todayIso)
  const platformCount = useMemo(() => countPlatforms(week.items), [week])
  const cardOrder = useMemo(() => new Map(week.items.map((r, i) => [r.id, i])), [week])
  const nearest = useMemo(() => nearestFilled(weeks, week.start), [weeks, week])
  const otherRegionName = REGION_SHORT[region === 'IN' ? 'US' : 'IN']
  const isCurrent = week.start === currentStart

  return (
    <div className="v6-page">
      <div className="v6-shell">
        <header className="v6-head">
          <div className="v6-head-copy">
            <h1 className="v6-h1">What lands in {REGION_NAME[region]}</h1>
            {/* Counts describe the shown week. On a quiet week they would read
                "0 new titles · 0 platforms", which is true and useless — the
                empty surface below says it properly, so this stands down. */}
            {week.items.length > 0 && (
              <p className="v6-sub">
                {plural(week.items.length, 'new title')} ·{' '}
                {plural(platformCount, 'platform')}
              </p>
            )}
          </div>
          <div className="v6-controls">
            <RegionToggle region={region} onChange={setRegion} />
            <WeekPicker
              weeks={weeks}
              value={week.start}
              currentStart={currentStart}
              onChange={setChosenWeek}
            />
          </div>
        </header>

        {/* The week names itself here, above its own ruler, rather than only
            inside the control that changes it. A week that isn't the current
            one has to say so, or a reader who lands mid-browse reads a past or
            future slate as now. */}
        <div className="v6-weekbar">
          <h2 className="v6-week-heading">{week.range}</h2>
          {!isCurrent && (
            <span className="v6-standing">{weekStanding(week.start, currentStart)}</span>
          )}
        </div>
        <WeekRuler week={week} todayIso={todayIso} />

        <main className="v6-week" aria-label={week.label}>
          {week.items.length ? (
            <div className="v6-grid" style={{ '--cols': colsFor(week.items.length) }}>
              {week.items.map((r) => (
                <ReleaseCard
                  key={r.id}
                  release={r}
                  otherRegionName={otherRegionName}
                  order={cardOrder.get(r.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyWeek
              regionName={REGION_NAME[region]}
              range={week.range}
              upcoming={week.start > currentStart}
              nearest={nearest}
              onJump={setChosenWeek}
            />
          )}
        </main>

        <footer className="v6-foot">
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
