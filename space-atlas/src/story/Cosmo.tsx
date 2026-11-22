import { ROCKET_COLORS } from '../data/storyData'
import type { EyesId, HatId } from '../data/moreData'
import { useCosmoStyle } from './cosmoStyle'

/**
 * Cosmo, the little blue robot with a rocket backpack, and Splash, the space dolphin.
 * Pure SVG + CSS animations: no images to load, sharp on every screen.
 */
function Eyes({ kind }: { kind: EyesId }) {
  const c = '#67e8f9'
  if (kind === 'happy')
    return (
      <g stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M43 43 Q49 35 55 43" />
        <path d="M65 43 Q71 35 77 43" />
      </g>
    )
  if (kind === 'star') {
    const star = (cx: number) =>
      Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? 3 : 7.5
        const a = (Math.PI / 5) * i - Math.PI / 2
        return `${cx + r * Math.cos(a)},${41 + r * Math.sin(a)}`
      }).join(' ')
    return (
      <g fill="#fde047">
        <polygon points={star(49)} />
        <polygon points={star(71)} />
      </g>
    )
  }
  if (kind === 'heart') {
    const heart = (x: number) => `M${x} 46 C ${x - 9} 39, ${x - 6} 32, ${x} 37 C ${x + 6} 32, ${x + 9} 39, ${x} 46 Z`
    return (
      <g fill="#f472b6">
        <path d={heart(49)} />
        <path d={heart(71)} />
      </g>
    )
  }
  return (
    <g className="animate-blink" style={{ transformOrigin: '60px 41px' }}>
      <ellipse cx="49" cy="41" rx="5.5" ry="6.5" fill={c} />
      <ellipse cx="71" cy="41" rx="5.5" ry="6.5" fill={c} />
      <circle cx="51" cy="39" r="1.8" fill="#ecfeff" />
      <circle cx="73" cy="39" r="1.8" fill="#ecfeff" />
    </g>
  )
}

function Hat({ kind }: { kind: HatId }) {
  if (kind === 'cap')
    return (
      <g>
        <path d="M30 26 C 32 6, 88 6, 90 26 Z" fill="#ef4444" />
        <path d="M86 24 C 98 24, 108 27, 110 31 L 84 29 Z" fill="#b91c1c" />
        <circle cx="60" cy="9" r="3" fill="#fff" />
      </g>
    )
  if (kind === 'crown')
    return (
      <g>
        <path d="M36 24 L36 6 L48 16 L60 2 L72 16 L84 6 L84 24 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="16" r="3.5" fill="#f43f5e" />
        <circle cx="45" cy="19" r="2.5" fill="#38bdf8" />
        <circle cx="75" cy="19" r="2.5" fill="#38bdf8" />
      </g>
    )
  if (kind === 'bow')
    return (
      <g transform="translate(78 14) rotate(20)">
        <path d="M0 0 L-16 -9 L-16 9 Z" fill="#f472b6" />
        <path d="M0 0 L16 -9 L16 9 Z" fill="#f472b6" />
        <circle r="4.5" fill="#db2777" />
      </g>
    )
  if (kind === 'headphones')
    return (
      <g>
        <path d="M22 40 C 22 4, 98 4, 98 40" stroke="#334155" strokeWidth="6" fill="none" strokeLinecap="round" />
        <rect x="12" y="32" width="14" height="22" rx="6" fill="#f43f5e" />
        <rect x="94" y="32" width="14" height="22" rx="6" fill="#f43f5e" />
      </g>
    )
  return null
}

/**
 * Cosmo, the little robot with a rocket backpack (dressed up in the robot workshop), and Splash,
 * the space dolphin. Pure SVG + CSS animations: no images to load, sharp on every screen.
 */
export function Cosmo({
  size = 120,
  cheer = false,
  wave = true,
  fly = true,
  dance = false,
}: {
  size?: number
  cheer?: boolean
  wave?: boolean
  fly?: boolean
  dance?: boolean
}) {
  const style = useCosmoStyle()
  const col = ROCKET_COLORS[style.color] ?? ROCKET_COLORS[0]
  const gid = `cosmo-body-${style.color}`
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 120 138"
      className={dance ? 'animate-dance' : cheer ? 'animate-word-pop' : 'animate-float'}
      role="img"
      aria-label="Cosmo the robot"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={col.main} />
          <stop offset="1" stopColor={col.dark} />
        </linearGradient>
        <radialGradient id="cosmo-flame" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#fff7ae" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>
      {fly && (
        <g className="animate-flame" style={{ transformOrigin: '60px 112px' }}>
          <ellipse cx="44" cy="122" rx="7" ry="15" fill="url(#cosmo-flame)" />
          <ellipse cx="76" cy="122" rx="7" ry="15" fill="url(#cosmo-flame)" />
        </g>
      )}
      <rect x="30" y="66" width="60" height="40" rx="12" fill="#475569" />
      <rect x="37" y="100" width="14" height="10" rx="3" fill="#334155" />
      <rect x="69" y="100" width="14" height="10" rx="3" fill="#334155" />
      <rect x="38" y="64" width="44" height="42" rx="14" fill={`url(#${gid})`} stroke="#e0f2fe" strokeWidth="2" />
      <rect x="48" y="74" width="24" height="16" rx="5" fill="#0c4a6e" />
      <path d="M51 82 L56 82 L58 77 L61 87 L64 80 L66 82 L70 82" stroke="#5eead4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22" y="70" width="18" height="11" rx="5.5" fill={col.main} />
      <circle cx="21" cy="76" r="6" fill="#fbbf24" />
      <g className={wave || cheer || dance ? 'animate-wave' : ''} style={{ transformOrigin: '82px 76px' }}>
        <rect x="80" y="70" width="20" height="11" rx="5.5" fill={col.main} transform={cheer ? 'rotate(-45 82 76)' : undefined} />
        <circle cx={cheer ? 94 : 101} cy={cheer ? 61 : 76} r="6" fill="#fbbf24" />
      </g>
      {style.hat !== 'headphones' && style.hat !== 'cap' && style.hat !== 'crown' && (
        <>
          <line x1="60" y1="8" x2="60" y2="20" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="7" r="5.5" fill="#fb923c" className="animate-twinkle" style={{ transformOrigin: '60px 7px' }} />
        </>
      )}
      <rect x="24" y="18" width="72" height="48" rx="22" fill={`url(#${gid})`} stroke="#e0f2fe" strokeWidth="2.5" />
      <circle cx="22" cy="42" r="6" fill={col.dark} />
      <circle cx="98" cy="42" r="6" fill={col.dark} />
      <rect x="33" y="26" width="54" height="32" rx="15" fill="#082f49" />
      <ellipse cx="44" cy="31" rx="7" ry="2.6" fill="#7dd3fc" opacity="0.5" />
      <Eyes kind={style.eyes} />
      <path d={cheer || dance ? 'M51 49 Q60 58 69 49' : 'M53 50 Q60 55 67 50'} stroke="#67e8f9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="50" r="3" fill="#f9a8d4" opacity="0.7" />
      <circle cx="80" cy="50" r="3" fill="#f9a8d4" opacity="0.7" />
      <Hat kind={style.hat} />
    </svg>
  )
}

/** Splash, Cosmo's space-dolphin friend, in a bubble helmet. */
export function Splash({ size = 120, helmet = true, cheer = false, swim = true }: { size?: number; helmet?: boolean; cheer?: boolean; swim?: boolean }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 140 105" className={cheer ? 'animate-word-pop' : swim ? 'animate-swim' : ''} role="img" aria-label="Splash the dolphin">
      <defs>
        <linearGradient id="splash-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* tail */}
      <g className="animate-tail" style={{ transformOrigin: '24px 66px' }}>
        <path d="M26 64 C 18 58, 8 50, 2 44 C 10 46, 18 48, 24 54 Z" fill="#1e40af" />
        <path d="M26 66 C 18 72, 10 82, 4 90 C 14 86, 22 80, 28 72 Z" fill="#1e40af" />
      </g>
      {/* dorsal fin */}
      <path d="M60 32 C 64 16, 74 10, 84 8 C 78 18, 78 26, 80 34 Z" fill="#1d4ed8" />
      {/* body */}
      <path d="M22 66 C 26 40, 62 24, 98 34 C 112 38, 124 44, 134 52 C 126 57, 114 59, 104 59 C 96 70, 72 80, 46 76 C 36 74, 28 72, 22 66 Z" fill="url(#splash-body)" />
      {/* belly */}
      <path d="M44 70 C 64 74, 88 70, 104 59 C 112 59, 122 57, 130 54 C 120 64, 100 76, 70 78 C 58 78, 50 75, 44 70 Z" fill="#e0f2fe" />
      {/* flipper */}
      <path d="M72 66 C 68 78, 62 84, 54 90 C 64 86, 76 80, 84 68 Z" fill="#1e3a8a" />
      {/* eye + smile */}
      <circle cx="104" cy="45" r="4.2" fill="#0f172a" />
      <circle cx="105.5" cy="43.5" r="1.4" fill="#fff" />
      <path d={cheer ? 'M112 54 Q120 60 128 54' : 'M114 55 Q121 58 128 55'} stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="110" cy="52" r="2.6" fill="#f9a8d4" opacity="0.7" />
      {helmet && (
        <>
          <circle cx="106" cy="47" r="30" fill="rgba(186,230,253,0.14)" stroke="rgba(224,242,254,0.85)" strokeWidth="2.5" />
          <path d="M86 30 A 24 24 0 0 1 108 20" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      )}
    </svg>
  )
}

/** Speech bubble: tap to hear the line again. */
export function Bubble({ en, vi, onTap, compact }: { en: string; vi: string; onTap: () => void; compact: boolean }) {
  return (
    <button
      onClick={onTap}
      className={`relative max-w-full rounded-3xl bg-white text-left text-slate-900 shadow-2xl active:scale-95 ${compact ? 'px-3 py-2' : 'px-6 py-4'}`}
    >
      <b className={`block font-black leading-tight ${compact ? 'text-base' : 'text-3xl'}`}>{en}</b>
      <small className={`block font-semibold text-slate-500 ${compact ? 'text-[11px] leading-tight' : 'text-lg'}`}>{vi}</small>
      <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 bg-white" />
    </button>
  )
}

export function Crystal({ size = 48, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={dim ? 'opacity-25 grayscale' : 'animate-crystal'}>
      <polygon points="24,2 40,16 34,44 14,44 8,16" fill="#67e8f9" stroke="#e0f2fe" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="24,2 40,16 24,22 8,16" fill="#cffafe" />
      <polygon points="24,22 40,16 34,44" fill="#22d3ee" />
      <polygon points="24,22 8,16 14,44" fill="#38bdf8" />
    </svg>
  )
}
