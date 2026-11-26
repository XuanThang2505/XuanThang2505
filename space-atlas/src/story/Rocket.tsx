import { useId } from 'react'
import { meStore } from '../me/meStore'
/** The child's own rocket (colour, fins, pilot), drawn in SVG. */
import { ROCKET_COLORS, type RocketDesign } from '../data/storyData'

const FINS = [
  ['M31 112 L8 156 L8 170 L33 154 Z', 'M69 112 L92 156 L92 170 L67 154 Z'],
  ['M32 110 C 6 124, 4 156, 10 172 C 18 160, 26 156, 33 154 Z', 'M68 110 C 94 124, 96 156, 90 172 C 82 160, 74 156, 67 154 Z'],
  ['M32 92 L2 146 L2 166 L33 150 Z', 'M68 92 L98 146 L98 166 L67 150 Z'],
]
const PILOT_EMOJI = { robot: '🤖', dolphin: '🐬', astronaut: '🧑‍🚀', me: '🧒' } as const

export function RocketArt({ design, size = 200, flame = 0 }: { design: RocketDesign; size?: number; flame?: number }) {
  const photo = meStore.use().photo
  const uid = useId().replace(/:/g, '')
  const col = ROCKET_COLORS[design.color] ?? ROCKET_COLORS[0]
  const [l, r] = FINS[design.fins] ?? FINS[0]
  const id = `rk-${design.color}`
  return (
    <svg width={size * 0.5} height={size} viewBox="0 0 100 200" role="img" aria-label="Rocket" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={col.dark} />
          <stop offset="0.35" stopColor={col.main} />
          <stop offset="0.7" stopColor={col.main} />
          <stop offset="1" stopColor={col.dark} />
        </linearGradient>
        <radialGradient id="rk-flame" cx="0.5" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.25" stopColor="#fde68a" />
          <stop offset="0.6" stopColor="#f97316" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      {flame > 0 && (
        <g className="animate-flame" style={{ transformOrigin: '50px 166px' }}>
          <ellipse cx="50" cy={166 + 22 * flame} rx={12 + 6 * flame} ry={22 * flame + 6} fill="url(#rk-flame)" />
        </g>
      )}
      <path d={l} fill={col.dark} />
      <path d={r} fill={col.dark} />
      <path d="M41 150 L59 150 L56 166 L44 166 Z" fill="#475569" />
      <path d="M50 6 C 73 28, 74 62, 70 152 L30 152 C 26 62, 27 28, 50 6 Z" fill={`url(#${id})`} stroke="#e2e8f0" strokeWidth="2" />
      <path d="M50 6 C 60 15, 65 26, 68 38 L32 38 C 35 26, 40 15, 50 6 Z" fill="#f43f5e" />
      <rect x="30" y="124" width="40" height="8" fill="#f8fafc" opacity="0.85" />
      <rect x="47" y="110" width="6" height="38" rx="3" fill={col.dark} />
      <circle cx="50" cy="74" r="17" fill="#e2e8f0" />
      <circle cx="50" cy="74" r="13.5" fill="#0c4a6e" />
      {design.pilot === 'me' && photo ? (
        <>
          <clipPath id={`win-${uid}`}>
            <circle cx="50" cy="74" r="13" />
          </clipPath>
          <image href={photo} x="37" y="61" width="26" height="26" preserveAspectRatio="xMidYMid slice" clipPath={`url(#win-${uid})`} />
        </>
      ) : (
        <text x="50" y="81" textAnchor="middle" fontSize="18">
          {PILOT_EMOJI[design.pilot]}
        </text>
      )}
      <path d="M41 66 A 11 11 0 0 1 50 61" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
