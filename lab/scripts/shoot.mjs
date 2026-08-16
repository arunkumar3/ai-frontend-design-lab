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
