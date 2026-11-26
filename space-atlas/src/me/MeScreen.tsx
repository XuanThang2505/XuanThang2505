/**
 * "Me in space": a parent adds the child's photo (hold 2 s → choose / take a photo → drag & zoom
 * into the circle), the child picks a space suit, patches and visor. The photo stays on the iPad.
 */
import { useEffect, useRef, useState } from 'react'
import { Screen, TopBar, type Say } from '../games/ui'
import { playPop, playSparkle } from '../utils/soundEffects'
import { speak, stopSpeaking } from '../utils/speech'
import { useLayout } from '../utils/useLayout'
import { MeAstronaut } from './MeAstronaut'
import { meStore, type SuitId } from './meStore'
import { ME_LINES } from '../data/meData'

const SUITS: { id: SuitId; en: string; vi: string; icon: string }[] = [
  { id: 'eva', en: 'SPACE SUIT', vi: 'Đồ đi bộ ngoài không gian', icon: '🧑‍🚀' },
  { id: 'launch', en: 'LAUNCH SUIT', vi: 'Đồ phóng tàu (màu cam)', icon: '🟠' },
  { id: 'hero', en: 'HERO SUIT', vi: 'Đồ siêu anh hùng', icon: '🦸' },
]
const PATCHES = ['🚀', '🪐', '🐬', '⭐', '🌙', '🤖']

/** Hold-to-open button: little fingers tap, grown-ups hold for 2 seconds. */
function HoldButton({ onDone, children, testid }: { onDone: () => void; children: React.ReactNode; testid: string }) {
  const [p, setP] = useState(0)
  const timer = useRef(0)
  const start = () => {
    const t0 = performance.now()
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 2000)
      setP(k)
      if (k >= 1) {
        setP(0)
        onDone()
      } else timer.current = requestAnimationFrame(tick)
    }
    timer.current = requestAnimationFrame(tick)
  }
  const stop = () => {
    cancelAnimationFrame(timer.current)
    setP(0)
  }
  return (
    <button
      data-testid={testid}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="relative overflow-hidden rounded-2xl bg-slate-800/90 px-4 font-black shadow-lg"
      style={{ minHeight: 48 }}
    >
      <span className="absolute inset-y-0 left-0 bg-emerald-500/60" style={{ width: `${p * 100}%` }} />
      <span className="relative">{children}</span>
    </button>
  )
}

/** Parent crops the photo into the helmet circle; saves a 384 px JPEG on the device. */
function PhotoCrop({ file, onDone, onCancel }: { file: File; onDone: (url: string) => void; onCancel: () => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1.2)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const BOX = 280
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const i = new Image()
    i.onload = () => setImg(i)
    i.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  const base = img ? BOX / Math.min(img.width, img.height) : 1
  const save = () => {
    if (!img) return
    const S = 384
    const cv = document.createElement('canvas')
    cv.width = S
    cv.height = S
    const g = cv.getContext('2d')!
    const k = S / BOX
    const w = img.width * base * zoom * k
    const h = img.height * base * zoom * k
    g.drawImage(img, S / 2 - w / 2 + off.x * k, S / 2 - h / 2 + off.y * k, w, h)
    onDone(cv.toDataURL('image/jpeg', 0.85))
  }
  return (
    <div data-testid="photo-crop" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-3 text-white">
      <div className="text-center font-black">Kéo ảnh để khuôn mặt nằm giữa vòng tròn · Drag the face into the circle</div>
      <div
        className="relative touch-none overflow-hidden rounded-2xl bg-slate-800"
        style={{ width: BOX, height: BOX }}
        onPointerDown={(e) => {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y }
        }}
        onPointerMove={(e) => drag.current && setOff({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y })}
        onPointerUp={() => (drag.current = null)}
      >
        {img && (
          <img
            src={img.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={{ width: img.width * base * zoom, height: img.height * base * zoom, transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))` }}
          />
        )}
        {/* helmet window guide */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0 46%, rgba(0,0,0,0.65) 47%)' }} />
        <div className="pointer-events-none absolute inset-[4%] rounded-full border-4 border-dashed border-white/80" />
      </div>
      <label className="flex items-center gap-2 font-bold">
        🔍
        <input data-testid="crop-zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-56" />
      </label>
      <div className="flex gap-3">
        <button data-testid="crop-ok" onClick={save} className="rounded-full bg-emerald-500 px-8 py-3 text-xl font-black" style={{ minHeight: 48 }}>
          ✓ OK
        </button>
        <button onClick={onCancel} className="rounded-full bg-slate-700 px-6 py-3 text-xl font-black" style={{ minHeight: 48 }}>
          ✕
        </button>
      </div>
    </div>
  )
}

export function MeScreen({ stars, onBack, onSay }: { stars: number; onBack: () => void; onSay: Say }) {
  const L = useLayout()
  const c = L.compact
  const me = meStore.use()
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pop, setPop] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => void onSay(ME_LINES.title.en, ME_LINES.title.vi), 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [onSay])
  const set = (v: Parameters<typeof meStore.set>[0], word?: string) => {
    playPop()
    meStore.set(v)
    setPop((p) => p + 1)
    if (word) void speak(word + '!')
  }
  const opt = (on: boolean) => `flex items-center justify-center rounded-2xl border-4 font-black active:scale-90 ${on ? 'border-white bg-white/15' : 'border-white/20 bg-white/5'}`
  return (
    <Screen>
      <TopBar onBack={onBack} stars={stars} middle={<div className={`font-black ${c ? 'text-lg' : 'text-4xl'}`}>Me in space 🧑‍🚀</div>} />
      <div className={`flex flex-1 items-center justify-center overflow-y-auto px-3 pb-3 ${L.portrait ? 'flex-col gap-3' : c ? 'gap-5' : 'gap-14'}`}>
        <div key={pop} className="animate-word-pop flex flex-col items-center">
          <MeAstronaut size={L.portrait ? Math.min(L.h * 0.34, 340) : c ? 190 : 380} />
        </div>
        <div className={`flex flex-col items-center ${c ? 'gap-2' : 'gap-4'}`}>
          <div className="flex flex-col items-center gap-1">
            <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>SUIT · Bộ đồ</div>
            <div className="flex gap-2">
              {SUITS.map((s) => (
                <button key={s.id} data-testid={`suit-${s.id}`} onClick={() => set({ suit: s.id }, s.en)} className={`${opt(me.suit === s.id)} flex-col ${c ? 'h-16 w-24 text-[10px]' : 'h-24 w-36 text-sm'}`}>
                  <span className={c ? 'text-2xl' : 'text-4xl'}>{s.icon}</span>
                  {s.en}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`font-extrabold text-sky-200 ${c ? 'text-[11px]' : 'text-base'}`}>PATCH · Huy hiệu</div>
            <div className="flex gap-1.5">
              {PATCHES.map((p) => (
                <button key={p} onClick={() => set({ patch: p })} className={opt(me.patch === p)} style={{ width: c ? 42 : 58, height: c ? 42 : 58, fontSize: c ? 22 : 30 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button data-testid="me-flag" onClick={() => set({ flag: !me.flag }, 'FLAG')} className={`${opt(me.flag)} gap-1 px-3 ${c ? 'text-xs' : 'text-base'}`} style={{ minHeight: 48 }}>
              🇻🇳 FLAG
            </button>
            <button data-testid="me-visor" onClick={() => set({ visor: me.visor === 'gold' ? 'clear' : 'gold' }, 'VISOR')} className={`${opt(me.visor === 'gold')} gap-1 px-3 ${c ? 'text-xs' : 'text-base'}`} style={{ minHeight: 48 }}>
              🟡 GOLD VISOR
            </button>
            <button
              data-testid="me-hello"
              onClick={() => {
                playSparkle()
                void onSay(ME_LINES.title.en, ME_LINES.title.vi)
              }}
              className={`animate-breathe rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 px-3 font-black ${c ? 'text-xs' : 'text-base'}`}
              style={{ minHeight: 48 }}
            >
              👋 HELLO!
            </button>
          </div>
          {/* grown-up area */}
          <div className={`mt-1 flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/25 ${c ? 'p-2' : 'p-3'}`}>
            <div className={`font-bold text-amber-200 ${c ? 'text-[11px]' : 'text-sm'}`}>👨‍👩‍👧 Bố mẹ: giữ nút 2 giây để chọn ảnh của bé (ảnh chỉ lưu trên iPad này)</div>
            <div className="flex flex-wrap justify-center gap-2">
              <HoldButton testid="me-photo" onDone={() => fileInput.current?.click()}>
                📷 {me.photo ? 'Đổi ảnh' : 'Thêm ảnh của bé'}
              </HoldButton>
              {me.photo && (
                <HoldButton testid="me-photo-delete" onDone={() => set({ photo: null })}>
                  🗑 Xóa ảnh
                </HoldButton>
              )}
              <input
                value={me.name}
                maxLength={10}
                onChange={(e) => meStore.set({ name: e.target.value })}
                placeholder="Tên bé"
                aria-label="Name on the suit"
                className="w-32 rounded-xl bg-white/90 px-3 text-center font-black text-slate-900"
                style={{ minHeight: 48 }}
              />
            </div>
            <input
              ref={fileInput}
              data-testid="me-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFile(f)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </div>
      {file && (
        <PhotoCrop
          file={file}
          onCancel={() => setFile(null)}
          onDone={(url) => {
            setFile(null)
            set({ photo: url })
            playSparkle()
            void onSay(ME_LINES.title.en, ME_LINES.title.vi)
          }}
        />
      )}
    </Screen>
  )
}
