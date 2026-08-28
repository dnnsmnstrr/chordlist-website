import { siteConfig } from "@/lib/site-config"
import {
  commonCopy as en,
  homeCopy as enHome,
  locale as enLocale,
  metadataCopy as enMetadata,
  pianoCopy as enPiano,
  screenshotGalleryCopy as enScreenshotGallery,
} from "@/locales/en"
import type { Localized } from "@/locales/types"
import { phrase } from "@/locales/vocabulary"

/// German copy for the site.
///
/// **Partial, and deliberately shaped around the home page.** Everything the home page and the
/// chrome around it render is translated: `locale`, `commonCopy`, `metadataCopy`, `homeCopy`,
/// `pianoCopy` and `screenshotGalleryCopy`. `docsCopy`, `faqCopy`, `pressCopy`, `screensCopy`,
/// `privacyCopy`, `blogCopy` and `galleryCopy` are not, so those pages are English-only and are
/// still linked at their English URLs from the German header and footer. `locales/index.ts` is
/// the registry that decides which of these a route gets; adding a page to the German site means
/// translating its copy object here and widening `Dictionary` there.
///
/// Each object is typed `Localized<typeof …>` — the English shape with its wording set free — so
/// TypeScript refuses a translation that has drifted structurally: a key added to `en.ts` breaks
/// the build here rather than silently rendering English.
///
/// Wording that the app also uses comes from `@/locales/vocabulary`, which is synced out of the
/// app repository's `VOCABULARY.md`. Do not retype those terms.

export const locale: Localized<typeof enLocale> = {
  htmlLang: "de",
  openGraph: "de_DE",
  dateLocale: "de-DE",
} as const

const launchDate = new Intl.DateTimeFormat(locale.dateLocale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${siteConfig.launchDate}T00:00:00Z`))

const isEvening =
  new Date().getTime() >= new Date().setHours(18, 0, 0, 0) ||
  new Date().getTime() < new Date().setHours(2, 0, 0, 0)

export const commonCopy: Localized<typeof en> = {
  appName: siteConfig.name,
  appDescription: phrase("description", "de"),
  tagline: phrase("tagline", "de"),
  navigation: {
    homeLabel: `${siteConfig.name} Startseite`,
    languageLabel: "Sprache",
    features: "Funktionen",
    footerLabel: "Fußzeile",
    docs: "Doku",
    blog: "Blog",
    faq: "FAQ",
    support: "Support",
    press: "Presse",
    screens: "Screens",
    socialPosts: "Social Posts",
    privacy: "Datenschutz",
    x: "X",
    instagram: "Instagram",
  },
  appCta: {
    download: "Laden",
    testFlight: "TestFlight beitreten",
    preorder: "Vorbestellen",
    comingSoon: "Demnächst",
    largeSuffix: "für iOS",
    note: {
      testFlight: `Kostenlose öffentliche Beta für iPhone und iPad. Benötigt Apples TestFlight-App und iOS ${siteConfig.minimumOSVersion} oder neuer.`,
      download: `Kostenloser Download für iPhone und iPad. Benötigt iOS ${siteConfig.minimumOSVersion} oder neuer.`,
      preorder: `Vorbestellung für iPhone und iPad. Benötigt iOS ${siteConfig.minimumOSVersion} oder neuer.`,
      comingSoon: `Kommt für iPhone und iPad, ab iOS ${siteConfig.minimumOSVersion}.`,
    },
    betaAside: {
      prefix: `Du willst es vor dem offiziellen Release?`,
      link: "Zur TestFlight-Beta",
      suffix: ".",
    },
  },
  skipToContent: "Zum Inhalt springen",
  notFound: {
    title: "Seite nicht gefunden",
    description: "Diese Seite wurde verschoben oder hat es nie gegeben. Das Songbook gibt es weiterhin.",
    backHome: "Zurück zur Startseite",
  },
} as const

export const metadataCopy: Localized<typeof enMetadata> = {
  defaultTitle: `${siteConfig.name} — Local-first Songbook für Songtexte und Akkorde`,
  titleTemplate: `%s — ${siteConfig.name}`,
  category: "Musik",
  defaultDescription:
    `${siteConfig.name} ist ein Local-first-Songbook für iPhone und iPad. Jeder Song bleibt eine einfache ` +
    "Markdown-Datei in einem Ordner deiner Wahl – offline und ohne Konto.",
  socialTitle: `${siteConfig.name} — ${commonCopy.tagline}`,
  socialDescription: "Ein Local-first-Songbook für iPhone und iPad, in Markdown.",
  twitterDescription:
    `Ein Songbook aus Dateien, die dir gehören. ${siteConfig.name} legt jeden Song als einfache ` +
    "Markdown-Datei auf iPhone und iPad ab – deine Songtexte und Akkorde bleiben lesbar, portabel und offline verfügbar.",
  socialImageAlt: `${siteConfig.name}: ${commonCopy.tagline}`,
  // Search terms as a German player would type them, not a translation of the English list: the
  // product words that stay English here (Songbook, Markdown, local-first) are the ones VOCABULARY.md
  // keeps untranslated, so they are what someone actually searches for.
  keywords: [
    "Songbook App",
    "Songtexte und Akkorde",
    "Akkorde App",
    "Markdown Songbook",
    "Songbook als Textdateien",
    "local-first",
    "Songbook offline",
    "Akkorde transponieren",
    "Songbook iPhone",
    "Songbook iPad",
    "Obsidian",
  ],
} as const

export const homeCopy: Localized<typeof enHome> = {
  chordlinkBanner: {
    eyebrow: "Neu · chordlink",
    title: "Instrument antippen und chordlist öffnen.",
    action: "chordlink ansehen",
  },
  hero: {
    eyebrow: "Local-first Songbook für iOS",
    subheadline:
      "Ein Offline-Songbook für alle, die ihre Songs auf iPhone und iPad dabeihaben wollen.",
    description: `${siteConfig.name} sichert jeden Song als Markdown-Datei in einem Ordner deiner Wahl. \nKeine Accounts, keine Cloud-Synchronisierung. Deine Dateien bleiben portabel und in deiner Hand.`,
    formatLink: "Das Format ansehen",
  },
  showcase: {
    eyebrow: "Gemacht für die Setlist",
    title: "Song finden, spielen, weitermachen.",
    description:
      "Durchsuche und filtere deine Bibliothek, transponiere beim Spielen und behalte verwandte Songs in Reichweite – ohne die Einfachheit gewöhnlicher Dateien aufzugeben.",
    video: {
      title: "chordlist in Bewegung",
      description:
        "Eine kurze Tour durch Bibliothek, Suche, Auto-Scroll, Transposition und Farbanpassung.",
      alt: "Kurzes chordlist-Produktvideo abspielen",
    },
    screenshots: [
      {
        title: "Song-Bibliothek",
        description:
          "Eine nach Interpret gruppierte Bibliothek, in der Akkordfolgen und Tags auf einen Blick sichtbar sind.",
      },
      {
        title: "Song-Detail",
        description:
          "Songtext und Akkorde lesen, beim Spielen transponieren und Vorschläge mit passenden Akkordfolgen finden.",
      },
      {
        title: "Song-Editor",
        description:
          "Eine portable Song-Datei anlegen – mit Titel, Interpret, Akkordfolge, Tags und Songtext.",
      },
    ],
  },
  features: {
    title: "Gebaut rund um Dateien, die dir gehören.",
    items: [
      {
        title: "Einfaches Markdown",
        body: "Jeder Song ist eine lesbare .md-Datei. Schreib Songtext und Akkorde mit nichts als Text, den du ohnehin verstehst.",
      },
      {
        title: "Funktioniert offline",
        body: "Deine vorhandene Bibliothek durchsuchen, bearbeiten und transponieren – ganz ohne Verbindung. Der Online-Import läuft nur, wenn du ihn anstößt.",
      },
      {
        title: "Deine Dateien bleiben deine",
        body: `${siteConfig.name} lädt deine Song-Bibliothek nicht hoch. Du bestimmst, wo die Dateien liegen, und teilst sie nur, wenn du es willst.`,
      },
      {
        title: "Passende Akkordfolgen",
        body: "Spiel einen Song zu Ende und sieh, was du sonst schon spielen kannst. Songs mit derselben Akkordfolge werden automatisch erkannt und vorgeschlagen.",
      },
    ],
  },
  lyricPreview: {
    title: "Ein Song, eine Datei.",
    description:
      "Die Akkorde stehen direkt über den Worten, sodass du im selben Blick lesen und spielen kannst. Das hier ist eine echte Datei – lade sie und öffne sie, wo du willst.",
    download: "Laden",
    downloadLabel: "Beispiel-Song laden",
    openInApp: `Diesen Song in ${siteConfig.name} öffnen`,
    frontmatterHelp:
      "Frontmatter: Metadaten zum Song, die am Anfang der Datei stehen. Die App nutzt sie für Akkordfolgen und weitere Angaben zum Song.",
    frontmatterHelpLabel: "Was ist Frontmatter?",
  },
  closingCta: {
    title: `Starte dein Songbook ${isEvening ? "heute Abend" : "heute"}.`,
    description: `Zeig ${siteConfig.name} einen Ordner, und dein erster Song ist schon eine Datei, die dir gehört – lesbar, portabel und überallhin mitzunehmen.`,
  },
} as const

export const pianoCopy: Localized<typeof enPiano> = {
  label: "Interaktive Klaviatur",
  playNote: (note: string) => `Note ${note} spielen`,
  chordModeHint: "Drücke A–G dreimal schnell hintereinander für den Akkordmodus",
  chordModeActive: "Akkordmodus · Umschalt für Moll · Esc zum Beenden",
} as const

export const screenshotGalleryCopy: Localized<typeof enScreenshotGallery> = {
  viewFullscreen: (title: string) => `${title} im Vollbild ansehen`,
  download: (title: string) => `${title} herunterladen`,
  downloadPng: "PNG herunterladen",
  close: "Vollbild schließen",
  previous: "Vorheriges Bild",
  next: "Nächstes Bild",
} as const

// Referenced so the launch date stays wired up the way `en.ts` has it; the objects that use it are
// not translated yet.
export const launchDateDisplay = launchDate
