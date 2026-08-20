// Verify the v7 render against the data, not against intent.
//
// Two things this covers that a screenshot cannot: the surfaces that only exist
// behind a URL (an empty week, the other region), and the relationships between
// what is drawn in one place and what is drawn in another — the calendar's
// marks against the release dates, the week list's counts against the groups.
//
// Date strings are formatted inside the page rather than here. Node and
// Chromium ship different ICU data — Node 22 renders en-GB with a weekday as
// "Thu 6 Aug", Chromium 141 as "Thu, 6 Aug" — and a check that re-derives a
// formatted string in a second engine is asserting on that engine, not on the
// page. The script still decides *which* date belongs where; that is the claim.
import { chromium } from 'playwright'
import { RELEASES, PLATFORMS } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'

// The page renders the combined feed (snapshot + curated week), so the model
// must too, or every count drifts the day a source is added.
const ALL = [...RELEASES, ...CURATED]

const RUN_DAY = 4 // Thursday
const asDate = (iso) => new Date(`${iso}T00:00:00`)
const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function weekStartIso(iso) {
  const d = asDate(iso)
  d.setDate(d.getDate() - ((d.getDay() - RUN_DAY + 7) % 7))
  return isoOf(d)
}
function addDays(iso, n) {
  const d = asDate(iso)
  d.setDate(d.getDate() + n)
  return isoOf(d)
}

const forRegion = (region) =>
  ALL.filter((r) => r.region === region).sort((a, b) => a.date.localeCompare(b.date))

const weeksFor = (region) => {
  const map = new Map()
  for (const r of forRegion(region)) {
    const key = weekStartIso(r.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return map
}

/** Every day a title occupies, ranges included. */
const daysFor = (region) => {
  const map = new Map()
  for (const r of forRegion(region)) {
    const last = r.endDate ?? r.date
    for (let d = r.date; d <= last; d = addDays(d, 1)) {
      if (!map.has(d)) map.set(d, [])
      map.get(d).push(r)
    }
  }
  return map
}

const todayIso = isoOf(new Date())
const currentStart = weekStartIso(todayIso)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })

let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)
}

const go = (query = '') =>
  page.goto(`http://localhost:5173/v7${query}`, { waitUntil: 'networkidle' })

/** Formats a release's "when" string using the page's own engine. */
const whenFor = (releases) =>
  page.evaluate((list) => {
    const entry = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    const noMonth = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' })
    const at = (iso) => new Date(`${iso}T00:00:00`)
    return list.map(([date, endDate]) => {
      const s = at(date)
      if (!endDate) return entry.format(s)
      const e = at(endDate)
      const same = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
      return `${(same ? noMonth : entry).format(s)} – ${entry.format(e)}`
    })
  }, releases.map((r) => [r.date, r.endDate ?? null]))

/** Cards in the featured week only — the next-run block renders one too. */
const readSlate = () =>
  page.$$eval('.v7-slate__grid .v7-card', (nodes) =>
    nodes.map((c) => ({
      title: (c.querySelector('.v7-tile__name') ?? c.querySelector('.v7-card__name'))
        .childNodes[0].textContent.trim(),
      when: (c.querySelector('.v7-tile__when') ?? c.querySelector('.v7-card__when')).textContent.trim(),
      tags: c.querySelector('.v7-card__tags').textContent.trim(),
    })),
  )

console.log(`today ${todayIso} · current week starts ${currentStart}\n`)

for (const region of ['IN', 'US']) {
  console.log(`== ${region} ==`)
  const byWeek = weeksFor(region)
  const byDay = daysFor(region)
  const keys = [...byWeek.keys()].sort()

  await go(region === 'IN' ? '' : '?region=US')

  // --- the landing week -----------------------------------------------------
  // What the landing view shows is what resolveWeek picks, which is NOT
  // blindly the current week: when the current week is empty the page falls
  // back to the most recent week that has titles and flags it "archive" —
  // documented behaviour, and the exact scenario feed:shapes drives with
  // synthetic data. As first written this script assumed the current week
  // always has titles; that was true the day it was written and false the
  // first Thursday the clock rolled past the frozen data (2026-08-20), when
  // it reported five failures on a page doing precisely what PHASE-2 §5.1
  // says it should. The page was right. The check was wrong.
  const resolved = byWeek.has(currentStart)
    ? currentStart
    : (keys.filter((k) => k < currentStart).at(-1) ?? keys[0])
  const want = byWeek.get(resolved) ?? []
  let cards = await readSlate()
  check(
    cards.length === want.length,
    'the landing view renders the whole resolved week',
    `${cards.length} cards, week ${resolved} has ${want.length}, region total ${forRegion(region).length}`,
  )
  check(
    cards.map((c) => c.title).sort().join('|') === want.map((r) => r.title).sort().join('|'),
    'those cards are exactly that week’s titles',
  )

  // every card carries its own date and its platform
  const expected = new Map((await whenFor(want)).map((w, i) => [want[i].title, w]))
  const wrongDate = cards.filter((c) => expected.get(c.title) !== c.when)
  check(
    wrongDate.length === 0,
    'every card shows its own release date',
    wrongDate.map((c) => `${c.title}: got "${c.when}" want "${expected.get(c.title)}"`).join(' / '),
  )
  const noPlatform = cards.filter((c) => {
    const rel = want.find((r) => r.title === c.title)
    return !rel || !c.tags.includes(PLATFORMS[rel.platform].label)
  })
  check(noPlatform.length === 0, 'every card names its platform')

  // --- the grid never strands a single card on its own row ------------------
  const cols = await page.$eval('.v7-slate__grid', (n) =>
    Number(getComputedStyle(n).getPropertyValue('--cols')),
  )
  check(
    want.length <= cols || want.length % cols !== 1,
    'the column count leaves no orphan row',
    `${want.length} titles in ${cols} columns`,
  )

  // --- header summary -------------------------------------------------------
  const note = await page.textContent('.v7-head__note')
  const platforms = new Set(want.map((r) => r.platform)).size
  check(
    note.includes(`${want.length} title`) && note.includes(`${platforms} platform`),
    'the header counts describe the shown week, not the whole feed',
    note.trim(),
  )
  // A fallback week presented without a flag reads as this week's slate,
  // which is a lie rather than a gap; the current week must carry no flag.
  if (resolved === currentStart) {
    check(!/archive|upcoming/.test(note), 'the current week carries no standing flag', note.trim())
  } else {
    check(/archive|upcoming/.test(note), 'the fallback week is flagged, not passed off as now', note.trim())
  }

  // --- the calendar ---------------------------------------------------------
  const marked = await page.$$eval('.v7-cal__hit', (ns) =>
    ns.map((n) => ({ day: Number(n.textContent.trim()), label: n.getAttribute('aria-label') })),
  )
  const month = resolved.slice(0, 7)
  const wantDays = [...byDay.keys()]
    .filter((d) => d.startsWith(month))
    .map((d) => Number(d.slice(8)))
    .sort((a, b) => a - b)
  check(
    marked.map((m) => m.day).sort((a, b) => a - b).join() === wantDays.join(),
    'the calendar marks exactly the days that carry a release',
    `marked ${marked.map((m) => m.day).join()} / data ${wantDays.join()}`,
  )
  const badCount = marked.filter((m) => {
    const iso = `${month}-${String(m.day).padStart(2, '0')}`
    const n = byDay.get(iso).length
    return !m.label.includes(`${n} title`)
  })
  check(badCount.length === 0, 'each marked day states how many titles it carries')

  // a fixture that runs a week must appear on every day it runs
  const runs = forRegion(region).filter((r) => r.endDate && r.date.startsWith(month))
  if (runs.length) {
    const spanDays = new Set()
    for (const r of runs) {
      for (let d = r.date; d <= r.endDate; d = addDays(d, 1)) spanDays.add(Number(d.slice(8)))
    }
    const shown = new Set(marked.map((m) => m.day))
    check(
      [...spanDays].every((d) => shown.has(d)),
      'a multi-day fixture is marked on every day it runs',
      `${runs[0].title} spans ${runs[0].date}..${runs[0].endDate}`,
    )
  }

  // --- the week list --------------------------------------------------------
  const rows = await page.$$eval('.v7-week', (ns) =>
    ns.map((n) => ({
      range: n.querySelector('.v7-week__range').textContent.trim(),
      standing: n.querySelector('.v7-week__standing').textContent.trim(),
      count: n.querySelector('.v7-week__count').textContent.trim(),
      on: n.classList.contains('v7-week--on'),
    })),
  )
  check(rows.length === keys.length, 'the list holds every week in the data', `${rows.length} rows, ${keys.length} weeks`)
  const wantStandings = keys
    .slice()
    .reverse()
    .map((k) => (k === currentStart ? 'this week' : k > currentStart ? 'upcoming' : 'archive'))
  check(
    rows.map((r) => r.standing).join() === wantStandings.join(),
    'the list runs newest first and each row states its standing',
    rows.map((r) => `${r.range} ${r.standing}`).join(' / '),
  )
  const wantCounts = keys
    .slice()
    .reverse()
    .map((k) => `${byWeek.get(k).length} title${byWeek.get(k).length === 1 ? '' : 's'}`)
  check(rows.map((r) => r.count).join() === wantCounts.join(), 'each row states its own count')
  check(rows.filter((r) => r.on).length === 1, 'exactly one row is marked as selected')

  // --- selecting a week through the URL ------------------------------------
  const other = keys.find((k) => k !== currentStart)
  if (other) {
    await go(`?week=${other}${region === 'US' ? '&region=US' : ''}`)
    const picked = byWeek.get(other)
    cards = await readSlate()
    check(
      cards.map((c) => c.title).sort().join('|') === picked.map((r) => r.title).sort().join('|'),
      'a ?week= URL opens exactly that week',
      `${other} → ${cards.length} cards`,
    )
    const note2 = await page.textContent('.v7-head__note')
    check(
      note2.includes(other > currentStart ? 'upcoming' : 'archive'),
      'a week that is not the current one says so',
      note2.trim(),
    )
  }

  console.log('')
}

// --- the empty state, which no week in the data can produce on its own -------
console.log('== empty week ==')
// far enough past the end of this frozen feed that no region has anything
await go('?week=2027-03-11')
check((await readSlate()).length === 0, 'an empty week renders no cards')
const emptyLead = await page.textContent('.v7-empty__lead').catch(() => null)
check(Boolean(emptyLead), 'the empty week renders the designed empty surface', emptyLead?.trim() ?? 'MISSING')
check(
  Boolean(emptyLead) && emptyLead.includes('India'),
  'it names the catalog it checked',
)
const escape = await page.textContent('.v7-empty .v7-btn').catch(() => null)
check(Boolean(escape), 'the empty week offers a way out', escape?.trim() ?? 'MISSING')
// the way out has to actually go somewhere with titles
await page.click('.v7-empty .v7-btn')
await page.waitForTimeout(400)
check(
  (await readSlate()).length > 0,
  'and that way out lands on a week that has titles',
  `${(await readSlate()).length} cards`,
)

// --- region is carried in the URL, not just in memory ------------------------
console.log('\n== region ==')
await go('?region=US')
const usNote = await page.textContent('.v7-head__note')
check(
  usNote.includes('United States') || (await page.textContent('.v7-nav__links')).includes('United States'),
  'a ?region= URL opens that catalog',
  usNote.trim(),
)
const usPressed = await page.$eval('.v7-nav__link[aria-pressed="true"]', (n) => n.textContent.trim())
check(usPressed === 'United States', 'and the toggle reflects it', usPressed)

// --- the next-run block -----------------------------------------------------
console.log('\n== next run ==')
await go('')
const inWeeks = weeksFor('IN')
const inKeys = [...inWeeks.keys()].sort()
const nextKey = inKeys.find((k) => k > currentStart)
if (nextKey) {
  const listed = await page.$$eval('.v7-next__name', (ns) => ns.map((n) => n.textContent.trim()))
  check(
    listed.sort().join('|') === inWeeks.get(nextKey).map((r) => r.title).sort().join('|'),
    'the next-run block lists exactly the next week that has titles',
    listed.join(', '),
  )
  const heading = await page.textContent('.v7-next__date')
  check(
    heading.includes(String(Number(nextKey.slice(8)))),
    'and its heading names that week',
    heading.trim(),
  )
}

console.log(`\n${failures} failing check(s)`)
await browser.close()
process.exit(failures ? 1 : 0)
