// The frozen 22-row snapshot, presented as a feed source.
//
// It is the default source and the fixture the tests run against, but it is no
// longer what a route imports directly: it goes through the same validation as
// anything off the network, so the boundary is exercised on every page load
// rather than only when a real feed is wired up. A snapshot that quietly
// bypassed the checks would be a boundary nobody had ever run.

import { RELEASES } from '../../data/releases.js'

export const snapshotSource = {
  id: 'snapshot',
  label: 'Frozen snapshot (22 titles, scraped 2026-08-15)',
  /** Synchronous: it is an in-repo array, not I/O. */
  read: () => RELEASES,
}
