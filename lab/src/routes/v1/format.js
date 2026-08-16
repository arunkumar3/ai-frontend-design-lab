// Date helpers. Release dates are plain 'YYYY-MM-DD' strings with no time
// component, so every formatter below parses/formats in UTC — using the
// local timezone here would risk shifting a date to the day before or
// after depending on where the browser sits.

const WEEKDAY_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})

const DAY_MONTH_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function formatDayHeading(iso) {
  const dt = parseISO(iso)
  return `${WEEKDAY_FMT.format(dt)} · ${DAY_MONTH_FMT.format(dt)}`
}

export function formatDateRange(startIso, endIso) {
  if (!endIso || endIso === startIso) return DAY_MONTH_FMT.format(parseISO(startIso))
  return `${DAY_MONTH_FMT.format(parseISO(startIso))}–${DAY_MONTH_FMT.format(parseISO(endIso))}`
}

export function todayISO() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10)
}

/** Groups an already date-sorted release list into { date, items }[] buckets. */
export function groupByDate(releases) {
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
