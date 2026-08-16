import vocabularyData from "./vocabulary.json"

/// The wording shared with the app, synced out of the chordlist-app repository by `pnpm sync:app`.
///
/// `VOCABULARY.md` over there is the source of truth; this is the generated copy. Reach for these
/// rather than retyping a term in `de.ts`, so a wording change in the app repository reaches the
/// site the next time the sync runs instead of quietly disagreeing with it.

/// Whatever `VOCABULARY.md` has columns for. Adding French there widens this automatically,
/// because the generated JSON lists its own languages.
export type VocabularyLanguage = (typeof vocabularyData)["languages"][number]

type VocabularyTerm = {
  term: string
  /// Keyed by language code. English is the `term` itself, so it is absent here.
  translations: Record<string, string>
  match: "strict" | "loose"
  notes: string
}

type VocabularyPhrase = {
  name: string
  /// Keyed by language code, English included.
  translations: Record<string, string>
}

const terms = vocabularyData.terms as VocabularyTerm[]
const phrases = vocabularyData.phrases as VocabularyPhrase[]
const sourceLanguage = vocabularyData.sourceLanguage as string

/// The agreed translation of a glossary term, by its English wording.
///
/// Throws rather than falling back: a silent English word in the middle of German copy is the
/// failure this whole mechanism exists to prevent, and it should surface at build time.
export function term(english: string, language: VocabularyLanguage): string {
  const match = terms.find((entry) => entry.term === english)
  if (!match) {
    throw new Error(
      `"${english}" is not in VOCABULARY.md. Add it there, run scripts/build-vocabulary.py in the app repository, then pnpm sync:app.`,
    )
  }
  if (language === sourceLanguage) return match.term

  const translation = match.translations[language]
  if (!translation) {
    throw new Error(`"${english}" has no ${language} translation in VOCABULARY.md.`)
  }
  return translation
}

/// A shared phrase — the tagline and product description, which have to read the same on the site,
/// in the app, and in the App Store listing.
export function phrase(name: string, language: VocabularyLanguage): string {
  const match = phrases.find((entry) => entry.name === name)
  if (!match) {
    throw new Error(
      `"${name}" is not a phrase in VOCABULARY.md. Add it there, run scripts/build-vocabulary.py in the app repository, then pnpm sync:app.`,
    )
  }
  const wording = match.translations[language]
  if (!wording) {
    throw new Error(`The "${name}" phrase has no ${language} wording in VOCABULARY.md.`)
  }
  return wording
}

export const vocabulary = { terms, phrases } as const
