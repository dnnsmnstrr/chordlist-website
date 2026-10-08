/**
 * The words on the App Store screenshots, per language.
 *
 * Keyed by language, then by the slide id in `CONFIG.slides` of
 * `scripts/build-app-store-screenshots.mjs`, which owns the art direction — screenshot selection,
 * colours, photography, geometry. Copy lives here so a translation is a new key rather than a
 * second copy of the layout, the same split the site keeps between `locales/` and its components.
 *
 * Every language listed here must be a language in `VOCABULARY.md`, and product wording is read
 * from it rather than retyped, so the images cannot drift from the app, the site, and the listing.
 * The builder checks that each language covers every slide.
 */
import { term } from "./vocabulary.mjs"

/// The shared terms, in the form the German sentences below need them. `VOCABULARY.md` carries the
/// singular, so the agreed word still governs the wording and only the plural suffix is added here.
const deWords = {
  songbook: term("songbook", "de"),
  lyrics: `${term("lyrics", "de")}e`,
  chord: term("chord", "de"),
  chords: `${term("chord", "de")}e`,
  chordProgression: term("chord progression", "de"),
  library: term("library", "de"),
  tags: `${term("tag", "de")}s`,
  appleMusic: term("Apple Music", "de"),
}

export const appStoreCopy = {
  en: {
    "01-library": {
      eyebrow: "Your songbook",
      headline: ["Your songs.", "Ready to play."],
      supporting: "Keep lyrics and chords together, beautifully organized.",
    },
    "02-find": {
      eyebrow: "Instant access",
      headline: ["Find any song", "in seconds."],
      supporting: "Search your library and filter by the tags that matter.",
    },
    "03-song-sheet": {
      eyebrow: "Chord matching",
      headline: ["Songs that share", "your chords."],
      supporting: "Every song suggests others in your library built on the same progression.",
    },
    "04-flow": {
      eyebrow: "Built for adding songs",
      // Not a second speed claim: "02-find" already owns the one about seconds, and two slides
      // making the same promise reads as filler. This one is about how little the adding costs you.
      headline: ["Adding a song", "is the easy part."],
      supporting:
        "Use the purpose-built chord keyboard, fill in details from Apple Music or import from the web.",
    },
    "05-stage": {
      eyebrow: "Performance mode",
      headline: ["Built for", "the stage."],
      supporting: "Readable, distraction-free song sheets when it counts.",
    },
  },
  de: {
    "01-library": {
      eyebrow: `Dein ${deWords.songbook}`,
      headline: ["Deine Songs.", "Sofort spielbereit."],
      supporting: `${deWords.lyrics} und ${deWords.chords} bleiben zusammen, übersichtlich sortiert.`,
    },
    "02-find": {
      eyebrow: "Sofort zur Hand",
      headline: ["Jeden Song finden.", "Sekundenschnell."],
      supporting: `Durchsuche deine ${deWords.library} und filtere nach den ${deWords.tags}, die zählen.`,
    },
    "03-song-sheet": {
      eyebrow: `Passende ${deWords.chords}`,
      headline: ["Songs mit einer", `${deWords.chordProgression}.`],
      supporting: `Jeder Song schlägt weitere aus deiner ${deWords.library} vor, die auf derselben ${deWords.chordProgression} aufbauen.`,
    },
    "04-flow": {
      // "hinzufügen" rather than "anlegen": it is what the app's own button says, and this slide
      // is a picture of that button's screen.
      eyebrow: "Songs hinzufügen",
      // "Sekunden" belongs to "02-find" alone, for the same reason the English line gave it up.
      headline: ["Ein neuer Song", "ist schnell erfasst."],
      supporting: `Nutze die eigens gebaute ${deWords.chord}-Tastatur, übernimm Details aus ${deWords.appleMusic} oder importiere aus dem Web.`,
    },
    "05-stage": {
      eyebrow: "Bühnenmodus",
      headline: ["Gemacht für", "die Bühne."],
      supporting: `Gut lesbare ${deWords.lyrics} ohne Ablenkung, wenn es darauf ankommt.`,
    },
  },
}

/// The languages the App Store sets can be built in, in upload order.
export const copyLanguages = Object.keys(appStoreCopy)

/**
 * The words on the creative assets — the product page header, the search results asset, and the
 * universal asset that can serve as both.
 *
 * Nothing new is written here. The header and universal assets carry the tagline — whole, or its
 * opening words closed with a full stop — hand-broken into lines that
 * `scripts/build-app-store-creative.mjs` checks against `VOCABULARY.md`, and the search
 * results asset repeats the first screenshot's message, which is the one the listing leads with.
 * Apple shows these at a fraction of their pixel size, so they carry a headline and no paragraph.
 *
 * In-App Event media has no entry: the App Store sets the event's name, badge, and description over
 * it from App Store Connect, so words in the image would say everything twice.
 */
export const creativeCopy = {
  en: {
    tagline: ["Your lyrics", "and chords,", "as files."],
    search: "01-library",
  },
  de: {
    tagline: ["Deine Songtexte", "und Akkorde –", "immer mit dabei."],
    search: "01-library",
  },
}
