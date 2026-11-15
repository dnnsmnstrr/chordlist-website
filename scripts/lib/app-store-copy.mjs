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
 *
 * A slide's words belong to its message, not to a device. The folded iPhone Duo's outer display
 * shows the same five screens as the iPhone, so it reads these entries unchanged, and the unfolded
 * inner display reads two of them; a device only gets copy of its own when it shows a screen no
 * other device does.
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

/// French: `VOCABULARY.md` carries *paroles* already plural and the singular of the rest.
const frWords = {
  songbook: term("songbook", "fr"),
  lyrics: term("lyrics", "fr"),
  chords: `${term("chord", "fr")}s`,
  chordProgression: term("chord progression", "fr"),
  library: term("library", "fr"),
  tags: `${term("tag", "fr")}s`,
  appleMusic: term("Apple Music", "fr"),
}

/// Spanish: *letras* is the plural VOCABULARY.md asks for when it means several songs.
const esWords = {
  songbook: term("songbook", "es"),
  lyrics: `${term("lyrics", "es")}s`,
  chords: `${term("chord", "es")}s`,
  chordProgression: term("chord progression", "es"),
  library: term("library", "es"),
  tags: `${term("tag", "es")}s`,
  appleMusic: term("Apple Music", "es"),
}

const capitalized = (word) => word.charAt(0).toUpperCase() + word.slice(1)

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
  fr: {
    "01-library": {
      eyebrow: `Ton ${frWords.songbook}`,
      headline: ["Tes chansons.", "Prêtes à jouer."],
      supporting: `${capitalized(frWords.lyrics)} et ${frWords.chords} restent ensemble, joliment rangés.`,
    },
    "02-find": {
      eyebrow: "Accès instantané",
      // "en quelques secondes" runs past the iPhone's column; "en un instant" keeps the promise.
      headline: ["Chaque chanson", "en un instant."],
      supporting: `Cherche dans ta ${frWords.library} et filtre selon les ${frWords.tags} qui comptent.`,
    },
    "03-song-sheet": {
      eyebrow: `${capitalized(frWords.chords)} en commun`,
      headline: ["Même grille,", "autres chansons."],
      supporting: `Chaque chanson t’en suggère d’autres de ta ${frWords.library}, construites sur la même ${frWords.chordProgression}.`,
    },
    "04-flow": {
      // "Ajouter", as the app's own button says on the screen this slide shows.
      eyebrow: "Ajouter des chansons",
      headline: ["Ajouter une chanson,", "c’est facile."],
      supporting: `Utilise le clavier d’${frWords.chords} dédié, récupère les infos depuis ${frWords.appleMusic} ou importe depuis le web.`,
    },
    "05-stage": {
      eyebrow: "Mode scène",
      headline: ["Pensé pour", "la scène."],
      supporting: `Des ${frWords.lyrics} lisibles et sans distraction, quand ça compte.`,
    },
  },
  es: {
    "01-library": {
      eyebrow: `Tu ${esWords.songbook}`,
      headline: ["Tus canciones.", "Listas para tocar."],
      supporting: `${capitalized(esWords.lyrics)} y ${esWords.chords} juntos, bien organizados.`,
    },
    "02-find": {
      eyebrow: "Acceso inmediato",
      headline: ["Cualquier canción,", "en segundos."],
      supporting: `Busca en tu ${esWords.library} y filtra por las ${esWords.tags} que importan.`,
    },
    "03-song-sheet": {
      eyebrow: `${capitalized(esWords.chords)} en común`,
      headline: ["Canciones con", "tus acordes."],
      supporting: `Cada canción te sugiere otras de tu ${esWords.library} con la misma ${esWords.chordProgression}.`,
    },
    "04-flow": {
      // "Añadir", as the app's own button says on the screen this slide shows.
      eyebrow: "Añadir canciones",
      headline: ["Añadir canciones", "es lo más fácil."],
      supporting: `Usa el teclado de ${esWords.chords} diseñado para ello, completa los datos desde ${esWords.appleMusic} o importa desde la web.`,
    },
    "05-stage": {
      eyebrow: "Modo escenario",
      headline: ["Hecho para", "el escenario."],
      supporting: `${capitalized(esWords.lyrics)} y ${esWords.chords} legibles, sin distracciones, cuando más importa.`,
    },
  },
}

/**
 * Languages whose sets borrow another language's captures until their own are taken: the frames
 * speak the language, the interface inside them does not yet. A stopgap so the listing has
 * translated words at all — both builders announce every borrowed set, and a language's own
 * captures replace the borrowed ones the moment they exist, device by device: German has its own
 * iPhone and iPad captures and borrows only for the iPhone Duo. Delete an entry once it has captures.
 */
export const borrowedCaptures = {
  de: "en",
  fr: "en",
  es: "en",
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
  fr: {
    tagline: ["Tes paroles", "et tes accords,", "en fichiers."],
    search: "01-library",
  },
  es: {
    tagline: ["Tus letras", "y acordes,", "como archivos."],
    search: "01-library",
  },
}
