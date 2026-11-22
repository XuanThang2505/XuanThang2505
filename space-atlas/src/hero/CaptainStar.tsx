/**
 * Captain Star – an original space superhero for the app (SVG + CSS, no images).
 * Wears the suit the child designed; carries a glowing star-shaped shield.
 */
import { EMBLEMS } from '../data/heroData'
import { HERO_COLORS, useHeroStyle } from './heroStyle'

const starPoints = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 ? r : R
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`
  }).join(' ')

/** The glowing star shield (also flies on its own in the shield game). */
export function StarShield({ size = 60, color, spin = false }: { size?: number; color?: number; spin?: boolean }) {
  const st = useHeroStyle()
  const col = HERO_COLORS[color ?? st.shield] ?? HERO_COLORS[6]
  const id = `shield-${color ?? st.shield}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={spin ? 'animate-spin' : ''} style={{ filter: `drop-shadow(0 0 ${size / 8}px ${col.main})`, animationDuration: '0.45s' }}>
      <defs>
        <radialGradient id={id} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={col.main} />
          <stop offset="1" stopColor={col.dark} />
        </radialGradient>
      </defs>
      <polygon points={starPoints(50, 53, 48, 22)} fill={`url(#${id})`} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <polygon points={starPoints(50, 53, 22, 10)} fill="#fff" opacity="0.9" />
    </svg>
  )
}

export function CaptainStar({ size = 140, cheer = false, fly = false, shield = true }: { size?: number; cheer?: boolean; fly?: boolean; shield?: boolean }) {
  const st = useHeroStyle()
  const suit = HERO_COLORS[st.suit] ?? HERO_COLORS[0]
  const cape = HERO_COLORS[st.cape] ?? HERO_COLORS[3]
  const mask = HERO_COLORS[st.mask] ?? HERO_COLORS[0]
  const emblem = EMBLEMS.find((e) => e.id === st.emblem)?.icon ?? '⭐'
  const gid = `hero-suit-${st.suit}`
  return (
    <div
      className={cheer ? 'animate-word-pop' : 'animate-float'}
      style={{ width: size * 0.75, height: size, position: 'relative', transform: fly ? 'rotate(-14deg)' : undefined }}
      role="img"
      aria-label="Captain Star"
    >
      <svg width={size * 0.75} height={size} viewBox="0 0 120 160" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" x2="1">
            <stop offset="0" stopColor={suit.dark} />
            <stop offset="0.4" stopColor={suit.main} />
            <stop offset="1" stopColor={suit.dark} />
          </linearGradient>
        </defs>
        {/* cape */}
        <g className="animate-cape" style={{ transformOrigin: '60px 58px' }}>
          <path d="M40 58 C 30 90, 22 126, 14 152 Q 60 164 106 152 C 98 126, 90 90, 80 58 Z" fill={cape.main} stroke={cape.dark} strokeWidth="2" />
        </g>
        {/* legs + boots */}
        <rect x="45" y="108" width="13" height="36" rx="6" fill={suit.dark} />
        <rect x="62" y="108" width="13" height="36" rx="6" fill={suit.dark} />
        <rect x="42" y="136" width="18" height="14" rx="6" fill={cape.main} stroke={cape.dark} strokeWidth="1.5" />
        <rect x="60" y="136" width="18" height="14" rx="6" fill={cape.main} stroke={cape.dark} strokeWidth="1.5" />
        {/* body */}
        <rect x="38" y="56" width="44" height="58" rx="16" fill={`url(#${gid})`} stroke="#e0f2fe" strokeWidth="1.5" />
        <rect x="38" y="98" width="44" height="8" fill="#facc15" />
        <rect x="55" y="97" width="10" height="10" rx="2" fill="#fde68a" stroke="#a16207" strokeWidth="1.5" />
        <circle cx="60" cy="76" r="12.5" fill="#f8fafc" stroke={cape.main} strokeWidth="2.5" />
        <text x="60" y="81.5" textAnchor="middle" fontSize="14">
          {emblem}
        </text>
        {/* left arm (shield side) */}
        <rect x="25" y="60" width="14" height="38" rx="7" fill={suit.main} />
        <circle cx="32" cy="100" r="6.5" fill="#f5c9a6" />
        {/* right arm: down, or a hero fist in the air */}
        {cheer ? (
          <g transform="rotate(-150 88 64)">
            <rect x="81" y="60" width="14" height="38" rx="7" fill={suit.main} />
            <circle cx="88" cy="100" r="6.5" fill="#f5c9a6" />
          </g>
        ) : (
          <>
            <rect x="81" y="60" width="14" height="38" rx="7" fill={suit.main} />
            <circle cx="88" cy="100" r="6.5" fill="#f5c9a6" />
          </>
        )}
        {/* head */}
        <circle cx="60" cy="34" r="23" fill="#f5c9a6" />
        <path d="M37 33 C 35 8, 85 6, 83 33 C 77 22, 67 17, 60 18 C 52 21, 44 24, 37 33 Z" fill="#3b2416" />
        <polygon points={starPoints(77, 15, 7, 3)} fill="#facc15" stroke="#a16207" strokeWidth="1" />
        {/* mask */}
        <path d="M37 30 Q 60 24 83 30 L 83 40 Q 60 36 37 40 Z" fill={mask.main} stroke={mask.dark} strokeWidth="1.5" />
        <ellipse cx="50" cy="34" rx="5" ry="4.2" fill="#fff" />
        <ellipse cx="70" cy="34" rx="5" ry="4.2" fill="#fff" />
        <g className="animate-blink" style={{ transformOrigin: '60px 34px' }}>
          <circle cx="51" cy="34.5" r="2.4" fill="#0f172a" />
          <circle cx="71" cy="34.5" r="2.4" fill="#0f172a" />
        </g>
        <path d={cheer ? 'M50 45 Q60 54 70 45' : 'M52 46 Q60 51 68 46'} stroke="#7c2d12" strokeWidth="2.5" fill={cheer ? '#fff' : 'none'} strokeLinecap="round" />
        <circle cx="44" cy="44" r="3" fill="#fb7185" opacity="0.45" />
        <circle cx="76" cy="44" r="3" fill="#fb7185" opacity="0.45" />
      </svg>
      {shield && (
        <div style={{ position: 'absolute', left: -size * 0.12, top: size * 0.42 }}>
          <StarShield size={size * 0.42} />
        </div>
      )}
    </div>
  )
}

/** Comic-book burst ("POW!", "ZOOM!", "SUPER!") for big moments. */
export function ComicBurst({ text, size = 140, color = '#facc15' }: { text: string; size?: number; color?: string }) {
  return (
    <div className="animate-word-pop pointer-events-none relative flex items-center justify-center" style={{ width: size, height: size * 0.8 }}>
      <svg width={size} height={size * 0.8} viewBox="0 0 100 80" className="absolute inset-0">
        <polygon
          points="50,0 58,18 76,6 72,26 98,22 80,38 100,50 78,54 88,76 64,62 54,80 46,62 22,78 30,56 2,58 22,42 0,26 26,26 18,6 40,18"
          fill={color}
          stroke="#b91c1c"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative font-black italic text-rose-600" style={{ fontSize: size * 0.2, WebkitTextStroke: `${Math.max(1, size / 90)}px #fff`, transform: 'rotate(-8deg)' }}>
        {text}
      </span>
    </div>
  )
}
