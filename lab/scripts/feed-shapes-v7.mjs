// Drive the real page against feeds the snapshot cannot produce.
//
// The unit tests in src/feed/ prove the boundary parses. They cannot prove that
// a 50-title week lays out, that an unknown platform reaches the card as a
// label rather than a TypeError, or that an 80-character title stays inside its
// cell — and those are the things a live feed will actually deliver on its
// first bad day. This repo's own finding is that a green suite and a rendered
// page are different claims, so these run in a browser against `/v7`.
//
// Feeds arrive through `globalThis.__FEED__`, a seam `src/feed/index.js` reads
// only under `import.meta.env.DEV`.
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const RUN_DAY = 4 // Thursday

const isoOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return isoOf(d)
}
const weekStart = (iso) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() - ((d.getDay() - RUN_DAY + 7) % 7))
  return isoOf(d)
}

const TODAY = isoOf(new Date())
const THIS_WEEK = weekStart(TODAY)

const row = (over = {}) => ({
  id: `s-${Math.random().toString(36).slice(2, 10)}`,
  title: 'Placeholder Title',
  date: THIS_WEEK,
  region: 'IN',
  type: 'series',
  platform: 'netflix',
  language: 'English',
  poster: null,
  ...over,
})

const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i))

/* Each scenario: the records to inject, and what must be true of the render. */
const SCENARIOS = [
  {
    name: 'one title in the week',
    records: [row({ id: 'a', title: 'Solo Drop' })],
    expect: { cards: 1 },
  },
  {
    name: 'fifty titles in one week',
    records: many(50, (i) =>
      row({ id: `big-${i}`, title: `Title Number ${i + 1}`, date: addDays(THIS_WEEK, i % 7) }),
    ),
    expect: { cards: 50 },
  },
  {
    // Not an empty state. When the current week has nothing but the archive
    // does, `resolveWeek` falls back to the most recent week that has titles —
    // documented behaviour, and better than a blank page. The invariant worth
    // asserting is that the fallback is *labelled*: a past week presented
    // without a flag reads as this week's slate, which is a lie rather than a
    // gap. (The first version of this scenario expected an empty state and
    // failed a page that was behaving correctly.)
    name: 'the current week is empty, the archive is not',
    records: many(3, (i) => row({ id: `old-${i}`, date: addDays(THIS_WEEK, -30 - i * 7) })),
    expect: { cards: 1, noteIncludes: 'archive' },
  },
  {
    name: 'a platform nobody has heard of',
    records: [row({ id: 'p1', title: 'Arthouse Pick', platform: 'mubi' })],
    expect: { cards: 1, tagIncludes: 'Mubi', notice: true },
  },
  {
    name: 'every optional field missing',
    records: [
      { id: 'bare', title: 'Bare Minimum', date: THIS_WEEK, region: 'IN', type: 'movie', platform: 'netflix' },
    ],
    expect: { cards: 1 },
  },
  {
    name: 'titles far longer than anything in the snapshot',
    records: many(4, (i) =>
      row({
        id: `long-${i}`,
        title:
          'The Extraordinarily Protracted Chronicles of an Unreasonably Long Television Title, Part ' +
          (i + 1),
      }),
    ),
    expect: { cards: 4 },
  },
  {
    name: 'a single unbroken 60-character word',
    records: [row({ id: 'word', title: 'Antidisestablishmentarianismandthensomemorelettersyetagain' })],
    expect: { cards: 1 },
  },
  {
    name: 'half the feed is malformed',
    records: [
      row({ id: 'good-1', title: 'Survives One' }),
      { id: '', title: '', date: 'not-a-date', region: 'ZZ', type: 'film', platform: '' },
      row({ id: 'good-2', title: 'Survives Two' }),
      { id: 'dup', title: 'First', date: THIS_WEEK, region: 'IN', type: 'movie', platform: 'netflix' },
      { id: 'dup', title: 'Second', date: THIS_WEEK, region: 'IN', type: 'movie', platform: 'netflix' },
      null,
    ],
    expect: { cards: 3, notice: true },
  },
  {
    name: 'only one region has anything',
    records: many(4, (i) => row({ id: `in-only-${i}`, region: 'IN' })),
    expect: { cards: 4, regionButtons: 1 },
  },
  {
    name: 'every record is unusable',
    records: [{ nope: true }, null, 'string', 42],
    expect: { cards: 0, empty: true, notice: true },
  },
]

const browser = await chromium.launch()
let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)
}

for (const scenario of SCENARIOS) {
  console.log(`\n== ${scenario.name} ==`)
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()))

  await page.addInitScript((records) => {
    globalThis.__FEED__ = records
  }, scenario.records)
  await page.goto(`${BASE}/v7`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  check(errors.length === 0, 'renders without a runtime error', errors.slice(0, 2).join(' | '))

  const rendered = await page.$('.v7-page')
  check(Boolean(rendered), 'the page mounted')
  if (!rendered) {
    await page.close()
    continue
  }

  const cards = await page.$$eval('.v7-slate__grid .v7-card', (n) => n.length)
  check(cards === scenario.expect.cards, `renders ${scenario.expect.cards} card(s)`, `got ${cards}`)

  if (scenario.expect.empty) {
    const lead = await page.textContent('.v7-empty__lead').catch(() => null)
    check(Boolean(lead), 'shows the designed empty surface', lead?.trim().slice(0, 60) ?? 'MISSING')
  }

  if (scenario.expect.notice) {
    const notice = await page.textContent('.v7-notice summary').catch(() => null)
    check(Boolean(notice), 'reports what the boundary dropped', notice?.trim() ?? 'MISSING')
  }

  if (scenario.expect.noteIncludes) {
    const note = await page.textContent('.v7-head__note').catch(() => '')
    check(
      note.includes(scenario.expect.noteIncludes),
      `the shown week is flagged "${scenario.expect.noteIncludes}"`,
      note.trim(),
    )
  }

  if (scenario.expect.tagIncludes) {
    const tags = await page.textContent('.v7-card__tags').catch(() => '')
    check(
      tags.includes(scenario.expect.tagIncludes),
      `names the unknown platform as "${scenario.expect.tagIncludes}"`,
      tags.trim(),
    )
  }

  if (scenario.expect.regionButtons !== undefined) {
    const n = await page.$$eval('.v7-nav__link', (ns) => ns.length)
    check(
      n === scenario.expect.regionButtons,
      `offers ${scenario.expect.regionButtons} region control(s)`,
      `got ${n}`,
    )
  }

  // Layout invariants that hold for every shape.
  const overflow = await page.evaluate(() => ({
    body: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cells: [...document.querySelectorAll('.v7-slate__grid > li')].filter(
      (li) => li.scrollWidth > li.clientWidth + 1,
    ).length,
    frames: [...document.querySelectorAll('.v7-card__frame')].filter((f) => {
      const r = f.getBoundingClientRect()
      return r.width < 90 || r.height < 130
    }).length,
  }))
  check(overflow.body <= 0, 'the page does not scroll sideways', `overflow ${overflow.body}px`)
  check(overflow.cells === 0, 'no card overflows its grid cell', `${overflow.cells} overflowing`)
  check(overflow.frames === 0, 'no poster frame collapses below its floor', `${overflow.frames} collapsed`)

  await page.close()
}

console.log(`\n${failures} failing check(s)`)
await browser.close()
process.exit(failures ? 1 : 0)
