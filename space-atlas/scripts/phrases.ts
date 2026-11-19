/**
 * Prints every English text the app speaks, as JSON [{ slug, text }].
 * Used by scripts/make_voice.py to pre-record the voice clips.
 *   npx tsx scripts/phrases.ts > /tmp/phrases.json
 */
import { PLANETS, PUZZLE_LINES, SYSTEM_LESSON } from '../src/data/planetsData'
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

const seen = new Map<string, string>()
for (const t of texts) if (!seen.has(slugify(t))) seen.set(slugify(t), t)
console.log(JSON.stringify([...seen].map(([slug, text]) => ({ slug, text })), null, 1))
