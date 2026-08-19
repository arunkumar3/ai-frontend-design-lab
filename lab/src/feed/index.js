// What a route imports. One call, one validated result, no direct access to
// `RELEASES` anywhere downstream.

import { normaliseFeed, derivedPlatforms } from './normalise.js'
import { snapshotSource } from './sources/snapshot.js'

/**
 * The test seam.
 *
 * `pnpm feed:shapes` drives the real page against feeds the snapshot cannot
 * produce — an empty region, a 50-title week, records with fields missing, a
 * platform nobody has heard of. Those shapes have to arrive as *data*, because
 * the point is to exercise the layout and the boundary together; asserting on
 * `normaliseFeed` alone would prove the parser works and tell us nothing about
 * whether a 50-title week renders.
 *
 * Guarded on `import.meta.env.DEV`, so it is dead code in a production build.
 */
function injectedRecords() {
  if (!import.meta.env.DEV) return null
  const injected = globalThis.__FEED__
  return Array.isArray(injected) ? injected : null
}

/**
 * @returns {{
 *   releases: object[], platforms: object, rejected: object[],
 *   duplicates: object[], sourceId: string, sourceLabel: string
 * }}
 */
export function loadFeed({ source = snapshotSource } = {}) {
  const injected = injectedRecords()
  const records = injected ?? source.read()
  const { releases, platforms, rejected, duplicates } = normaliseFeed(records)

  return {
    releases,
    platforms,
    rejected,
    duplicates,
    derived: derivedPlatforms(platforms),
    sourceId: injected ? 'injected' : source.id,
    sourceLabel: injected ? `Injected (${records.length} records)` : source.label,
  }
}

/** Date-ordered releases for one region. */
export const forRegion = (feed, region) => feed.releases.filter((r) => r.region === region)

/** Regions the feed actually carries, in a stable order. */
export const regionsIn = (feed) =>
  ['IN', 'US'].filter((code) => feed.releases.some((r) => r.region === code))

/**
 * Titles that appear in more than one region. A reader who toggles region and
 * meets the same poster again reads it as a bug unless the card says why.
 */
export function titlesInBothRegions(feed) {
  const byTitle = new Map()
  for (const r of feed.releases) {
    if (!byTitle.has(r.title)) byTitle.set(r.title, new Set())
    byTitle.get(r.title).add(r.region)
  }
  return [...byTitle.entries()].filter(([, regions]) => regions.size > 1).map(([title]) => title)
}
