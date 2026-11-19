/** Shared building blocks for the 2D games (full-screen layout, top bar, question, finish screen). */
import type React from 'react'

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

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_30%_30%,#24185e_0%,#0a0d2c_55%,#03040f_100%)] font-nunito text-white">
      {children}
    </div>
  )
}

export function TopBar({ onBack, middle, stars }: { onBack: () => void; middle: React.ReactNode; stars: number }) {
  return (
    <div className="flex items-center gap-3 p-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <button
        onClick={onBack}
        aria-label="Back"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-2xl font-black shadow-lg active:scale-90"
      >
        ✕
      </button>
      <div className="flex min-w-0 flex-1 justify-center">{middle}</div>
      <div className="shrink-0 rounded-full bg-amber-400/90 px-4 py-2 text-xl font-black text-slate-900 shadow-lg">⭐ {stars}</div>
    </div>
  )
}

export function QuestionButton({ icon, en, vi, onSay }: { icon: string; en: string; vi: string; onSay: Say }) {
  return (
    <button
      onClick={() => onSay(en, vi)}
      className="flex max-w-full items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/75 px-5 py-3 text-left shadow-xl backdrop-blur active:scale-95"
    >
      <span className="text-4xl">{icon}</span>
      <span className="min-w-0">
        <b className="block text-2xl font-extrabold leading-tight md:text-3xl">{en}</b>
        <small className="block text-base font-semibold text-slate-300">{vi}</small>
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-xl">🔊</span>
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
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="animate-word-pop text-6xl">{'⭐'.repeat(Math.max(1, Math.min(stars, 5)))}</div>
      <div className="text-5xl font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{title}</div>
      <div className="text-xl font-semibold text-sky-200">{sub}</div>
      <div className="mt-4 flex gap-4">
        <button onClick={onAgain} className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
          {againLabel}
        </button>
        <button onClick={onBack} className="rounded-full border border-white/20 bg-slate-800/80 px-8 py-4 text-2xl font-black shadow-xl active:scale-95">
          BACK
        </button>
      </div>
    </div>
  )
}

