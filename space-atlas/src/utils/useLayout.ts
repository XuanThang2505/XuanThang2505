/**
 * One place that knows what kind of screen we are on, so every screen of the app can
 * adapt (iPhone, iPad, Mac, TV…).
 *
 *   portrait  – taller than wide (phone or tablet held upright)
 *   compact   – a phone: the SHORT side is under 520 CSS px. iPhones are 390–440 px wide
 *               in portrait and 390–440 px tall in landscape, so both count as compact.
 *
 * The root font size (see index.css) already scales all rem-based sizes with the screen;
 * this hook is for layout decisions and pixel maths.
 */
import { useEffect, useState } from 'react'

export interface Layout {
  w: number
  h: number
  portrait: boolean
  compact: boolean
}

export const COMPACT_BELOW = 520

function read(): Layout {
  const w = window.innerWidth
  const h = window.innerHeight
  return { w, h, portrait: h > w, compact: Math.min(w, h) < COMPACT_BELOW }
}

export function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(read)
  useEffect(() => {
    const on = () => {
      const next = read()
      setLayout((p) => (p.w === next.w && p.h === next.h ? p : next))
    }
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    // iOS changes the visual viewport when toolbars show/hide
    window.visualViewport?.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
      window.visualViewport?.removeEventListener('resize', on)
    }
  }, [])
  return layout
}
