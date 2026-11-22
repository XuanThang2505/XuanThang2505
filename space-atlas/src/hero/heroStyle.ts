/** The child's own hero suit (Hero suit screen). Shared by every Captain Star on screen, saved. */
import { useSyncExternalStore } from 'react'
import { ROCKET_COLORS } from '../data/storyData'
import type { EmblemId } from '../data/heroData'

export const HERO_COLORS = [...ROCKET_COLORS, { en: 'YELLOW', vi: 'Màu vàng', main: '#facc15', dark: '#a16207' }]

export interface HeroStyle {
  suit: number
  cape: number
  mask: number
  shield: number
  emblem: EmblemId
}
const KEY = 'space-atlas-herostyle'
const DEFAULT: HeroStyle = { suit: 0, cape: 3, mask: 0, shield: 6, emblem: 'star' }
let current: HeroStyle = (() => {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULT
  }
})()
const listeners = new Set<() => void>()
export function setHeroStyle(s: Partial<HeroStyle>) {
  current = { ...current, ...s }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l())
}
export function useHeroStyle() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}
