import { Link } from 'react-router-dom'

const DRILLS = [
  ['v0', 'naive baseline — no levers'],
  ['v1', 'CLAUDE.md constitution'],
  ['v2', 'design system first'],
  ['v3', 'reference pipeline'],
  ['v4', 'screenshot loop'],
  ['v5', 'community skills'],
  ['v6', 'derived palette + restored date axis'],
  ['v7', 'filmhood.in visual language, data-shaped layout'],
]

export default function Index() {
  return (
    <ul>
      {DRILLS.map(([slug, label]) => (
        <li key={slug}>
          <Link to={`/${slug}`}>{slug}</Link> — {label}
        </li>
      ))}
    </ul>
  )
}
