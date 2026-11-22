/**
 * Vietnamese voice recorded by the family (stored on the device in IndexedDB).
 * A parent's voice has correct tones and the child loves it; lines without a recording fall back
 * to the system Vietnamese voice.
 */
import { FACTS, GAME_LINES, PLANETS, PUZZLE_LINES, QUIZ, STICKERS, SYSTEM_LESSON } from '../data/planetsData'
import { STATION_LINES, STORY, WISH_LINES } from '../data/storyData'
import { slugify } from './slug'

const DB = 'space-atlas-vi'
const STORE = 'clips'

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((res, rej) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => res(req.result)
        req.onerror = () => rej(req.error)
      }),
  )
}

export const viKey = (text: string) => slugify(text)
export const saveVi = (text: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, viKey(text))).then(() => undefined)
export const getVi = (text: string) => tx<Blob | undefined>('readonly', (s) => s.get(viKey(text))).catch(() => undefined)
export const deleteVi = (text: string) => tx('readwrite', (s) => s.delete(viKey(text))).then(() => undefined)
export const listVi = () => tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys()).then((k) => new Set(k.map(String))).catch(() => new Set<string>())

/** Every Vietnamese line of the app, most important first (names, then phrases, facts, games, story). */
export function allViLines(): string[] {
  const out: string[] = []
  PLANETS.forEach((p) => out.push(p.vietnameseName))
  out.push(SYSTEM_LESSON.vietnameseName)
  PLANETS.forEach((p) => p.vocabWords.forEach((w) => out.push(w.vi)))
  STICKERS.forEach((s) => out.push(s.vi))
  Object.values(GAME_LINES).forEach((l) => out.push(l.vi))
  ;[PUZZLE_LINES.start, PUZZLE_LINES.tryAgain, PUZZLE_LINES.done, ...PUZZLE_LINES.praise].forEach((l) => out.push(l.vi))
  ;[STORY.hello, STORY.tapWord, STORY.finale, ...Object.values(STORY.intro), ...STORY.crystal, ...Object.values(WISH_LINES), STATION_LINES.title].forEach((l) => out.push(l.vi))
  PLANETS.forEach((p) => out.push(p.vietnameseSub, p.compare.vi))
  out.push(SYSTEM_LESSON.vietnameseSub)
  Object.values(FACTS).forEach((list) => list.forEach((f) => out.push(f[2])))
  QUIZ.forEach((q) => out.push(q[2]))
  const seen = new Set<string>()
  return out.filter((t) => {
    const k = viKey(t)
    if (!t || seen.has(k)) return false
    seen.add(k)
    return true
  })
}
