/**
 * Robot workshop: dress up Cosmo (colour, eyes, hat) – every choice says its English word – then
 * make him dance. The look is saved and used everywhere Cosmo appears.
 */
import { useEffect, useRef, useState } from 'react'
import { COSMO_EYES, COSMO_HATS, WORKSHOP_LINES } from '../data/moreData'
import { ROCKET_COLORS } from '../data/storyData'
import { Screen, TopBar, type Say } from '../games/ui'
import { playArrive, playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo } from './Cosmo'
import { setCosmoStyle, useCosmoStyle, type CosmoStyle } from './cosmoStyle'

const HAT_ICON: Record<string, string> = { none: '🤖', cap: '🧢', crown: '👑', bow: '🎀', headphones: '🎧' }
const EYE_ICON: Record<string, string> = { round: '👀', happy: '😊', star: '🤩', heart: '😍' }

export function RobotWorkshop({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const style = useCosmoStyle()
  const [dancing, setDancing] = useState(false)
  const [pop, setPop] = useState(0)
  const changes = useRef(0)
  const danceTimer = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => void onSay(WORKSHOP_LINES.start.en, WORKSHOP_LINES.start.vi), 450)
    return () => {
      clearTimeout(t)
      window.clearTimeout(danceTimer.current)
      stopSpeaking()
    }
  }, [onSay])

  const pick = (s: Partial<CosmoStyle>, word: string) => {
    playPop()
    setCosmoStyle(s)
    setPop((p) => p + 1)
    void speak(word + '!')
    // a star for the first few new looks (keeps it rewarding without farming)
    if (++changes.current % 4 === 0 && changes.current <= 12) onStar()
  }

  const dance = () => {
    playArrive()
    playSparkle()
    setDancing(true)
    void speak(WORKSHOP_LINES.dance.en)
    window.clearTimeout(danceTimer.current)
    danceTimer.current = window.setTimeout(() => setDancing(false), 4500)
  }

  const chip = c ? 46 : 68
  const row = (title: string, children: React.ReactNode) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>{title}</div>
      <div className={`flex flex-wrap justify-center ${c ? 'gap-1.5' : 'gap-3'}`}>{children}</div>
    </div>
  )
  const opt = (active: boolean) =>
    `flex items-center justify-center rounded-2xl border-4 bg-white/5 active:scale-90 ${active ? 'scale-105 border-white bg-white/15' : 'border-white/20'}`

  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Robot workshop 🔧</div>} />
      <div className={`flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3 ${L.portrait ? 'flex-col gap-3' : c ? 'gap-4' : 'gap-14'}`}>
        <div className="relative flex flex-col items-center">
          {/* spotlight */}
          <div className="absolute inset-x-0 bottom-2 mx-auto h-8 w-3/4 rounded-[50%] bg-sky-300/20 blur-md" />
          <div key={pop} className={dancing ? '' : 'animate-word-pop'}>
            <Cosmo size={L.portrait ? Math.min(L.h * 0.26, 260) : c ? 150 : 300} dance={dancing} fly={!dancing} />
          </div>
          {dancing &&
            ['🎵', '✨', '🎶', '⭐'].map((e, i) => (
              <span key={i} className="animate-float absolute text-3xl" style={{ left: `${[5, 80, 10, 85][i]}%`, top: `${[10, 15, 60, 55][i]}%`, animationDelay: `${i * 0.3}s` }}>
                {e}
              </span>
            ))}
        </div>
        <div className={`flex flex-col items-center ${c ? 'gap-2' : 'gap-5'}`}>
          {row(
            'COLOR · Màu',
            ROCKET_COLORS.map((col, i) => (
              <button
                key={col.en}
                aria-label={col.en}
                data-testid={`cosmo-color-${col.en}`}
                onClick={() => pick({ color: i }, col.en)}
                className={`rounded-full border-4 shadow-lg active:scale-90 ${style.color === i ? 'scale-110 border-white' : 'border-white/20'}`}
                style={{ width: chip, height: chip, background: `radial-gradient(circle at 35% 35%, ${col.main}, ${col.dark})` }}
              />
            )),
          )}
          {row(
            'EYES · Mắt',
            COSMO_EYES.map((e) => (
              <button key={e.id} data-testid={`cosmo-eyes-${e.id}`} aria-label={e.vi} onClick={() => pick({ eyes: e.id }, e.en)} className={opt(style.eyes === e.id)} style={{ width: chip * 1.15, height: chip * 1.15, fontSize: chip * 0.55 }}>
                {EYE_ICON[e.id]}
              </button>
            )),
          )}
          {row(
            'HAT · Mũ',
            COSMO_HATS.map((h) => (
              <button key={h.id} data-testid={`cosmo-hat-${h.id}`} aria-label={h.vi} onClick={() => pick({ hat: h.id }, h.en)} className={opt(style.hat === h.id)} style={{ width: chip * 1.15, height: chip * 1.15, fontSize: chip * 0.55 }}>
                {HAT_ICON[h.id]}
              </button>
            )),
          )}
          <button
            data-testid="cosmo-dance"
            onClick={dance}
            className={`animate-breathe mt-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 font-black text-white shadow-[0_0_40px_rgba(236,72,153,0.5)] active:scale-95 ${c ? 'px-6 py-2.5 text-xl' : 'px-12 py-5 text-4xl'}`}
          >
            💃 DANCE!
          </button>
        </div>
      </div>
    </Screen>
  )
}
