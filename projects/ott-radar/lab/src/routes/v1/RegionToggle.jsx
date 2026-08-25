import { motion } from 'motion/react'

export default function RegionToggle({ regions, value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Region"
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}
    >
      {regions.map((region) => {
        const active = region.code === value
        return (
          <button
            key={region.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(region.code)}
            className="v1-focusable v1-text-body relative rounded-full px-4 py-1.5 font-medium transition-colors"
            style={{ color: active ? 'var(--accent-ink)' : 'var(--ink-soft)' }}
          >
            {active && (
              <motion.span
                layoutId="region-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
            <span className="relative">{region.label}</span>
          </button>
        )
      })}
    </div>
  )
}
