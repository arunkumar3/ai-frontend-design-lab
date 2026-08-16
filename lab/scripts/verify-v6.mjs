// Verify the render against the data, not against intent. The page now shows
// one week at a time, so most of what matters is behaviour a screenshot cannot
// show: which week it opens on, and what the picker does.
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

function expectedWhen(r) {
  const start = asDate(r.date)
  if (!r.endDate) return entryFmt.format(start)
  const end = asDate(r.endDate)
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  return `${(sameMonth ? entryNoMonthFmt : entryFmt).format(start)} – ${entryFmt.format(end)}`
}

const weeksFor = (region) => {
  const map = new Map()
  for (const r of RELEASES.filter((x) => x.region === region)) {
    const key = isoOf(weekStart(r.date))
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }
  return map
}

const todayIso = isoOf(new Date())
const currentStart = isoOf(weekStart(todayIso))

const browser = await chromium.launch()
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

console.log(`today ${todayIso} · current week starts ${currentStart}\n`)

for (const region of ['IN', 'US']) {
  console.log(`== ${region} ==`)
  if (region === 'US') {
    await page.getByRole('button', { name: 'United States' }).click()
    await page.waitForTimeout(500)
  }

  const byWeek = weeksFor(region)
  const keys = [...byWeek.keys()].sort()

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
  check(!/archive|upcoming/.test(sub), 'current week carries no archive flag')

  // --- the picker ---------------------------------------------------------
  const opts = await page.$$eval('#v6-week option', (ns) =>
    ns.map((n) => ({ value: n.value, text: n.textContent.trim() })),
  )
  check(
    opts.length === keys.length,
    'picker lists every week present in the data',
    `${opts.length} options, ${keys.length} weeks`,
  )
  check(
    opts.map((o) => o.value).join() === keys.slice().reverse().join(),
    'picker runs newest first',
  )
  check(
    opts.every((o) => {
      const n = byWeek.get(o.value).length
      const standing =
        o.value === currentStart ? 'this week' : o.value > currentStart ? 'upcoming' : 'archive'
      return o.text.includes(standing) && o.text.includes(`${n} title`)
    }),
    'each option states its standing and its count',
    opts.map((o) => o.text).join(' / '),
  )

  // --- selecting another week --------------------------------------------
  const other = keys.find((k) => k !== currentStart)
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
    const sub2 = await page.textContent('.v6-sub')
    const expectFlag = other > currentStart ? 'upcoming' : 'archive'
    check(sub2.includes(expectFlag), `a non-current week is flagged "${expectFlag}"`, sub2.trim())

    // every card still carries its own exact date
    const wrong = cards.filter((c) => {
      const rel = want.find((r) => r.title === c.title)
      return !rel || c.when !== expectedWhen(rel)
    })
    check(wrong.length === 0, 'cards still show their own exact release date')

    const noPlatform = cards.filter((c) => {
      const rel = want.find((r) => r.title === c.title)
      return !rel || !c.meta.includes(PLATFORMS[rel.platform].label)
    })
    check(noPlatform.length === 0, 'platform still named on every card')

    // back to current for the next region pass
    await page.selectOption('#v6-week', currentStart)
    await page.waitForTimeout(300)
  }
  console.log('')
}

// --- region switch while parked on a week the other region does not publish
console.log('== region switch ==')
await page.getByRole('button', { name: 'India' }).click()
await page.waitForTimeout(400)
const inOnly = [...weeksFor('IN').keys()].find((k) => !weeksFor('US').has(k))
await page.selectOption('#v6-week', inOnly)
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'United States' }).click()
await page.waitForTimeout(500)
const after = await page.$eval('#v6-week', (n) => n.value)
const usCards = await readCards()
check(
  weeksFor('US').has(after),
  'switching region falls back to a week that region actually has',
  `was ${inOnly} (IN-only) → now ${after}`,
)
check(usCards.length > 0, 'the fallback never lands on an empty page', `${usCards.length} cards`)

console.log(`\n${failures} failing check(s)`)
await browser.close()
process.exit(failures ? 1 : 0)
