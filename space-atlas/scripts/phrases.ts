/**
 * Prints every English text the app speaks, as JSON [{ slug, text }].
 * Used by scripts/make_voice.py to pre-record the voice clips.
 *   npx tsx scripts/phrases.ts > /tmp/phrases.json
 */
import { FACTS, GAME_LINES, PLANETS, PUZZLE_LINES, QUIZ, STICKERS, SYSTEM_LESSON } from '../src/data/planetsData'
import { OCEAN_WORDS, ROCKET_COLORS, ROCKET_LINES, ROCKET_PILOTS, SPLASH_LINES, STATION_LINES, STORY, WISH_LINES } from '../src/data/storyData'
import { catchLine, COSMO_EYES, COSMO_HATS, COUNT_WORDS, CREATURES, DIVE_LINES, DOLPHIN_LEVEL_LINES, FLY_LINES, WORKSHOP_LINES, ZONES } from '../src/data/moreData'
import { heroTexts } from '../src/data/heroData'
import { worldTexts } from '../src/data/worldsData'
import { slugify } from '../src/utils/slug'

const texts = new Set<string>()
for (const p of PLANETS) {
  texts.add(p.englishName + '!')
  texts.add(p.englishPhrase)
  texts.add(p.compare.en)
  p.vocabWords.forEach((w) => texts.add(w.word + '!'))
}
texts.add(SYSTEM_LESSON.englishName + '!')
texts.add(SYSTEM_LESSON.englishPhrase)
SYSTEM_LESSON.vocabWords.forEach((w) => texts.add(w.word + '!'))
;[PUZZLE_LINES.start, PUZZLE_LINES.tryAgain, PUZZLE_LINES.done, ...PUZZLE_LINES.praise].forEach((l) => texts.add(l.en))
Object.values(GAME_LINES).forEach((l) => texts.add(l.en))
Object.values(FACTS).forEach((list) => list.forEach(([, en]) => texts.add(en)))
QUIZ.forEach(([, q]) => texts.add(q))
STICKERS.forEach((st) => texts.add(st.en + '!'))
;[STORY.hello, STORY.tapWord, STORY.finale, ...Object.values(STORY.intro), ...STORY.crystal, ...Object.values(WISH_LINES), STATION_LINES.title].forEach((l) => texts.add(l.en))

;[...Object.values(SPLASH_LINES), ROCKET_LINES.build, ...ROCKET_LINES.count, ...ROCKET_LINES.trips].forEach((l) => texts.add(l.en))
;[...OCEAN_WORDS, ...ROCKET_COLORS, ...ROCKET_PILOTS].forEach((w) => texts.add(w.en + '!'))

;[...Object.values(DIVE_LINES), ...Object.values(WORKSHOP_LINES), ...Object.values(DOLPHIN_LEVEL_LINES), ...Object.values(FLY_LINES), ...ZONES].forEach((l) => texts.add(l.en))
;[...CREATURES, ...COSMO_EYES, ...COSMO_HATS].forEach((w) => texts.add(w.en + '!'))
COUNT_WORDS.forEach((w) => texts.add(w))
OCEAN_WORDS.forEach((w) => texts.add(catchLine(w.en).en))
texts.add('TREASURE!')

heroTexts().forEach((t) => texts.add(t))
worldTexts().en.forEach((t) => texts.add(t))

const seen = new Map<string, string>()
for (const t of texts) if (!seen.has(slugify(t))) seen.set(slugify(t), t)
console.log(JSON.stringify([...seen].map(([slug, text]) => ({ slug, text })), null, 1))
