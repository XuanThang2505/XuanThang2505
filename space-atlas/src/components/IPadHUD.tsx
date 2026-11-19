/**
 * iPad landscape HUD: word card (top-left), vocab cards (right), planet dock (bottom),
 * parent lock (top-right).
 */
import { useEffect, useRef, useState } from 'react'
import { FACTS, PLANETS, type Lesson, type PlanetData, type ViewId, type VocabWord } from '../data/planetsData'
import { speak, stopSpeaking } from '../utils/speech'
import { playPop } from '../utils/soundEffects'
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
function WordCard({ planet, bounceKey, flying, onSpeakName, onSpeakPhrase }: Pick<Props, 'planet' | 'flying' | 'onSpeakName' | 'onSpeakPhrase'> & { bounceKey: number }) {
  return (
    <div
      className={`pointer-events-auto max-w-[44vw] rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md transition-all duration-500 ${
        flying ? 'translate-y-[-8px] opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onSpeakName}
          key={bounceKey}
          className="animate-word-pop text-left text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_14px_rgba(125,200,255,0.65)] md:text-5xl"
        >
          {planet.englishName}
        </button>
        <button
          onClick={onSpeakName}
          aria-label="Speak name"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-lg shadow-orange-500/40 active:scale-90"
        >
          <SpeakerIcon className="h-8 w-8" />
        </button>
      </div>
      {planet.syllables !== planet.englishName && (
        <div className="mt-1 text-lg font-bold tracking-[0.2em] text-sky-300/90">{planet.syllables}</div>
      )}
      <button onClick={onSpeakPhrase} className="mt-2 flex items-center gap-2 text-left text-xl font-bold text-amber-300 active:scale-95">
        <span>{planet.englishPhrase}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/25 text-amber-200">
          <SpeakerIcon className="h-5 w-5" />
        </span>
      </button>
      <div className="mt-3 border-t border-white/15 pt-2 text-base font-semibold text-slate-300">
        <span className="font-extrabold text-white/90">{planet.vietnameseName}</span>
        <span className="mx-2 text-white/30">·</span>
        {planet.vietnameseSub}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- fun facts
function FactsPanel({ planet, flying, onFact }: Pick<Props, 'planet' | 'flying' | 'onFact'>) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(-1)
  const run = useRef(0)
  const facts = FACTS[planet.id]

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

  return (
    <div className={`pointer-events-auto mt-3 max-w-[44vw] transition-all duration-500 ${flying ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex gap-2">
        <button
          onClick={() => {
            playPop()
            run.current++
            stopSpeaking()
            setCurrent(-1)
            setOpen(!open)
          }}
          className={`flex items-center gap-2 rounded-2xl border px-3 py-2 shadow-lg backdrop-blur-md active:scale-95 ${
            open ? 'border-sky-300 bg-sky-500/40' : 'border-white/10 bg-slate-900/75'
          }`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-left leading-tight">
            <b className="block text-base font-extrabold text-white">FUN FACTS</b>
            <small className="block text-xs font-semibold text-slate-300">Điều thú vị</small>
          </span>
        </button>
        {open && (
          <button
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
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {facts.map(([icon, en, vi], i) => (
            <button
              key={planet.id + i}
              onClick={() => {
                run.current++
                setCurrent(i)
                onFact(en, vi)
              }}
              className={`animate-word-pop flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-left shadow-lg backdrop-blur-md active:scale-95 ${
                current === i ? 'border-amber-300 bg-amber-400/30 ring-2 ring-amber-300/60' : 'border-white/10 bg-slate-900/75'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="min-w-0 leading-tight">
                <b className="block text-sm font-extrabold text-white">{en}</b>
                <small className="block text-[11px] font-semibold text-slate-300">{vi}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- vocab cards
function VocabCards({ planet, activeWord, compareOn, flying, onVocab, onToggleCompare }: Pick<Props, 'planet' | 'activeWord' | 'compareOn' | 'flying' | 'onVocab' | 'onToggleCompare'>) {
  return (
    <div className={`pointer-events-auto flex flex-col gap-3 transition-all duration-500 ${flying ? 'translate-x-6 opacity-0' : 'opacity-100'}`}>
      {planet.vocabWords.map((w) => {
        const active = activeWord === w.word
        return (
          <button
            key={planet.id + w.word}
            onClick={() => onVocab(w)}
            className={`flex h-20 min-w-[150px] items-center gap-3 rounded-2xl border px-4 text-left shadow-xl backdrop-blur-md transition-all active:scale-95 ${
              active
                ? 'scale-105 border-amber-300 bg-amber-400/30 shadow-amber-400/40 ring-4 ring-amber-300/60'
                : 'border-white/10 bg-slate-900/70'
            }`}
          >
            <span className={`text-4xl ${active ? 'animate-wiggle' : ''}`}>{w.icon}</span>
            <span className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold tracking-wide text-white">{w.word}</span>
              <span className="text-sm font-semibold text-slate-300">{w.vi}</span>
            </span>
          </button>
        )
      })}
      {planet.id !== 'system' && (
      <button
        onClick={onToggleCompare}
        className={`flex h-16 min-w-[150px] items-center gap-3 rounded-2xl border px-4 text-left shadow-xl backdrop-blur-md transition-all active:scale-95 ${
          compareOn ? 'border-sky-300 bg-sky-500/40 ring-4 ring-sky-300/50' : 'border-white/10 bg-indigo-900/70'
        }`}
      >
        <span className="text-3xl">⚖️</span>
        <span className="flex flex-col leading-tight">
          <span className="text-base font-extrabold tracking-wide text-white">SIZE COMPARE</span>
          <span className="text-xs font-semibold text-slate-300">So sánh kích thước</span>
        </span>
      </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- planet dock
/** Dock icon for the Solar System overview: a little sun with orbit rings. */
function SystemBall() {
  return (
    <span className="relative block h-14 w-14 lg:h-16 lg:w-16">
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

function PlanetBall({ planet, size = 'w-14 h-14 lg:w-16 lg:h-16' }: { planet: PlanetData; size?: string }) {
  return (
    <span className={`relative block ${size}`}>
      {(planet.id === 'saturn' || planet.id === 'uranus') && (
        // back half of the ring, behind the planet
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] ${
            planet.id === 'uranus'
              ? 'h-[130%] w-[22%] border-[2px] border-cyan-100/60'
              : 'h-[34%] w-[150%] -rotate-[18deg] border-[5px] border-amber-200/80'
          }`}
        />
      )}
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
      {(planet.id === 'saturn' || planet.id === 'uranus') && (
        // front half of the ring, drawn over the planet
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] ${
            planet.id === 'uranus'
              ? 'h-[130%] w-[22%] border-[2px] border-cyan-100/70'
              : 'h-[34%] w-[150%] -rotate-[18deg] border-[5px] border-amber-200/90'
          }`}
          style={{ clipPath: planet.id === 'uranus' ? 'inset(0 0 0 50%)' : 'inset(50% 0 0 0)' }}
        />
      )}
    </span>
  )
}

function PlanetDock({ currentId, onSelectPlanet, onOpenGames, stars }: Pick<Props, 'currentId' | 'onSelectPlanet' | 'onOpenGames' | 'stars'>) {
  return (
    <div className="pointer-events-auto flex items-end gap-1 rounded-[2rem] border border-white/10 bg-slate-900/60 px-3 pb-2 pt-3 shadow-2xl backdrop-blur-md lg:gap-2">
      <button
        onClick={() => onSelectPlanet('system')}
        className={`mr-1 flex flex-col items-center border-r border-white/10 pr-2 transition-transform duration-300 active:scale-90 ${currentId === 'system' ? '-translate-y-2 scale-110' : ''}`}
      >
        <SystemBall />
        <span
          className={`mt-1 rounded-full px-2 text-[11px] font-extrabold leading-tight tracking-wide ${
            currentId === 'system' ? 'bg-amber-400 text-slate-900' : 'text-white/85'
          }`}
        >
          SOLAR SYSTEM
        </span>
      </button>
      <button
        onClick={onOpenGames}
        aria-label="Play games"
        className="relative mr-1 flex flex-col items-center border-r border-white/10 pr-2 transition-transform duration-300 active:scale-90"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-3xl shadow-lg shadow-fuchsia-500/30 lg:h-16 lg:w-16">
          🎮
        </span>
        {stars > 0 && (
          <span className="absolute -right-0.5 -top-1.5 rounded-full bg-amber-400 px-1.5 text-[11px] font-black text-slate-900 shadow">⭐{stars}</span>
        )}
        <span className="mt-1 rounded-full px-2 text-[11px] font-extrabold leading-tight tracking-wide text-white/85">PLAY</span>
      </button>
      {PLANETS.map((p) => {
        const active = p.id === currentId
        return (
          <button
            key={p.id}
            onClick={() => onSelectPlanet(p.id)}
            className={`flex flex-col items-center transition-transform duration-300 active:scale-90 ${active ? '-translate-y-2 scale-110' : ''}`}
          >
            <PlanetBall planet={p} />
            <span
              className={`mt-1 rounded-full px-1.5 text-[11px] font-extrabold tracking-wide lg:text-xs ${
                active ? 'bg-amber-400 text-slate-900' : 'text-white/85'
              }`}
            >
              {p.englishName}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- parent lock
function ParentLock({ onOpen }: { onOpen: () => void }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef(0)

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
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Parent settings (hold 2 seconds)"
      className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#fbbf24 ${progress * 360}deg, rgba(15,23,42,0.7) 0deg)` }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 text-xl">🔒</span>
    </button>
  )
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left">
      <span>
        <span className="block text-lg font-bold text-white">{label}</span>
        {sub && <span className="block text-sm text-slate-400">{sub}</span>}
      </span>
      <span className={`relative h-8 w-14 rounded-full transition-colors ${value ? 'bg-emerald-400' : 'bg-slate-600'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
      </span>
    </button>
  )
}

function ParentPanel({ settings, hasViVoice, onChange, onClose }: { settings: Settings; hasViVoice: boolean; onChange: (s: Settings) => void; onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[min(92vw,460px)] rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold text-white">👨‍👩‍👧 Cài đặt phụ huynh</h2>
        <div className="mt-5 space-y-3">
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
            sub={hasViVoice ? 'Đọc nghĩa tiếng Việt sau từ tiếng Anh' : 'iPad chưa có giọng Việt (Cài đặt › Trợ năng › Nội dung được đọc)'}
            value={settings.vietnameseVoice}
            onChange={(v) => onChange({ ...settings, vietnameseVoice: v })}
          />
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-xl font-extrabold text-white active:scale-95">
          Xong ✓
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- HUD
export function IPadHUD(props: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const { planet, compareOn, flying } = props

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 font-nunito"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <div className="relative h-full w-full">
        <div className="absolute left-0 top-0">
          <WordCard
            planet={planet}
            flying={flying}
            bounceKey={props.nameBounceKey}
            onSpeakName={props.onSpeakName}
            onSpeakPhrase={props.onSpeakPhrase}
          />
          <FactsPanel planet={planet} flying={flying} onFact={props.onFact} />
        </div>

        <div className="absolute right-0 top-0">
          <ParentLock onOpen={() => setPanelOpen(true)} />
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <VocabCards
            planet={planet}
            activeWord={props.activeWord}
            compareOn={compareOn}
            flying={flying}
            onVocab={props.onVocab}
            onToggleCompare={props.onToggleCompare}
          />
        </div>

        {compareOn && !flying && 'compare' in planet && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-word-pop rounded-2xl bg-sky-600/85 px-5 py-2 text-center shadow-xl backdrop-blur">
            <div className="text-xl font-extrabold text-white">{planet.compare.en}</div>
            <div className="text-sm font-semibold text-sky-100">{planet.compare.vi}</div>
          </div>
        )}

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <PlanetDock currentId={props.currentId} onSelectPlanet={props.onSelectPlanet} onOpenGames={props.onOpenGames} stars={props.stars} />
        </div>
      </div>

      {panelOpen && (
        <ParentPanel settings={props.settings} hasViVoice={props.hasViVoice} onChange={props.onSettingsChange} onClose={() => setPanelOpen(false)} />
      )}
    </div>
  )
}
