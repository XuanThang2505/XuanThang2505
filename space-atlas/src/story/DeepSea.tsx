/**
 * Deep-sea dive: swipe up to take Cosmo's submarine down through the Sunlight, Twilight and
 * Midnight zones to the sea floor. Tap an animal to hear its English name and read a fun fact;
 * every new animal goes into the sea book (+1 star). A treasure chest waits at the bottom.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { CREATURES, DIVE_LINES, SEA_DEPTH_M, ZONES, type Creature, type Zone } from '../data/moreData'
import { BackButton, Screen, type Say } from '../games/ui'
import { playBubble, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Crystal } from './Cosmo'

const KEY = 'space-atlas-seadex'
function loadFound(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

function Submarine({ size, light }: { size: number; light: number }) {
  return (
    <div className="relative" style={{ width: size, height: size * 0.6 }}>
      {/* headlight beam, stronger in the dark */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2"
        style={{
          left: size * 0.92,
          width: size * 2.6,
          height: size * 1.4,
          opacity: light,
          background: 'radial-gradient(ellipse at 0% 50%, rgba(254,249,195,0.55), rgba(254,249,195,0) 70%)',
          clipPath: 'polygon(0 42%, 100% 0, 100% 100%, 0 58%)',
        }}
      />
      <svg width={size} height={size * 0.6} viewBox="0 0 160 96" className="animate-swim">
        <rect x="64" y="8" width="34" height="24" rx="8" fill="#f59e0b" />
        <rect x="78" y="0" width="5" height="12" rx="2" fill="#78716c" />
        <ellipse cx="80" cy="56" rx="72" ry="34" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
        <circle cx="54" cy="54" r="13" fill="#0c4a6e" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="94" cy="54" r="13" fill="#0c4a6e" stroke="#e2e8f0" strokeWidth="4" />
        {/* Cosmo looking out */}
        <circle cx="90" cy="52" r="2.6" fill="#67e8f9" />
        <circle cx="98" cy="52" r="2.6" fill="#67e8f9" />
        <circle cx="134" cy="56" r="7" fill="#fef9c3" />
        <g className="animate-spin" style={{ transformOrigin: '8px 56px', animationDuration: '0.6s' }}>
          <rect x="4" y="40" width="8" height="32" rx="4" fill="#78716c" />
        </g>
      </svg>
    </div>
  )
}

function Chest({ open, size }: { open: boolean; size: number }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 100 85" style={{ overflow: 'visible' }}>
      <rect x="8" y="38" width="84" height="44" rx="6" fill="#92400e" stroke="#451a03" strokeWidth="3" />
      <rect x="8" y="50" width="84" height="7" fill="#facc15" />
      <rect x="44" y="46" width="12" height="16" rx="3" fill="#facc15" stroke="#a16207" strokeWidth="2" />
      <g style={{ transformOrigin: '8px 38px', transform: open ? 'rotate(-35deg)' : 'none', transition: 'transform 0.6s cubic-bezier(.34,1.56,.64,1)' }}>
        <path d="M8 38 C 8 12, 92 12, 92 38 Z" fill="#b45309" stroke="#451a03" strokeWidth="3" />
        <rect x="8" y="30" width="84" height="7" fill="#facc15" />
      </g>
    </svg>
  )
}

export function DeepSea({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const scroller = useRef<HTMLDivElement>(null)
  const [depth, setDepth] = useState(0) // 0..1
  const [found, setFound] = useState(loadFound)
  const [card, setCard] = useState<Creature | null>(null)
  const [chestOpen, setChestOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const zoneSaid = useRef<Set<Zone>>(new Set(['sun']))
  const cardTimer = useRef(0)
  const H = Math.max(L.h - (c ? 60 : 90), 300) * 5 // the whole dive is five screens tall
  const base = c ? 58 : 92

  useEffect(() => {
    const t = setTimeout(() => void onSay(DIVE_LINES.start.en, DIVE_LINES.start.vi), 450)
    return () => {
      clearTimeout(t)
      window.clearTimeout(cardTimer.current)
      stopSpeaking()
    }
  }, [onSay])

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    const d = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)
    if (!scrolled && el.scrollTop > 30) setScrolled(true)
    // only re-render when the depth meter changes by ~10 m
    if (Math.abs(d - depth) * SEA_DEPTH_M >= 10) setDepth(d)
    const zone = [...ZONES].reverse().find((z) => d >= z.from)
    if (zone && !zoneSaid.current.has(zone.id)) {
      zoneSaid.current.add(zone.id)
      void onSay(zone.en, zone.vi)
    }
  }

  const tap = (cr: Creature) => {
    playBubble()
    void speak(cr.en + '!')
    setCard(cr)
    window.clearTimeout(cardTimer.current)
    cardTimer.current = window.setTimeout(() => setCard(null), 7000)
    if (!found.has(cr.id)) {
      const next = new Set(found).add(cr.id)
      setFound(next)
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]))
      } catch {
        /* private mode */
      }
      onStar()
    }
  }

  const openChest = async () => {
    if (chestOpen) return
    setChestOpen(true)
    playSparkle()
    onStar()
    onStar()
    onStar()
    await onSay(DIVE_LINES.treasure.en, DIVE_LINES.treasure.vi)
  }

  const zone = [...ZONES].reverse().find((z) => depth >= z.from) ?? ZONES[0]
  const meters = Math.round((depth * SEA_DEPTH_M) / 10) * 10
  const snow = useMemo(
    () => Array.from({ length: 40 }, (_, i) => `radial-gradient(circle at ${(i * 37) % 100}% ${(i * 53) % 100}%, rgba(255,255,255,0.5) 0 1.5px, transparent 2px)`).join(','),
    [],
  )

  return (
    <Screen>
      <div className={`flex items-center ${c ? 'gap-2 p-2' : 'gap-3 p-3'}`} style={{ paddingTop: `max(${c ? 8 : 12}px, env(safe-area-inset-top))` }}>
        <BackButton onBack={onBack} />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <div className={`rounded-full bg-slate-900/90 font-black ${c ? 'px-3 py-1 text-sm' : 'px-5 py-2 text-xl'}`} data-testid="depth">
            🌊 {meters} m
          </div>
          <div className={`rounded-full bg-sky-600/90 font-black ${c ? 'px-3 py-1 text-sm' : 'px-5 py-2 text-xl'}`}>
            📖 {found.size}/{CREATURES.length}
          </div>
        </div>
        <div className={`shrink-0 rounded-full bg-amber-400/90 font-black text-slate-900 shadow-lg ${c ? 'px-3 py-1.5 text-base' : 'px-4 py-2 text-xl'}`}>⭐ {stars}</div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div ref={scroller} data-testid="sea" onScroll={onScroll} className="no-scrollbar absolute inset-0 touch-pan-y overflow-y-auto overscroll-contain">
          <div
            className="relative w-full"
            style={{
              height: H,
              background:
                'linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 6%, #0369a1 20%, #1d4ed8 30%, #1e3a8a 45%, #1e1b4b 60%, #0b1020 80%, #0b1020 92%, #3b2f1e 96%, #57442a 100%)',
            }}
          >
            {/* sun rays at the top, marine snow in the deep (static backgrounds: no animation cost) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[25%] opacity-40" style={{ background: 'repeating-linear-gradient(100deg, rgba(255,255,255,0.18) 0 30px, transparent 30px 90px)', maskImage: 'linear-gradient(#000, transparent)' }} />
            <div className="pointer-events-none absolute inset-x-0 top-[45%] h-[50%]" style={{ backgroundImage: snow, backgroundSize: '220px 220px' }} />
            {/* zone signs */}
            {ZONES.map((z) => (
              <div key={z.id} className={`pointer-events-none absolute right-3 rounded-full bg-black/30 font-extrabold text-white/80 ${c ? 'px-2 text-[11px]' : 'px-3 py-1 text-sm'}`} style={{ top: `calc(${z.from * 100}% + 8px)` }}>
                {z.en}
              </div>
            ))}
            {/* seaweed + rocks on the floor */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-around px-4 text-5xl">
              <span>🪨</span>
              <span className="animate-drift">🌿</span>
              <span>🪸</span>
              <span className="animate-drift" style={{ animationDelay: '1s' }}>🌿</span>
              <span>🪨</span>
            </div>

            {CREATURES.map((cr, i) => (
              <button
                key={cr.id}
                data-testid={`creature-${cr.id}`}
                onClick={() => tap(cr)}
                className="absolute -translate-x-1/2 -translate-y-1/2 active:scale-90"
                style={{ top: cr.y * H, left: `${cr.x * 100}%`, minWidth: 56, minHeight: 56 }}
              >
                <span className={`block ${i % 2 ? 'animate-drift' : 'animate-float'}`} style={{ fontSize: base * cr.size, animationDelay: `${(i % 5) * 0.6}s`, filter: depth > 0.5 && cr.y > 0.55 ? 'drop-shadow(0 0 12px rgba(254,249,195,0.6))' : undefined }}>
                  {cr.emoji}
                </span>
                {found.has(cr.id) && <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 text-xs font-black">✓</span>}
              </button>
            ))}

            <button data-testid="treasure" onClick={() => void openChest()} className="absolute -translate-x-1/2 active:scale-95" style={{ top: H * 0.9, left: '62%' }}>
              <Chest open={chestOpen} size={c ? 90 : 140} />
              {chestOpen && (
                <span className="animate-word-pop absolute -top-10 left-1/2 flex -translate-x-1/2">
                  <Crystal size={c ? 40 : 60} />
                  <Crystal size={c ? 40 : 60} />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* the submarine stays in view while the sea scrolls past */}
        <div className="pointer-events-none absolute left-[6%] top-[38%]">
          <Submarine size={c ? 110 : 190} light={Math.min(1, Math.max(0, (depth - 0.3) * 2.2))} />
        </div>

        {!scrolled && (
          <div className={`pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center font-black text-white drop-shadow ${c ? 'text-base' : 'text-2xl'}`}>
            <span className="animate-float text-4xl">👆</span>
            Swipe up to dive! · Vuốt lên để lặn
          </div>
        )}

        {depth > 0.08 && (
          <button
            aria-label="Back to the surface"
            onClick={() => {
              playPop()
              scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`absolute bottom-4 right-4 rounded-full bg-sky-500/90 font-black shadow-xl active:scale-90 ${c ? 'px-3 py-2 text-sm' : 'px-5 py-3 text-lg'}`}
            style={{ minHeight: 44 }}
          >
            ⬆ UP
          </button>
        )}

        {card && (
          <button
            data-testid="creature-card"
            onClick={() => setCard(null)}
            className={`animate-word-pop absolute inset-x-3 mx-auto flex max-w-xl items-center rounded-3xl bg-white/95 text-left text-slate-900 shadow-2xl ${c ? 'top-2 gap-2 p-2' : 'top-4 gap-4 p-4'}`}
          >
            <span className={c ? 'text-5xl' : 'text-7xl'}>{card.emoji}</span>
            <span className="min-w-0">
              <b className={`block font-black ${c ? 'text-xl' : 'text-4xl'}`}>{card.en}</b>
              <span className={`block font-bold text-sky-700 ${c ? 'text-sm' : 'text-xl'}`}>{card.vi}</span>
              <span className={`block font-semibold text-slate-600 ${c ? 'text-xs' : 'text-base'}`}>{card.fact}</span>
            </span>
          </button>
        )}

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/30 px-3 py-1 text-xs font-extrabold text-white/90">{zone.vi}</div>
      </div>
    </Screen>
  )
}
