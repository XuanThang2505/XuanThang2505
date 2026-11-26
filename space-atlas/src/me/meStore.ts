/**
 * "Me" – the child's own astronaut. The photo is cropped to a small square and kept ONLY on this
 * device (localStorage); nothing is uploaded anywhere.
 */
import { useSyncExternalStore } from 'react'

export type SuitId = 'eva' | 'launch' | 'hero'
export interface Me {
  photo: string | null // small JPEG data URL (~384 px)
  suit: SuitId
  patch: string
  flag: boolean
  visor: 'clear' | 'gold'
  name: string
}
const KEY = 'space-atlas-me'
const DEFAULT: Me = { photo: null, suit: 'eva', patch: '🚀', flag: true, visor: 'clear', name: '' }
let value: Me = (() => {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULT
  }
})()
const ls = new Set<() => void>()
export const meStore = {
  get: () => value,
  set(v: Partial<Me>) {
    value = { ...value, ...v }
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      /* storage full / private mode: keep it for this session only */
    }
    ls.forEach((l) => l())
  },
  use(): Me {
    return useSyncExternalStore(
      (l) => {
        ls.add(l)
        return () => ls.delete(l)
      },
      () => value,
    )
  },
}
