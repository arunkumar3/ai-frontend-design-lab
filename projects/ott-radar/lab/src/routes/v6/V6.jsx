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
// Day-first on every schedule entry — rail, card, and header summary all read
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

const asDate = (iso) => new Date(`${iso}T00:00:00`)

const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

// The release date is no longer a section heading, so it moves onto the card:
// inside an 11-title week, "what drops when" has to be legible per title or the
// chronology is decorative again.
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
// repeated block — quiet variation, still inside the canvas's own warm
// tonal family.
function toneFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ['a', 'b', 'c'][Math.abs(hash) % 3]
}

// Chronology is the organising axis (v0–v2 had it; v3 traded it for
// JustWatch's platform grouping and v4/v5 inherited the trade), but the unit is
// the publishing week, not the individual day: this page is generated once a
// week, on a Thursday, for that week. Platform demotes to card metadata — where
// it still appears on every card, and in the header count — rather than being
// deleted outright.
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

// `releasesForRegion` is already date-sorted, so weeks come out in
// chronological order and each week's items keep their own date order.
function groupByWeek(releases) {
  const map = new Map()
  for (const r of releases) {
    const key = isoOf(weekStart(r.date))
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return [...map.entries()].map(([start, items]) => {
    const from = asDate(start)
    const to = asDate(start)
    to.setDate(to.getDate() + 6)
    return {
      start,
      items,
      range: formatWeekRange(from, to),
      label: `Week of ${fullDayFmt.format(from)} to ${fullDayFmt.format(to)}`,
    }
  })
}

// Which week the page opens on. The run is weekly, so the landing view is the
// current week — resolved against the clock, not against the end of the table,
// because this data set is frozen and will age. When today's week carries no
// releases the most recent week that does stands in, and a slate made entirely
// of future weeks opens on its earliest rather than showing nothing.
function pickDefaultWeek(weeks, todayIso) {
  const current = isoOf(weekStart(todayIso))
  const exact = weeks.find((w) => w.start === current)
  if (exact) return exact
  const past = weeks.filter((w) => w.start < current)
  return past.length ? past[past.length - 1] : weeks[0]
}

// One column per title, capped at what fits at full card width: six 200px
// columns need 1320px of content box against the shell's 1172px, so a
// six-column week silently shrank its cards to ~147px — under the 150px floor,
// and enough to wrap every title and metadata line. Five is the real ceiling.
//
// Past the cap the column count avoids a trailing row of one: a 7-title week
// runs 5+2, and an 11-title week drops to 4+4+3 rather than 5+5+1.
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
// where it sits relative to the run, not assumed to be past. Dropping future
// weeks from the picker would hide real releases; naming them keeps next
// week's slate reachable without it passing for this week's.
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
                {w.range} · {weekStanding(w.start, currentStart)} · {w.items.length} title
                {w.items.length === 1 ? '' : 's'}
              </option>
            ))}
        </select>
        <span className="v6-weekpick-arrow" aria-hidden="true" />
      </div>
    </div>
  )
}

// Mount-time entrance only — never scroll-triggered. The shoot harness takes a
// single full-page screenshot 1200ms after network idle without scrolling, so a
// `whileInView` reveal would leave below-the-fold cards captured at their
// initial (invisible) state. Cubic-bezier and the 30ms step are v5's vocabulary;
// the cap keeps the last card's delay bounded as the slate grows.
const CARD_EASE = [0.23, 1, 0.32, 1]
const CARD_STAGGER_MS = 30
const CARD_STAGGER_CAP = 10

function ReleaseCard({ release, otherRegionName, order }) {
  const url = posterUrl(release)
  const label = TYPE_LABEL[release.type]
  const platform = PLATFORMS[release.platform].label
  const alsoElsewhere = CROSS_REGION_TITLES.has(release.title)
  const reduce = useReducedMotion()
  const delay = (reduce ? 0 : Math.min(order, CARD_STAGGER_CAP) * CARD_STAGGER_MS) / 1000

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
          />
        </div>
      ) : (
        <div
          className={`v6-fallback v6-tone-${toneFor(release.id)}`}
          role="img"
          aria-label={`${release.title} — artwork not available`}
        >
          <span className="v6-fallback-flag" aria-hidden="true">
            No artwork
          </span>
          <span className="v6-fallback-title">{release.title}</span>
        </div>
      )}
      <figcaption>
        {/* h2, not h3: the week used to supply the level-2 heading from the
            rail, and now the picker names it instead. With no grouping heading
            left between the page title and the titles themselves, h3 would
            skip a level and break the document outline. */}
        <h2 className="v6-title">
          {release.title}
          {release.posterApprox && (
            <span className="v6-approx" title="Approximate artwork">
              {' '}(approx.)
            </span>
          )}
        </h2>
        {/* The rail groups by week, so the exact day lives here — first line
            under the title, ahead of the descriptive metadata, because it is
            the question the page exists to answer. Ranges read as ranges: the
            two sport fixtures run 15–21 Aug, not on one day. */}
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

export default function V6() {
  const [region, setRegion] = useState('IN')
  // Which week the reader has chosen, or null while they are still on the
  // landing view. Kept as the week's own start date rather than an index so it
  // survives a region switch when both catalogs happen to cover that week.
  const [chosenWeek, setChosenWeek] = useState(null)

  const releases = useMemo(() => releasesForRegion(region), [region])
  const weeks = useMemo(() => groupByWeek(releases), [releases])
  const todayIso = useMemo(() => isoOf(new Date()), [])
  const currentStart = useMemo(() => isoOf(weekStart(todayIso)), [todayIso])

  // Derived, not synchronised: the two regions publish different weeks, so a
  // week chosen under one may not exist under the other. Falling back here
  // means switching region can never land on an empty page, and no effect has
  // to race the render to correct the selection.
  const week =
    weeks.find((w) => w.start === chosenWeek) ?? pickDefaultWeek(weeks, todayIso)
  const platformCount = useMemo(() => countPlatforms(week.items), [week])
  const cardOrder = useMemo(() => new Map(week.items.map((r, i) => [r.id, i])), [week])
  const otherRegionName = REGION_SHORT[region === 'IN' ? 'US' : 'IN']
  const isCurrent = week.start === currentStart

  return (
    <div className="v6-page">
      <div className="v6-shell">
        <header className="v6-head">
          <div className="v6-head-copy">
            <h1 className="v6-h1">What&rsquo;s new in {REGION_NAME[region]}</h1>
            <p className="v6-sub">
              {week.items.length} new title{week.items.length === 1 ? '' : 's'} ·{' '}
              {platformCount} platform{platformCount === 1 ? '' : 's'} · {week.range}
              {/* A week that isn't the current one has to say so, or a reader
                  who lands mid-browse reads a past or future slate as now. */}
              {!isCurrent && (
                <span className="v6-sub-flag"> · {weekStanding(week.start, currentStart)}</span>
              )}
            </p>
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

        {/* One week per view, so the section is the page: the week is named by
            the picker above rather than by a rail beside a single group. */}
        <main className="v6-week" aria-label={week.label}>
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
        </main>

        <footer className="v6-foot">
          <p>
            Palette sampled from this week&rsquo;s poster art — the slate&rsquo;s dominant hue
            band, not a house colour.
          </p>
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
