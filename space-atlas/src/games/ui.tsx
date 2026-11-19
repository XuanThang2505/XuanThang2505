/** Shared building blocks for the 2D games (full-screen layout, top bar, question, finish screen). */
import type React from 'react'
import { useLayout } from '../utils/useLayout'

export type Say = (en: string, vi?: string) => void

export function shuffle<T>(a: T[]) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Space the game's top bar needs (px), so boards can start below it. */
export function topBarHeight(compact: boolean) {
  return compact ? 64 : 96
}

/** Full-screen game layer. Keeps clear of the notch / Dynamic Island / home bar on every side. */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_30%_30%,#24185e_0%,#0a0d2c_55%,#03040f_100%)] font-nunito text-white"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {children}
    </div>
  )
}

export function TopBar({ onBack, middle, stars }: { onBack: () => void; middle: React.ReactNode; stars: number }) {
  const { compact } = useLayout()
  return (
    <div className={`flex items-center ${compact ? 'gap-2 p-2' : 'gap-3 p-3'}`} style={{ paddingTop: `max(${compact ? 8 : 12}px, env(safe-area-inset-top))` }}>
      <button
        onClick={onBack}
        aria-label="Back"
        style={{ width: compact ? 44 : 56, height: compact ? 44 : 56 }}
        className="flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-2xl font-black shadow-lg active:scale-90"
      >
        ✕
      </button>
      <div className="flex min-w-0 flex-1 justify-center">{middle}</div>
      <div className={`shrink-0 rounded-full bg-amber-400/90 font-black text-slate-900 shadow-lg ${compact ? 'px-3 py-1.5 text-base' : 'px-4 py-2 text-xl'}`}>⭐ {stars}</div>
    </div>
  )
}

export function QuestionButton({ icon, en, vi, onSay }: { icon: string; en: string; vi: string; onSay: Say }) {
  const { compact } = useLayout()
  return (
    <button
      onClick={() => onSay(en, vi)}
      className={`flex max-w-full items-center rounded-3xl border border-white/10 bg-slate-900/75 text-left shadow-xl backdrop-blur active:scale-95 ${
        compact ? 'min-h-[44px] gap-2 px-3 py-1' : 'gap-3 px-5 py-3'
      }`}
    >
      <span className={compact ? 'text-2xl' : 'text-4xl'}>{icon}</span>
      <span className="min-w-0">
        <b className={`block font-extrabold leading-tight ${compact ? 'text-base' : 'text-2xl md:text-3xl'}`}>{en}</b>
        <small className={`block font-semibold text-slate-300 ${compact ? 'text-[11px] leading-tight' : 'text-base'}`}>{vi}</small>
      </span>
      <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 ${compact ? 'h-9 w-9 text-base' : 'h-11 w-11 text-xl'}`}>🔊</span>
    </button>
  )
}

export function Done({
  title,
  sub,
  stars,
  onAgain,
  onBack,
  againLabel = '▶ AGAIN',
}: {
  title: string
  sub: string
  stars: number
  onAgain: () => void
  onBack: () => void
  againLabel?: string
}) {
  const { compact } = useLayout()
  const btn = compact ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 text-center">
      <div className={`animate-word-pop ${compact ? 'text-4xl' : 'text-6xl'}`}>{'⭐'.repeat(Math.max(1, Math.min(stars, 5)))}</div>
      <div className={`font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${compact ? 'text-3xl' : 'text-5xl'}`}>{title}</div>
      <div className={`font-semibold text-sky-200 ${compact ? 'text-base' : 'text-xl'}`}>{sub}</div>
      <div className={`flex flex-wrap justify-center gap-3 ${compact ? 'mt-2' : 'mt-4'}`}>
        <button onClick={onAgain} className={`rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 font-black shadow-xl active:scale-95 ${btn}`}>
          {againLabel}
        </button>
        <button onClick={onBack} className={`rounded-full border border-white/20 bg-slate-800/80 font-black shadow-xl active:scale-95 ${btn}`}>
          BACK
        </button>
      </div>
    </div>
  )
}
