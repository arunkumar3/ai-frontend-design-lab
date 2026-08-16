// WCAG contrast for the v6 palette. Constitution: "Text contrast must be
// computed, not eyeballed. 4.5:1 for body, 3:1 for large."
//
// The last three rows of each theme are not contrast requirements — they check
// that a fallback panel is far enough off the canvas to read as a surface
// rather than as a hole punched in the page. That defect shipped twice.
const hex = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const lin = (c) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const lum = (h) => {
  const [r, g, b] = hex(h)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const DARK = {
  canvas: '#262320',
  surfaceA: '#383329',
  surfaceB: '#453F33',
  surfaceC: '#302B23',
  text: '#EFEBE3',
  muted: '#B5ADA1',
  accent: '#5FC3CE',
  accentInk: '#0E2529',
}
const LIGHT = {
  canvas: '#DEDAD2',
  surfaceA: '#C9C2B4',
  surfaceB: '#BAB2A2',
  surfaceC: '#D1CABC',
  text: '#191714',
  muted: '#443E37',
  accent: '#09545B',
  accentInk: '#F0F7F7',
}

const checks = (p, name) => {
  const rows = [
    ['body text on canvas', p.text, p.canvas, 4.5],
    ['body text on surface-a', p.text, p.surfaceA, 4.5],
    ['body text on surface-b', p.text, p.surfaceB, 4.5],
    ['body text on surface-c', p.text, p.surfaceC, 4.5],
    ['muted meta on canvas', p.muted, p.canvas, 4.5],
    ['muted meta on surface-a', p.muted, p.surfaceA, 4.5],
    ['muted meta on surface-b', p.muted, p.surfaceB, 4.5],
    ['muted meta on surface-c', p.muted, p.surfaceC, 4.5],
    ['accent standing/today on canvas', p.accent, p.canvas, 4.5],
    ['accent on surface-a', p.accent, p.surfaceA, 4.5],
    ['accent-ink on accent pill', p.accentInk, p.accent, 4.5],
    ['accent focus ring on canvas', p.accent, p.canvas, 3.0],
    ['fallback surface-a reads off canvas', p.surfaceA, p.canvas, 1.15],
    ['fallback surface-b reads off canvas', p.surfaceB, p.canvas, 1.15],
    ['fallback surface-c reads off canvas', p.surfaceC, p.canvas, 1.1],
  ]
  console.log(`\n== ${name} ==`)
  let fails = 0
  for (const [label, fg, bg, floor] of rows) {
    const r = ratio(fg, bg)
    const ok = r >= floor
    if (!ok) fails++
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1  (need ${floor})  ${label}  ${fg} on ${bg}`,
    )
  }
  return fails
}

const fails = checks(DARK, 'dark') + checks(LIGHT, 'light')
console.log(`\n${fails} failing pair(s)`)
process.exit(fails ? 1 : 0)
