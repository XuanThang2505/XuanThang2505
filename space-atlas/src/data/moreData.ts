/**
 * Content for the "explore" features: the deep-sea dive, Cosmo's robot workshop, the extra
 * dolphin levels and the rocket flight.
 */

// ---------------------------------------------------------------- deep sea dive
export type Zone = 'sun' | 'twilight' | 'midnight' | 'floor'
export const ZONES: { id: Zone; en: string; vi: string; from: number; color: string }[] = [
  { id: 'sun', en: 'Sunlight zone', vi: 'Vùng nắng chiếu (0–200 m)', from: 0, color: '#38bdf8' },
  { id: 'twilight', en: 'Twilight zone', vi: 'Vùng chạng vạng (200–1000 m)', from: 0.28, color: '#1d4ed8' },
  { id: 'midnight', en: 'Midnight zone', vi: 'Vùng nửa đêm (1000–4000 m)', from: 0.55, color: '#1e1b4b' },
  { id: 'floor', en: 'The sea floor!', vi: 'Đáy biển!', from: 0.82, color: '#0b1020' },
]
export const SEA_DEPTH_M = 4000

export interface Creature {
  id: string
  emoji: string
  en: string
  vi: string
  fact: string
  /** 0..1 down the dive */
  y: number
  /** 0..1 across */
  x: number
  size: number
}
export const CREATURES: Creature[] = [
  { id: 'dolphin', emoji: '🐬', en: 'DOLPHIN', vi: 'Cá heo', fact: 'Cá heo thở bằng phổi nên phải ngoi lên mặt nước để thở.', y: 0.05, x: 0.72, size: 1.2 },
  { id: 'fish', emoji: '🐠', en: 'FISH', vi: 'Con cá', fact: 'Cá thở dưới nước bằng mang.', y: 0.1, x: 0.25, size: 0.9 },
  { id: 'turtle', emoji: '🐢', en: 'TURTLE', vi: 'Rùa biển', fact: 'Rùa biển có thể sống hơn 50 năm.', y: 0.15, x: 0.62, size: 1.1 },
  { id: 'pufferfish', emoji: '🐡', en: 'PUFFERFISH', vi: 'Cá nóc', fact: 'Cá nóc phồng tròn như quả bóng khi sợ hãi.', y: 0.2, x: 0.2, size: 0.9 },
  { id: 'shark', emoji: '🦈', en: 'SHARK', vi: 'Cá mập', fact: 'Cá mập có rất nhiều hàng răng, rụng răng này lại mọc răng khác.', y: 0.24, x: 0.7, size: 1.3 },
  { id: 'jellyfish', emoji: '🪼', en: 'JELLYFISH', vi: 'Con sứa', fact: 'Sứa không có xương và cũng không có não.', y: 0.34, x: 0.3, size: 1 },
  { id: 'squid', emoji: '🦑', en: 'SQUID', vi: 'Mực ống', fact: 'Mực phun mực đen để trốn kẻ thù.', y: 0.42, x: 0.7, size: 1 },
  { id: 'octopus', emoji: '🐙', en: 'OCTOPUS', vi: 'Bạch tuộc', fact: 'Bạch tuộc có tám xúc tu và ba trái tim.', y: 0.49, x: 0.25, size: 1.1 },
  { id: 'whale', emoji: '🐋', en: 'WHALE', vi: 'Cá voi', fact: 'Cá voi xanh là con vật lớn nhất trên Trái Đất.', y: 0.6, x: 0.6, size: 1.8 },
  { id: 'shrimp', emoji: '🦐', en: 'SHRIMP', vi: 'Con tôm', fact: 'Nhiều con tôm biển sâu tự phát sáng trong bóng tối.', y: 0.7, x: 0.25, size: 0.9 },
  { id: 'crab', emoji: '🦀', en: 'CRAB', vi: 'Con cua', fact: 'Cua đi ngang bằng tám cái chân.', y: 0.86, x: 0.2, size: 1 },
  { id: 'lobster', emoji: '🦞', en: 'LOBSTER', vi: 'Tôm hùm', fact: 'Tôm hùm có hai cái càng to để kẹp thức ăn.', y: 0.9, x: 0.78, size: 1 },
  { id: 'shell', emoji: '🐚', en: 'SHELL', vi: 'Vỏ sò', fact: 'Vỏ sò là ngôi nhà cứng bảo vệ con sò.', y: 0.95, x: 0.42, size: 0.8 },
  { id: 'coral', emoji: '🪸', en: 'CORAL', vi: 'San hô', fact: 'San hô là ngôi nhà của rất nhiều loài cá.', y: 0.13, x: 0.88, size: 1 },
]
export const DIVE_LINES = {
  start: { en: "Let's dive into the ocean!", vi: 'Cùng lặn xuống đại dương nào!' },
  deeper: { en: 'Dive deeper!', vi: 'Lặn sâu hơn nữa!' },
  treasure: { en: 'You found the treasure!', vi: 'Con tìm thấy kho báu rồi!' },
}

// ---------------------------------------------------------------- Cosmo's workshop
export const COSMO_EYES = [
  { id: 'round', en: 'EYES', vi: 'Mắt tròn' },
  { id: 'happy', en: 'HAPPY', vi: 'Mắt cười' },
  { id: 'star', en: 'STAR', vi: 'Mắt ngôi sao' },
  { id: 'heart', en: 'HEART', vi: 'Mắt trái tim' },
] as const
export const COSMO_HATS = [
  { id: 'none', en: 'ROBOT', vi: 'Không đội' },
  { id: 'cap', en: 'HAT', vi: 'Mũ lưỡi trai' },
  { id: 'crown', en: 'CROWN', vi: 'Vương miện' },
  { id: 'bow', en: 'BOW', vi: 'Nơ' },
  { id: 'headphones', en: 'HEADPHONES', vi: 'Tai nghe' },
] as const
export type EyesId = (typeof COSMO_EYES)[number]['id']
export type HatId = (typeof COSMO_HATS)[number]['id']
export const WORKSHOP_LINES = {
  start: { en: 'Dress up Cosmo!', vi: 'Trang trí cho Cosmo nào!' },
  dance: { en: "Let's dance!", vi: 'Cùng nhảy nào!' },
}

// ---------------------------------------------------------------- dolphin levels + rocket flight
export const COUNT_WORDS = ['One!', 'Two!', 'Three!', 'Four!', 'Five!']
export const DOLPHIN_LEVEL_LINES = {
  count: { en: "Let's count!", vi: 'Cùng đếm nào!' },
}
export const catchLine = (word: string) => ({ en: `Catch the ${word.toLowerCase()}!`, vi: '' })
export const FLY_LINES = {
  start: { en: 'Fly and catch the stars!', vi: 'Lái tên lửa và bắt các ngôi sao!' },
  oops: { en: 'Oops!', vi: 'Ối!' },
}
