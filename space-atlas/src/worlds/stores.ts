/** Small saved stores for the explore features (passport stamps, my planet) + the overview clock. */
import { useSyncExternalStore } from 'react'
import type { SurfaceId, WorldId } from '../data/worldsData'

function store<T>(key: string, initial: T) {
  let value: T = (() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...initial, ...JSON.parse(raw) } : initial
    } catch {
      return initial
    }
  })()
  const ls = new Set<() => void>()
  return {
    get: () => value,
    set(v: Partial<T>) {
      value = { ...value, ...v }
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* private mode */
      }
      ls.forEach((l) => l())
    },
    use(): T {
      return useSyncExternalStore(
        (l) => {
          ls.add(l)
          return () => ls.delete(l)
        },
        () => value,
      )
    },
  }
}

export const passport = store<{ stamps: WorldId[] }>('space-atlas-passport', { stamps: [] })

export interface MyPlanet {
  made: boolean
  name: string
  surface: SurfaceId
  size: 1 | 2 | 3
  rings: boolean
  moons: 0 | 1 | 2 | 3
}
export const myPlanet = store<MyPlanet>('space-atlas-myplanet', { made: false, name: 'My planet', surface: 'ocean', size: 2, rings: true, moons: 1 })

/** Overview clock, written by the 3D scene, read by the HUD a few times a second (no re-render per frame). */
export const sim = { earthYears: 0, timeScale: 1 }
