/** Tiny check kept apart from the AR exporter, so the main bundle does not load three.js for it. */
export function arSupported() {
  try {
    return document.createElement('a').relList.supports('ar')
  } catch {
    return false
  }
}
