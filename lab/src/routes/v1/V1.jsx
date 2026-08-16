import { useMemo, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { REGIONS, releasesForRegion } from '../../lib/regions.js'
import { formatDayHeading, formatDateRange, groupByDate, todayISO } from './format.js'
import RegionToggle from './RegionToggle.jsx'
import ReleaseCard from './ReleaseCard.jsx'
import './v1.css'

export default function V1() {
  const [region, setRegion] = useState(REGIONS[0].code)
  const today = useMemo(() => todayISO(), [])

  const releases = useMemo(() => releasesForRegion(region), [region])
  const groups = useMemo(() => groupByDate(releases), [releases])
  const regionLabel = REGIONS.find((r) => r.code === region)?.label ?? region

  const platformCount = useMemo(() => new Set(releases.map((r) => r.platform)).size, [releases])
  const rangeLabel = releases.length
    ? formatDateRange(releases[0].date, releases[releases.length - 1].date)
    : null

  return (
    <MotionConfig reducedMotion="user">
      <div className="v1-page">
        <div className="v1-shell py-10 md:py-14">
          <header className="flex flex-col gap-6 pb-8 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10">
            <div className="max-w-2xl">
              <p className="v1-text-caption font-semibold uppercase" style={{ color: 'var(--accent)' }}>
                New this week &middot; {regionLabel}
              </p>
              <h1 className="v1-text-display mt-1 font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                What's landing on streaming
              </h1>
              {rangeLabel && (
                <p className="v1-text-body mt-3" style={{ color: 'var(--ink-soft)' }}>
                  {releases.length} title{releases.length === 1 ? '' : 's'} across {platformCount} platform
                  {platformCount === 1 ? '' : 's'}, {rangeLabel}.
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
              <span className="v1-text-caption font-medium uppercase" style={{ color: 'var(--ink-faint)' }}>
                Region
              </span>
              <RegionToggle regions={REGIONS} value={region} onChange={setRegion} />
            </div>
          </header>

          <div className="v1-rule" />

          <main className="flex flex-col">
            {groups.map((group, i) => (
              <motion.section
                key={group.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.04 }}
                className="grid grid-cols-1 gap-4 border-b py-7 md:grid-cols-[10rem_1fr] md:gap-8"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h2 className="v1-text-heading font-semibold" style={{ color: 'var(--ink)' }}>
                    {formatDayHeading(group.date)}
                  </h2>
                  <p className="v1-text-caption mt-1 uppercase" style={{ color: 'var(--ink-faint)' }}>
                    {group.items.length} release{group.items.length === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
                  {group.items.map((release) => (
                    <ReleaseCard key={release.id} release={release} isNewToday={release.date === today} />
                  ))}
                </div>
              </motion.section>
            ))}

            {groups.length === 0 && (
              <p className="v1-text-body py-16" style={{ color: 'var(--ink-soft)' }}>
                No releases found for {regionLabel} this week.
              </p>
            )}
          </main>

          <footer className="pt-10">
            <p className="v1-text-caption" style={{ color: 'var(--ink-faint)' }}>
              Sourced from regional streaming schedules. Some artwork is approximate or unavailable.
            </p>
          </footer>
        </div>
      </div>
    </MotionConfig>
  )
}
