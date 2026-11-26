/**
 * Row of explore buttons under the word card.
 *  Solar System: time machine (+ year counter), my age, my planet, bedtime, tonight's sky, passport
 *  A planet:     LAND!, see it in my room (AR, iPhone/iPad only), passport
 */
import { useEffect, useState } from 'react'
import type { ViewId } from '../data/planetsData'
import type { Layout } from '../utils/useLayout'
import { playPop } from '../utils/soundEffects'
import { arSupported } from './arSupport'
import { sim } from './stores'
import type { ExploreKind } from './ExploreHost'

const TIME_LABEL: Record<number, string> = { 1: '×1', 5: '×5', 25: '×25' }

export function ExploreBar({
  view,
  flying,
  timeScale,
  L,
  onTime,
  onOpen,
  onLand,
  onBedtime,
  onAR,
}: {
  view: ViewId
  flying: boolean
  timeScale: number
  L: Layout
  onTime: () => void
  onOpen: (k: ExploreKind) => void
  onLand: () => void
  onBedtime: () => void
  onAR: () => void
}) {
  const c = L.compact
  const [years, setYears] = useState(0)
  const system = view === 'system'
  useEffect(() => {
    if (!system) return
    const t = window.setInterval(() => setYears(Math.floor(sim.earthYears)), 500)
    return () => window.clearInterval(t)
  }, [system])
  if (flying) return null
  const btn = (testid: string, icon: string, label: string, on: () => void, hot = false) => (
    <button
      key={testid}
      data-testid={testid}
      onClick={() => {
        playPop()
        on()
      }}
      style={{ minHeight: 44, minWidth: 44 }}
      className={`pointer-events-auto flex shrink-0 flex-col items-center justify-center rounded-2xl border shadow-lg active:scale-90 ${
        hot ? 'border-amber-300 bg-gradient-to-b from-amber-400 to-orange-600 text-white' : 'border-white/10 bg-slate-900/90 text-white'
      } ${c ? 'px-1.5 py-0.5' : 'px-2.5 py-1'}`}
    >
      <span className={c ? 'text-lg leading-none' : 'text-2xl leading-none'}>{icon}</span>
      <span className={`font-extrabold leading-tight ${c ? 'text-[9px]' : 'text-[11px]'}`}>{label}</span>
    </button>
  )
  const items = system
    ? [
        btn('ex-time', '⏩', `TIME ${TIME_LABEL[timeScale]}`, onTime, timeScale > 1),
        ...(timeScale > 1
          ? [
              <span key="years" data-testid="year-counter" className={`pointer-events-none shrink-0 rounded-full bg-sky-600/90 font-black ${c ? 'px-2 text-[11px]' : 'px-3 py-1 text-sm'}`}>
                🌍 {years} {years === 1 ? 'year' : 'years'}
              </span>,
            ]
          : []),
        btn('ex-age', '🎂', 'MY AGE', () => onOpen('age')),
        btn('ex-builder', '🛠️', 'MY PLANET', () => onOpen('builder')),
        btn('ex-sky', '🔭', 'TONIGHT', () => onOpen('sky')),
        btn('ex-bedtime', '🌙', 'BEDTIME', onBedtime),
        btn('ex-passport', '🛂', 'PASSPORT', () => onOpen('passport')),
      ]
    : [
        ...(view !== 'sun' ? [btn('ex-land', '🚀', 'LAND!', onLand, true)] : []),
        ...(view !== 'sun' && arSupported() ? [btn('ex-ar', '🥽', 'MY ROOM', onAR)] : []),
        btn('ex-passport', '🛂', 'PASSPORT', () => onOpen('passport')),
      ]
  return (
    <div className={`no-scrollbar mt-2 flex items-center overflow-x-auto ${c ? 'gap-1' : 'gap-2'}`} data-testid="explore-bar">
      {items}
    </div>
  )
}
