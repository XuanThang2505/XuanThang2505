/**
 * The child as an astronaut: their own face (photo, kept on the device) inside a realistic-looking
 * helmet, with a real-style space suit – white spacewalk suit, orange launch suit or hero suit.
 */
import { useId } from 'react'
import { EMBLEMS } from '../data/heroData'
import { HERO_COLORS, useHeroStyle } from '../hero/heroStyle'
import { meStore, type SuitId } from './meStore'

const star5 = (cx: number, cy: number, R: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? R * 0.42 : R
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

/** The face in the visor: the photo, or a friendly drawn face until a parent adds one. */
function Face({ photo, clip }: { photo: string | null; clip: string }) {
  if (photo) return <image href={photo} x="38" y="18" width="64" height="64" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`} />
  return (
    <g clipPath={`url(#${clip})`}>
      <rect x="38" y="18" width="64" height="64" fill="#f5c9a6" />
      <path d="M40 40 C 42 16, 98 16, 100 40 C 92 30, 80 26, 70 27 C 60 28, 48 32, 40 40 Z" fill="#3b2416" />
      <circle cx="60" cy="50" r="3.4" fill="#0f172a" />
      <circle cx="80" cy="50" r="3.4" fill="#0f172a" />
      <path d="M60 62 Q70 70 80 62" stroke="#7c2d12" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="54" cy="60" r="3.5" fill="#fb7185" opacity="0.4" />
      <circle cx="86" cy="60" r="3.5" fill="#fb7185" opacity="0.4" />
    </g>
  )
}

export function MeAstronaut({ size = 200, suit: suitOverride, cheer = false, float = true }: { size?: number; suit?: SuitId; cheer?: boolean; float?: boolean }) {
  const me = meStore.use()
  const hero = useHeroStyle()
  const uid = useId().replace(/:/g, '')
  const suit = suitOverride ?? me.suit
  const heroCol = HERO_COLORS[hero.suit] ?? HERO_COLORS[0]
  const capeCol = HERO_COLORS[hero.cape] ?? HERO_COLORS[3]
  const pal =
    suit === 'launch'
      ? { body: '#f97316', edge: '#c2410c', joint: '#ea580c', glove: '#57534e', boot: '#1f2937', ring: '#1d4ed8' }
      : suit === 'hero'
        ? { body: heroCol.main, edge: heroCol.dark, joint: heroCol.dark, glove: '#f8fafc', boot: capeCol.main, ring: '#e2e8f0' }
        : { body: '#f8fafc', edge: '#cbd5e1', joint: '#cbd5e1', glove: '#94a3b8', boot: '#94a3b8', ring: '#cbd5e1' }
  const name = (me.name || 'ME').toUpperCase().slice(0, 10)
  const emblem = EMBLEMS.find((e) => e.id === hero.emblem)?.icon ?? '⭐'
  return (
    <svg
      width={size * 0.7}
      height={size}
      viewBox="0 0 140 200"
      className={cheer ? 'animate-word-pop' : float ? 'animate-float' : ''}
      role="img"
      aria-label="Me, the astronaut"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`v${uid}`}>
          <circle cx="70" cy="50" r="30" />
        </clipPath>
        <linearGradient id={`b${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={pal.edge} />
          <stop offset="0.35" stopColor={pal.body} />
          <stop offset="0.75" stopColor={pal.body} />
          <stop offset="1" stopColor={pal.edge} />
        </linearGradient>
        <radialGradient id={`g${uid}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.35" stopColor="#facc15" />
          <stop offset="1" stopColor="#a16207" />
        </radialGradient>
      </defs>

      {/* hero cape / life-support backpack */}
      {suit === 'hero' ? (
        <g className="animate-cape" style={{ transformOrigin: '70px 84px' }}>
          <path d="M44 84 C 34 120, 26 160, 18 192 Q 70 202 122 192 C 114 160, 106 120, 96 84 Z" fill={capeCol.main} stroke={capeCol.dark} strokeWidth="2" />
        </g>
      ) : suit === 'eva' ? (
        <rect x="24" y="72" width="92" height="82" rx="16" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      ) : null}

      {/* legs + boots */}
      {[44, 74].map((x) => (
        <g key={x}>
          <rect x={x} y="138" width="22" height="46" rx="9" fill={`url(#b${uid})`} stroke={pal.edge} strokeWidth="1.5" />
          <rect x={x} y="158" width="22" height="5" fill={pal.joint} />
          <rect x={x - 4} y="178" width="30" height="16" rx="7" fill={pal.boot} />
        </g>
      ))}
      {suit === 'eva' && <rect x="44" y="140" width="5" height="36" fill="#ef4444" opacity="0.85" />}

      {/* arms */}
      {[16, 104].map((x, i) => (
        <g key={x} transform={cheer && i === 1 ? 'rotate(-150 110 90)' : undefined}>
          <rect x={x} y="86" width="20" height="50" rx="10" fill={`url(#b${uid})`} stroke={pal.edge} strokeWidth="1.5" />
          <rect x={x} y="108" width="20" height="5" fill={pal.joint} />
          <circle cx={x + 10} cy="139" r="9.5" fill={pal.glove} />
        </g>
      ))}

      {/* torso */}
      <rect x="36" y="80" width="68" height="66" rx="22" fill={`url(#b${uid})`} stroke={pal.edge} strokeWidth="2" />
      {suit === 'hero' ? (
        <>
          <rect x="36" y="128" width="68" height="8" fill="#facc15" />
          <circle cx="70" cy="108" r="15" fill="#f8fafc" stroke={capeCol.main} strokeWidth="3" />
          <text x="70" y="114.5" textAnchor="middle" fontSize="17">
            {emblem}
          </text>
        </>
      ) : (
        <>
          {/* chest control box with buttons */}
          <rect x="51" y="104" width="38" height="22" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="60" cy="115" r="3.2" fill="#ef4444" />
          <circle cx="70" cy="115" r="3.2" fill="#3b82f6" />
          <circle cx="80" cy="115" r="3.2" fill="#facc15" />
          {suit === 'launch' && <path d="M70 84 L70 104" stroke="#cbd5e1" strokeWidth="2.5" />}
        </>
      )}
      {/* name tag */}
      <rect x="47" y="88" width="46" height="11" rx="2.5" fill="#1e3a8a" />
      <text x="70" y="96.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#fff" fontFamily="Nunito, system-ui">
        {name}
      </text>
      {/* shoulder patches: Vietnam flag + mission patch */}
      {me.flag && (
        <g>
          <rect x="18" y="88" width="17" height="12" rx="1.5" fill="#da251d" stroke="#fff" strokeWidth="0.8" />
          <polygon points={star5(26.5, 94, 4.4)} fill="#ffcd00" />
        </g>
      )}
      <circle cx="114" cy="94" r="9" fill="#0f172a" stroke="#facc15" strokeWidth="1.5" />
      <text x="114" y="97.8" textAnchor="middle" fontSize="10">
        {me.patch}
      </text>

      {/* helmet */}
      <ellipse cx="70" cy="84" rx="30" ry="7" fill={pal.ring} />
      <circle cx="70" cy="48" r="40" fill={suit === 'hero' ? 'rgba(186,230,253,0.18)' : '#f8fafc'} stroke={suit === 'hero' ? '#e0f2fe' : '#cbd5e1'} strokeWidth="3" />
      {suit !== 'hero' && (
        <>
          <rect x="26" y="38" width="7" height="12" rx="2" fill="#fde68a" stroke="#a16207" strokeWidth="0.8" />
          <rect x="107" y="38" width="7" height="12" rx="2" fill="#fde68a" stroke="#a16207" strokeWidth="0.8" />
        </>
      )}
      <circle cx="70" cy="50" r="31" fill="#0b1220" />
      <Face photo={me.photo} clip={`v${uid}`} />
      {me.visor === 'gold' && suit !== 'hero' && (
        <g>
          <path d="M39 50 A 31 31 0 0 1 101 50 L 101 46 Q 70 38 39 46 Z" fill={`url(#g${uid})`} opacity="0.96" />
          <path d="M39 46 A 31 31 0 0 1 101 46" fill="none" stroke="#a16207" strokeWidth="1.5" />
        </g>
      )}
      {/* glass reflection */}
      <path d="M48 30 A 26 26 0 0 1 72 22" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.55" />
      <circle cx="90" cy="68" r="2.5" fill="#fff" opacity="0.35" />
    </svg>
  )
}
