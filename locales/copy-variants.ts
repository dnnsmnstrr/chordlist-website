import { homeCopy as deHome } from "@/locales/de"
import { homeCopy as enHome } from "@/locales/en"
import type { Language } from "@/locales"
import type { Localized } from "@/locales/types"

/// Alternative wordings of the home page, switchable without editing `en.ts`.
///
/// The site has one positioning and `en.ts` holds it. This file holds the two others worth
/// testing against it, taken from [Marketing strategies](../docs/marketing-strategies.md): the
/// product's file story is what makes it credible, but a stranger's actual question is *I do not
/// know what to play*, and the strongest sentence on the site is currently a carousel header.
/// Rather than argue about that in a diff, all three are written down and one is selected.
///
/// This mirrors `video/src/copy.ts`, which has done the same thing for the promo video since it
/// was built: named packs, one switch, no forked components.

export const copyVariants = ["files", "progressions", "setlist"] as const
export type CopyVariant = (typeof copyVariants)[number]

/// The positioning the site currently ships. `en.ts` and `de.ts` are its wording, so its entry
/// below is empty by definition — there is nothing for it to override.
export const defaultCopyVariant: CopyVariant = "files"

/**
 * What a variant may replace.
 *
 * Whole sections of `homeCopy`, never single strings. A section is the unit a reader takes in at
 * once, and a half-replaced one reads as two people arguing: swapping `showcase.title` into the
 * hero without also rewriting the showcase leaves the same sentence on the page twice. Section
 * replacement makes that impossible to do by accident, and it is why each entry below repeats the
 * keys it is not changing.
 *
 * Two things deliberately stay out of reach:
 *
 * - **The `<h1>`.** It renders `commonCopy.tagline`, which comes from `VOCABULARY.md` and is
 *   checked by `scripts/build-og-image.mjs` against the social card. A variant that moved it would
 *   silently break that check or ship a card that disagrees with the page.
 * - **The order of `features.items`.** `components/features.tsx` pairs an icon to each position, so
 *   reordering the tuple would hand the progressions card a document icon. A variant leads with the
 *   hero and the section title instead, which is what the eye reaches first anyway.
 */
type HomeOverride = { readonly [Key in keyof Localized<typeof enHome>]?: Localized<typeof enHome>[Key] }

/**
 * Every variant, in every language.
 *
 * `Record<Language, …>` rather than an optional per-language map, for the same reason `Dictionary`
 * is: a variant with no German entry would render the default German copy under an English
 * variant's name, which is exactly the silent fallback the translation setup exists to prevent.
 * Adding a language does not compile until its variants are written.
 */
const overrides: Record<Language, Record<CopyVariant, HomeOverride>> = {
  en: {
    files: {},

    // Leads with the one thing no competitor has, and answers the question a stranger actually
    // arrives with. The file story does not disappear — it moves down into the feature grid, where
    // it is an answer rather than an opening argument.
    progressions: {
      hero: {
        eyebrow: "Chord-aware songbook for iOS",
        subheadline: "Finish a song and see what else you can already play.",
        description:
          "Every song is a Markdown file in a folder you choose, and its chord progression is part of the file. \nSongs that share one are put together for you, offline.",
        formatLink: "See the format",
      },
      features: {
        title: "The next song is already half learned.",
        items: [
          {
            title: "Plain markdown",
            body: "Every song is a readable .md file: title, artist, chord progression, lyrics. Nothing here you could not open in a text editor.",
          },
          {
            title: "Works offline",
            body: "Search, transpose, and follow a suggestion with no connection at all. Online import runs only when you request it.",
          },
          {
            title: "Your files stay yours",
            body: "chordlist does not upload your song library. Choose where the files live and share them only when you decide to.",
          },
          {
            title: "Matching progressions",
            body: "Four chords you already know are four chords in a hundred other songs. chordlist puts the songs that share a progression together, so the next one is already half learned.",
          },
        ],
      },
      closingCta: {
        title: "You can already play more than you think.",
        description:
          "Point chordlist at a folder, add the songs you know, and it starts showing you which ones share a progression.",
      },
    },

    // Promotes "Find a song, play it, keep moving." out of the carousel header and into the hero,
    // and rewrites the showcase around it so the sentence is not on the page twice.
    setlist: {
      hero: {
        eyebrow: "Made for the set list",
        subheadline: "Find a song, play it, keep moving.",
        description:
          "Search the whole library, transpose while you play, and let the chart scroll at your pace. \nEvery song stays a Markdown file in a folder you choose.",
        formatLink: "See the format",
      },
      showcase: {
        eyebrow: "On stage and in the practice room",
        title: "Everything that happens between two songs.",
        description:
          "Search and filter your library, transpose as you play, and keep related songs close without giving up the simplicity of ordinary files.",
        video: enHome.showcase.video,
        screenshots: enHome.showcase.screenshots,
      },
      features: {
        title: "Quick on stage, plain on disk.",
        items: [
          {
            title: "Plain markdown",
            body: "Every song is a readable .md file. Write lyrics and chords with nothing but text you already understand.",
          },
          {
            title: "Works offline",
            body: "No signal in the back room is not a problem. Browse, edit, search, and transpose your existing library with no connection at all.",
          },
          {
            title: "Your files stay yours",
            body: "chordlist does not upload your song library. Choose where the files live and share them only when you decide to.",
          },
          {
            title: "Matching progressions",
            body: "Finish a song and see what else you can already play. Songs sharing a chord progression sit together — the raw material of a medley.",
          },
        ],
      },
      closingCta: {
        title: "Bring the whole set list with you.",
        description:
          "Point chordlist at a folder and every chart you need is already on the device, ready before the next song starts.",
      },
    },
  },

  de: {
    files: {},

    progressions: {
      hero: {
        eyebrow: "Songbook für iOS, das Akkorde liest",
        subheadline: "Spiel einen Song zu Ende und sieh, was du sonst schon spielen kannst.",
        description:
          "Jeder Song ist eine Markdown-Datei in einem Ordner deiner Wahl, und die Akkordfolge steht mit in der Datei. \nSongs mit derselben Akkordfolge legt chordlist offline für dich zusammen.",
        formatLink: "Das Format ansehen",
      },
      features: {
        title: "Den nächsten Song kannst du halb schon.",
        items: [
          {
            title: "Einfaches Markdown",
            body: "Jeder Song ist eine lesbare .md-Datei: Titel, Interpret, Akkordfolge, Songtext. Nichts, was du nicht in einem Texteditor öffnen könntest.",
          },
          {
            title: "Funktioniert offline",
            body: "Suchen, transponieren und einem Vorschlag folgen – ganz ohne Verbindung. Der Online-Import läuft nur, wenn du ihn anstößt.",
          },
          {
            title: "Deine Dateien bleiben deine",
            body: "chordlist lädt deine Song-Bibliothek nicht hoch. Du bestimmst, wo die Dateien liegen, und teilst sie nur, wenn du es willst.",
          },
          {
            title: "Passende Akkordfolgen",
            body: "Vier Akkorde, die du kennst, sind vier Akkorde in hundert weiteren Songs. chordlist legt Songs mit derselben Akkordfolge zusammen – den nächsten kannst du damit halb schon.",
          },
        ],
      },
      closingCta: {
        title: "Du kannst mehr spielen, als du denkst.",
        description:
          "Zeig chordlist einen Ordner, leg die Songs ab, die du kennst, und die App zeigt dir, welche davon dieselbe Akkordfolge teilen.",
      },
    },

    setlist: {
      hero: {
        eyebrow: "Gemacht für die Setlist",
        subheadline: "Song finden, spielen, weitermachen.",
        description:
          "Durchsuche die ganze Bibliothek, transponiere beim Spielen und lass den Text in deinem Tempo laufen. \nJeder Song bleibt eine Markdown-Datei in einem Ordner deiner Wahl.",
        formatLink: "Das Format ansehen",
      },
      showcase: {
        eyebrow: "Auf der Bühne und im Proberaum",
        title: "Alles, was zwischen zwei Songs passiert.",
        description:
          "Durchsuche und filtere deine Bibliothek, transponiere beim Spielen und behalte verwandte Songs in Reichweite – ohne die Einfachheit gewöhnlicher Dateien aufzugeben.",
        video: deHome.showcase.video,
        screenshots: deHome.showcase.screenshots,
      },
      features: {
        title: "Schnell auf der Bühne, schlicht auf der Platte.",
        items: [
          {
            title: "Einfaches Markdown",
            body: "Jeder Song ist eine lesbare .md-Datei. Schreib Songtext und Akkorde mit nichts als Text, den du ohnehin verstehst.",
          },
          {
            title: "Funktioniert offline",
            body: "Kein Empfang im Nebenraum ist kein Problem. Deine vorhandene Bibliothek durchsuchen, bearbeiten und transponieren – ganz ohne Verbindung.",
          },
          {
            title: "Deine Dateien bleiben deine",
            body: "chordlist lädt deine Song-Bibliothek nicht hoch. Du bestimmst, wo die Dateien liegen, und teilst sie nur, wenn du es willst.",
          },
          {
            title: "Passende Akkordfolgen",
            body: "Spiel einen Song zu Ende und sieh, was du sonst schon spielen kannst. Songs mit derselben Akkordfolge stehen beieinander – das Rohmaterial für ein Medley.",
          },
        ],
      },
      closingCta: {
        title: "Nimm die ganze Setlist mit.",
        description:
          "Zeig chordlist einen Ordner, und jeder Text, den du brauchst, liegt schon auf dem Gerät – bereit, bevor der nächste Song anfängt.",
      },
    },
  },
}

export function isCopyVariant(value: string): value is CopyVariant {
  return (copyVariants as readonly string[]).includes(value)
}

/**
 * The variant this build renders, from `NEXT_PUBLIC_COPY_VARIANT`.
 *
 * Build-time rather than per-request: the home page is static in two languages, and reading a
 * cookie or a search parameter would opt the whole site into dynamic rendering to answer a question
 * that only changes when someone deploys. On Vercel the switch is an environment variable on a
 * preview branch, so a variant can be read on a real URL before it is promoted.
 *
 * `NEXT_PUBLIC_` because `components/piano-keyboard.tsx` is a client component and calls
 * `dictionary()`, so the value has to survive into the browser bundle.
 *
 * Throws on an unknown value instead of falling back. A typo that silently ships the default is
 * the failure this is meant to make impossible: it would look exactly like a variant that did not
 * work.
 */
function resolveCopyVariant(value: string | undefined): CopyVariant {
  if (!value) return defaultCopyVariant
  if (!isCopyVariant(value)) {
    throw new Error(`NEXT_PUBLIC_COPY_VARIANT is "${value}"; expected one of ${copyVariants.join(", ")}.`)
  }
  return value
}

export const activeCopyVariant = resolveCopyVariant(process.env.NEXT_PUBLIC_COPY_VARIANT)

const baseHomeCopy: Record<Language, Localized<typeof enHome>> = { en: enHome, de: deHome }

/** One language's home copy with a variant's sections swapped in. */
export function homeCopyFor(language: Language, variant: CopyVariant): Localized<typeof enHome> {
  return { ...baseHomeCopy[language], ...overrides[language][variant] }
}
