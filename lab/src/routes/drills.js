import { lazy } from 'react'

// One drill's code and stylesheet per page load, and not for bundle size.
// Imported eagerly, every route's CSS is attached to every page — so
// `npx impeccable detect http://localhost:5173/v6` was scanning v1 through v5's
// stylesheets too and reporting their literal spacing values against v6. It
// fired the same `monotonous-spacing` finding on /v4 and /v6 alike, from
// declarations neither page owns; splitting the routes dropped /v4 back to the
// 3 findings RANKING.md recorded. The constitution says audit the running page.
// The running page has to be only the page.
export const V0 = lazy(() => import('./v0/V0.jsx'))
export const V1 = lazy(() => import('./v1/V1.jsx'))
export const V2 = lazy(() => import('./v2/index.jsx'))
export const V3 = lazy(() => import('./v3/V3.jsx'))
export const V4 = lazy(() => import('./v4/V4.jsx'))
export const V5 = lazy(() => import('./v5/V5.jsx'))
export const V6 = lazy(() => import('./v6/V6.jsx'))
