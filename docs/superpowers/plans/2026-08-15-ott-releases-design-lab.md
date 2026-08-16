# OTT Releases Design Lab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build six independently-viewable versions of an "OTT Releases This Week" site, each adding exactly one design-direction technique, producing screenshot evidence of what each technique is worth.

**Architecture:** A single Vite + React app with six sibling route folders (`v0`–`v5`) sharing one dataset and one capture harness. Routes are append-only: a drill never edits a previous route, so all six remain live and comparable. Shared code is limited to data and the capture script — every route owns its own components and CSS, because sharing components across drills would leak later levers into earlier baselines.

**Tech Stack:** Vite, React 19, React Router, Tailwind CSS v4.3.3 (CSS-first `@theme`), Motion 13.1.0, Playwright 1.62.1 (already connected as MCP), pnpm 10.33.2, Node 20.20.2

**Spec:** `docs/superpowers/specs/2026-08-15-claude-code-design-operating-model-design.md`

**Scope:** Phase A only — the six drills and the playbook they produce. Phase B
(TMDB live data, real states, deploy) gets its own plan once the winning
design exists.

## Global Constraints

- **Append-only routes.** Never modify `app/vN` once its drill is complete. Evidence integrity depends on this.
- **One lever per drill.** If a drill's output improves for a reason outside its assigned lever, that is a contaminated result — note it in the findings rather than accepting it.
- **`CLAUDE.md` must not exist at repo root until Task 5.** Its presence would contaminate the `v0` baseline.
- **Community design skills are installed at Task 9, not before.** Same reason.
- **Banned defaults** (enforced from `v1` onward, via `CLAUDE.md`): indigo→purple gradients; centered hero with two buttons; emoji as iconography; blanket `shadow-lg`; `max-w-7xl mx-auto` as the default container; copy containing "seamless", "empower", "effortless", "unlock", "elevate".
- **Every route must render both regions** (`IN`, `US`) via a working toggle.
- **Tailwind v4 is CSS-first.** Configuration lives in `@theme` inside CSS. There is no `tailwind.config.js`.
- **Capture before claiming.** No drill is complete until `pnpm shoot vN` has produced its six screenshots.

## Poster Artwork

Real posters, resolved 2026-08-15 by scraping TMDB's server-rendered search
pages — **no API key required**. Images are served from
`https://image.tmdb.org/t/p/w500/<file>.jpg` (verified: 200, `image/jpeg`).
The API key stays deferred to Phase B; only *live* data needs it, not images.

**16 of 22 titles have a poster. Six do not**, and that is kept deliberately:

| No poster | Why |
|---|---|
| India Tour of Sri Lanka | sports fixtures are not on TMDB |
| IndianOil Durand Cup 2026 | same |
| 108 Base Hospital: Uri | zero TMDB results |
| Pyaar Prema Kalyanam | zero TMDB results |
| Bigg Boss Agnipariksha (Telugu) | only unrelated matches |
| Bharat Bhagya Vidhaata | TMDB has only the unrelated 2002 film |

Every real OTT aggregator has gaps like these, concentrated exactly here — in
regional and sports content. **A designed missing-artwork state is therefore
a requirement of every drill, not an edge case.** A broken image icon, a grey
box, or a card that collapses is a failed drill. This is also the single
hardest thing for a naive build to get right, which makes it a good
discriminator between `v0` and later routes.

Two posters are approximate and marked `posterApprox: true` in the data —
`Aakhri Sawal` (matched TMDB's "The Last Journey", likely its international
title) and `Bigg Boss: The Common Man` (matched the generic Hindi *Bigg Boss*
series art). Corrected in Phase B.

All artwork is 2:3. Cards must not assume a poster exists.

## File Structure

```
web_development/
  CLAUDE.md                          # created Task 5, NOT before
  playbook/                          # written Tasks 10–11
  lab/
    package.json
    vite.config.js
    index.html
    scripts/shoot.mjs                # Task 3
    src/
      main.jsx                       # router; one entry per drill
      data/releases.js               # Task 2 — shared, the only shared data
      data/releases.test.js          # Task 2
      lib/regions.js                 # Task 2 — filter + platform metadata
      routes/
        Index.jsx                    # links to all six drills
        v0/                          # Task 4  — naive baseline
        v1/                          # Task 5  — constitution
        v2/                          # Task 6  — design system
        v3/                          # Task 7  — references
        v4/                          # Task 8  — screenshot loop
        v5/                          # Task 9  — community skills
    design/
      references/                    # Task 7 — captured gallery screenshots
      dna/                           # Task 7 — /taste output
      tokens.md                      # Task 6
    shots/vN/{viewport}-{theme}.png  # capture output, committed
```

Each `routes/vN/` folder is self-contained: its own `index.jsx`, its own components, its own `styles.css`. Duplication across drills is intentional and required.

---

### Task 1: Scaffold the lab

**Files:**
- Create: `lab/package.json`, `lab/vite.config.js`, `lab/index.html`, `lab/src/main.jsx`, `lab/src/routes/Index.jsx`, `lab/src/index.css`, `lab/.gitignore`
- Create: `.gitignore` (repo root)

**Interfaces:**
- Consumes: nothing
- Produces: a dev server on `http://localhost:5173`; routes `/`, `/v0` … `/v5` all resolve (stubs render the string `vN — not built yet`)

- [ ] **Step 1: Initialize git at repo root**

```bash
cd /Users/arunjalanila/MyProjects/web_development
git init
printf 'node_modules/\ndist/\n.DS_Store\n' > .gitignore
```

- [ ] **Step 2: Scaffold Vite + React**

```bash
cd /Users/arunjalanila/MyProjects/web_development
pnpm create vite@latest lab --template react
cd lab
pnpm install
pnpm add react-router-dom motion
pnpm add -D tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 playwright@1.62.1
```

- [ ] **Step 3: Wire Tailwind v4 into Vite**

`lab/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`lab/src/index.css` — the entire file:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Router with six stub routes**

`lab/src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Index from './routes/Index.jsx'

const DRILLS = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5']

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {DRILLS.map((d) => (
          <Route key={d} path={`/${d}`} element={<div>{d} — not built yet</div>} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
```

`lab/src/routes/Index.jsx`:

```jsx
import { Link } from 'react-router-dom'

const DRILLS = [
  ['v0', 'naive baseline — no levers'],
  ['v1', 'CLAUDE.md constitution'],
  ['v2', 'design system first'],
  ['v3', 'reference pipeline'],
  ['v4', 'screenshot loop'],
  ['v5', 'community skills'],
]

export default function Index() {
  return (
    <ul>
      {DRILLS.map(([slug, label]) => (
        <li key={slug}>
          <Link to={`/${slug}`}>{slug}</Link> — {label}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 5: Verify the server runs and all routes resolve**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm dev
```

Expected: server on `:5173`. Visit `/`, `/v0`, `/v5`. `/` lists six links; `/v0` shows `v0 — not built yet`. Stop the server.

- [ ] **Step 6: Commit**

```bash
cd /Users/arunjalanila/MyProjects/web_development
git add -A
git commit -m "chore: scaffold vite+react+tailwind4 lab with six drill routes"
```

---

### Task 2: The dataset

**Files:**
- Create: `lab/src/data/releases.js`
- Create: `lab/src/lib/regions.js`
- Test: `lab/src/data/releases.test.js`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `RELEASES: Release[]` where `Release = { id: string, title: string, platform: string, region: 'IN'|'US', date: string /* ISO */, endDate?: string, language?: string, type: 'series'|'movie'|'sport', tmdbId: number|null, poster: string|null, posterApprox?: boolean }`
  - `PLATFORMS: Record<string, { label: string, color: string }>` — `color` is a hex brand color, used for badges and for the missing-artwork fallback
  - `POSTER_BASE: string` — `'https://image.tmdb.org/t/p/w500'`
  - `posterUrl(release: Release): string | null` — **returns `null` for six releases; every consumer must handle it**
  - `releasesForRegion(region: 'IN'|'US'): Release[]` — sorted ascending by `date`
  - `titlesInBothRegions(): string[]` — titles present in both regions (currently `['Reacher S4', 'Lanterns']`)

- [ ] **Step 1: Write the failing test**

`lab/src/data/releases.test.js`:

```js
import { test, expect } from 'vitest'
import { RELEASES, PLATFORMS, posterUrl } from './releases.js'
import { releasesForRegion, titlesInBothRegions } from '../lib/regions.js'

test('both regions have releases', () => {
  expect(releasesForRegion('IN').length).toBeGreaterThan(5)
  expect(releasesForRegion('US').length).toBeGreaterThan(5)
})

test('releases are sorted ascending by date', () => {
  const dates = releasesForRegion('IN').map((r) => r.date)
  expect(dates).toEqual([...dates].sort())
})

test('Lanterns exists in both regions on different platforms', () => {
  const inRow = releasesForRegion('IN').find((r) => r.title === 'Lanterns')
  const usRow = releasesForRegion('US').find((r) => r.title === 'Lanterns')
  expect(inRow.platform).toBe('jiohotstar')
  expect(usRow.platform).toBe('hbomax')
  expect(inRow.date).not.toBe(usRow.date)
})

test('titlesInBothRegions surfaces the cross-region cases', () => {
  expect(titlesInBothRegions()).toContain('Lanterns')
})

test('sport entries carry a date range', () => {
  const sport = RELEASES.find((r) => r.type === 'sport' && r.endDate)
  expect(sport.endDate > sport.date).toBe(true)
})

test('every release references a known platform', () => {
  for (const r of RELEASES) expect(PLATFORMS[r.platform]).toBeDefined()
})

test('ids are unique', () => {
  const ids = RELEASES.map((r) => r.id)
  expect(new Set(ids).size).toBe(ids.length)
})

test('16 titles have poster artwork', () => {
  expect(RELEASES.filter((r) => r.poster).length).toBe(16)
})

test('exactly six releases have no artwork — the fallback must be designed', () => {
  const missing = RELEASES.filter((r) => !r.poster).map((r) => r.id)
  expect(missing.sort()).toEqual([
    'in-bb-te', 'in-bharat', 'in-durand', 'in-ppk', 'in-slcricket', 'in-uri',
  ])
})

test('posterUrl returns a full CDN url or null', () => {
  const withArt = RELEASES.find((r) => r.poster)
  const without = RELEASES.find((r) => !r.poster)
  expect(posterUrl(withArt)).toMatch(/^https:\/\/image\.tmdb\.org\/t\/p\/w500\/.+\.jpg$/)
  expect(posterUrl(without)).toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm add -D vitest
pnpm vitest run
```

Expected: FAIL — `Failed to resolve import "./releases.js"`

- [ ] **Step 3: Write the data module**

`lab/src/data/releases.js`:

```js
export const PLATFORMS = {
  netflix:      { label: 'Netflix',       color: '#E50914' },
  prime:        { label: 'Prime Video',   color: '#00A8E1' },
  jiohotstar:   { label: 'JioHotstar',    color: '#1F80E0' },
  zee5:         { label: 'ZEE5',          color: '#8230C6' },
  sonyliv:      { label: 'SonyLIV',       color: '#CF2027' },
  sunnxt:       { label: 'Sun NXT',       color: '#D5222B' },
  lionsgate:    { label: 'Lionsgate Play',color: '#F5C518' },
  hbomax:       { label: 'HBO Max',       color: '#7B2BF9' },
  disneyplus:   { label: 'Disney+',       color: '#113CCF' },
  hulu:         { label: 'Hulu',          color: '#1CE783' },
  appletv:      { label: 'Apple TV+',     color: '#8E8E93' },
}

export const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

/** Full poster URL, or null when no artwork exists. Cards must handle null. */
export function posterUrl(release) {
  return release.poster ? `${POSTER_BASE}/${release.poster}` : null
}

// Week of 15–21 Aug 2026. Sources: FilmiBeat, myvi.in, FilmyChill, Boston.com.
// Posters + tmdbId scraped from themoviedb.org search pages, 2026-08-15.
// `poster: null` is real and must render a designed fallback — see plan.
// `posterApprox: true` means the artwork is a best-effort match.
// US dates are less reliable than IN — sources disagreed. Corrected in Phase B.
export const RELEASES = [
  // ---- India ----
  { id: 'in-reacher4',   title: 'Reacher S4',                platform: 'prime',      region: 'IN', date: '2026-08-12', language: 'English',   type: 'series', tmdbId: 108978, poster: 'f1VCQIG2iCyOookdgOzwtUpwWC0.jpg' },
  { id: 'in-bharat',     title: 'Bharat Bhagya Vidhaata',    platform: 'zee5',       region: 'IN', date: '2026-08-14', language: 'Hindi',     type: 'movie',  tmdbId: null,   poster: null },
  { id: 'in-aakhri',     title: 'Aakhri Sawal',              platform: 'lionsgate',  region: 'IN', date: '2026-08-14', language: 'Hindi',     type: 'movie',  tmdbId: 1173397, poster: '28xV2X07CfoXGSRvO288AgECsQI.jpg', posterApprox: true },
  { id: 'in-wfh',        title: 'Mr. Work From Home',        platform: 'sunnxt',     region: 'IN', date: '2026-08-14', language: 'Telugu',    type: 'movie',  tmdbId: 1749087, poster: '2fGML9MV1iODxPctkAKfggUO722.jpg' },
  { id: 'in-uri',        title: '108 Base Hospital: Uri',    platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Hindi',     type: 'series', tmdbId: null,   poster: null },
  { id: 'in-bb-ml',      title: 'Bigg Boss Agnipareeksha',   platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Malayalam', type: 'series', tmdbId: 39323,  poster: '1GboWZREUaFkx11V4DtkLpQsiOs.jpg' },
  { id: 'in-bb-te',      title: 'Bigg Boss Agnipariksha',    platform: 'jiohotstar', region: 'IN', date: '2026-08-15', language: 'Telugu',    type: 'series', tmdbId: null,   poster: null },
  { id: 'in-slcricket',  title: 'India Tour of Sri Lanka',   platform: 'sonyliv',    region: 'IN', date: '2026-08-15', endDate: '2026-08-21', type: 'sport',  tmdbId: null,   poster: null },
  { id: 'in-durand',     title: 'IndianOil Durand Cup 2026', platform: 'sonyliv',    region: 'IN', date: '2026-08-15', endDate: '2026-08-21', type: 'sport',  tmdbId: null,   poster: null },
  { id: 'in-bb-kn',      title: 'Bigg Boss Agniparikshe',    platform: 'jiohotstar', region: 'IN', date: '2026-08-16', language: 'Kannada',   type: 'series', tmdbId: 207608, poster: 'cJZcrPPDcE4QmvRIg7540c46bth.jpg' },
  { id: 'in-bb-ta',      title: 'Bigg Boss: The Common Man', platform: 'jiohotstar', region: 'IN', date: '2026-08-16', language: 'Tamil',     type: 'series', tmdbId: 72908,  poster: 'pzu8AWFRvOlNys4fStVqd4kDpGO.jpg', posterApprox: true },
  { id: 'in-lanterns',   title: 'Lanterns',                  platform: 'jiohotstar', region: 'IN', date: '2026-08-17', language: 'English',   type: 'series', tmdbId: 95350,  poster: 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg' },
  { id: 'in-ppk',        title: 'Pyaar Prema Kalyanam',      platform: 'netflix',    region: 'IN', date: '2026-08-21', language: 'Tamil',     type: 'movie',  tmdbId: null,   poster: null },

  // ---- US ----
  { id: 'us-silo',       title: 'Silo',                          platform: 'appletv',    region: 'US', date: '2026-07-02', type: 'series', tmdbId: 125988, poster: 'gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg' },
  { id: 'us-daughter',   title: "My Daughter's Father",          platform: 'netflix',    region: 'US', date: '2026-07-22', type: 'series', tmdbId: 329394, poster: 'wUUS9lwm82R8nlYMIaijt8dQbIz.jpg' },
  { id: 'us-soyluna',    title: "Soy Luna: Let's Roll Again",    platform: 'disneyplus', region: 'US', date: '2026-07-24', type: 'series', tmdbId: 66203,  poster: '4JDmIzhNF7aMsDGlxVwkQ9kv9E6.jpg' },
  { id: 'us-lioness',    title: 'Lioness',                       platform: 'prime',      region: 'US', date: '2026-08-02', type: 'series', tmdbId: 113962, poster: 'rzpHPSEgPTpRs8EHbygwsOw7jC0.jpg' },
  { id: 'us-futurama',   title: 'Futurama',                      platform: 'hulu',       region: 'US', date: '2026-08-03', type: 'series', tmdbId: 615,    poster: 'eM8bbTn8C8vUwwS6upzzm7gX31u.jpg' },
  { id: 'us-tedlasso',   title: 'Ted Lasso',                     platform: 'prime',      region: 'US', date: '2026-08-04', type: 'series', tmdbId: 97546,  poster: 'uRHsiw1wLxPHFXkkv4Ix1s0O6f4.jpg' },
  { id: 'us-reacher4',   title: 'Reacher S4',                    platform: 'prime',      region: 'US', date: '2026-08-14', type: 'series', tmdbId: 108978, poster: 'f1VCQIG2iCyOookdgOzwtUpwWC0.jpg' },
  { id: 'us-lanterns',   title: 'Lanterns',                      platform: 'hbomax',     region: 'US', date: '2026-08-16', type: 'series', tmdbId: 95350,  poster: 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg' },
  { id: 'us-whisper',    title: 'The Whisper Man',               platform: 'netflix',    region: 'US', date: '2026-08-28', type: 'movie',  tmdbId: 860508, poster: '6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg' },
]
```

- [ ] **Step 4: Write the region helpers**

`lab/src/lib/regions.js`:

```js
import { RELEASES } from '../data/releases.js'

export const REGIONS = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
]

export function releasesForRegion(region) {
  return RELEASES
    .filter((r) => r.region === region)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function titlesInBothRegions() {
  const byTitle = new Map()
  for (const r of RELEASES) {
    if (!byTitle.has(r.title)) byTitle.set(r.title, new Set())
    byTitle.get(r.title).add(r.region)
  }
  return [...byTitle.entries()]
    .filter(([, regions]) => regions.size > 1)
    .map(([title]) => title)
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm vitest run
```

Expected: 11 passed

- [ ] **Step 6: Commit**

```bash
cd /Users/arunjalanila/MyProjects/web_development
git add -A
git commit -m "feat: real OTT release dataset for 15-21 Aug 2026 with region helpers"
```

---

### Task 3: Capture harness

**Files:**
- Create: `lab/scripts/shoot.mjs`
- Modify: `lab/package.json` (add `shoot` script)

**Interfaces:**
- Consumes: a running dev server at `http://localhost:5173`
- Produces: `pnpm shoot <route>` writes six PNGs to `lab/shots/<route>/` named `{390|768|1440}-{light|dark}.png`

- [ ] **Step 1: Write the capture script**

`lab/scripts/shoot.mjs`:

```js
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const route = process.argv[2]
if (!route) {
  console.error('usage: pnpm shoot <route>   e.g. pnpm shoot v0')
  process.exit(1)
}

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const VIEWPORTS = [390, 768, 1440]
const THEMES = ['light', 'dark']
const outDir = new URL(`../shots/${route}/`, import.meta.url)

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()

for (const width of VIEWPORTS) {
  for (const colorScheme of THEMES) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      colorScheme,
      deviceScaleFactor: 2,
    })
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' })
    // let entrance animations settle before capturing
    await page.waitForTimeout(1200)
    await page.screenshot({
      path: new URL(`${width}-${colorScheme}.png`, outDir).pathname,
      fullPage: true,
    })
    await page.close()
    console.log(`✓ ${route} ${width}px ${colorScheme}`)
  }
}

await browser.close()
```

- [ ] **Step 2: Add the npm script**

In `lab/package.json`, add to `"scripts"`:

```json
"shoot": "node scripts/shoot.mjs"
```

- [ ] **Step 3: Install the browser binary**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm exec playwright install chromium
```

- [ ] **Step 4: Verify against a stub route**

Run the dev server in one shell, then:

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm shoot v0
ls shots/v0
```

Expected: six files — `390-light.png`, `390-dark.png`, `768-light.png`, `768-dark.png`, `1440-light.png`, `1440-dark.png`

- [ ] **Step 5: Commit**

```bash
cd /Users/arunjalanila/MyProjects/web_development
git add -A
git commit -m "feat: playwright capture harness — 3 viewports x 2 themes"
```

---

### Task 4: Drill v0 — the naive baseline

**Purpose:** Establish the specimen. This route is *supposed* to look generic. Do not improve it.

**Files:**
- Create: `lab/src/routes/v0/index.jsx`
- Modify: `lab/src/main.jsx` (swap the `v0` stub for the real component)

**Interfaces:**
- Consumes: `releasesForRegion`, `REGIONS` from `src/lib/regions.js`; `PLATFORMS` from `src/data/releases.js`
- Produces: a rendered `/v0` route and `shots/v0/`

- [ ] **Step 1: Build v0 from the naive prompt, verbatim**

Execute exactly this prompt with **no additional direction, no reference images, no screenshot review, and no design skills installed**:

> Build a modern, clean landing page that shows this week's new OTT releases. It should have a toggle to switch between India and US. Make it look professional and modern.

Constraints on the implementer: use only default Tailwind utilities and the default font stack. Do not consult references. Do not look at the rendered output. Ship the first complete version.

- [ ] **Step 2: Wire the route**

In `lab/src/main.jsx`, import and mount it:

```jsx
import V0 from './routes/v0/index.jsx'
// …
<Route path="/v0" element={<V0 />} />
```

- [ ] **Step 3: Verify it renders and the toggle works**

Start the dev server, open `/v0`, click the region toggle. Expected: the list changes between 13 India rows and 9 US rows.

- [ ] **Step 4: Capture**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm shoot v0
```

Expected: six PNGs in `shots/v0/`

- [ ] **Step 5: Record the baseline tells**

Create `playbook/findings/v0.md`. Look at the six screenshots and list every generic tell actually present — not the ones predicted in the spec, the ones visible. For each, note the specific element. This file becomes the scoring rubric for every later drill.

- [ ] **Step 6: Commit**

```bash
cd /Users/arunjalanila/MyProjects/web_development
git add -A
git commit -m "feat(v0): naive baseline + captured tells"
```

---

### Task 5: Drill v1 — the constitution

**Lever:** standing negative constraints, applied with no other change.

**Files:**
- Create: `CLAUDE.md` (repo root — **first time it may exist**)
- Create: `lab/src/routes/v1/index.jsx`
- Modify: `lab/src/main.jsx`

**Interfaces:**
- Consumes: same data interfaces as Task 4
- Produces: `/v1`, `shots/v1/`, `playbook/findings/v1.md`

- [ ] **Step 1: Write the constitution**

`CLAUDE.md` at repo root:

```markdown
# Design Constitution

Applies to all frontend work in this repository.

## Banned outright

- Indigo→purple (or any violet) gradient as a background or accent.
- Centered hero with a headline, subhead, and two buttons.
- Emoji used as iconography.
- `shadow-lg` (or heavier) applied broadly. Elevation must be earned by one or two elements.
- `max-w-7xl mx-auto` as the reflexive container.
- Gradient text.
- Cards nested inside cards.
- Copy containing: seamless, empower, effortless, unlock, elevate, revolutionize, supercharge.
- Default Tailwind palette colors as brand colors (`blue-500`, `indigo-600`, `slate-*` as an accent).

## Required

- Exactly one accent color across the page.
- A deliberate type scale — no more than four sizes on one screen.
- Asymmetry somewhere. A page where every section is centered is a failed page.
- Real copy about real titles. No filler.
- Both light and dark must be designed, not inherited.

## Process

- Before claiming any surface complete, capture it with `pnpm shoot <route>` and look at the images.
```

- [ ] **Step 2: Build v1**

Same naive prompt as Task 4, verbatim, with `CLAUDE.md` now in force. Still: no references, no screenshot review, no design skills.

- [ ] **Step 3: Wire, verify, capture**

Mount `/v1` in `main.jsx` as in Task 4 Step 2. Verify the toggle. Then:

```bash
pnpm shoot v1
```

- [ ] **Step 4: Score against v0**

Create `playbook/findings/v1.md`. Walk the tell list from `v0.md` and mark each **fixed / unchanged / newly introduced**. Note any tell the constitution missed — those become new constitution lines.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(v1): design constitution + delta vs v0"
```

---

### Task 6: Drill v2 — design system first

**Lever:** define tokens before writing any markup.

**Files:**
- Create: `lab/design/tokens.md`
- Create: `lab/src/routes/v2/index.jsx`, `lab/src/routes/v2/theme.css`
- Modify: `lab/src/main.jsx`

- [ ] **Step 1: Write `lab/design/tokens.md` before any component**

Must specify, with concrete values: a typeface pairing (self-hosted or Google Fonts, and explicitly not Inter); a modular type scale (base size and ratio, four steps); a spacing scale; one accent color with its light/dark variants; a radius rule; an elevation rule; and motion timings with named easing curves.

- [ ] **Step 2: Express the tokens in Tailwind v4 `@theme`**

`lab/src/routes/v2/theme.css` — Tailwind v4 is CSS-first, so tokens are declared in CSS, e.g.:

```css
@theme {
  --font-display: "Instrument Serif", serif;
  --font-body: "Geist", system-ui, sans-serif;
  --color-accent: oklch(0.72 0.19 45);
  --ease-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

Replace these placeholders with the actual values chosen in Step 1.

- [ ] **Step 3: Build v2 from the tokens**

Same prompt, but every color, size, and spacing value must resolve to a token. No arbitrary values (`text-[13px]`, `bg-[#1a1a1a]`) anywhere.

- [ ] **Step 4: Wire, verify, capture**

```bash
pnpm shoot v2
```

- [ ] **Step 5: Score, then commit**

Create `playbook/findings/v2.md` scoring against the `v0` tell list. Then:

```bash
git add -A && git commit -m "feat(v2): token-first design system + delta vs v1"
```

---

### Task 7: Drill v3 — the reference pipeline

**Lever:** evidence instead of adjectives.

**Files:**
- Create: `lab/design/references/*.png`
- Create: `lab/design/dna/*.md`, `lab/design/dna/*.json`
- Create: `lab/src/routes/v3/index.jsx`, `lab/src/routes/v3/theme.css`
- Modify: `lab/src/main.jsx`

- [ ] **Step 1: Install the DNA extractor skill**

```bash
git clone https://github.com/senlindesign/taste-skill ~/.claude/skills/taste
```

Verify `/taste` appears in the skill list. It requires Playwright MCP, already connected.

- [ ] **Step 2: Source references from galleries**

Browse [Godly](https://godly.website), [Land-book](https://land-book.com), [Lapa Ninja](https://www.lapa.ninja), and [Mobbin](https://mobbin.com) with Playwright. Capture 8–12 candidates into `lab/design/references/`. Bias toward **catalog, grid, and card-dense** layouts — this is a browse surface, not a landing page. Marketing hero shots are the wrong reference class here.

- [ ] **Step 3: Extract design DNA from the strongest four**

```
/taste <url>
```

for each. Output lands in `lab/design/dna/`.

- [ ] **Step 4: Synthesize, do not clone**

Write `lab/design/dna/SYNTHESIS.md`: for each of type scale, spacing rhythm, color relationships, elevation, and motion timing, state which reference informed the decision and **why that decision suits an OTT catalog specifically**. Copying any single reference wholesale is a failed drill.

- [ ] **Step 5: Rebuild v2's token set from the synthesis, then build v3**

- [ ] **Step 6: Capture, score, commit**

```bash
pnpm shoot v3
git add -A && git commit -m "feat(v3): reference-driven design + DNA synthesis"
```

Create `playbook/findings/v3.md` before committing.

---

### Task 8: Drill v4 — the screenshot loop

**Lever:** the model looks at its own output and critiques it.

**Files:**
- Create: `lab/src/routes/v4/index.jsx`, `lab/src/routes/v4/theme.css`
- Create: `playbook/findings/v4-rounds.md`
- Modify: `lab/src/main.jsx`

- [ ] **Step 1: Copy v3 forward as the starting point**

`v4` begins as a duplicate of `v3`. This drill isolates the *loop*, not a fresh build.

- [ ] **Step 2: Run three critique rounds**

For each round 1–3:
1. `pnpm shoot v4`
2. Read all six images.
3. Write the round's critique into `playbook/findings/v4-rounds.md` **before** editing — at least five specific defects with element and viewport named. "Looks unbalanced" is not a defect; "at 390px the platform badge wraps to a second line and breaks card rhythm" is.
4. Fix only the listed defects.

- [ ] **Step 3: Run the design-iterator agent for a fourth pass**

Use the installed `compound-engineering:design:design-iterator` agent against `/v4`. Record what it caught that the manual rounds missed.

- [ ] **Step 4: Capture, score, commit**

```bash
pnpm shoot v4
git add -A && git commit -m "feat(v4): screenshot critique loop, 3 rounds + iterator"
```

Create `playbook/findings/v4.md` before committing.

---

### Task 9: Drill v5 — community skills

**Lever:** pre-packaged taste, stacked.

**Files:**
- Create: `lab/src/routes/v5/index.jsx`, `lab/src/routes/v5/theme.css`
- Create: `playbook/findings/v5-conflicts.md`
- Modify: `lab/src/main.jsx`

- [ ] **Step 1: Install all three skills**

Handles verified 2026-08-15; the widely-circulated versions of two of these are 404s.

```bash
npx skills add emilkowalski/skill      # motion — NOT emilkowal/skill
npx skills add Leonxlnx/taste-skill    # anti-slop — NOT Leonxlnx/taste
```

Then, in Claude Code:

```
/plugin marketplace add pbakaus/impeccable
```

and from `lab/`:

```bash
npx impeccable install
```

then `/impeccable init`.

- [ ] **Step 2: Copy v4 forward, then rebuild under the skills**

- [ ] **Step 3: Log conflicts as they occur**

Record every case where the three skills disagree on spacing, color, or motion in `playbook/findings/v5-conflicts.md`: what each wanted, which won, and why. The spec flags this as the most instructive moment in the sequence — do not silently resolve them.

- [ ] **Step 4: Capture, score, commit**

```bash
pnpm shoot v5
git add -A && git commit -m "feat(v5): community design skills stacked + conflict log"
```

Create `playbook/findings/v5.md` before committing.

---

### Task 10: The verdict pass

**Files:**
- Create: `playbook/02-the-levers.md`, `playbook/05-troubleshooting.md`
- Create: `playbook/findings/RANKING.md`

- [ ] **Step 1: Audit all six routes**

```
/impeccable audit
```

against each of `/v0` … `/v5`. Record the scores in `playbook/findings/RANKING.md` — a third-party number none of us authored.

- [ ] **Step 2: Rank by human judgment too**

Lay the six `1440-dark.png` captures side by side. Arun ranks them without seeing the audit scores first. Record both rankings and note where they disagree — disagreement between the tool and the eye is itself a finding.

- [ ] **Step 3: Write `02-the-levers.md`**

One section per lever, each stating: what it is, the measured delta it produced here, and when to reach for it. Use the actual observed results. If a lever underperformed the spec's prediction — particularly if `v5` added little over `v4` — say so plainly.

- [ ] **Step 4: Write `05-troubleshooting.md`**

A symptom→lever table derived from the findings files. Every row must trace to something observed in `v0`–`v5`, not to general design advice.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: verdict pass — rankings, levers, troubleshooting"
```

---

### Task 11: Complete the playbook

**Files:**
- Create: `playbook/01-why-output-is-generic.md`, `playbook/03-prompt-patterns.md`, `playbook/04-screenshot-loop.md`, `playbook/06-evaluating-skills.md`
- Modify: `CLAUDE.md` (fold in constitution lines discovered during drills)

- [ ] **Step 1: Write `01-why-output-is-generic.md`** — the mechanism, illustrated with the actual `v0` captures.

- [ ] **Step 2: Write `03-prompt-patterns.md`** — the openers that produced good results, quoted verbatim from what was actually run in Tasks 4–9, with the resulting screenshot referenced for each.

- [ ] **Step 3: Write `04-screenshot-loop.md`** — the loop as run in Task 8, including `shoot.mjs` usage and what makes a critique specific enough to act on.

- [ ] **Step 4: Write `06-evaluating-skills.md`** — the method used on the Instagram post: verify handles resolve, read the README, isolate the skill in one drill, measure the delta. Include the three 404s as the worked example.

- [ ] **Step 5: Update `CLAUDE.md`** with every constitution line discovered during the drills that was not in the original list.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "docs: complete design operating playbook"
```

---

## Verification

**Per drill:** six screenshots exist in `shots/vN/`; the region toggle changes the list; a `playbook/findings/vN.md` scores that route against the `v0` tell list.

**End to end:**

```bash
cd /Users/arunjalanila/MyProjects/web_development/lab
pnpm vitest run          # dataset invariants — 11 passing
pnpm dev                 # then visit / and click through all six drills
for v in v0 v1 v2 v3 v4 v5; do pnpm shoot $v; done
ls shots/*/ | wc -l      # expect 36 PNGs
```

**The real test:** the six `1440-dark.png` captures, viewed in order, should show a monotonic improvement. Any place they do not is the most valuable finding in the project, and `05-troubleshooting.md` must explain it rather than omit it.
