import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

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
    // fileURLToPath, not .pathname — .pathname stays percent-encoded, so a repo
    // path containing a space would write to a literal "%20" path and ENOENT.
    await page.screenshot({
      path: fileURLToPath(new URL(`${width}-${colorScheme}.png`, outDir)),
      fullPage: true,
    })
    await page.close()
    console.log(`✓ ${route} ${width}px ${colorScheme}`)
  }
}

await browser.close()
