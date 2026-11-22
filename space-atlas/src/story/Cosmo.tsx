/** Cosmo, the little robot astronaut who guides the story. Pure SVG + CSS, no images. */
export function Cosmo({ size = 120, cheer = false, wave = true }: { size?: number; cheer?: boolean; wave?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={cheer ? 'animate-word-pop' : 'animate-float'} role="img" aria-label="Cosmo the robot">
      {/* antenna */}
      <line x1="60" y1="14" x2="60" y2="28" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="11" r="5" fill="#fbbf24" className="animate-twinkle" />
      {/* backpack */}
      <rect x="28" y="62" width="64" height="40" rx="14" fill="#6366f1" />
      {/* body */}
      <rect x="36" y="66" width="48" height="44" rx="16" fill="#f8fafc" />
      <circle cx="60" cy="88" r="7" fill="#38bdf8" />
      <circle cx="60" cy="88" r="3" fill="#e0f2fe" />
      {/* arms */}
      <rect x="22" y="72" width="18" height="12" rx="6" fill="#e2e8f0" />
      <g className={wave || cheer ? 'animate-wave' : ''}>
        <rect x="80" y="70" width="22" height="12" rx="6" fill="#e2e8f0" transform={cheer ? 'rotate(-40 82 76)' : undefined} />
        <circle cx="102" cy="76" r="6" fill="#fbbf24" />
      </g>
      {/* helmet */}
      <circle cx="60" cy="46" r="30" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x="36" y="32" width="48" height="30" rx="15" fill="#1e1b4b" />
      <ellipse cx="48" cy="38" rx="6" ry="3" fill="#a5b4fc" opacity="0.7" />
      {/* eyes + smile */}
      <circle cx="51" cy="47" r="4.5" fill="#67e8f9" />
      <circle cx="69" cy="47" r="4.5" fill="#67e8f9" />
      <path d="M52 54 Q60 61 68 54" stroke="#67e8f9" strokeWidth="3" fill="none" strokeLinecap="round" />
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
