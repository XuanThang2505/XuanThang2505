/**
 * Hero HQ – home of Captain Star & the Space Guardians: the big entrance, the five missions
 * (story), the shield game, the hero suit and "What would a hero do?".
 */
import { useEffect, useState } from 'react'
import { HERO_LINES, loadHero, MISSIONS, saveHero, type MissionId } from '../data/heroData'
import { type Say } from '../games/ui'
import { playHeroTheme, playPop, playWhoosh } from '../utils/soundEffects'
import { stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { Cosmo, Splash } from '../story/Cosmo'
import { CaptainStar, ComicBurst, StarShield } from './CaptainStar'
import { Graduation, HeroSuit, KindChoices, ShieldThrow } from './HeroGames'
import { LightsMission, MeteorMission, OceanMission, SatelliteMission } from './Missions'
import { HeroBar, HeroScreen } from './shared'

type View = 'hq' | 'map' | 'throw' | 'suit' | 'kind' | MissionId

export function HeroHQ({ stars, onBack, onStar, onSay }: { stars: number; onBack: () => void; onStar: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const [view, setView] = useState<View>('hq')
  const [prog, setProg] = useState(loadHero)
  const [entrance, setEntrance] = useState(0)

  // the big entrance every time the child comes into HQ
  useEffect(() => {
    if (view !== 'hq') return
    playWhoosh()
    const a = setTimeout(() => playHeroTheme(), 700)
    const b = setTimeout(async () => {
      const p = loadHero()
      if (!p.seenIntro) {
        await onSay(HERO_LINES.intro.en, HERO_LINES.intro.vi)
        const np = { ...p, seenIntro: true }
        saveHero(np)
        setProg(np)
      }
      void onSay(HERO_LINES.team.en, HERO_LINES.team.vi)
    }, 1300)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, entrance])

  const complete = (id: MissionId) => {
    const p = loadHero()
    if (!p.done.includes(id)) {
      const np = { ...p, done: [...p.done, id] }
      saveHero(np)
      setProg(np)
      onStar()
      onStar()
    }
  }
  const toMap = () => setView('map')
  const props = { stars, onStar, onSay }
  if (view === 'meteor') return <MeteorMission {...props} onBack={toMap} onComplete={() => complete('meteor')} />
  if (view === 'ocean') return <OceanMission {...props} onBack={toMap} onComplete={() => complete('ocean')} />
  if (view === 'satellite') return <SatelliteMission {...props} onBack={toMap} onComplete={() => complete('satellite')} />
  if (view === 'lights') return <LightsMission {...props} onBack={toMap} onComplete={() => complete('lights')} />
  if (view === 'graduation') return <Graduation {...props} onBack={toMap} onComplete={() => complete('graduation')} />
  if (view === 'throw') return <ShieldThrow {...props} onBack={() => setView('hq')} />
  if (view === 'suit') return <HeroSuit {...props} onBack={() => setView('hq')} />
  if (view === 'kind') return <KindChoices {...props} onBack={() => setView('hq')} />

  // ------------------------------------------------ mission map
  if (view === 'map') {
    const unlocked = (i: number) => (i < 4 ? i === 0 || prog.done.includes(MISSIONS[i - 1].id) || prog.done.includes(MISSIONS[i].id) : MISSIONS.slice(0, 4).every((m) => prog.done.includes(m.id)))
    return (
      <HeroScreen>
        <HeroBar onBack={() => setView('hq')} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Missions 🗺️</div>} />
        <div className={`flex flex-1 flex-col items-center justify-center overflow-y-auto px-3 pb-3 ${c ? 'gap-3' : 'gap-8'}`}>
          <div className={`flex flex-wrap items-center justify-center ${c ? 'gap-2' : 'gap-5'}`}>
            {MISSIONS.map((m, i) => {
              const done = prog.done.includes(m.id)
              const open = unlocked(i)
              const next = open && !done
              return (
                <button
                  key={m.id}
                  data-testid={`mission-${m.id}`}
                  onClick={() => {
                    playPop()
                    if (open) setView(m.id)
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-[2rem] border-4 shadow-xl active:scale-95 ${
                    done ? 'border-amber-300 bg-gradient-to-br from-amber-400 to-orange-600' : open ? 'animate-breathe border-white/60 bg-gradient-to-br from-sky-500 to-blue-800' : 'border-white/10 bg-slate-800/70 opacity-50'
                  } ${c ? 'h-28 w-28 p-1' : 'h-48 w-44 p-3'}`}
                >
                  <span className={`absolute left-3 top-2 rounded-full bg-black/25 px-2 font-black ${c ? 'text-xs' : 'text-base'}`}>{i + 1}</span>
                  {next && <span className={`absolute -top-3 right-2 ${c ? 'text-xl' : 'text-3xl'}`}>👉</span>}
                  <span className={c ? 'text-4xl' : 'text-7xl'}>{open ? m.icon : '🔒'}</span>
                  <b className={`font-black leading-tight ${c ? 'text-[12px]' : 'text-xl'}`}>{m.en}</b>
                  <small className={`font-semibold text-white/85 ${c ? 'text-[10px]' : 'text-sm'}`}>{m.vi}</small>
                  {done && <span className="absolute -bottom-3 rounded-full bg-emerald-500 px-2 text-sm font-black">✓</span>}
                </button>
              )
            })}
          </div>
          <div className={`flex items-end ${c ? 'gap-2' : 'gap-6'}`}>
            <CaptainStar size={c ? 90 : 160} />
            <Cosmo size={c ? 56 : 100} fly={false} />
            <Splash size={c ? 70 : 120} />
          </div>
        </div>
      </HeroScreen>
    )
  }

  // ------------------------------------------------ HQ
  const big = (v: View, icon: React.ReactNode, en: string, vi: string, cls: string, testid: string) => (
    <button
      data-testid={testid}
      onClick={() => {
        playPop()
        setView(v)
      }}
      className={`flex items-center rounded-[2rem] border-2 border-white/30 bg-gradient-to-br ${cls} text-left shadow-xl active:scale-95 ${c ? 'h-[70px] w-[190px] gap-2 px-2' : 'h-32 w-80 gap-4 px-5'}`}
    >
      <span className={`flex shrink-0 items-center justify-center ${c ? 'w-12 text-4xl' : 'w-20 text-6xl'}`}>{icon}</span>
      <span>
        <b className={`block font-black leading-tight ${c ? 'text-[15px]' : 'text-2xl'}`}>{en}</b>
        <small className={`block font-semibold text-white/85 ${c ? 'text-[11px]' : 'text-base'}`}>{vi}</small>
      </span>
    </button>
  )
  return (
    <HeroScreen>
      <HeroBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Hero HQ 🛡️</div>} />
      <div className={`relative flex flex-1 items-center justify-center overflow-hidden px-3 pb-3 ${L.portrait ? 'flex-col gap-3' : c ? 'gap-4' : 'gap-14'}`}>
        {/* light rays behind the hero */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-25" style={{ background: 'repeating-conic-gradient(from 0deg, #38bdf8 0deg 8deg, transparent 8deg 24deg)' }} />
        <button key={entrance} className="relative" onClick={() => setEntrance((e) => e + 1)} aria-label="Captain Star">
          <div className="animate-hero-in">
            <CaptainStar size={L.portrait ? Math.min(L.h * 0.32, 300) : c ? 170 : 330} cheer />
          </div>
          <div className="pointer-events-none absolute -right-10 -top-6">
            <ComicBurst text="SUPER!" size={c ? 90 : 150} />
          </div>
        </button>
        <div className={`relative flex flex-col items-center ${c ? 'gap-2' : 'gap-4'}`}>
          <div className={`text-center font-black italic tracking-wide drop-shadow-[0_0_18px_rgba(56,189,248,0.9)] ${c ? 'text-2xl' : 'text-5xl'}`}>Captain Star</div>
          {big('map', '🗺️', 'Missions', `Nhiệm vụ · ${prog.done.length}/5 🎖️`, 'from-sky-400 to-blue-800', 'hq-missions')}
          {big('throw', <StarShield size={c ? 40 : 64} />, 'Shield throw', 'Ném khiên trúng số', 'from-amber-400 to-rose-600', 'hq-throw')}
          {big('suit', '🦸', 'Hero suit', 'Thiết kế bộ đồ anh hùng', 'from-fuchsia-500 to-indigo-700', 'hq-suit')}
          {big('kind', '💙', 'What would a hero do?', 'Anh hùng sẽ làm gì?', 'from-teal-400 to-cyan-800', 'hq-kind')}
        </div>
      </div>
    </HeroScreen>
  )
}
