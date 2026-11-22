/** Building blocks shared by the Captain Star screens. */
import { useEffect, useRef } from 'react'
import { HERO_LINES } from '../data/heroData'
import { BackButton, Screen, type Say } from '../games/ui'
import { playHeroTheme, playPop } from '../utils/soundEffects'
import { useLayout } from '../utils/useLayout'
import { CaptainStar, ComicBurst, StarShield } from './CaptainStar'

export function HeroBar({ onBack, middle, stars }: { onBack: () => void; middle: React.ReactNode; stars: number }) {
  const c = useLayout().compact
  return (
    <div className={`relative z-20 flex items-center ${c ? 'gap-2 p-2' : 'gap-3 p-3'}`} style={{ paddingTop: `max(${c ? 8 : 12}px, env(safe-area-inset-top))` }}>
      <BackButton onBack={onBack} />
      <div className="flex min-w-0 flex-1 justify-center">{middle}</div>
      <div className={`shrink-0 rounded-full bg-amber-400/90 font-black text-slate-900 shadow-lg ${c ? 'px-3 py-1.5 text-base' : 'px-4 py-2 text-xl'}`}>⭐ {stars}</div>
    </div>
  )
}

/** Big "MISSION COMPLETE!" moment with Captain Star cheering. */
export function MissionComplete({ onBack, onSay, sub }: { onBack: () => void; onSay: Say; sub: string }) {
  const c = useLayout().compact
  useEffect(() => {
    playHeroTheme()
    const t = setTimeout(() => void onSay(HERO_LINES.missionDone.en, HERO_LINES.missionDone.vi), 500)
    return () => clearTimeout(t)
  }, [onSay])
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/55 px-3 text-center">
      <ComicBurst text="SUPER!" size={c ? 130 : 210} />
      <CaptainStar size={c ? 150 : 250} cheer />
      <div className={`font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] ${c ? 'text-3xl' : 'text-6xl'}`}>Mission complete!</div>
      <div className={`font-semibold text-sky-100 ${c ? 'text-base' : 'text-2xl'}`}>{sub}</div>
      <button
        data-testid="mission-back"
        onClick={() => {
          playPop()
          onBack()
        }}
        className={`mt-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-700 font-black shadow-xl active:scale-95 ${c ? 'px-6 py-2.5 text-lg' : 'px-10 py-4 text-2xl'}`}
      >
        🛡️ BACK TO HERO HQ
      </button>
    </div>
  )
}

/**
 * Throws the shield from (fx, fy) to (tx, ty) and back – the boomerang move used by the missions
 * and the shield game. Resolves when it reaches the target (the "hit" moment).
 */
export function useShieldThrow() {
  const el = useRef<HTMLDivElement>(null)
  const throwTo = (from: { x: number; y: number }, to: { x: number; y: number }) =>
    new Promise<void>((resolve) => {
      const s = el.current
      if (!s) return resolve()
      const dx = to.x - from.x
      const dy = to.y - from.y
      s.style.left = `${from.x}px`
      s.style.top = `${from.y}px`
      s.style.opacity = '1'
      const a = s.animate(
        [
          { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg) scale(0.7)' },
          { transform: `translate(-50%,-50%) translate(${dx * 0.55}px, ${dy * 0.55 - 60}px) rotate(400deg) scale(1)`, offset: 0.3 },
          { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) rotate(720deg) scale(1.1)`, offset: 0.5 },
          { transform: `translate(-50%,-50%) translate(${dx * 0.45}px, ${dy * 0.45 + 50}px) rotate(1080deg) scale(0.9)`, offset: 0.75 },
          { transform: 'translate(-50%,-50%) translate(0,0) rotate(1440deg) scale(0.7)' },
        ],
        { duration: 900, easing: 'ease-in-out' },
      )
      setTimeout(resolve, 450)
      a.onfinish = () => {
        s.style.opacity = '0'
      }
    })
  const node = (size: number) => (
    <div ref={el} className="pointer-events-none absolute z-20" style={{ opacity: 0 }}>
      <StarShield size={size} />
    </div>
  )
  return { throwTo, node }
}

export function HeroScreen({ children }: { children: React.ReactNode }) {
  return <Screen>{children}</Screen>
}
