// The live weekly feed. `.github/workflows/fetch-feed.yml` runs on a cron
// (Thursdays, when the network is open on a GitHub runner) and commits its
// output here — the same pattern this repo already uses for posters: fetch
// where egress is open, publish through git, read as a static import where it
// is not.
//
// Runs have landed since this file was written, so `releases` is no longer
// empty; each week joins the archive alongside the frozen snapshot and the
// curated week, and `normaliseFeed` dedupes by id, so a fetch window that
// overlaps a previous run collides safely instead of doubling up. The windows
// deliberately overlap — see `../window.js`.
//
// `[]` here would now mean something has gone wrong rather than a quiet week:
// `scripts/fetch-feed.mjs` refuses to write a zero-record run at all, so an
// empty array can only arrive by someone emptying the file by hand. `v7`'s
// designed empty state still covers it, reachable through `?week=`.
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
