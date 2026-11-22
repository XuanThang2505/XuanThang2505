/** A shooting star now and then across the 3D sky: a DOM animation, almost free for the battery. */
import { useEffect, useState } from 'react'

export function AmbientStars({ on }: { on: boolean }) {
  const [star, setStar] = useState<{ id: number; top: number; left: number } | null>(null)
  useEffect(() => {
    if (!on) return
    let t: number
    let id = 0
    const schedule = () => {
      t = window.setTimeout(() => {
        if (!document.hidden) setStar({ id: ++id, top: 4 + Math.random() * 30, left: 55 + Math.random() * 40 })
        schedule()
      }, 25000 + Math.random() * 30000)
    }
    // the first one comes soon so the child notices the sky is alive
    t = window.setTimeout(() => {
      setStar({ id: ++id, top: 10, left: 80 })
      schedule()
    }, 9000)
    return () => window.clearTimeout(t)
  }, [on])
  if (!star) return null
  return (
    <div
      key={star.id}
      onAnimationEnd={() => setStar(null)}
      className="animate-streak pointer-events-none absolute z-[5] text-3xl"
      style={{ top: `${star.top}%`, left: `${star.left}%` }}
    >
      🌠
    </div>
  )
}
