/**
 * The shared wording, for the Node build scripts.
 *
 * `locales/vocabulary.ts` is the same thing for the site's TypeScript; both read the generated
 * `locales/vocabulary.json` that `pnpm sync:app` copies out of the chordlist-app repository, where
 * `VOCABULARY.md` is the source of truth. Asset copy reaches for these rather than retyping a term,
 * so an image and the app cannot disagree about what a thing is called.
 *
 * Lookups throw rather than falling back: a silent English word in the middle of German copy is
 * exactly the failure this exists to prevent, and an App Store image is a bad place to discover it.
 */
import { readFileSync } from "node:fs"

const data = JSON.parse(readFileSync(new URL("../../locales/vocabulary.json", import.meta.url), "utf8"))

const rebuild =
  "Add it to VOCABULARY.md, run scripts/build-vocabulary.py in the app repository, then pnpm sync:app."

/// Every language VOCABULARY.md has a column for, English first.
export const vocabularyLanguages = data.languages

export const sourceLanguage = data.sourceLanguage

/// The agreed translation of a glossary term, by its English wording.
export function term(english, language) {
  const match = data.terms.find((entry) => entry.term === english)
  if (!match) throw new Error(`"${english}" is not a term in VOCABULARY.md. ${rebuild}`)
  if (language === data.sourceLanguage) return match.term

  const translation = match.translations[language]
  if (!translation) throw new Error(`"${english}" has no ${language} translation in VOCABULARY.md. ${rebuild}`)
  return translation
}

/// A shared phrase — the tagline and product description, which have to read the same on the site,
/// in the app, and in the App Store listing.
export function phrase(name, language) {
  const match = data.phrases.find((entry) => entry.name === name)
  if (!match) throw new Error(`"${name}" is not a phrase in VOCABULARY.md. ${rebuild}`)

  const wording = match.translations[language]
  if (!wording) throw new Error(`The "${name}" phrase has no ${language} wording in VOCABULARY.md. ${rebuild}`)
  return wording
}
