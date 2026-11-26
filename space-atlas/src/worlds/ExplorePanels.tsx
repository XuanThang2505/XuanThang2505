/** Overview "explore" screens: my age on other planets, space passport, build my planet. */
import { useEffect, useState } from 'react'
import { MY_PLANET_SURFACES, OVERVIEW_LINES, WORLD_LINES, YEAR_DAYS, type PlanetWorldId as WorldId } from '../data/worldsData'
import { PLANET_MAP, PLANET_ORDER } from '../data/planetsData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { Screen, TopBar, type Say } from '../games/ui'
import { playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { myPlanet, passport, type MyPlanet } from './stores'

const WORLD_IDS = PLANET_ORDER as WorldId[]

// ================================================================ my age on other planets
export function AgePanel({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const c = useLayout().compact
  const [age, setAge] = useState(5)
  useEffect(() => {
    const t = setTimeout(() => void onSay(OVERVIEW_LINES.age.en, OVERVIEW_LINES.age.vi), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])
  const on = (id: WorldId) => (age * 365.25) / YEAR_DAYS[id]
  const fmt = (n: number) => (n >= 10 ? Math.round(n).toString() : n >= 1 ? n.toFixed(1).replace('.0', '') : n.toFixed(2))
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>My age in space 🎂</div>} />
      <div className={`flex flex-1 flex-col items-center overflow-y-auto px-3 pb-3 ${c ? 'gap-2' : 'gap-5'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-black ${c ? 'text-sm' : 'text-xl'}`}>Con mấy tuổi?</span>
          {[3, 4, 5, 6, 7, 8].map((a) => (
            <button
              key={a}
              data-testid={`age-${a}`}
              onClick={() => {
                playPop()
                setAge(a)
              }}
              className={`rounded-full font-black shadow active:scale-90 ${age === a ? 'bg-amber-400 text-slate-900' : 'bg-white/15'} ${c ? 'h-11 w-11 text-lg' : 'h-14 w-14 text-2xl'}`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className={`grid w-full max-w-4xl ${c ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'}`}>
          {WORLD_IDS.map((id) => (
            <button
              key={id}
              data-testid={`age-on-${id}`}
              onClick={() => {
                playPop()
                void speak(PLANET_MAP[id].englishName + '!')
              }}
              className={`flex items-center rounded-3xl bg-slate-900/80 text-left shadow-xl active:scale-95 ${c ? 'gap-2 p-2' : 'gap-3 p-3'} ${id === 'earth' ? 'ring-4 ring-sky-400' : ''}`}
            >
              <PlanetBall2D id={id} size={c ? 44 : 70} />
              <span>
                <b className={`block font-black ${c ? 'text-sm' : 'text-xl'}`}>{PLANET_MAP[id].englishName}</b>
                <span className={`block font-black text-amber-300 ${c ? 'text-xl' : 'text-4xl'}`}>{fmt(on(id))}</span>
                <small className={`font-semibold text-sky-200 ${c ? 'text-[10px]' : 'text-sm'}`}>tuổi {on(id) < 1 ? '(chưa tròn 1!)' : ''}</small>
              </span>
            </button>
          ))}
        </div>
        <div className={`max-w-2xl text-center font-semibold text-sky-100 ${c ? 'text-xs' : 'text-lg'}`}>
          Một "tuổi" là một vòng quanh Mặt Trời. Sao Thủy chạy rất nhanh nên con nhiều tuổi hơn, Sao Hải Vương chạy rất chậm nên con còn chưa được 1 tuổi!
        </div>
      </div>
    </Screen>
  )
}

// ================================================================ passport
export function Passport({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const c = useLayout().compact
  const { stamps } = passport.use()
  useEffect(() => {
    const t = setTimeout(() => void onSay(WORLD_LINES.passport.en, WORLD_LINES.passport.vi), 400)
    return () => clearTimeout(t)
  }, [onSay])
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Space passport 🛂</div>} />
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3">
        <div className={`rounded-[2rem] border-4 border-amber-200/70 bg-gradient-to-br from-indigo-900 to-blue-950 shadow-2xl ${c ? 'p-3' : 'p-8'}`}>
          <div className={`mb-3 text-center font-black tracking-widest text-amber-200 ${c ? 'text-sm' : 'text-2xl'}`}>🌌 SPACE PASSPORT · {stamps.length}/9</div>
          <div className={`grid ${c ? 'grid-cols-4 gap-2' : 'grid-cols-4 gap-5'}`}>
            {WORLD_IDS.map((id, i) => {
              const has = stamps.includes(id)
              return (
                <div key={id} className={`flex flex-col items-center justify-center rounded-2xl border-4 ${has ? 'border-rose-400 bg-white/10' : 'border-dashed border-white/20'} ${c ? 'h-20 w-20' : 'h-36 w-36'}`} style={{ transform: has ? `rotate(${(i % 3) * 6 - 6}deg)` : undefined }}>
                  <div className={has ? '' : 'opacity-25 grayscale'}>
                    <PlanetBall2D id={id} size={c ? 34 : 64} />
                  </div>
                  <span className={`mt-1 font-black ${has ? 'text-rose-300' : 'text-white/40'} ${c ? 'text-[9px]' : 'text-sm'}`}>{has ? `✓ ${PLANET_MAP[id].englishName}` : PLANET_MAP[id].englishName}</span>
                </div>
              )
            })}
            {(() => {
              const has = stamps.includes('moon')
              return (
                <div className={`flex flex-col items-center justify-center rounded-2xl border-4 ${has ? 'border-rose-400 bg-white/10' : 'border-dashed border-white/20'} ${c ? 'h-20 w-20' : 'h-36 w-36'}`}>
                  <div className={`rounded-full bg-[radial-gradient(circle_at_35%_35%,#f5f5f4,#a8a29e_55%,#57534e)] ${has ? '' : 'opacity-25'}`} style={{ width: c ? 30 : 56, height: c ? 30 : 56 }} />
                  <span className={`mt-1 font-black ${has ? 'text-rose-300' : 'text-white/40'} ${c ? 'text-[9px]' : 'text-sm'}`}>{has ? '✓ MOON' : 'MOON'}</span>
                </div>
              )
            })()}
          </div>
          <div className={`mt-3 text-center font-semibold text-sky-200 ${c ? 'text-xs' : 'text-base'}`}>Bay tới hành tinh và bấm 🚀 LAND để được đóng dấu!</div>
        </div>
      </div>
    </Screen>
  )
}

// ================================================================ build my planet
export function MyPlanetBall({ p, size }: { p: MyPlanet; size: number }) {
  const s = MY_PLANET_SURFACES.find((x) => x.id === p.surface) ?? MY_PLANET_SURFACES[0]
  const [a, b, d] = s.colors
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {p.rings && <div className="absolute left-1/2 top-1/2 rounded-[50%] border-[6px] border-amber-200/80" style={{ width: size * 2, height: size * 0.55, transform: 'translate(-50%,-50%) rotate(-14deg)', clipPath: 'inset(0 0 50% 0)' }} />}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 70% 65%, ${d} 0 12%, transparent 13%), radial-gradient(circle at 30% 70%, ${b} 0 18%, transparent 19%), radial-gradient(circle at 60% 25%, ${b} 0 10%, transparent 11%), radial-gradient(circle at 50% 50%, ${a} 55%, ${b} 100%)`,
          boxShadow: `inset -${size * 0.12}px -${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.45), 0 0 ${size * 0.2}px ${a}88`,
        }}
      />
      {p.rings && <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%] border-[6px] border-amber-200/90" style={{ width: size * 2, height: size * 0.55, transform: 'translate(-50%,-50%) rotate(-14deg)', clipPath: 'inset(50% 0 0 0)' }} />}
      {Array.from({ length: p.moons }, (_, i) => (
        <div key={i} className="animate-float absolute rounded-full bg-slate-300 shadow" style={{ width: size * 0.16, height: size * 0.16, left: `${[105, -18, 85][i]}%`, top: `${[5, 30, 88][i]}%`, animationDelay: `${i * 0.5}s` }} />
      ))}
    </div>
  )
}

export function PlanetBuilder({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const p = myPlanet.use()
  const [launched, setLaunched] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => void onSay(OVERVIEW_LINES.buildPlanet.en, OVERVIEW_LINES.buildPlanet.vi), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])
  const set = (v: Partial<MyPlanet>, word?: string) => {
    playPop()
    myPlanet.set(v)
    if (word) void speak(word + '!')
  }
  const opt = (on: boolean) => `flex items-center justify-center rounded-2xl border-4 font-black active:scale-90 ${on ? 'border-white bg-white/15' : 'border-white/20 bg-white/5'}`
  const chip = c ? 46 : 70
  const size = [0, c ? 90 : 150, c ? 120 : 200, c ? 150 : 250][p.size]
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>My planet 🛠️</div>} />
      <div className={`flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3 ${L.portrait ? 'flex-col gap-4' : c ? 'gap-6' : 'gap-16'}`}>
        <div className="flex flex-col items-center gap-3" style={{ minWidth: c ? 160 : 300 }}>
          <div className={launched ? 'animate-word-pop' : 'animate-float'}>
            <MyPlanetBall p={p} size={size} />
          </div>
          <input
            value={p.name}
            maxLength={14}
            onChange={(e) => myPlanet.set({ name: e.target.value })}
            className={`w-48 rounded-xl bg-white/90 px-3 py-1 text-center font-black text-slate-900 ${c ? 'text-base' : 'text-2xl'}`}
            aria-label="Planet name"
          />
        </div>
        <div className={`flex flex-col items-center ${c ? 'gap-2' : 'gap-5'}`}>
          <div className="flex flex-wrap justify-center gap-2">
            {MY_PLANET_SURFACES.map((s) => (
              <button key={s.id} data-testid={`surface-${s.id}`} onClick={() => set({ surface: s.id }, s.en)} className={opt(p.surface === s.id)} style={{ width: chip * 1.2, height: chip * 1.2, fontSize: chip * 0.55 }}>
                {s.icon}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {([1, 2, 3] as const).map((n) => (
              <button key={n} data-testid={`size-${n}`} onClick={() => set({ size: n }, n === 1 ? 'SMALL' : n === 3 ? 'BIG' : undefined)} className={opt(p.size === n)} style={{ width: chip, height: chip }}>
                <span className="rounded-full bg-sky-300" style={{ width: chip * (0.25 + n * 0.17), height: chip * (0.25 + n * 0.17) }} />
              </button>
            ))}
            <button data-testid="rings" onClick={() => set({ rings: !p.rings }, 'RING')} className={opt(p.rings)} style={{ width: chip * 1.3, height: chip, fontSize: chip * 0.45 }}>
              💍
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-black ${c ? 'text-xs' : 'text-lg'}`}>🌙 Moons</span>
            {([0, 1, 2, 3] as const).map((n) => (
              <button key={n} data-testid={`moons-${n}`} onClick={() => set({ moons: n }, n ? ['One!', 'Two!', 'Three!'][n - 1].replace('!', '') : undefined)} className={opt(p.moons === n)} style={{ width: chip * 0.9, height: chip * 0.9, fontSize: chip * 0.4 }}>
                {n}
              </button>
            ))}
          </div>
          <button
            data-testid="launch-planet"
            onClick={() => {
              playSparkle()
              const first = !p.made
              myPlanet.set({ made: true })
              setLaunched(true)
              if (first) onStar()
              void onSay(OVERVIEW_LINES.myPlanet.en, OVERVIEW_LINES.myPlanet.vi)
            }}
            className={`animate-breathe rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-rose-500 font-black shadow-xl active:scale-95 ${c ? 'px-6 py-2.5 text-lg' : 'px-10 py-4 text-3xl'}`}
          >
            🪐 PUT IT IN SPACE!
          </button>
          {launched && <div className={`text-center font-bold text-emerald-300 ${c ? 'text-xs' : 'text-lg'}`}>Hành tinh của con đã bay vào Hệ Mặt Trời! Quay về SPACE để xem nhé 🌌</div>}
        </div>
      </div>
    </Screen>
  )
}
