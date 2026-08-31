import type { Route } from "next"

import { activeCopyVariant, copyVariants, homeCopyFor, type CopyVariant } from "@/locales/copy-variants"
import * as de from "@/locales/de"
import * as en from "@/locales/en"
import type { Localized } from "@/locales/types"

/// The registry that turns the per-language copy files into something a route can ask for.
///
/// `en.ts` and `de.ts` are the wording; this decides which of them a request gets and what a
/// component is allowed to assume is present. Components take a `language` and call `dictionary()`
/// rather than importing `@/locales/en` at module scope, which is what lets one component render
/// in either language without a copy of it per locale.

export const languages = ["en", "de"] as const
export type Language = (typeof languages)[number]

/// English is the site at its root; every other language hangs off a subpath.
export const defaultLanguage: Language = "en"

export function isLanguage(value: string): value is Language {
  return (languages as readonly string[]).includes(value)
}

/**
 * The copy objects a translated route may use.
 *
 * This is the honest boundary of the translation: exactly the objects the home page and the chrome
 * around it render. It is typed off the English shapes through `Localized`, so a key added to
 * `en.ts` breaks every language that has not caught up, and a component cannot reach for
 * `docsCopy` here and quietly render English inside a German page — it is not in the type.
 *
 * Translating another page means adding its object here and to every entry below, which will not
 * compile until each language actually has it.
 */
export type Dictionary = {
  readonly locale: Localized<typeof en.locale>
  readonly common: Localized<typeof en.commonCopy>
  readonly metadata: Localized<typeof en.metadataCopy>
  readonly home: Localized<typeof en.homeCopy>
  readonly imprint: Localized<typeof en.imprintCopy>
  readonly support: Localized<typeof en.supportCopy>
  readonly piano: Localized<typeof en.pianoCopy>
  readonly screenshotGallery: Localized<typeof en.screenshotGalleryCopy>
}

const chrome = {
  en: {
    locale: en.locale,
    common: en.commonCopy,
    metadata: en.metadataCopy,
    imprint: en.imprintCopy,
    support: en.supportCopy,
    piano: en.pianoCopy,
    screenshotGallery: en.screenshotGalleryCopy,
  },
  de: {
    locale: de.locale,
    common: de.commonCopy,
    metadata: de.metadataCopy,
    imprint: de.imprintCopy,
    support: de.supportCopy,
    piano: de.pianoCopy,
    screenshotGallery: de.screenshotGalleryCopy,
  },
} as const satisfies Record<Language, Omit<Dictionary, "home">>

// Every language crossed with every copy variant, built once at module load. Only `home` differs
// between variants — see locales/copy-variants.ts for why the chrome deliberately does not.
const dictionaries = Object.fromEntries(
  languages.map((language) => [
    language,
    Object.fromEntries(
      copyVariants.map((variant) => [variant, { ...chrome[language], home: homeCopyFor(language, variant) }]),
    ),
  ]),
) as Record<Language, Record<CopyVariant, Dictionary>>

/**
 * The copy for one language. Server-side and synchronous — the files are ordinary modules.
 *
 * `variant` defaults to whichever one this build ships, so every component that asks for a
 * dictionary gets the active wording without knowing variants exist. Passing one explicitly is for
 * `/copy`, which has to render all of them side by side to be worth looking at.
 */
export function dictionary(language: Language, variant: CopyVariant = activeCopyVariant): Dictionary {
  return dictionaries[language][variant]
}

/**
 * Where the home page lives in each language.
 *
 * The home page paths in each language. Other translated routes keep their own explicit maps so a
 * general path-rewriting rule never implies that an untranslated page exists.
 */
export const homeHref = {
  en: "/",
  de: "/de",
} as const satisfies Record<Language, Route>

/** The language a visitor can switch to from each language, and the label for that switch. */
export const languageNames = {
  en: "English",
  de: "Deutsch",
} as const satisfies Record<Language, string>

export { activeCopyVariant, copyVariants, defaultCopyVariant, isCopyVariant, type CopyVariant } from "@/locales/copy-variants"
