// WCAG contrast for the v6 palette. Constitution: "Text contrast must be
// computed, not eyeballed. 4.5:1 for body, 3:1 for large."
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
  canvas: '#1D1410',
  surfaceA: '#2A1D16',
  surfaceB: '#3A281D',
  surfaceC: '#33251B',
  text: '#F6EFE6',
  muted: '#B39C87',
  accent: '#E0983F',
  accentInk: '#21140A',
}
const LIGHT = {
  canvas: '#F4EDE2',
  surfaceA: '#E8DECE',
  surfaceB: '#DBCDB6',
  surfaceC: '#EFE2CD',
  text: '#211610',
  muted: '#6A5443',
  accent: '#8C4711',
  accentInk: '#FFF7EC',
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
    ['accent day-label on canvas', p.accent, p.canvas, 4.5],
    ['accent-ink on accent pill', p.accentInk, p.accent, 4.5],
    ['accent focus ring on canvas', p.accent, p.canvas, 3.0],
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
