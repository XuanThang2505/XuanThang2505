/** Weekly event: shooting stars cross the sky – tap one to make a wish. Geminids week gets a special title. */
import { useEffect, useRef, useState } from 'react'
import { isGeminids, WISH_LINES } from '../data/storyData'
import { Screen, TopBar, type Say, Done } from '../games/ui'
import { playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'

const TOTAL = 6

export function ShootingWish({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const c = useLayout().compact
  const [caught, setCaught] = useState(0)
  const [active, setActive] = useState<{ id: number; top: number; left: number; dur: number } | null>(null)
  const alive = useRef(true)
  const id = useRef(0)

  useEffect(() => {
    alive.current = true
    const t = setTimeout(() => void onSay(WISH_LINES.catch.en, WISH_LINES.catch.vi), 500)
    return () => {
      alive.current = false
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])

  // launch the next star whenever the previous one was caught (or flew away)
  useEffect(() => {
    if (caught >= TOTAL) return
    const t = setTimeout(
      () => alive.current && setActive({ id: ++id.current, top: 8 + Math.random() * 40, left: 55 + Math.random() * 35, dur: 4.5 + Math.random() * 1.5 }),
      active ? 900 : 1600,
    )
    return () => clearTimeout(t)
  }, [caught, active?.id])

  const catchIt = async () => {
    if (!active) return
    setActive(null)
    playSparkle()
    onStar()
    setCaught((n) => n + 1)
    await speak(WISH_LINES.title.en)
    if (caught + 1 >= TOTAL && alive.current) await onSay(WISH_LINES.done.en, WISH_LINES.done.vi)
  }

  return (
    <Screen>
      <TopBar
        onBack={onBack}
        stars={stars}
        middle={
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span key={i} className={c ? 'text-xl' : 'text-3xl'}>
                {i < caught ? '🌠' : '⚪'}
              </span>
            ))}
          </div>
        }
      />
      {caught >= TOTAL ? (
        <Done title="Make a wish!" sub={WISH_LINES.done.vi} stars={3} onAgain={() => setCaught(0)} onBack={onBack} />
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div className={`pointer-events-none absolute inset-x-0 top-3 text-center font-black text-sky-100/90 ${c ? 'text-base' : 'text-3xl'}`}>
            {isGeminids() ? '🌠 Geminids meteor shower!' : WISH_LINES.catch.en}
          </div>
          {active && (
            <button
              key={active.id}
              data-testid="wish-star"
              onClick={() => {
                playPop()
                void catchIt()
              }}
              onAnimationEnd={() => setActive(null)}
              className="animate-streak absolute flex h-16 w-16 items-center justify-center text-5xl"
              style={{ top: `${active.top}%`, left: `${active.left}%`, animationDuration: `${active.dur}s`, minWidth: 64, minHeight: 64 }}
            >
              🌠
            </button>
          )}
        </div>
      )}
    </Screen>
  )
}
