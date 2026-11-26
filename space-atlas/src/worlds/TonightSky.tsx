/**
 * Tonight's sky over Vietnam: real planet positions (astronomy-engine, offline) for this evening
 * or early morning. Shows which planets are up, the direction (N/E/S/W) and how high to look.
 */
import { useEffect, useMemo, useState } from 'react'
import * as A from 'astronomy-engine'
import { PLANET_MAP, type PlanetId } from '../data/planetsData'
import { SKY_LINES } from '../data/worldsData'
import { PlanetBall2D } from '../games/PlanetBall2D'
import { Screen, TopBar, type Say } from '../games/ui'
import { playPop } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'

const CITIES = [
  { id: 'hn', name: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { id: 'dn', name: 'Đà Nẵng', lat: 16.05, lon: 108.2 },
  { id: 'hcm', name: 'TP.HCM', lat: 10.78, lon: 106.7 },
]
const BODIES: { id: PlanetId | 'moon'; body: A.Body }[] = [
  { id: 'mercury', body: A.Body.Mercury },
  { id: 'venus', body: A.Body.Venus },
  { id: 'mars', body: A.Body.Mars },
  { id: 'jupiter', body: A.Body.Jupiter },
  { id: 'saturn', body: A.Body.Saturn },
  { id: 'moon', body: A.Body.Moon },
]
const DIRS = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc']
const DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

/** tonight 20:00 or tomorrow 05:00, Vietnam time (UTC+7) */
function when(kind: 'evening' | 'morning') {
  const now = new Date()
  const vn = new Date(now.getTime() + 7 * 3600e3)
  const y = vn.getUTCFullYear()
  const m = vn.getUTCMonth()
  const d = vn.getUTCDate()
  return kind === 'evening' ? new Date(Date.UTC(y, m, d, 20 - 7)) : new Date(Date.UTC(y, m, d + 1, 5 - 7))
}

export function TonightSky({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const [city, setCity] = useState(0)
  const [kind, setKind] = useState<'evening' | 'morning'>('evening')
  useEffect(() => {
    const t = setTimeout(() => void onSay(SKY_LINES.title.en, SKY_LINES.title.vi), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])

  const sky = useMemo(() => {
    const date = when(kind)
    const ct = CITIES[city]
    const obs = new A.Observer(ct.lat, ct.lon, 10)
    const hor = (b: A.Body) => {
      const eq = A.Equator(b, date, obs, true, true)
      return A.Horizon(date, obs, eq.ra, eq.dec, 'normal')
    }
    const sunAlt = hor(A.Body.Sun).altitude
    const items = BODIES.map((b) => {
      const h = hor(b.body)
      const mag = A.Illumination(b.body, date).mag
      return { ...b, alt: h.altitude, az: h.azimuth, mag }
    })
    const moonPhase = A.MoonPhase(date)
    return { date, sunAlt, items, moonPhase }
  }, [city, kind])

  const up = sky.items.filter((i) => i.alt > 5)
  const dir = (az: number) => Math.round(az / 45) % 8
  const moonEmoji = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][Math.round(sky.moonPhase / 45) % 8]
  const W = Math.min(L.w - 24, 1000)
  const H = c ? 170 : 300

  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Tonight's sky 🔭</div>} />
      <div className={`flex flex-1 flex-col items-center overflow-y-auto px-3 pb-3 ${c ? 'gap-2' : 'gap-4'}`}>
        <div className="flex flex-wrap justify-center gap-2">
          {CITIES.map((ct, i) => (
            <button key={ct.id} onClick={() => (playPop(), setCity(i))} className={`rounded-full px-3 font-black ${city === i ? 'bg-amber-400 text-slate-900' : 'bg-white/15'} ${c ? 'text-xs' : 'text-base'}`} style={{ minHeight: 40 }}>
              📍 {ct.name}
            </button>
          ))}
          <button onClick={() => (playPop(), setKind('evening'))} className={`rounded-full px-3 font-black ${kind === 'evening' ? 'bg-sky-400 text-slate-900' : 'bg-white/15'} ${c ? 'text-xs' : 'text-base'}`} style={{ minHeight: 40 }}>
            🌙 8 giờ tối
          </button>
          <button onClick={() => (playPop(), setKind('morning'))} className={`rounded-full px-3 font-black ${kind === 'morning' ? 'bg-sky-400 text-slate-900' : 'bg-white/15'} ${c ? 'text-xs' : 'text-base'}`} style={{ minHeight: 40 }}>
            🌅 5 giờ sáng
          </button>
        </div>
        {/* the sky as a panorama: N → E → S → W → N, higher = higher in the sky */}
        <div data-testid="sky-panorama" className="relative overflow-hidden rounded-3xl border-2 border-white/15 bg-gradient-to-b from-[#020617] via-[#0b1446] to-[#1e3a8a]" style={{ width: W, height: H }}>
          {Array.from({ length: 40 }, (_, i) => (
            <span key={i} className="absolute h-0.5 w-0.5 rounded-full bg-white/70" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 85}%` }} />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-emerald-950 to-emerald-900/0" />
          {DIRS.map((d, i) =>
            i % 2 === 0 ? (
              <span key={d} className={`absolute bottom-1 font-black text-amber-200 ${i === 0 ? '' : '-translate-x-1/2'} ${c ? 'text-[10px]' : 'text-sm'}`} style={{ left: i === 0 ? 6 : `${(i * 45 * 100) / 360}%` }}>
                {DIRS_EN[i]} · {d}
              </span>
            ) : null,
          )}
          {up.map((p) => (
            <button
              key={p.id}
              data-testid={`sky-${p.id}`}
              onClick={() => (playPop(), void speak(p.id === 'moon' ? 'MOON!' : PLANET_MAP[p.id as PlanetId].englishName + '!'))}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${(p.az / 360) * 100}%`, top: `${(1 - Math.min(p.alt, 85) / 90) * (H - 30)}px` }}
            >
              {p.id === 'moon' ? <span className={c ? 'text-3xl' : 'text-5xl'}>{moonEmoji}</span> : <span className="animate-twinkle inline-block"><PlanetBall2D id={p.id as PlanetId} size={c ? 22 : 36} /></span>}
              <span className={`block whitespace-nowrap font-black ${c ? 'text-[9px]' : 'text-xs'}`}>{p.id === 'moon' ? 'MOON' : PLANET_MAP[p.id as PlanetId].englishName}</span>
            </button>
          ))}
        </div>
        <div className={`w-full max-w-3xl rounded-3xl bg-slate-900/80 ${c ? 'p-2 text-xs' : 'p-4 text-lg'}`}>
          {sky.sunAlt > -6 ? (
            <div className="font-bold text-amber-200">☀️ Lúc này trời còn sáng – hãy chọn giờ khác nhé.</div>
          ) : up.length === 0 ? (
            <div className="font-bold">Lúc này không có hành tinh sáng nào trên trời. Thử 5 giờ sáng nhé!</div>
          ) : (
            <ul className="space-y-1">
              {up.map((p) => (
                <li key={p.id} className="font-bold">
                  {p.id === 'moon' ? moonEmoji + ' Mặt Trăng' : '🪐 ' + PLANET_MAP[p.id as PlanetId].vietnameseName}: nhìn về hướng <b className="text-amber-300">{DIRS[dir(p.az)]}</b>,{' '}
                  {p.alt < 25 ? 'thấp gần chân trời' : p.alt < 55 ? 'cao vừa' : 'cao trên đầu'}
                  {p.id !== 'moon' && p.mag > 2 ? ' (hơi mờ, cần trời thật tối)' : p.id !== 'moon' && p.mag < -1 ? ' – rất sáng, dễ thấy!' : ''}
                </li>
              ))}
            </ul>
          )}
          <div className={`mt-2 font-semibold text-sky-300 ${c ? 'text-[10px]' : 'text-sm'}`}>
            Vị trí tính theo thiên văn thật cho {CITIES[city].name}, {kind === 'evening' ? '20:00 tối nay' : '05:00 sáng mai'}. Hành tinh trông như ngôi sao sáng, không nhấp nháy.
          </div>
        </div>
      </div>
    </Screen>
  )
}
