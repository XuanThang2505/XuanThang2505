/**
 * Real photographs shown with "📷 REAL PHOTO" when the child lands on a world.
 * All are NASA images (public domain) except where a credit says CC BY.
 * Source: images.nasa.gov (ids in brackets). Files live in public/photos/.
 */
export interface RealPhoto {
  file: string
  en: string
  vi: string
  credit: string
  /** cover = fill the screen · contain = whole planet on black · pano = slow pan across a panorama */
  fit: 'cover' | 'contain' | 'pano'
}

export const PHOTOS: Partial<Record<string, RealPhoto[]>> = {
  mars: [
    { file: './photos/mars-pano.jpg', fit: 'pano', en: 'Mars, seen by the Perseverance rover (2021)', vi: 'Sao Hỏa thật, do xe tự hành Perseverance chụp năm 2021', credit: 'NASA/JPL-Caltech/MSSS/ASU [PIA24264]' },
    { file: './photos/mars-sunset.jpg', fit: 'cover', en: 'A real blue sunset on Mars (Curiosity, 2015)', vi: 'Hoàng hôn xanh thật trên Sao Hỏa, xe Curiosity chụp năm 2015', credit: 'NASA/JPL-Caltech/MSSS/Texas A&M Univ. [PIA19400]' },
  ],
  moon: [
    { file: './photos/moon-aldrin.jpg', fit: 'cover', en: 'Astronaut Buzz Aldrin on the Moon (Apollo 11, 1969)', vi: 'Phi hành gia Buzz Aldrin trên Mặt Trăng (Apollo 11, năm 1969)', credit: 'NASA [AS11-40-5903]' },
    { file: './photos/moon-footprint.jpg', fit: 'cover', en: 'A real footprint on the Moon (Apollo 11, 1969)', vi: 'Dấu chân thật trên Mặt Trăng (Apollo 11, năm 1969)', credit: 'NASA [AS11-40-5878]' },
  ],
  earth: [
    { file: './photos/earth-bluemarble.jpg', fit: 'contain', en: 'The Blue Marble: our Earth, seen by the Apollo 17 astronauts (1972)', vi: '"Viên bi xanh": Trái Đất do phi hành gia Apollo 17 chụp năm 1972', credit: 'NASA [AS17-148-22727]' },
  ],
  venus: [
    { file: './photos/venus-magellan.jpg', fit: 'cover', en: 'Venus surface made from Magellan radar (colors added)', vi: 'Bề mặt Sao Kim dựng từ radar của tàu Magellan (màu được tô thêm)', credit: 'NASA/JPL [S91-50687]' },
  ],
  mercury: [
    { file: './photos/mercury-messenger.jpg', fit: 'contain', en: 'Mercury, seen by the MESSENGER spacecraft', vi: 'Sao Thủy do tàu MESSENGER chụp', credit: 'NASA/Johns Hopkins University APL/Carnegie Institution of Washington' },
  ],
  jupiter: [
    { file: './photos/jupiter-juno.jpg', fit: 'contain', en: "Jupiter's swirling clouds, seen by Juno (2018)", vi: 'Những đám mây xoáy của Sao Mộc, tàu Juno chụp năm 2018', credit: 'NASA/JPL-Caltech/SwRI/MSSS – image processing Kevin M. Gill (CC BY) [PIA21984]' },
  ],
  saturn: [
    { file: './photos/saturn-cassini.jpg', fit: 'contain', en: 'Saturn and its rings, seen by Cassini (2004)', vi: 'Sao Thổ và vành đai, tàu Cassini chụp', credit: 'NASA/JPL/Space Science Institute [PIA06193]' },
  ],
  uranus: [
    { file: './photos/uranus-voyager.jpg', fit: 'contain', en: 'Uranus, seen by Voyager 2 (1986)', vi: 'Sao Thiên Vương, tàu Voyager 2 chụp năm 1986', credit: 'NASA/JPL-Caltech [PIA18182]' },
  ],
  neptune: [
    { file: './photos/neptune-voyager.jpg', fit: 'contain', en: 'Neptune, seen by Voyager 2 (1989)', vi: 'Sao Hải Vương, tàu Voyager 2 chụp năm 1989', credit: 'NASA/JPL [PIA01492]' },
  ],
}
