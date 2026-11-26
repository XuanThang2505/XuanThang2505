import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
// The 3D engine is the biggest part of the app: load it in the background while the welcome
// screen is already on screen, so opening the app feels instant.
const SolarScene = lazy(() => import('./components/SolarScene').then((m) => ({ default: m.SolarScene })))
import { IPadHUD } from './components/IPadHUD'
import { WelcomeScreen } from './components/WelcomeScreen'
import { loadStars, saveStars } from './games/stars'
const GamesHub = lazy(() => import('./games/GamesHub').then((m) => ({ default: m.GamesHub })))
import type { ActiveEffect } from './components/PlanetMesh'
import { COUNT_STEP, effectDuration, lessonFor, PLANET_MAP, PLANET_ORDER, type ViewId, type VocabWord } from './data/planetsData'
import {
  hasVietnameseVoice,
  preloadVoiceClips,
  setSpeechRate,
  speakBilingual,
  speakSequence,
  stopSpeaking,
  unlockSpeech,
  type SpeechRate,
} from './utils/speech'
import { AmbientStars } from './story/AmbientStars'
import { ExploreBar } from './worlds/ExploreBar'
import { useLayout } from './utils/useLayout'
import type { Explore, ExploreKind } from './worlds/ExploreHost'
import { BEDTIME, OVERVIEW_LINES, type PlanetWorldId, type WorldId } from './data/worldsData'
import { myPlanet } from './worlds/stores'
const ExploreHost = lazy(() => import('./worlds/ExploreHost'))
import { setAudioSleeping, ensureAudio, playArrive, playBoing, playPop, playSparkle, playWhoosh, setAudioRebuiltHandler, startMusic, stopMusic, unlockAudio } from './utils/soundEffects'

export interface Settings {
  rate: SpeechRate
  autoRotate: boolean
  music: boolean
  vietnameseVoice: boolean
  /** Battery saver: lower resolution, no glow effect, 24 fps, no background sparkles */
  saver: boolean
}

const SETTINGS_KEY = 'space-atlas-settings'
const DEFAULT_SETTINGS: Settings = { rate: 'normal', autoRotate: true, music: true, vietnameseVoice: false, saver: false }
/** Nobody touched the screen for this long → the app goes to sleep (nothing is drawn or played). */
const SLEEP_AFTER_MS = 2 * 60_000

function loadSettings(): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [planetId, setPlanetId] = useState<ViewId>('system')
  const [flying, setFlying] = useState(true)
  const [effect, setEffect] = useState<ActiveEffect | null>(null)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [compareOn, setCompareOn] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)
  const [explore, setExplore] = useState<Explore | null>(null)
  const layout = useLayout()
  const [timeScale, setTimeScale] = useState(1)
  const [bedtime, setBedtime] = useState(false)
  const [stars, setStars] = useState(loadStars)
  const addStar = useCallback(() => setStars((n) => n + 1), [])
  useEffect(() => saveStars(stars), [stars])
  const [bounce, setBounce] = useState(0)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [viVoice, setViVoice] = useState(false)
  const wordTimer = useRef<number | null>(null)
  const planet = lessonFor(planetId)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSpeechRate(settings.rate)
  }, [settings])

  // ---- sleep: after 2 minutes without a touch the 3D scene, music and animations all stop
  const [sleeping, setSleeping] = useState(false)
  useEffect(() => {
    if (!started) return
    let timer = 0
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setSleeping(true), SLEEP_AFTER_MS)
    }
    arm()
    window.addEventListener('pointerdown', arm, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', arm)
    }
  }, [started])
  useEffect(() => {
    document.documentElement.classList.toggle('app-sleeping', sleeping)
    setAudioSleeping(sleeping)
  }, [sleeping])

  const wantMusic = started && settings.music && !sleeping
  const wantMusicRef = useRef(wantMusic)
  wantMusicRef.current = wantMusic
  useEffect(() => {
    if (wantMusic && !document.hidden) startMusic()
    else stopMusic()
  }, [wantMusic])

  // Battery + iOS: no music while the app is in the background; wake the sound engine on return;
  // if iOS killed the engine (call, lock screen) it is rebuilt and the music restarts.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopMusic()
      else {
        void ensureAudio().then(() => wantMusicRef.current && startMusic())
      }
    }
    document.addEventListener('visibilitychange', onVis)
    setAudioRebuiltHandler(() => wantMusicRef.current && startMusic())
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      setAudioRebuiltHandler(null)
    }
  }, [])

  const say = useCallback((en: string, vi?: string) => speakBilingual(en, vi, settingsRef.current.vietnameseVoice), [])

  const handleStart = useCallback(() => {
    // Everything here runs inside the tap → iOS unlocks audio + speech.
    void unlockAudio()
    unlockSpeech()
    playWhoosh()
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
    try {
      if (el.requestFullscreen) void el.requestFullscreen().catch(() => {})
      else el.webkitRequestFullscreen?.()
    } catch {
      /* not supported – fine */
    }
    setStarted(true)
    // load the games quietly in the background so PLAY opens at once
    setTimeout(() => void import('./games/GamesHub'), 9000)
    // only the first words a child hears, a few seconds after the intro flight
    setTimeout(() => void preloadVoiceClips(['SOLAR SYSTEM!', ...PLANET_ORDER.map((id) => PLANET_MAP[id].englishName + '!'), 'SUN!']), 4000)
    setTimeout(() => setViVoice(hasVietnameseVoice()), 800)
  }, [])

  const handleArrive = useCallback(
    (id: ViewId) => {
      setFlying(false)
      playArrive()
      setBounce((b) => b + 1)
      const p = lessonFor(id)
      setTimeout(() => say(p.englishName + '!', p.vietnameseName), 150)
    },
    [say],
  )

  // where the child has been, so BACK can fly to the previous planet
  const [trail, setTrail] = useState<ViewId[]>([])
  const fromBack = useRef(false)
  const handleSelectPlanet = useCallback(
    (id: ViewId) => {
      if (id === planetId) {
        playPop()
        setBounce((b) => b + 1)
        say(planet.englishName + '!', planet.vietnameseName)
        return
      }
      stopSpeaking()
      if (!fromBack.current) setTrail((t) => [...t, planetId].slice(-20))
      fromBack.current = false
      playWhoosh()
      setFlying(true)
      setEffect(null)
      setActiveWord(null)
      setCompareOn(false)
      setPlanetId(id)
    },
    [planetId, planet, say],
  )

  const handleBack = useCallback(() => {
    if (flying || !trail.length) return
    const prev = trail[trail.length - 1]
    setTrail((t) => t.slice(0, -1))
    fromBack.current = true
    handleSelectPlanet(prev)
  }, [flying, trail, handleSelectPlanet])

  const handleSpeakName = useCallback(() => {
    setBounce((b) => b + 1)
    say(planet.englishName + '!', planet.vietnameseName)
  }, [planet, say])

  const handleSpeakPhrase = useCallback(() => {
    say(planet.englishPhrase, planet.vietnameseSub)
  }, [planet, say])

  const handlePlanetTap = useCallback(() => {
    if (flying) return
    playBoing()
    handleSpeakName()
  }, [flying, handleSpeakName])

  const handleVocab = useCallback(
    (w: VocabWord) => {
      if (flying) return
      playSparkle()
      setEffect({ name: w.effect, key: Date.now() })
      setActiveWord(w.word)
      if (w.effect === 'countPlanets') {
        // "Mercury, Venus, Earth…" in step with the planets lighting up
        void speakSequence(
          PLANET_ORDER.map((id) => PLANET_MAP[id].englishName + '!'),
          COUNT_STEP,
        )
      } else {
        say(w.word + '!', w.vi)
      }
      if (wordTimer.current) window.clearTimeout(wordTimer.current)
      wordTimer.current = window.setTimeout(() => setActiveWord(null), effectDuration(w.effect) * 1000)
    },
    [flying, say],
  )

  const handleToggleCompare = useCallback(() => {
    if (flying || !('compare' in planet)) return
    playPop()
    if (!compareOn) say(planet.compare.en, planet.compare.vi)
    setCompareOn(!compareOn)
  }, [flying, compareOn, planet, say])

  const openGames = useCallback(() => {
    playPop()
    stopSpeaking()
    setEffect(null)
    setActiveWord(null)
    setCompareOn(false)
    setGamesOpen(true)
  }, [])

  const closeGames = useCallback(
    (to3D: boolean) => {
      playPop()
      stopSpeaking()
      setGamesOpen(false)
      if (to3D) handleSelectPlanet('system')
    },
    [handleSelectPlanet],
  )

  // ---- explore: land on planets, my age, my planet, tonight's sky, passport
  const openExplore = useCallback((e: Explore) => {
    playPop()
    stopSpeaking()
    setEffect(null)
    setActiveWord(null)
    setCompareOn(false)
    setExplore(e)
  }, [])
  const closeExplore = useCallback(() => {
    stopSpeaking()
    setExplore(null)
  }, [])
  const cycleTime = useCallback(() => {
    setTimeScale((t) => {
      const n = t === 1 ? 5 : t === 5 ? 25 : 1
      if (n > 1) say(OVERVIEW_LINES.time.en, OVERVIEW_LINES.time.vi)
      return n
    })
  }, [say])
  const onExtra = useCallback(
    (what: 'comet' | 'myplanet') => {
      playSparkle()
      if (what === 'comet') say(OVERVIEW_LINES.comet.en, OVERVIEW_LINES.comet.vi)
      else say(OVERVIEW_LINES.myPlanet.en, myPlanet.get().name)
    },
    [say],
  )
  const openAR = useCallback(() => {
    if (planetId === 'system' || planetId === 'sun') return
    playSparkle()
    void import('./worlds/ar').then((m) => m.openAR(planetId as PlanetWorldId)).catch(() => {})
  }, [planetId])

  // ---- bedtime planetarium: a calm guided trip, then the app goes to sleep
  const selectRef = useRef(handleSelectPlanet)
  selectRef.current = handleSelectPlanet
  const viewRef = useRef(planetId)
  viewRef.current = planetId
  useEffect(() => {
    if (!bedtime) return
    let stop = false
    stopMusic()
    void (async () => {
      for (const step of BEDTIME) {
        if (stop) return
        if (step.id !== viewRef.current) {
          selectRef.current(step.id)
          await new Promise((r) => setTimeout(r, 3400))
        } else await new Promise((r) => setTimeout(r, 600))
        if (stop) return
        await say(step.line.en, step.line.vi)
        await new Promise((r) => setTimeout(r, 1800))
      }
      if (stop) return
      setBedtime(false)
      setSleeping(true)
    })()
    return () => {
      stop = true
      stopSpeaking()
    }
  }, [bedtime, say])

  const exploreBar = (
    <ExploreBar
      view={planetId}
      flying={flying}
      timeScale={timeScale}
      L={layout}
      onTime={cycleTime}
      onOpen={(k: ExploreKind) => openExplore({ kind: k })}
      onLand={() => planetId !== 'system' && planetId !== 'sun' && openExplore({ kind: 'land', id: planetId as WorldId })}
      onMoon={() => openExplore({ kind: 'land', id: 'moon' })}
      onBedtime={() => {
        setTimeScale(1)
        setBedtime(true)
      }}
      onAR={openAR}
    />
  )

  return (
    <div className="relative h-[100dvh] w-screen touch-none select-none overflow-hidden bg-[#050818] font-nunito">
      <Suspense fallback={null}>
      <SolarScene
        viewId={planetId}
        started={started}
        effect={effect}
        compareOn={compareOn}
        autoRotate={settings.autoRotate}
        onArrive={handleArrive}
        onPlanetTap={handlePlanetTap}
        onSelectPlanet={handleSelectPlanet}
        paused={gamesOpen || sleeping || !!explore}
        timeScale={timeScale}
        onExtra={onExtra}
        saver={settings.saver}
      />
      </Suspense>

      <AmbientStars on={started && !gamesOpen && !sleeping && !settings.saver} />

      {started && gamesOpen && (
        <Suspense fallback={<div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0d2c] text-6xl"><span className="animate-float">🚀</span></div>}>
          <GamesHub stars={stars} onStar={addStar} onClose={closeGames} onSay={say} />
        </Suspense>
      )}

      {started && explore && (
        <Suspense fallback={<div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0d2c] text-6xl"><span className="animate-float">🚀</span></div>}>
          <ExploreHost explore={explore} stars={stars} onClose={closeExplore} onStar={addStar} onSay={say} />
        </Suspense>
      )}

      {started && bedtime && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[#020617]/40 font-nunito">
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-slate-900/80 px-4 py-1 text-lg font-black text-sky-100">🌙 Bedtime · Giờ đi ngủ</div>
          <button
            data-testid="bedtime-stop"
            onClick={() => setBedtime(false)}
            className="pointer-events-auto absolute right-4 top-4 rounded-full bg-slate-800/90 px-4 py-2 text-lg font-black text-white"
            style={{ minHeight: 44 }}
          >
            ✕ STOP
          </button>
        </div>
      )}

      {started && !gamesOpen && !explore && !bedtime && (
        <IPadHUD
          planet={planet}
          currentId={planetId}
          flying={flying}
          nameBounceKey={bounce}
          activeWord={activeWord}
          compareOn={compareOn}
          settings={settings}
          hasViVoice={viVoice}
          onSpeakName={handleSpeakName}
          onSpeakPhrase={handleSpeakPhrase}
          onVocab={handleVocab}
          onToggleCompare={handleToggleCompare}
          onSelectPlanet={handleSelectPlanet}
          onBack={trail.length ? handleBack : undefined}
          onOpenGames={openGames}
          explore={exploreBar}
          stars={stars}
          onFact={say}
          onSettingsChange={setSettings}
        />
      )}

      <WelcomeScreen onStart={handleStart} leaving={started} />

      {sleeping && (
        <button
          data-testid="sleep-overlay"
          aria-label="Wake up"
          onClick={() => {
            setSleeping(false)
            void ensureAudio()
          }}
          className="absolute inset-0 z-[70] flex flex-col items-center justify-center gap-3 bg-[#03040f] font-nunito text-white"
        >
          <span className="text-7xl">😴</span>
          <span className="text-3xl font-black">Cosmo is sleeping…</span>
          <span className="text-lg font-bold text-sky-200">Chạm để đánh thức · Tap to wake up</span>
        </button>
      )}
    </div>
  )
}
