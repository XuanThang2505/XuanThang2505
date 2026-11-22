/** How the child dressed Cosmo (robot workshop). Shared by every Cosmo on screen, saved on the device. */
import { useSyncExternalStore } from 'react'
import type { EyesId, HatId } from '../data/moreData'

export interface CosmoStyle {
  color: number
  eyes: EyesId
  hat: HatId
}
const KEY = 'space-atlas-cosmo'
const DEFAULT: CosmoStyle = { color: 0, eyes: 'round', hat: 'none' }
let current: CosmoStyle = (() => {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULT
  }
})()
const listeners = new Set<() => void>()

export function setCosmoStyle(s: Partial<CosmoStyle>) {
  current = { ...current, ...s }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l())
}
export function useCosmoStyle() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}
