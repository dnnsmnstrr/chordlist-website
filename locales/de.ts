import { siteConfig } from "@/lib/site-config"
import { commonCopy as en, homeCopy as enHome, locale as enLocale, metadataCopy as enMetadata } from "@/locales/en"
import type { Localized } from "@/locales/types"
import { phrase } from "@/locales/vocabulary"

/// German copy for the site.
///
/// **Partial.** `locale`, `commonCopy`, `metadataCopy` and `homeCopy` are translated; `docsCopy`,
/// `faqCopy`, `pressCopy`, `screensCopy`, `privacyCopy`, `blogCopy`, `galleryCopy`,
/// `screenshotGalleryCopy` and `pianoCopy` are not, and the site still imports `@/locales/en`
/// everywhere. Wiring locale selection and routing is the next step — see the German localization
/// section of the app repository's AGENTS.md.
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
} as const

export const metadataCopy: Localized<typeof enMetadata> = {
  defaultTitle: `${siteConfig.name} — Local-first Songbook für Songtexte und Akkorde`,
  titleTemplate: `%s — ${siteConfig.name}`,
  category: "Musik",
  defaultDescription:
    `${siteConfig.name} is a local-first songbook for iPhone and iPad. Every song stays a plain Markdown ` +
    "file in a folder you choose — offline, with no account.",
  socialTitle: `${siteConfig.name} — ${commonCopy.tagline}`,
  socialDescription: "A local-first songbook for iPhone and iPad, in Markdown.",
  twitterDescription:
    `A songbook made of files you own. ${siteConfig.name} keeps every song as a plain Markdown file on ` +
    "iPhone and iPad, so your lyrics and chords stay readable, portable, and available offline.",
  socialImageAlt: `${siteConfig.name}: ${commonCopy.tagline}`,
  keywords: [
    "songbook app",
    "lyrics and chords",
    "chord charts",
    "markdown songbook",
    "plain text songbook",
    "local-first",
    "offline songbook",
    "transpose chords",
    "iPhone songbook app",
    "iPad songbook app",
    "Obsidian",
  ],
} as const

export const homeCopy: Localized<typeof enHome> = {
  hero: {
    eyebrow: "Local-first Songbook für iOS",
    subheadline:
      "Ein Offline-Songbook für alle, die ihre Charts auf iPhone und iPad dabeihaben wollen.",
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
        title: "Kein Lock-in",
        body: "Exportiere und verschiebe deine Dateien jederzeit. Öffne sie in jedem Editor – die Daten gehören immer dir.",
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

// Referenced so the launch date stays wired up the way `en.ts` has it; the objects that use it are
// not translated yet.
export const launchDateDisplay = launchDate
