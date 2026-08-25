// The live weekly feed. `.github/workflows/fetch-feed.yml` runs on a cron
// (Thursdays, when the network is open on a GitHub runner) and commits its
// output here — the same pattern this repo already uses for posters: fetch
// where egress is open, publish through git, read as a static import where it
// is not.
//
// No CI run has ever completed, so `releases` starts as `[]`. That is a
// legitimate empty result, not a failure — see the empty-vs-failure rule in
// CLAUDE.md — and `v7` already has a designed empty state reachable through
// `?week=`. Once a run lands, its week joins the archive alongside the frozen
// snapshot and the curated week; `normaliseFeed` dedupes by id, so a fetch
// window that overlaps a previous run collides safely instead of doubling up.
//
// TMDB cannot supply sport (see `sources/tmdb.js`), so the frozen snapshot's
// two fixtures stay the only sport rows until a second live source exists.

// The import attribute is required by plain Node (verify-v7.mjs, feed:fetch)
// and accepted (ignored) by Vite's own JSON handling — needed either way.
import feed from '../../data/feed.live.json' with { type: 'json' }

export const generatedSource = {
  id: 'generated',
  label: feed.fetchedFor
    ? `TMDB live (${feed.fetchedFor.from}..${feed.fetchedFor.to})`
    : 'TMDB live (no run yet)',
  read: () => (Array.isArray(feed.releases) ? feed.releases : []),
}
