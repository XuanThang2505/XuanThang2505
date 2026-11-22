/**
 * Cosmo, the little blue robot with a rocket backpack, and Splash, the space dolphin.
 * Pure SVG + CSS animations: no images to load, sharp on every screen.
 */
export function Cosmo({ size = 120, cheer = false, wave = true, fly = true }: { size?: number; cheer?: boolean; wave?: boolean; fly?: boolean }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 120 138" className={cheer ? 'animate-word-pop' : 'animate-float'} role="img" aria-label="Cosmo the robot">
      <defs>
        <linearGradient id="cosmo-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <radialGradient id="cosmo-flame" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#fff7ae" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* rocket-pack flames */}
      {fly && (
        <g className="animate-flame" style={{ transformOrigin: '60px 112px' }}>
          <ellipse cx="44" cy="122" rx="7" ry="15" fill="url(#cosmo-flame)" />
          <ellipse cx="76" cy="122" rx="7" ry="15" fill="url(#cosmo-flame)" />
        </g>
      )}
      {/* rocket pack */}
      <rect x="30" y="66" width="60" height="40" rx="12" fill="#475569" />
      <rect x="37" y="100" width="14" height="10" rx="3" fill="#334155" />
      <rect x="69" y="100" width="14" height="10" rx="3" fill="#334155" />
      {/* body */}
      <rect x="38" y="64" width="44" height="42" rx="14" fill="url(#cosmo-body)" stroke="#e0f2fe" strokeWidth="2" />
      <rect x="48" y="74" width="24" height="16" rx="5" fill="#0c4a6e" />
      <path d="M51 82 L56 82 L58 77 L61 87 L64 80 L66 82 L70 82" stroke="#5eead4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* arms */}
      <rect x="22" y="70" width="18" height="11" rx="5.5" fill="#38bdf8" />
      <circle cx="21" cy="76" r="6" fill="#fbbf24" />
      <g className={wave || cheer ? 'animate-wave' : ''} style={{ transformOrigin: '82px 76px' }}>
        <rect x="80" y="70" width="20" height="11" rx="5.5" fill="#38bdf8" transform={cheer ? 'rotate(-45 82 76)' : undefined} />
        <circle cx={cheer ? 94 : 101} cy={cheer ? 61 : 76} r="6" fill="#fbbf24" />
      </g>
      {/* antenna */}
      <line x1="60" y1="8" x2="60" y2="20" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="7" r="5.5" fill="#fb923c" className="animate-twinkle" style={{ transformOrigin: '60px 7px' }} />
      {/* head */}
      <rect x="24" y="18" width="72" height="48" rx="22" fill="url(#cosmo-body)" stroke="#e0f2fe" strokeWidth="2.5" />
      <circle cx="22" cy="42" r="6" fill="#0369a1" />
      <circle cx="98" cy="42" r="6" fill="#0369a1" />
      <rect x="33" y="26" width="54" height="32" rx="15" fill="#082f49" />
      <ellipse cx="44" cy="31" rx="7" ry="2.6" fill="#7dd3fc" opacity="0.5" />
      {/* eyes blink */}
      <g className="animate-blink" style={{ transformOrigin: '60px 41px' }}>
        <ellipse cx="49" cy="41" rx="5.5" ry="6.5" fill="#67e8f9" />
        <ellipse cx="71" cy="41" rx="5.5" ry="6.5" fill="#67e8f9" />
        <circle cx="51" cy="39" r="1.8" fill="#ecfeff" />
        <circle cx="73" cy="39" r="1.8" fill="#ecfeff" />
      </g>
      <path d={cheer ? 'M51 49 Q60 58 69 49' : 'M53 50 Q60 55 67 50'} stroke="#67e8f9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="50" r="3" fill="#f9a8d4" opacity="0.7" />
      <circle cx="80" cy="50" r="3" fill="#f9a8d4" opacity="0.7" />
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
