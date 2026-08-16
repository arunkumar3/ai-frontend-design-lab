// Verify the render against the data, not against intent. The page shows one
// week at a time, so most of what matters is behaviour a screenshot cannot
// show: which week it opens on, what the picker holds, what the day ruler
// claims, and what a week with nothing in it does.
import { chromium } from 'playwright'
import { RELEASES, PLATFORMS } from '../src/data/releases.js'

const RUN_DAY = 4 // Thursday
const entryFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const entryNoMonthFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' })

const asDate = (iso) => new Date(`${iso}T00:00:00`)
const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function weekStart(iso) {
  const d = asDate(iso)
  d.setDate(d.getDate() - ((d.getDay() - RUN_DAY + 7) % 7))
  return d
}

// Node's ICU and the browser's do not agree on whether en-GB puts a comma
// after the weekday ("Wed 12 Aug" vs "Wed, 12 Aug"), and the split moves with
// the Chromium build. The assertion is about which date a card shows, not
// about a separator glyph, so both sides are flattened before comparison.
// Confirm the check before changing the page: this one was reporting a correct
// page as broken.
const sameDateString = (a, b) =>
  a.replace(/[,\s]+/g, ' ').trim() === b.replace(/[,\s]+/g, ' ').trim()

function expectedWhen(r) {
  const start = asDate(r.date)
  if (!r.endDate) return entryFmt.format(start)
  const end = asDate(r.endDate)
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  return `${(sameMonth ? entryNoMonthFmt : entryFmt).format(start)} – ${entryFmt.format(end)}`
}

// Weeks that carry at least one title.
const filledWeeks = (region) => {
  const map = new Map()
  for (const r of RELEASES.filter((x) => x.region === region)) {
    const key = isoOf(weekStart(r.date))
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return map
}

// The whole run: every publishing week from the first with a title to the
// last, quiet weeks included. This is what the picker is expected to hold.
const runWeeks = (region) => {
  const keys = [...filledWeeks(region).keys()].sort()
  const out = []
  const cursor = asDate(keys[0])
  const last = keys[keys.length - 1]
  while (isoOf(cursor) <= last) {
    out.push(isoOf(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return out
}

const todayIso = isoOf(new Date())
const currentStart = isoOf(weekStart(todayIso))
const standingOf = (start) =>
  start === currentStart ? 'this week' : start > currentStart ? 'upcoming' : 'archive'

// Sandboxes that ship a preinstalled Chromium and block the CDN set
// CHROMIUM_PATH; everywhere else Playwright resolves its own build.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173/v6', { waitUntil: 'networkidle' })

let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)
}

const readCards = () =>
  page.$$eval('.v6-card', (nodes) =>
    nodes.map((c) => ({
      title: c.querySelector('.v6-title').childNodes[0].textContent.trim(),
      when: c.querySelector('.v6-when').textContent.trim(),
      meta: c.querySelector('.v6-meta').textContent.trim(),
    })),
  )

// The ruler is the page's one structural claim about the week, so it is read
// back from the render the same way the cards are.
const readRuler = () =>
  page.$$eval('.v6-day', (nodes) =>
    nodes.map((d) => ({
      iso: d.querySelector('.v6-day-num').getAttribute('datetime'),
      ticks: d.querySelectorAll('.v6-tick:not(.is-empty)').length,
      today: d.classList.contains('is-today'),
    })),
  )

const standingText = () =>
  page.$$eval('.v6-standing', (ns) => ns.map((n) => n.textContent.trim()).join(''))

console.log(`today ${todayIso} · current week starts ${currentStart}\n`)

for (const region of ['IN', 'US']) {
  console.log(`== ${region} ==`)
  if (region === 'US') {
    await page.getByRole('button', { name: 'United States' }).click()
    await page.waitForTimeout(500)
  }

  const byWeek = filledWeeks(region)
  const run = runWeeks(region)

  // --- landing view -------------------------------------------------------
  const selected = await page.$eval('#v6-week', (n) => n.value)
  check(selected === currentStart, 'opens on the current week', `selected ${selected}`)

  let cards = await readCards()
  const wantCurrent = byWeek.get(currentStart) ?? []
  check(
    cards.length === wantCurrent.length,
    'landing page renders only the current week',
    `${cards.length} cards, week has ${wantCurrent.length}, region total ${
      RELEASES.filter((r) => r.region === region).length
    }`,
  )
  check(
    cards.map((c) => c.title).sort().join('|') ===
      wantCurrent.map((r) => r.title).sort().join('|'),
    'those cards are exactly that week’s titles',
  )
  const sub = await page.textContent('.v6-sub')
  const platforms = new Set(wantCurrent.map((r) => r.platform)).size
  check(
    sub.includes(`${wantCurrent.length} new title`) && sub.includes(`${platforms} platform`),
    'header counts describe the shown week, not the whole feed',
    sub.trim(),
  )
  check((await standingText()) === '', 'current week carries no standing flag')

  const heading = (await page.textContent('.v6-week-heading')).trim()
  check(heading.length > 0, 'the week names itself in a heading', heading)

  // --- the day ruler ------------------------------------------------------
  const ruler = await readRuler()
  check(ruler.length === 7, 'the ruler draws all seven days of the week', `${ruler.length} cells`)
  const perDay = new Map()
  for (const r of wantCurrent) perDay.set(r.date, (perDay.get(r.date) ?? 0) + 1)
  check(
    ruler.every((d) => d.ticks === (perDay.get(d.iso) ?? 0)),
    'every day carries one mark per title landing that day',
    ruler.map((d) => `${d.iso.slice(8)}:${d.ticks}`).join(' '),
  )
  check(
    ruler.filter((d) => d.today).length === (ruler.some((d) => d.iso === todayIso) ? 1 : 0) &&
      ruler.every((d) => d.today === (d.iso === todayIso)),
    'today is marked, and only today',
  )

  // --- the picker ---------------------------------------------------------
  const opts = await page.$$eval('#v6-week option', (ns) =>
    ns.map((n) => ({ value: n.value, text: n.textContent.trim() })),
  )
  check(
    opts.length === run.length,
    'picker lists the whole run, quiet weeks included',
    `${opts.length} options, run is ${run.length} weeks (${
      run.length - byWeek.size
    } of them empty)`,
  )
  check(opts.map((o) => o.value).join() === run.slice().reverse().join(), 'picker runs newest first')
  check(
    opts.every((o) => {
      const n = byWeek.get(o.value)?.length ?? 0
      const count = n ? `${n} title` : 'no titles'
      return o.text.includes(standingOf(o.value)) && o.text.includes(count)
    }),
    'each option states its standing and its count',
    opts.map((o) => o.text).join(' / '),
  )

  // --- selecting another week that has titles ------------------------------
  const other = [...byWeek.keys()].find((k) => k !== currentStart)
  if (other) {
    await page.selectOption('#v6-week', other)
    await page.waitForTimeout(500)
    cards = await readCards()
    const want = byWeek.get(other)
    check(
      cards.map((c) => c.title).sort().join('|') === want.map((r) => r.title).sort().join('|'),
      'selecting a week swaps in exactly that week',
      `${other} → ${cards.length} cards`,
    )
    check(
      (await standingText()) === standingOf(other),
      `a non-current week is flagged "${standingOf(other)}"`,
      await standingText(),
    )

    // every card still carries its own exact date
    const wrong = cards.filter((c) => {
      const rel = want.find((r) => r.title === c.title)
      return !rel || !sameDateString(c.when, expectedWhen(rel))
    })
    check(wrong.length === 0, 'cards still show their own exact release date', wrong
      .map((c) => `${c.title}: "${c.when}"`)
      .join(', '))

    const noPlatform = cards.filter((c) => {
      const rel = want.find((r) => r.title === c.title)
      return !rel || !c.meta.includes(PLATFORMS[rel.platform].label)
    })
    check(noPlatform.length === 0, 'platform still named on every card')
  }

  // --- a week the run contains but nothing landed in -----------------------
  const quiet = run.find((k) => !byWeek.has(k))
  if (quiet) {
    await page.selectOption('#v6-week', quiet)
    await page.waitForTimeout(500)
    check((await readCards()).length === 0, 'a quiet week renders no cards', quiet)
    check(await page.isVisible('.v6-empty'), 'a quiet week renders the designed empty surface')
    const quietRuler = await readRuler()
    check(
      quietRuler.length === 7 && quietRuler.every((d) => d.ticks === 0),
      'the ruler still draws the quiet week’s seven days',
    )
    // the one control on the empty surface has to lead somewhere real
    const jump = (await page.textContent('.v6-empty-jump')).trim()
    const nearest = [...byWeek.keys()].reduce((best, k) => {
      const d = Math.abs(asDate(k) - asDate(quiet))
      const bd = Math.abs(asDate(best) - asDate(quiet))
      return d < bd || (d === bd && k < best) ? k : best
    })
    await page.click('.v6-empty-jump')
    await page.waitForTimeout(500)
    check(
      (await page.$eval('#v6-week', (n) => n.value)) === nearest,
      'the empty surface’s control lands on the nearest week that has titles',
      `"${jump}" → ${nearest}`,
    )
  } else {
    console.log(`SKIP  ${region} run has no quiet week to test`)
  }

  // back to current for the next region pass
  await page.selectOption('#v6-week', currentStart)
  await page.waitForTimeout(300)
  console.log('')
}

// --- region switch -------------------------------------------------------
// The runs overlap but are not the same length, so a switch either keeps the
// reader's place in time or, when the week is outside the other run entirely,
// falls back rather than rendering nothing.
console.log('== region switch ==')
const usRun = runWeeks('US')
const inRun = runWeeks('IN')

// (a) a week both runs contain, but only one region published in
const sharedQuiet = inRun.find((k) => usRun.includes(k) && !filledWeeks('US').has(k))
await page.getByRole('button', { name: 'India' }).click()
await page.waitForTimeout(400)
await page.selectOption('#v6-week', sharedQuiet)
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'United States' }).click()
await page.waitForTimeout(500)
check(
  (await page.$eval('#v6-week', (n) => n.value)) === sharedQuiet,
  'switching region keeps the week when the other run covers it',
  sharedQuiet,
)
check(
  await page.isVisible('.v6-empty'),
  'and says so rather than showing an empty grid',
  (await page.textContent('.v6-empty-lead')).trim(),
)

// (b) a week outside the other run altogether
const outside = usRun.find((k) => !inRun.includes(k))
await page.selectOption('#v6-week', outside)
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'India' }).click()
await page.waitForTimeout(500)
const after = await page.$eval('#v6-week', (n) => n.value)
check(
  inRun.includes(after),
  'a week outside the other run falls back into it',
  `was ${outside} (US-only) → now ${after}`,
)
check((await readCards()).length > 0, 'the fallback never lands on an empty page')

console.log(`\n${failures} failing check(s)`)
await browser.close()
process.exit(failures ? 1 : 0)
