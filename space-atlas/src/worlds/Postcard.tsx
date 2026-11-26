/** "A postcard from space": draws a picture card on a canvas that can be saved or shared. */
import { useEffect, useState } from 'react'
import { WORLD_LINES, WORLDS, worldInfo, type WorldId } from '../data/worldsData'
import { loadHero } from '../data/heroData'
import { meStore } from '../me/meStore'
import type { Say } from '../games/ui'
import { playPop, playSparkle } from '../utils/soundEffects'
import { useLayout } from '../utils/useLayout'

function loadImg(src: string) {
  return new Promise<HTMLImageElement | null>((res) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => res(null)
    i.src = src
  })
}

async function draw(id: WorldId) {
  const w = WORLDS[id]
  const p = worldInfo(id)
  const W = 1200
  const H = 800
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, w.sky[0])
  sky.addColorStop(1, w.sky[1])
  g.fillStyle = sky
  g.fillRect(0, 0, W, H)
  // sun
  const sr = 90 * Math.max(0.3, Math.sqrt(w.sunScale))
  const sun = g.createRadialGradient(980, 150, 0, 980, 150, sr)
  sun.addColorStop(0, '#fffbe6')
  sun.addColorStop(0.5, '#fde047')
  sun.addColorStop(1, 'rgba(245,158,11,0)')
  g.fillStyle = sun
  g.beginPath()
  g.arc(980, 150, sr * 1.6, 0, Math.PI * 2)
  g.fill()
  // ground
  if (w.ground) {
    const gr = g.createLinearGradient(0, H * 0.66, 0, H)
    gr.addColorStop(0, w.ground[0])
    gr.addColorStop(1, w.ground[1])
    g.fillStyle = gr
    g.beginPath()
    g.moveTo(0, H * 0.72)
    g.bezierCurveTo(300, H * 0.6, 700, H * 0.8, W, H * 0.68)
    g.lineTo(W, H)
    g.lineTo(0, H)
    g.fill()
  }
  // the planet seen from space, in the corner
  const tex = await loadImg(p.textureUrl.replace('./textures/', './textures/md/'))
  if (tex) {
    g.save()
    g.beginPath()
    g.arc(170, 170, 120, 0, Math.PI * 2)
    g.clip()
    g.drawImage(tex, 0, 0, tex.width / 2, tex.height, 50, 50, 240, 240)
    const sh = g.createRadialGradient(130, 130, 20, 170, 170, 125)
    sh.addColorStop(0, 'rgba(255,255,255,0.15)')
    sh.addColorStop(1, 'rgba(0,0,0,0.55)')
    g.fillStyle = sh
    g.fillRect(40, 40, 260, 260)
    g.restore()
  }
  // the crew + features
  g.font = '150px system-ui, "Apple Color Emoji"'
  g.textAlign = 'center'
  g.fillText('🚀', 860, 560)
  // the child, as an astronaut (their photo stays on the device; it is drawn only into this picture)
  const me = meStore.get()
  const suitCol = me.suit === 'launch' ? '#f97316' : me.suit === 'hero' ? '#2563eb' : '#f8fafc'
  g.fillStyle = suitCol
  g.beginPath()
  g.roundRect(455, 560, 130, 150, 40)
  g.fill()
  g.fillStyle = '#f8fafc'
  g.beginPath()
  g.arc(520, 500, 82, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#cbd5e1'
  g.lineWidth = 6
  g.stroke()
  g.fillStyle = '#0b1220'
  g.beginPath()
  g.arc(520, 505, 62, 0, Math.PI * 2)
  g.fill()
  const face = me.photo ? await loadImg(me.photo) : null
  if (face) {
    g.save()
    g.beginPath()
    g.arc(520, 505, 60, 0, Math.PI * 2)
    g.clip()
    g.drawImage(face, 460, 445, 120, 120)
    g.restore()
  } else {
    g.font = '96px system-ui, "Apple Color Emoji"'
    g.fillText('🧒', 520, 540)
  }
  g.strokeStyle = 'rgba(255,255,255,0.6)'
  g.lineWidth = 7
  g.beginPath()
  g.arc(520, 505, 48, Math.PI * 1.1, Math.PI * 1.45)
  g.stroke()
  g.font = '150px system-ui, "Apple Color Emoji"'
  g.fillText('🤖', 300, 640)
  g.font = '110px system-ui, "Apple Color Emoji"'
  w.features.slice(0, 2).forEach((f, i) => g.fillText(f.emoji, 140 + i * 900, 720 - i * 40))
  // stamp + text
  const place = id === 'moon' ? 'the Moon' : p.englishName[0] + p.englishName.slice(1).toLowerCase()
  const name = meStore.get().name || loadHero().name
  const line1 = `Greetings from ${place}!`
  const line2 = `Chào từ ${p.vietnameseName}! ${name ? '– ' + name : ''} 💙`
  g.font = '900 60px Nunito, system-ui'
  const w1 = g.measureText(line1).width
  g.font = '700 34px Nunito, system-ui'
  const w2 = g.measureText(line2).width
  const bw = Math.min(W - 80, Math.max(w1, w2) + 80)
  g.fillStyle = 'rgba(255,255,255,0.92)'
  g.beginPath()
  g.roundRect(W / 2 - bw / 2, 240, bw, 160, 30)
  g.fill()
  g.fillStyle = '#0f172a'
  g.font = '900 60px Nunito, system-ui'
  g.fillText(line1, 600, 315)
  g.fillStyle = '#0369a1'
  g.font = '700 34px Nunito, system-ui'
  g.fillText(line2, 600, 372)
  g.strokeStyle = '#f43f5e'
  g.lineWidth = 10
  g.strokeRect(14, 14, W - 28, H - 28)
  return cv
}

export function Postcard({ id, onClose, onSay }: { id: WorldId; onClose: () => void; onSay: Say }) {
  const c = useLayout().compact
  const [url, setUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  useEffect(() => {
    let alive = true
    void draw(id).then((cv) =>
      cv.toBlob((b) => {
        if (!alive || !b) return
        setBlob(b)
        setUrl(URL.createObjectURL(b))
        playSparkle()
        void onSay(WORLD_LINES.postcard.en, WORLD_LINES.postcard.vi)
      }, 'image/png'),
    )
    return () => {
      alive = false
    }
  }, [id, onSay])
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url])

  const save = async () => {
    if (!blob) return
    playPop()
    const file = new File([blob], `postcard-${id}.png`, { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Postcard from space' })
        return
      } catch {
        /* cancelled – fall back to download */
      }
    }
    const a = document.createElement('a')
    a.href = url!
    a.download = file.name
    a.click()
  }

  return (
    <div data-testid="postcard" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/70 p-3">
      {url ? <img src={url} alt="Postcard" className="animate-word-pop max-h-[70vh] max-w-full rounded-2xl shadow-2xl" /> : <div className="animate-float text-6xl">📮</div>}
      <div className="flex gap-3">
        <button data-testid="postcard-save" onClick={() => void save()} disabled={!blob} className={`rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
          💾 SAVE · Lưu ảnh
        </button>
        <button onClick={onClose} className={`rounded-full border border-white/20 bg-slate-800/90 font-black shadow-xl active:scale-95 ${c ? 'px-5 py-2.5 text-lg' : 'px-8 py-4 text-2xl'}`}>
          CLOSE
        </button>
      </div>
    </div>
  )
}
