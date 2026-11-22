/** Stars earned in the games, saved on the device (kept apart so the 3D screen loads without the games). */
const STARS_KEY = 'space-atlas-stars'
export function loadStars() {
  try {
    return parseInt(localStorage.getItem(STARS_KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}
export function saveStars(n: number) {
  try {
    localStorage.setItem(STARS_KEY, String(n))
  } catch {
    /* private mode – fine */
  }
}
