import type { Language } from "@/locales"

export type ChordlinkEditionDefinition = {
  editionKey: string
  publicIdPattern: RegExp
  fallbackPaths: Record<Language, string>
}

export const genericChordlinkFallbackPaths: Record<Language, string> = {
  en: "/chordlink/setup",
  de: "/de/chordlink/setup",
}

// Rules are intentionally data, not route logic. A dark edition can add a
// two-digit rule ahead of this one without changing any NFC URL already printed.
// Patterns are tested against the canonical ID, so an edition never has to spell
// out the casing a tag happened to be printed in.
export const chordlinkEditions: readonly ChordlinkEditionDefinition[] = [
  {
    editionKey: "first",
    publicIdPattern: /^\d{3}$/,
    fallbackPaths: genericChordlinkFallbackPaths,
  },
]

// A public ID is a slug rather than a number, so a later run can carry a word —
// /link/tour-2026 — while every number already printed keeps the exact shape it
// was printed with. Hyphens separate rather than decorate: the form is groups of
// letters and digits joined by single hyphens, which rules out the leading,
// trailing, and doubled hyphens that make two tags look like one.
const canonicalPublicIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const publicIdLengths = { minimum: 2, maximum: 32 }

// Tags are printed and links are retyped, and neither carries case reliably. One
// canonical lowercase form means /link/Tour-2026 and /link/tour-2026 are the same
// chordlink rather than two that silently differ. ASCII only: an umlaut survives
// neither a printed tag nor a hand-typed URL intact, so it is refused here rather
// than resolving to something the owner did not name.
export function normalizeChordlinkPublicId(value: string): string | null {
  const candidate = value.trim().toLowerCase()
  if (candidate.length < publicIdLengths.minimum || candidate.length > publicIdLengths.maximum) return null

  return canonicalPublicIdPattern.test(candidate) ? candidate : null
}

export function isChordlinkPublicId(value: string): boolean {
  return normalizeChordlinkPublicId(value) !== null
}

export function chordlinkFallbackPath(publicId: string, language: Language): string | null {
  return resolveChordlinkFallbackPath(publicId, language, chordlinkEditions)
}

export function resolveChordlinkFallbackPath(
  publicId: string,
  language: Language,
  editions: readonly ChordlinkEditionDefinition[],
): string | null {
  const canonicalId = normalizeChordlinkPublicId(publicId)
  if (!canonicalId) return null

  const edition = editions.find(({ publicIdPattern }) => publicIdPattern.test(canonicalId))
  return edition?.fallbackPaths[language] ?? genericChordlinkFallbackPaths[language]
}

export function preferredChordlinkLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return "en"

  const preferences = acceptLanguage
    .split(",")
    .flatMap((entry, index) => {
      const [range, ...parameters] = entry.trim().toLowerCase().split(";")
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="))
      const quality = qualityParameter === undefined
        ? 1
        : Number.parseFloat(qualityParameter.trim().slice(2))
      if (!range || !Number.isFinite(quality) || quality <= 0 || quality > 1) return []

      const language: Language | null = range === "*" || range === "en" || range.startsWith("en-")
        ? "en"
        : range === "de" || range.startsWith("de-")
          ? "de"
          : null
      return language ? [{ language, quality, index }] : []
    })
    .toSorted((left, right) => right.quality - left.quality || left.index - right.index)

  return preferences[0]?.language ?? "en"
}
