/**
 * Real photographs (public-domain NASA images, see README for sources), shown with "📷 REAL PHOTO"
 * when the child stands on a world. Files live in public/photos/.
 */
export interface RealPhoto {
  file: string
  en: string
  vi: string
  credit: string
}
export const PHOTOS: Partial<Record<string, RealPhoto[]>> = {}
