// Week arithmetic for v7. Duplicated from v6 rather than imported: routes in
// this lab are append-only, so a later drill never reaches into an earlier
// one's files. The rules themselves are unchanged — the run is weekly, on a
// Thursday, and a title dropping Thursday morning belongs to the week that
// run publishes.

export const RUN_DAY = 4 // Thursday

export const asDate = (iso) => new Date(`${iso}T00:00:00`)

export const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

export function weekStart(iso) {
  const d = asDate(iso)
  d.setDate(d.getDate() - ((d.getDay() - RUN_DAY + 7) % 7))
  return d
}

export const weekStartIso = (iso) => isoOf(weekStart(iso))

export function addDays(iso, n) {
  const d = asDate(iso)
  d.setDate(d.getDate() + n)
  return isoOf(d)
}

const dayMonthFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const dayOnlyFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric' })
const yearFmt = new Intl.DateTimeFormat('en-GB', { year: 'numeric' })
const monthYearFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const longDayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
// Day-first everywhere on this page: "Sat 15 Aug", never a mix of orders.
const entryFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const entryNoMonthFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
})

export const formatMonth = (iso) => monthYearFmt.format(asDate(iso))
export const formatLongDay = (iso) => longDayFmt.format(asDate(iso))

/** "13–19 Aug 2026", or "30 Jul – 5 Aug 2026" when the week straddles a month. */
export function formatWeekRange(startIso) {
  const from = asDate(startIso)
  const to = asDate(addDays(startIso, 6))
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  return sameMonth
    ? `${dayOnlyFmt.format(from)}–${dayMonthFmt.format(to)} ${yearFmt.format(to)}`
    : `${dayMonthFmt.format(from)} – ${dayMonthFmt.format(to)} ${yearFmt.format(to)}`
}

/** The exact day a title lands. Ranges read as ranges — the sport fixtures run a week. */
export function formatWhen(release) {
  const start = asDate(release.date)
  if (!release.endDate) return entryFmt.format(start)
  const end = asDate(release.endDate)
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const head = sameMonth ? entryNoMonthFmt.format(start) : entryFmt.format(start)
  return `${head} – ${entryFmt.format(end)}`
}

/** Chronological weeks, each with its own date-ordered items. */
export function groupByWeek(releases) {
  const map = new Map()
  for (const r of releases) {
    const key = weekStartIso(r.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([start, items]) => ({ start, items, range: formatWeekRange(start) }))
}

export function standingOf(start, currentStart) {
  if (start === currentStart) return 'this week'
  return start > currentStart ? 'upcoming' : 'archive'
}

/**
 * The week to feature. An explicit `?week=` wins even when it holds nothing —
 * that is how the empty state is reachable, and how an archive link is a real
 * URL rather than a click that only exists in memory. Otherwise: the current
 * week, else the most recent week that has releases, else nothing at all.
 */
export function resolveWeek(weeks, todayIso, requested) {
  const currentStart = weekStartIso(todayIso)
  if (requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)) {
    const start = weekStartIso(requested)
    return weeks.find((w) => w.start === start) ?? { start, items: [], range: formatWeekRange(start) }
  }
  const exact = weeks.find((w) => w.start === currentStart)
  if (exact) return exact
  const past = weeks.filter((w) => w.start < currentStart)
  if (past.length) return past[past.length - 1]
  return weeks[0] ?? { start: currentStart, items: [], range: formatWeekRange(currentStart) }
}

/**
 * Calendar cells for the month containing `anchorIso`, padded to whole
 * Monday-start rows. Leading and trailing cells belong to the neighbouring
 * months and are marked so they can recede rather than lie.
 */
export function monthGrid(anchorIso) {
  const anchor = asDate(anchorIso)
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const lead = (first.getDay() + 6) % 7 // Monday-start
  const cells = []
  for (let i = 0; i < lead; i++) {
    cells.push({ iso: addDays(isoOf(first), i - lead), outside: true })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push({ iso: isoOf(new Date(anchor.getFullYear(), anchor.getMonth(), d)), outside: false })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ iso: addDays(cells[cells.length - 1].iso, 1), outside: true })
  }
  return cells
}

const fullDateFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "Friday, 21 August 2026" — the sheet answers the question in full. */
export const formatFullDate = (iso) => fullDateFmt.format(asDate(iso))

/**
 * The sheet's one-line answer to "can I watch it yet". Computed against the
 * clock, phrased against the range: a fixture that is mid-run says so. Dates
 * here are the SHORT form — this is an eyebrow, and the full date has its own
 * row directly beneath; the long form wrapped a one-liner onto three lines
 * and ran it under the close button.
 */
export function availability(release, todayIso) {
  const days = Math.round((asDate(release.date) - asDate(todayIso)) / 86400000)
  if (days > 1) return `Drops in ${days} days`
  if (days === 1) return 'Drops tomorrow'
  if (days === 0) return 'Drops today'
  if (release.endDate) {
    if (release.endDate >= todayIso) return `Live now — through ${entryFmt.format(asDate(release.endDate))}`
    return `Ran ${formatWhen(release)}`
  }
  return `Streaming since ${entryFmt.format(asDate(release.date))}`
}
