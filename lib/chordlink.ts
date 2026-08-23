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
export const chordlinkEditions: readonly ChordlinkEditionDefinition[] = [
  {
    editionKey: "first",
    publicIdPattern: /^\d{3}$/,
    fallbackPaths: genericChordlinkFallbackPaths,
  },
]

export function isChordlinkPublicId(value: string): boolean {
  return /^\d{2,6}$/.test(value)
}

export function chordlinkFallbackPath(publicId: string, language: Language): string | null {
  return resolveChordlinkFallbackPath(publicId, language, chordlinkEditions)
}

export function resolveChordlinkFallbackPath(
  publicId: string,
  language: Language,
  editions: readonly ChordlinkEditionDefinition[],
): string | null {
  if (!isChordlinkPublicId(publicId)) return null

  const edition = editions.find(({ publicIdPattern }) => publicIdPattern.test(publicId))
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
