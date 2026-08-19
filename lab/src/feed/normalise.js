// Turn a pile of raw records into something a route can render without
// defending itself at every field access.

import { PLATFORMS as KNOWN_PLATFORMS } from '../data/releases.js'
import { humanisePlatform, validateRelease } from './schema.js'

/**
 * @param {unknown[]} records  raw rows from any source
 * @param {object}    [opts]
 * @param {object}    [opts.knownPlatforms]  defaults to the curated map
 * @returns {{ releases: object[], platforms: object, rejected: object[], duplicates: object[] }}
 *
 * The contract the routes rely on:
 *   - every release in `releases` passed `validateRelease`
 *   - every `release.platform` is a key present in `platforms`
 *   - `releases` is sorted ascending by date, then by title so equal dates
 *     have a stable order rather than the source's arbitrary one
 *   - ids are unique
 */
export function normaliseFeed(records, { knownPlatforms = KNOWN_PLATFORMS } = {}) {
  const releases = []
  const rejected = []
  const duplicates = []
  const seen = new Map()

  // Start from a copy: discovering a platform must never mutate the curated
  // map, or the second call in a test run sees the first call's leftovers.
  const platforms = { ...knownPlatforms }

  for (const [index, raw] of (Array.isArray(records) ? records : []).entries()) {
    const result = validateRelease(raw)
    if (!result.ok) {
      rejected.push({
        index,
        id: raw && typeof raw === 'object' ? (raw.id ?? null) : null,
        title: raw && typeof raw === 'object' ? (raw.title ?? null) : null,
        reasons: result.reasons,
      })
      continue
    }

    const release = result.value

    // A feed that lists the same id twice is not an error worth throwing away
    // the whole run for; the first occurrence wins and the collision is
    // reported. Two *different* rows sharing an id is a source bug, and it
    // shows up here rather than as one card mysteriously missing.
    if (seen.has(release.id)) {
      duplicates.push({ id: release.id, title: release.title, keptTitle: seen.get(release.id).title })
      continue
    }

    // The hazard that actually breaks the page. Routes read
    // `PLATFORMS[r.platform].label`, so an unknown key is a TypeError, not a
    // blank. Register it with a derived label instead: a slightly wrong label
    // is a visible prompt to add the platform properly.
    if (!platforms[release.platform]) {
      platforms[release.platform] = {
        label: humanisePlatform(release.platform),
        color: null,
        derived: true,
      }
    }

    seen.set(release.id, release)
    releases.push(release)
  }

  releases.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))

  return { releases, platforms, rejected, duplicates }
}

/** Platforms that were invented by `normaliseFeed` rather than curated. */
export const derivedPlatforms = (platforms) =>
  Object.entries(platforms)
    .filter(([, p]) => p.derived)
    .map(([key, p]) => ({ key, label: p.label }))
