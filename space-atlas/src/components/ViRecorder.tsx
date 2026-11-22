/**
 * Parent tool: record the app's Vietnamese lines in your own voice (or the other parent's).
 * Clean tones, a voice the child loves, works offline. Stored on this device only.
 */
import { useEffect, useRef, useState } from 'react'
import { allViLines, deleteVi, getVi, listVi, saveVi, viKey } from '../utils/viRecordings'
import { forgetFamilyClip, playBlob } from '../utils/speech'
import { ensureAudio } from '../utils/soundEffects'

export function ViRecorder({ onClose }: { onClose: () => void }) {
  const lines = useRef(allViLines()).current
  const [done, setDone] = useState<Set<string>>(new Set())
  const [rec, setRec] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const media = useRef<{ r: MediaRecorder; stream: MediaStream; chunks: Blob[] } | null>(null)

  useEffect(() => {
    void listVi().then(setDone)
    return () => media.current?.stream.getTracks().forEach((t) => t.stop())
  }, [])

  const stop = () => {
    media.current?.r.state === 'recording' && media.current.r.stop()
  }

  const start = async (text: string) => {
    setErr('')
    if (rec) return stop()
    try {
      await ensureAudio()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m))
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks: Blob[] = []
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: r.mimeType || 'audio/mp4' })
        setRec(null)
        media.current = null
        if (blob.size > 800) {
          await saveVi(text, blob)
          forgetFamilyClip(text)
          setDone((d) => new Set(d).add(viKey(text)))
          await playBlob(blob)
        }
      }
      media.current = { r, stream, chunks }
      r.start()
      setRec(text)
      setTimeout(() => r.state === 'recording' && r.stop(), 15000)
    } catch {
      setErr('Không mở được micro. Hãy cho phép micro cho trang này trong Cài đặt Safari.')
    }
  }

  const play = async (text: string) => {
    const b = await getVi(text)
    if (b) await playBlob(b)
  }

  return (
    <div data-testid="vi-recorder" className="pointer-events-auto fixed inset-0 z-[60] flex flex-col bg-slate-950/95 text-white" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center gap-3 p-3">
        <button onClick={onClose} aria-label="Close" style={{ width: 44, height: 44 }} className="rounded-full bg-white/10 text-2xl font-black active:scale-90">
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-extrabold">🎙 Thu giọng Việt của nhà mình</div>
          <div className="text-sm text-sky-200">
            Đã thu {done.size}/{lines.length} câu. Bấm ● để thu, bấm ■ để dừng. Câu chưa thu sẽ dùng giọng máy.
          </div>
        </div>
      </div>
      {err && <div className="mx-3 rounded-xl bg-rose-600/80 p-2 text-sm font-bold">{err}</div>}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {lines.map((t) => {
          const has = done.has(viKey(t))
          const on = rec === t
          return (
            <div key={t} className={`flex items-center gap-2 rounded-2xl p-2 ${on ? 'bg-rose-600/40' : 'bg-white/5'}`}>
              <button
                aria-label="Record"
                onClick={() => void start(t)}
                disabled={!!rec && !on}
                style={{ width: 48, height: 48 }}
                className={`shrink-0 rounded-full text-xl font-black active:scale-90 disabled:opacity-30 ${on ? 'animate-glow-ring bg-rose-500' : 'bg-rose-600/70'}`}
              >
                {on ? '■' : '●'}
              </button>
              <div className="min-w-0 flex-1 text-base font-bold leading-tight">{t}</div>
              {has && (
                <>
                  <button aria-label="Play" onClick={() => void play(t)} style={{ width: 44, height: 44 }} className="shrink-0 rounded-full bg-emerald-500/80 text-lg active:scale-90">
                    ▶
                  </button>
                  <button
                    aria-label="Delete"
                    onClick={async () => {
                      await deleteVi(t)
                      forgetFamilyClip(t)
                      setDone((d) => {
                        const n = new Set(d)
                        n.delete(viKey(t))
                        return n
                      })
                    }}
                    style={{ width: 44, height: 44 }}
                    className="shrink-0 rounded-full bg-white/10 text-lg active:scale-90"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
