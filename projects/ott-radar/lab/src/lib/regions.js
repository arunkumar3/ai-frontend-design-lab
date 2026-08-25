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
