// Download every poster the feed references into .posters-cache/, at w342.
//
// The cache is gitignored: the repo's NOTICE keeps its hotlink-only stance for
// what is *committed*. The one agreed exception is the published sandbox
// preview, which embeds these files as data URIs at bundle time — recorded in
// NOTICE, decided by the repo owner on 2026-08-20.
//
// Exits 2 with a plain explanation while image.tmdb.org is unreachable, and
// refuses to write a partial cache silently — a poster pass on half the
// artwork is the "empty result vs total failure" trap wearing a beret.

import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { RELEASES } from '../src/data/releases.js'
import { CURATED } from '../src/feed/sources/curated.js'

const SIZE = 'w342'
const outDir = fileURLToPath(new URL('../.posters-cache/', import.meta.url))
await mkdir(outDir, { recursive: true })

const rows = [...RELEASES, ...CURATED].filter(
  (r) => r.poster && !r.poster.startsWith('data:') && !r.poster.startsWith('http'),
)
const files = [...new Set(rows.map((r) => r.poster))]

console.log(`${files.length} distinct poster file(s) referenced by the feed`)

let ok = 0
const failures = []
for (const file of files) {
  const url = `https://image.tmdb.org/t/p/${SIZE}/${file}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      failures.push({ file, status: res.status })
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(`${outDir}${file}`, buf)
    ok++
    console.log(`  ok  ${file}  ${(buf.length / 1024).toFixed(0)}KB`)
  } catch (err) {
    failures.push({ file, error: String(err).slice(0, 80) })
  }
}

if (ok === 0 && failures.length) {
  console.error(`\nEvery download failed (${failures.length}).`)
  console.error('image.tmdb.org is still unreachable from this network — the environment\'s')
  console.error('allowed-domains list needs image.tmdb.org before this script can work.')
  process.exit(2)
}
if (failures.length) {
  console.error(`\n${failures.length} of ${files.length} failed:`)
  for (const f of failures) console.error('  ', JSON.stringify(f))
  process.exit(1)
}
console.log(`\nall ${ok} posters cached in .posters-cache/ at ${SIZE}`)
