// Sample the real poster art for this week's slate and quantise it, so the v6
// palette is derived rather than asserted.
import { chromium } from 'playwright'

const POSTERS = [
  ['Reacher S4', 'f1VCQIG2iCyOookdgOzwtUpwWC0.jpg'],
  ['Aakhri Sawal', '28xV2X07CfoXGSRvO288AgECsQI.jpg'],
  ['Mr. Work From Home', '2fGML9MV1iODxPctkAKfggUO722.jpg'],
  ['Bigg Boss Agnipareeksha', '1GboWZREUaFkx11V4DtkLpQsiOs.jpg'],
  ['Bigg Boss Agniparikshe', 'cJZcrPPDcE4QmvRIg7540c46bth.jpg'],
  ['Bigg Boss: The Common Man', 'pzu8AWFRvOlNys4fStVqd4kDpGO.jpg'],
  ['Lanterns', 'rb94rKVIzLyfWufIN7WqLvadBDH.jpg'],
]

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/')

const out = await page.evaluate(async (posters) => {
  const load = (url) =>
    new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img)
      img.onerror = rej
      img.src = url
    })

  const toHex = (r, g, b) =>
    '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

  // rgb -> hsl, for reporting hue families
  const hsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0, s = 0
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      h *= 60
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
  }

  const results = []
  const all = []
  for (const [title, file] of posters) {
    const img = await load(`https://image.tmdb.org/t/p/w500/${file}`)
    const c = document.createElement('canvas')
    c.width = 60; c.height = 90
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, 60, 90)
    const { data } = ctx.getImageData(0, 0, 60, 90)

    // coarse 4x4x4 bucket histogram, weighted by saturation so a poster's
    // subject colour beats its large flat dark areas
    const buckets = new Map()
    let rs = 0, gs = 0, bs = 0, n = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      rs += r; gs += g; bs += b; n++
      all.push([r, g, b])
      const key = `${r >> 6},${g >> 6},${b >> 6}`
      const [, s] = hsl(r, g, b)
      const cur = buckets.get(key) || { r: 0, g: 0, b: 0, w: 0, n: 0 }
      const w = 1 + s / 25
      cur.r += r * w; cur.g += g * w; cur.b += b * w; cur.w += w; cur.n++
      buckets.set(key, cur)
    }
    const top = [...buckets.values()]
      .sort((a, b) => b.w - a.w)
      .slice(0, 3)
      .map((x) => {
        const r = x.r / x.w, g = x.g / x.w, b = x.b / x.w
        return { hex: toHex(r, g, b), hsl: hsl(r, g, b), share: +(x.n / n).toFixed(3) }
      })
    results.push({ title, mean: toHex(rs / n, gs / n, bs / n), top })
  }

  // whole-slate dominant hues
  const hueHist = new Array(36).fill(0)
  let satSum = 0, litSum = 0
  for (const [r, g, b] of all) {
    const [h, s, l] = hsl(r, g, b)
    if (s > 18 && l > 8 && l < 92) hueHist[Math.floor(h / 10) % 36] += 1
    satSum += s; litSum += l
  }
  const topHues = hueHist
    .map((count, i) => ({ hue: i * 10, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return {
    perPoster: results,
    slate: {
      topHues,
      meanSat: Math.round(satSum / all.length),
      meanLit: Math.round(litSum / all.length),
    },
  }
}, POSTERS)

console.log(JSON.stringify(out, null, 2))
await browser.close()
