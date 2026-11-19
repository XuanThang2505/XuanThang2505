/**
 * The on-screen interface (HUD), laid out for any screen:
 *
 *   landscape, regular   iPad / Mac / TV   word card top-left, vocab cards right, dock bottom
 *   landscape, compact   iPhone sideways   same idea, shrunk; facts open as a panel
 *   portrait (any size)  iPhone / iPad up  word card on top, vocab row + dock stacked at the bottom
 *
 * Touch targets are never smaller than 44 px (Apple's guideline). Safe areas (notch, Dynamic
 * Island, home bar) are respected on every side.
 */
import { useEffect, useRef, useState } from 'react'
import { FACTS, PLANETS, type Lesson, type PlanetData, type ViewId, type VocabWord } from '../data/planetsData'
import { speak, stopSpeaking } from '../utils/speech'
import { playPop } from '../utils/soundEffects'
import { useLayout, type Layout } from '../utils/useLayout'
import type { Settings } from '../App'

interface Props {
  planet: Lesson
  currentId: ViewId
  flying: boolean
  nameBounceKey: number
  activeWord: string | null
  compareOn: boolean
  settings: Settings
  hasViVoice: boolean
  onSpeakName: () => void
  onSpeakPhrase: () => void
  onVocab: (w: VocabWord) => void
  onToggleCompare: () => void
  onSelectPlanet: (id: ViewId) => void
  onOpenGames: () => void
  /** stars earned in the games */
  stars: number
  /** speak one fun fact (English, + Vietnamese if enabled) */
  onFact: (en: string, vi?: string) => void
  onSettingsChange: (s: Settings) => void
}

const TAP = 44 // minimum touch target in px

function SpeakerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12z" />
      <path d="M14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
    </svg>
  )
}

// ---------------------------------------------------------------- main word card
function WordCard({
  planet,
  bounceKey,
  flying,
  L,
  onSpeakName,
  onSpeakPhrase,
}: Pick<Props, 'planet' | 'flying' | 'onSpeakName' | 'onSpeakPhrase'> & { bounceKey: number; L: Layout }) {
  const c = L.compact
  const longName = planet.englishName.length > 9
  return (
    <div
      className={`pointer-events-auto border border-white/10 bg-slate-900/75 shadow-2xl backdrop-blur-md transition-all duration-500 ${
        c ? 'rounded-2xl px-3 py-2' : 'rounded-3xl p-5'
      } ${L.portrait ? 'w-full' : c ? 'max-w-[44vw]' : 'max-w-[44vw]'} ${flying ? 'translate-y-[-8px] opacity-0' : 'opacity-100'}`}
    >
      <div className={`flex items-center ${c ? 'gap-2' : 'gap-4'}`}>
        <button
          data-testid="word-name"
          onClick={onSpeakName}
          key={bounceKey}
          className={`animate-word-pop min-w-0 text-left font-extrabold tracking-wide text-white drop-shadow-[0_0_14px_rgba(125,200,255,0.65)] ${
            c ? `flex min-h-[44px] items-center ${longName ? 'text-[22px] leading-tight' : 'text-[28px] leading-none'}` : 'text-4xl md:text-5xl'
          }`}
        >
          {planet.englishName}
        </button>
        <button
          data-testid="speak-name"
          onClick={onSpeakName}
          aria-label="Speak name"
          style={c ? { width: TAP, height: TAP } : undefined}
          className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-lg shadow-orange-500/40 active:scale-90 ${
            c ? '' : 'h-14 min-h-[44px] w-14 min-w-[44px]'
          }`}
        >
          <SpeakerIcon className={c ? 'h-6 w-6' : 'h-8 w-8'} />
        </button>
      </div>
      {!c && planet.syllables !== planet.englishName && (
        <div className="mt-1 text-lg font-bold tracking-[0.2em] text-sky-300/90">{planet.syllables}</div>
      )}
      <button
        data-testid="speak-phrase"
        onClick={onSpeakPhrase}
        className={`flex items-center gap-2 text-left font-bold text-amber-300 active:scale-95 ${c ? 'min-h-[40px] text-[14px] leading-tight' : 'mt-2 text-xl'}`}
      >
        <span>{planet.englishPhrase}</span>
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-amber-400/25 text-amber-200 ${c ? 'h-6 w-6' : 'h-8 w-8'}`}>
          <SpeakerIcon className={c ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
        </span>
      </button>
      <div className={`border-t border-white/15 font-semibold text-slate-300 ${c ? 'mt-1.5 pt-1 text-[12px] leading-snug' : 'mt-3 pt-2 text-base'}`}>
        <span className="font-extrabold text-white/90">{planet.vietnameseName}</span>
        {(!c || L.portrait) && (
          <>
            <span className="mx-2 text-white/30">·</span>
            {planet.vietnameseSub}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- fun facts
function FactsPanel({ planet, flying, L, onFact }: Pick<Props, 'planet' | 'flying' | 'onFact'> & { L: Layout }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(-1)
  const run = useRef(0)
  const facts = FACTS[planet.id]
  const c = L.compact

  useEffect(() => {
    setOpen(false)
    setCurrent(-1)
    run.current++
  }, [planet.id])

  const readAll = async () => {
    playPop()
    const me = ++run.current
    for (let i = 0; i < facts.length; i++) {
      if (me !== run.current) return
      setCurrent(i)
      await speak(facts[i][1], { interrupt: i === 0 })
      if (me !== run.current) return
      await new Promise((r) => setTimeout(r, 350))
    }
    if (me === run.current) setCurrent(-1)
  }

  const toggle = () => {
    playPop()
    run.current++
    stopSpeaking()
    setCurrent(-1)
    setOpen(!open)
  }

  const chips = (
    <div className={`grid gap-2 ${c && !L.portrait ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {facts.map(([icon, en, vi], i) => (
        <button
          data-testid="fact-chip"
          key={planet.id + i}
          onClick={() => {
            run.current++
            setCurrent(i)
            onFact(en, vi)
          }}
          className={`animate-word-pop flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left shadow-lg backdrop-blur-md active:scale-95 ${
            current === i ? 'border-amber-300 bg-amber-400/30 ring-2 ring-amber-300/60' : 'border-white/10 bg-slate-900/80'
          }`}
        >
          <span className={c ? 'text-xl' : 'text-2xl'}>{icon}</span>
          <span className="min-w-0 leading-tight">
            <b className={`block font-extrabold text-white ${c ? 'text-[13px]' : 'text-sm'}`}>{en}</b>
            <small className="block text-[11px] font-semibold text-slate-300">{vi}</small>
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <div className={`pointer-events-auto transition-all duration-500 ${c ? 'mt-2' : 'mt-3'} ${L.portrait ? '' : 'max-w-[44vw]'} ${flying ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex gap-2">
        <button
          data-testid="facts-toggle"
          onClick={toggle}
          aria-label="Fun facts"
          style={c ? { minHeight: TAP, minWidth: TAP } : undefined}
          className={`flex items-center justify-center gap-2 rounded-2xl border shadow-lg backdrop-blur-md active:scale-95 ${c ? 'px-2' : 'px-3 py-2'} ${
            open ? 'border-sky-300 bg-sky-500/40' : 'border-white/10 bg-slate-900/75'
          }`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-left leading-tight">
            <b className={`block font-extrabold text-white ${c ? 'text-[13px]' : 'text-base'}`}>FUN FACTS</b>
            {!c && <small className="block text-xs font-semibold text-slate-300">Điều thú vị</small>}
          </span>
        </button>
        {open && !c && (
          <button
            data-testid="facts-readall"
            onClick={() => void readAll()}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/75 px-3 py-2 shadow-lg backdrop-blur-md active:scale-95"
          >
            <span className="text-2xl">▶️</span>
            <span className="text-left leading-tight">
              <b className="block text-base font-extrabold text-white">READ ALL</b>
              <small className="block text-xs font-semibold text-slate-300">Đọc hết</small>
            </span>
          </button>
        )}
      </div>

      {/* big screens: the facts sit right under the button */}
      {open && !c && <div className="mt-2">{chips}</div>}

      {/* phones: facts open as a centred panel so they never cover the planet's controls */}
      {open && c && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm" onClick={toggle}>
          <div
            data-testid="facts-modal"
            className="max-h-full w-full max-w-[560px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <b className="text-lg font-extrabold text-white">🔍 FUN FACTS</b>
              <div className="flex gap-2">
                <button
                  data-testid="facts-readall"
                  onClick={() => void readAll()}
                  style={{ minHeight: TAP }}
                  className="rounded-2xl bg-amber-400 px-3 text-sm font-extrabold text-slate-900 active:scale-95"
                >
                  ▶️ READ ALL
                </button>
                <button
                  onClick={toggle}
                  aria-label="Close facts"
                  style={{ width: TAP, height: TAP }}
                  className="rounded-full border border-white/15 bg-slate-800 text-lg font-black text-white active:scale-90"
                >
                  ✕
                </button>
              </div>
            </div>
            {chips}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- vocab cards
function VocabCards({
  planet,
  activeWord,
  compareOn,
  flying,
  L,
  onVocab,
  onToggleCompare,
}: Pick<Props, 'planet' | 'activeWord' | 'compareOn' | 'flying' | 'onVocab' | 'onToggleCompare'> & { L: Layout }) {
  const c = L.compact
  const hasCompare = planet.id !== 'system'
  const wordCard = (w: VocabWord) => {
    const active = activeWord === w.word
    const base = `border text-left shadow-xl backdrop-blur-md transition-all active:scale-95 ${
      active ? 'scale-105 border-amber-300 bg-amber-400/30 shadow-amber-400/40 ring-4 ring-amber-300/60' : 'border-white/10 bg-slate-900/70'
    }`
    if (L.portrait) {
      // a row of cards: icon on top, word below
      return (
        <button
          data-testid="vocab-card"
          data-word={w.word}
          key={planet.id + w.word}
          onClick={() => onVocab(w)}
          style={{ minHeight: c ? 64 : 88 }}
          className={`${base} flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-center`}
        >
          <span className={`${c ? 'text-2xl' : 'text-4xl'} ${active ? 'animate-wiggle' : ''}`}>{w.icon}</span>
          <span className={`font-extrabold leading-tight tracking-wide text-white ${c ? 'text-[13px]' : 'text-lg'}`}>{w.word}</span>
          <span className={`font-semibold leading-tight text-slate-300 ${c ? 'text-[10px]' : 'text-sm'}`}>{w.vi}</span>
        </button>
      )
    }
    return (
      <button
        data-testid="vocab-card"
          data-word={w.word}
        key={planet.id + w.word}
        onClick={() => onVocab(w)}
        className={`${base} flex items-center rounded-2xl ${c ? 'h-[46px] min-w-[132px] gap-2 px-2.5' : 'h-20 min-w-[150px] gap-3 px-4'}`}
      >
        <span className={`${c ? 'text-2xl' : 'text-4xl'} ${active ? 'animate-wiggle' : ''}`}>{w.icon}</span>
        <span className="flex flex-col leading-tight">
          <span className={`font-extrabold tracking-wide text-white ${c ? 'text-[14px]' : 'text-xl'}`}>{w.word}</span>
          <span className={`font-semibold text-slate-300 ${c ? 'text-[10px]' : 'text-sm'}`}>{w.vi}</span>
        </span>
      </button>
    )
  }

  const compare = hasCompare && (
    <button
      data-testid="compare"
      onClick={onToggleCompare}
      aria-label="Size compare"
      style={L.portrait ? { minHeight: c ? 64 : 88 } : c ? { height: 46 } : undefined}
      className={`border shadow-xl backdrop-blur-md transition-all active:scale-95 ${
        compareOn ? 'border-sky-300 bg-sky-500/40 ring-4 ring-sky-300/50' : 'border-white/10 bg-indigo-900/70'
      } ${
        L.portrait
          ? 'flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-center'
          : `flex items-center rounded-2xl text-left ${c ? 'min-w-[132px] gap-2 px-2.5' : 'h-16 min-w-[150px] gap-3 px-4'}`
      }`}
    >
      <span className={c ? 'text-2xl' : L.portrait ? 'text-4xl' : 'text-3xl'}>⚖️</span>
      <span className={`flex flex-col leading-tight ${L.portrait ? 'items-center' : ''}`}>
        <span className={`font-extrabold tracking-wide text-white ${c ? (L.portrait ? 'text-[12px]' : 'text-[12px]') : 'text-base'}`}>
          {c && L.portrait ? 'SIZE' : 'SIZE COMPARE'}
        </span>
        <span className={`font-semibold text-slate-300 ${c ? 'text-[10px]' : 'text-xs'}`}>{c ? 'So sánh' : 'So sánh kích thước'}</span>
      </span>
    </button>
  )

  return (
    <div
      className={`pointer-events-auto transition-all duration-500 ${
        L.portrait ? `grid gap-2 ${hasCompare ? 'grid-cols-4' : 'grid-cols-3'}` : `flex flex-col ${c ? 'gap-1.5' : 'gap-3'}`
      } ${flying ? (L.portrait ? 'translate-y-6 opacity-0' : 'translate-x-6 opacity-0') : 'opacity-100'}`}
    >
      {planet.vocabWords.map(wordCard)}
      {compare}
    </div>
  )
}

// ---------------------------------------------------------------- planet dock
/** Dock icon for the Solar System overview: a little sun with orbit rings. */
function SystemBall({ size }: { size: string }) {
  return (
    <span className={`relative block ${size}`}>
      {[100, 72, 46].map((sz) => (
        <span
          key={sz}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/50"
          style={{ width: `${sz}%`, height: `${sz * 0.55}%` }}
        />
      ))}
      <span
        className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle at 35% 35%, #fff7c2, #ffb02e 60%, #c23d00)', boxShadow: '0 0 12px 3px rgba(255,170,60,0.7)' }}
      />
      <span className="absolute left-[8%] top-[42%] h-[12%] w-[12%] rounded-full bg-sky-400" />
      <span className="absolute right-[18%] top-[30%] h-[9%] w-[9%] rounded-full bg-orange-400" />
    </span>
  )
}

function PlanetBall({ planet, size }: { planet: PlanetData; size: string }) {
  const ringed = planet.id === 'saturn' || planet.id === 'uranus'
  const ringClass = (front: boolean) =>
    `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] ${
      planet.id === 'uranus'
        ? `h-[130%] w-[22%] border-[2px] ${front ? 'border-cyan-100/70' : 'border-cyan-100/60'}`
        : `h-[34%] w-[150%] -rotate-[18deg] border-[5px] ${front ? 'border-amber-200/90' : 'border-amber-200/80'}`
    }`
  return (
    <span className={`relative block ${size}`}>
      {ringed && <span className={ringClass(false)} />}
      <span
        className="absolute inset-[12%] rounded-full shadow-[inset_-8px_-8px_16px_rgba(0,0,0,0.55)]"
        style={{
          background: planet.dockGradient,
          boxShadow:
            planet.id === 'sun'
              ? '0 0 26px 6px rgba(255,170,60,0.7), inset -6px -6px 14px rgba(160,40,0,0.5)'
              : 'inset -8px -8px 16px rgba(0,0,0,0.55), 0 0 12px rgba(120,170,255,0.25)',
        }}
      />
      {ringed && <span className={ringClass(true)} style={{ clipPath: planet.id === 'uranus' ? 'inset(0 0 0 50%)' : 'inset(50% 0 0 0)' }} />}
    </span>
  )
}

function PlanetDock({ currentId, onSelectPlanet, onOpenGames, stars, L }: Pick<Props, 'currentId' | 'onSelectPlanet' | 'onOpenGames' | 'stars'> & { L: Layout }) {
  const c = L.compact
  const ball = c ? 'h-[46px] w-[46px]' : 'h-14 min-h-[44px] w-14 min-w-[44px] lg:h-16 lg:w-16'
  const scroller = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // keep the current body visible when the dock scrolls (small screens)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [currentId, L.w])

  const label = (active: boolean, text: string) =>
    (!c || active) && (
      <span
        className={`mt-0.5 whitespace-nowrap rounded-full px-1.5 font-extrabold leading-tight tracking-wide ${c ? 'text-[10px]' : 'text-[11px] lg:text-xs'} ${
          active ? 'bg-amber-400 text-slate-900' : 'text-white/85'
        }`}
      >
        {text}
      </span>
    )

  return (
    <div
      ref={scroller}
      data-testid="dock"
      className={`no-scrollbar pointer-events-auto flex max-w-full items-end overflow-x-auto overflow-y-hidden border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md ${
        c ? 'gap-1 rounded-[1.5rem] px-2 pb-1 pt-1.5' : 'gap-1 rounded-[2rem] px-3 pb-2 pt-3 lg:gap-2'
      }`}
    >
      <button
        data-testid="dock-system"
        ref={currentId === 'system' ? activeRef : undefined}
        onClick={() => onSelectPlanet('system')}
        className={`mr-1 flex shrink-0 flex-col items-center border-r border-white/10 pr-2 transition-transform duration-300 active:scale-90 ${currentId === 'system' ? '-translate-y-1 scale-105' : ''}`}
      >
        <SystemBall size={ball} />
        {c ? (
          currentId === 'system' ? label(true, 'SOLAR SYSTEM') : <span className="h-0" />
        ) : (
          <span
            className={`mt-1 rounded-full px-2 text-[11px] font-extrabold leading-tight tracking-wide ${
              currentId === 'system' ? 'bg-amber-400 text-slate-900' : 'text-white/85'
            }`}
          >
            SOLAR SYSTEM
          </span>
        )}
      </button>
      <button
        data-testid="dock-play"
        onClick={onOpenGames}
        aria-label="Play games"
        className="relative mr-1 flex shrink-0 flex-col items-center border-r border-white/10 pr-2 transition-transform duration-300 active:scale-90"
      >
        <span className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 shadow-lg shadow-fuchsia-500/30 ${ball} ${c ? 'text-2xl' : 'text-3xl'}`}>
          🎮
        </span>
        {stars > 0 && <span className="absolute -right-0.5 -top-1.5 rounded-full bg-amber-400 px-1.5 text-[11px] font-black text-slate-900 shadow">⭐{stars}</span>}
        {!c && <span className="mt-1 rounded-full px-2 text-[11px] font-extrabold leading-tight tracking-wide text-white/85">PLAY</span>}
      </button>
      {PLANETS.map((p) => {
        const active = p.id === currentId
        return (
          <button
            key={p.id}
            data-testid={`dock-${p.id}`}
            aria-label={p.englishName}
            ref={active ? activeRef : undefined}
            onClick={() => onSelectPlanet(p.id)}
            className={`flex shrink-0 flex-col items-center transition-transform duration-300 active:scale-90 ${active ? '-translate-y-1 scale-105' : ''}`}
          >
            <PlanetBall planet={p} size={ball} />
            {label(active, p.englishName)}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- parent lock
function ParentLock({ onOpen, L }: { onOpen: () => void; L: Layout }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef(0)
  const c = L.compact

  const cancel = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = null
    setProgress(0)
  }
  const begin = () => {
    start.current = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / 2000)
      setProgress(p)
      if (p >= 1) {
        cancel()
        onOpen()
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => cancel, [])

  return (
    <button
      data-testid="lock"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Parent settings (hold 2 seconds)"
      style={c ? { width: TAP, height: TAP } : undefined}
      className={`pointer-events-auto relative flex items-center justify-center rounded-full ${c ? '' : 'h-14 min-h-[44px] w-14 min-w-[44px]'}`}
    >
      <span className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#fbbf24 ${progress * 360}deg, rgba(15,23,42,0.7) 0deg)` }} />
      <span className={`relative flex items-center justify-center rounded-full bg-slate-900/90 ${c ? 'h-[36px] w-[36px] text-base' : 'h-11 w-11 text-xl'}`}>🔒</span>
    </button>
  )
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left">
      <span>
        <span className="block text-lg font-bold text-white">{label}</span>
        {sub && <span className="block text-sm text-slate-400">{sub}</span>}
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${value ? 'bg-emerald-400' : 'bg-slate-600'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
      </span>
    </button>
  )
}

function ParentPanel({ settings, hasViVoice, onChange, onClose }: { settings: Settings; hasViVoice: boolean; onChange: (s: Settings) => void; onClose: () => void }) {
  return (
    <div data-testid="parent-panel" className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-full w-[min(94vw,460px)] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold text-white">👨‍👩‍👧 Cài đặt phụ huynh</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <div className="text-lg font-bold text-white">Tốc độ giọng đọc</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['slow', 'normal'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onChange({ ...settings, rate: r })}
                  className={`rounded-xl py-2 text-lg font-extrabold ${settings.rate === r ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white'}`}
                >
                  {r === 'slow' ? '🐢 Slow' : '🐇 Normal'}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="Tự động xoay" sub="Auto rotate" value={settings.autoRotate} onChange={(v) => onChange({ ...settings, autoRotate: v })} />
          <Toggle label="Nhạc nền" sub="Background music" value={settings.music} onChange={(v) => onChange({ ...settings, music: v })} />
          <Toggle
            label="Đọc thêm tiếng Việt"
            sub={hasViVoice ? 'Đọc nghĩa tiếng Việt sau từ tiếng Anh' : 'Máy chưa có giọng Việt (Cài đặt › Trợ năng › Nội dung được đọc)'}
            value={settings.vietnameseVoice}
            onChange={(v) => onChange({ ...settings, vietnameseVoice: v })}
          />
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-sky-500 py-3 text-xl font-extrabold text-white active:scale-95">
          Xong ✓
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- HUD
export function IPadHUD(props: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const L = useLayout()
  const { planet, compareOn, flying } = props
  const c = L.compact
  const pad = c ? 8 : 16

  const caption =
    compareOn && !flying && 'compare' in planet ? (
      <div
        data-testid="compare-caption"
        className={`animate-word-pop rounded-2xl bg-sky-600/85 text-center shadow-xl backdrop-blur ${c ? 'px-3 py-1' : 'px-5 py-2'} ${
          L.portrait ? 'mx-auto w-fit' : `absolute left-1/2 -translate-x-1/2 ${c ? 'bottom-[76px]' : 'bottom-32'}`
        }`}
      >
        <div className={`font-extrabold text-white ${c ? 'text-[15px]' : 'text-xl'}`}>{planet.compare.en}</div>
        <div className={`font-semibold text-sky-100 ${c ? 'text-[11px]' : 'text-sm'}`}>{planet.compare.vi}</div>
      </div>
    ) : null

  const vocab = (
    <VocabCards
      planet={planet}
      activeWord={props.activeWord}
      compareOn={compareOn}
      flying={flying}
      L={L}
      onVocab={props.onVocab}
      onToggleCompare={props.onToggleCompare}
    />
  )
  const dock = <PlanetDock currentId={props.currentId} onSelectPlanet={props.onSelectPlanet} onOpenGames={props.onOpenGames} stars={props.stars} L={L} />

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 font-nunito"
      style={{
        paddingTop: `max(${pad}px, env(safe-area-inset-top))`,
        paddingBottom: `max(${c ? 6 : 12}px, env(safe-area-inset-bottom))`,
        paddingLeft: `max(${pad}px, env(safe-area-inset-left))`,
        paddingRight: `max(${pad}px, env(safe-area-inset-right))`,
      }}
    >
      <div className="relative h-full w-full">
        {/* top-left (landscape) / full width (portrait): word card + facts */}
        <div className="absolute left-0 top-0" style={L.portrait ? { right: (c ? TAP : 56) + 8 } : undefined}>
          <WordCard
            planet={planet}
            flying={flying}
            L={L}
            bounceKey={props.nameBounceKey}
            onSpeakName={props.onSpeakName}
            onSpeakPhrase={props.onSpeakPhrase}
          />
          <FactsPanel planet={planet} flying={flying} L={L} onFact={props.onFact} />
        </div>

        <div className="absolute right-0 top-0">
          <ParentLock onOpen={() => setPanelOpen(true)} L={L} />
        </div>

        {L.portrait ? (
          // upright: vocab row and dock stacked at the bottom
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-stretch gap-2">
            {caption}
            {vocab}
            <div className="flex justify-center">{dock}</div>
          </div>
        ) : (
          <>
            <div className={`absolute right-0 ${c ? 'top-[52px]' : 'top-1/2 -translate-y-1/2'}`}>{vocab}</div>
            {caption}
            {/* full-width strip, dock centred: an element at left:50% could only use half the screen */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">{dock}</div>
          </>
        )}
      </div>

      {panelOpen && (
        <ParentPanel settings={props.settings} hasViVoice={props.hasViVoice} onChange={props.onSettingsChange} onClose={() => setPanelOpen(false)} />
      )}
    </div>
  )
}
