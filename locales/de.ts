import { siteConfig } from "@/lib/site-config"
import {
  commonCopy as en,
  faqCopy as enFaq,
  homeCopy as enHome,
  imprintCopy as enImprint,
  locale as enLocale,
  metadataCopy as enMetadata,
  pianoCopy as enPiano,
  screenshotGalleryCopy as enScreenshotGallery,
  supportCopy as enSupport,
} from "@/locales/en"
import type { Localized } from "@/locales/types"
import { phrase, term } from "@/locales/vocabulary"

/// German copy for the site.
///
/// **Partial, and deliberately shaped around the home page and the pages a reader is sent to from
/// outside the site.** Translated: `locale`, `commonCopy`, `metadataCopy`, `homeCopy`,
/// `imprintCopy`, `supportCopy`, `faqCopy`, `pianoCopy` and `screenshotGalleryCopy`. `docsCopy`,
/// `pressCopy`, `screensCopy`,
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
    imprint: "Impressum",
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
  faqSearch: {
    label: "Fragen durchsuchen",
    placeholder: "Suchen",
    clear: "Suche zurücksetzen",
    resultCount: (count: number) => (count === 1 ? "1 Frage" : `${count} Fragen`),
    empty: "Keine Frage passt zu dieser Suche.",
  },
  skipToContent: "Zum Inhalt springen",
  notFound: {
    title: "Seite nicht gefunden",
    description: "Diese Seite wurde verschoben oder hat es nie gegeben. Das Songbook gibt es weiterhin.",
    backHome: "Zurück zur Startseite",
  },
} as const

export const imprintCopy: Localized<typeof enImprint> = {
  metadata: {
    title: "Impressum",
    description: `Anbieterkennzeichnung und Kontaktdaten für ${siteConfig.name}.`,
  },
  eyebrow: siteConfig.name,
  title: "Impressum",
  provider: {
    title: "Angaben gemäß § 5 DDG",
    tradingAs: `handelnd unter ${siteConfig.operator}`,
    country: "Deutschland",
    contactLabel: "E-Mail",
  },
  editorial: {
    title: "Verantwortlich für journalistisch-redaktionelle Inhalte",
    introduction: "Verantwortlich gemäß § 18 Abs. 2 MStV:",
    addressReference: "Anschrift wie oben.",
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



export const faqCopy: Localized<typeof enFaq> = {
  metadata: {
    title: "Häufige Fragen",
    description: `Antworten zu Dateien, Datenschutz, Preis, Kompatibilität und Verfügbarkeit von ${siteConfig.name}.`,
  },
  title: "Häufige Fragen",
  introduction: "Die praktischen Details zu deinen Dateien, zum Datenschutz, zur Kompatibilität und zum Start.",
  questions: [
    {
      question: "Wo werden meine Songs gespeichert?",
      keywords: [
        "Speicherort",
        "wo liegen meine Dateien",
        "Pfad",
        "auf meinem iPhone",
        "iCloud Drive",
        "Dateianbieter",
        "lokal",
        "Backup",
        "Sicherung",
        "Synchronisierung",
        "storage",
        "location",
        "icloud",
        "sync",
        "backup",
      ],
      answer: `In einem ${term("folder", "de")}, den du selbst über die Dateien-Auswahl bestimmst. ${siteConfig.name} liest und schreibt die ${term("Markdown", "de")}-Dateien in diesem Ordner und lädt deine ${term("library", "de")} nirgendwohin hoch. Wählst du einen Ordner, den iCloud Drive oder ein anderer Anbieter verwaltet, kann dieser Anbieter ihn nach deinen Einstellungen synchronisieren.`,
    },
    {
      question: `Kann ich meine Songs auch ohne ${siteConfig.name} öffnen?`,
      keywords: [
        "Export",
        "exportieren",
        "portabel",
        "Lock-in",
        "andere Apps",
        "Markdown-Editor",
        "Texteditor",
        "Obsidian",
        "Klartext",
        "woanders öffnen",
        "export",
        "other apps",
        "plain text",
      ],
      answer: `Ja. Jeder Song ist eine gewöhnliche ${term("Markdown", "de")}-Datei mit Titel, ${term("artist", "de")}, ${term("chord progression", "de")}, ${term("tag", "de")}s und ${term("lyrics", "de")}. Du kannst diese Dateien mit jeder anderen kompatiblen App öffnen, kopieren, verschieben, sichern oder bearbeiten.`,
    },
    {
      question: "Funktioniert die App offline?",
      keywords: [
        "offline",
        "kein Internet",
        "kein Empfang",
        "Flugmodus",
        "ohne WLAN",
        "im Flugzeug",
        "Probe",
        "Auftritt",
        "no internet",
        "airplane mode",
      ],
      answer: `Ja. Du kannst offline stöbern, bearbeiten, suchen, ${term("transpose", "de")} und aus deiner lokalen ${term("library", "de")} spielen. Nur der Import eines Songs von einer Webseite braucht eine Verbindung, um die angeforderte Seite zu laden.`,
    },
    {
      question: `Sammelt ${siteConfig.name} Analysedaten?`,
      keywords: [
        "Datenschutz",
        "Tracking",
        "Telemetrie",
        "TelemetryDeck",
        "Datenerhebung",
        "DSGVO",
        "Analyse abschalten",
        "personenbezogene Daten",
        "Akkorddaten teilen",
        "privacy",
        "analytics",
        "opt out",
        "gdpr",
      ],
      answer: `Nur wenn du es erlaubst. Analysedaten sind aus, bis du die Frage bejahst, die die App nach dem Einstieg stellt; die Entscheidung lässt sich jederzeit in den Einstellungen ändern. Sind sie an, werden anonyme Nutzungs- und Geräteinformationen über TelemetryDeck gesendet. Das Teilen von Songtiteln, ${term("artist", "de")}s und ${term("chord progression", "de")}n ist eine getrennte Zustimmung; ${term("lyrics", "de")} und ${term("tag", "de")}s sind nie dabei.`,
    },
    {
      question: "Wann erscheint die App?",
      keywords: [
        "Release",
        "Erscheinungsdatum",
        "Start",
        "verfügbar",
        "Verfügbarkeit",
        "Vorbestellung",
        "vorbestellen",
        "TestFlight",
        "Beta",
        "release date",
        "launch",
        "preorder",
      ],
      answer: `${siteConfig.name} erscheint am ${launchDate} und lässt sich im App Store schon vorbestellen. Eine Vorbestellung lädt die App am Erscheinungstag automatisch auf dein Gerät. Bis dahin läuft eine kostenlose öffentliche Beta über TestFlight.`,
    },
    {
      question: "Was wird die App kosten?",
      keywords: [
        "Preis",
        "Kosten",
        "kostenlos",
        "gratis",
        "bezahlen",
        "In-App-Kauf",
        "einmalig",
        "Abo",
        "Songlimit",
        "price",
        "cost",
        "free",
        "subscription",
      ],
      answer: `Geplant ist ein kostenloser Download für bis zu ${siteConfig.freeSongLimit} Songs, mit einem optionalen einmaligen Kauf für „${term("unlimited songs", "de")}“.`,
    },
    {
      question: "Was ist chordlink?",
      keywords: [
        "chordlink",
        "NFC",
        "Tag",
        "Aufkleber",
        "Zubehör",
        "Hardware",
        "3D-Druck",
        "DIY",
        "Geschenk",
        "kaufen",
        "nfc tag",
        "buy",
      ],
      answer: `Ein nummerierter, 3D-gedruckter NFC-Tag, den du an dein Instrument oder dessen Koffer setzt. Beim ersten Scannen legst du fest, was er tut – die ${term("library", "de")} öffnen, zufällig einen Song wählen oder einen Song anlegen – und jedes weitere Antippen führt sofort dorthin. Die erste Edition kostet ${siteConfig.chordlink.price.display} inklusive Versand innerhalb Deutschlands und enthält ${siteConfig.name} unlimited. Mit einem eigenen 3D-Drucker kannst du den Modellgenerator und die Anleitung zum Programmieren eines Tags kostenlos nutzen.`,
      link: { href: "/de/chordlink", label: "chordlink ansehen" },
    },
    {
      question: "Welche Geräte werden unterstützt?",
      keywords: [
        "Kompatibilität",
        "Voraussetzungen",
        "iPhone",
        "iPad",
        "iPadOS",
        "iOS-Version",
        "altes iPhone",
        "Mac",
        "unterstützte Geräte",
        "compatibility",
        "requirements",
      ],
      answer: `${siteConfig.name} ist für iPhone und iPad gemacht und setzt iOS oder iPadOS ${siteConfig.minimumOSVersion} oder neuer voraus.`,
    },
    {
      question: "Wird es eine Android-Version geben?",
      keywords: ["Android", "Samsung", "Pixel", "Google Play", "Windows", "Web-Version", "Browser", "Desktop"],
      answer: "Eine Android-Version ist derzeit nicht geplant.",
    },
  ],
  contactPrefix: "Noch eine Frage? Schreib an",
} as const

export const supportCopy: Localized<typeof enSupport> = {
  metadata: {
    title: "Support",
    description: `Hilfe zu ${siteConfig.name}: Songs hinzufügen, fehlgeschlagene Käufe, Rückerstattungen und wie du jemanden erreichst.`,
  },
  title: "Support",
  introduction:
    "Sieh zuerst nach, ob deine Frage unten schon beantwortet ist. Passt keine davon, erreichst du über diese Adresse jemanden, der sich das ansieht.",
  contact: {
    label: "Support per E-Mail",
    hint: "Erkläre, was deine Erwartung war und was stattdessen passiert ist. Gib bitte auch dein Gerät, dessen iOS-Version und die App-Version unten in den Einstellungen an. <code>Einstellungen → Feedback senden</code> öffnet eine Nachricht, in der diese Angaben schon ausgefüllt sind.",
  },
  questionsTitle: "Häufige Fragen",
  searchEmptyHint: "Über die Adresse oben erreichst du weiterhin jemanden.",
  questions: [
    {
      question: `Wie bekomme ich meine Songs in ${siteConfig.name}?`,
      keywords: [
        "importieren",
        "Import",
        "hinzufügen",
        "neuer Song",
        "anlegen",
        "übertragen",
        "umziehen",
        "migrieren",
        "teilen",
        "Teilen-Menü",
        "Share-Erweiterung",
        "Link einfügen",
        "URL",
        "Ultimate Guitar",
        "Genius",
        "Tabs",
        "Einstieg",
        "erster Start",
        "Ordner wählen",
        "import",
        "add songs",
        "share",
        "share sheet",
        "getting started",
      ],
      answer: `Wähle beim ersten Öffnen der App den ${term("folder", "de")}, in dem deine ${term("library", "de")} liegt. Später lässt er sich unter <code>Einstellungen → Song-Ordner</code> ändern. Danach kannst du Songs auf mehreren Wegen hinzufügen: in der App schreiben, eine ${term("lyrics", "de")}- oder Tab-URL einfügen, eine unterstützte Seite aus einer anderen App an ${siteConfig.name} teilen oder Dateien als <code>Artist/Songtitel.md</code> mit „Dateien“ oder dem Finder in den Ordner kopieren und die ${term("library", "de")} durch Herunterziehen neu einlesen.`,
      link: { href: "/docs#adding-songs", label: "Wie Hinzufügen und Importieren funktioniert (auf Englisch)" },
    },
    {
      question: "Meine Songs tauchen nicht auf.",
      keywords: [
        "fehlen",
        "fehlt",
        "verschwunden",
        "leer",
        "leere Bibliothek",
        "wird nicht angezeigt",
        "finde meine Songs nicht",
        "Synchronisierung",
        "synchronisieren",
        "iCloud",
        "offline",
        "herunterladen",
        "aktualisieren",
        "neu laden",
        "Unterordner",
        "verschachtelt",
        "Ordnerstruktur",
        "Obsidian",
        "Vault",
        "missing",
        "empty library",
        "sync",
        "offline",
        "keep downloaded",
        "refresh",
      ],
      answer: `${siteConfig.name} liest ${term("Markdown", "de")}-Dateien genau eine Ebene unter dem Song-Ordner: Ein Song muss also in einem Artist-Ordner als <code>Artist/Songtitel.md</code> liegen – eine Datei direkt im Ordner oder tiefer verschachtelt taucht nicht auf. Zieh in der ${term("library", "de")} nach unten, um sie neu einzulesen, wenn du Dateien woanders bearbeitet hast. Liegt der Ordner in iCloud Drive, kann sein Inhalt noch in der Cloud statt auf dem Gerät liegen; markiere ihn in „Dateien“ mit <code>Heruntergeladen behalten</code>, bevor du zur Probe aufbrichst.`,
      link: { href: "/docs#offline", label: "iCloud-Ordner offline verfügbar halten (auf Englisch)" },
    },
    {
      question: `„${term("unlimited songs", "de")}“ wurde nach dem Kauf nicht freigeschaltet.`,
      keywords: [
        "freischalten",
        "freigeschaltet",
        "gesperrt",
        "Kauf",
        "gekauft",
        "bezahlt",
        "wiederherstellen",
        "In-App-Kauf",
        "Abo",
        "Abonnement",
        "Upgrade",
        "Pro",
        "Premium",
        "unbegrenzt",
        "Songlimit",
        "Apple-Account",
        "falscher Account",
        "neues iPhone",
        "anderes Gerät",
        "unlock",
        "unlimited songs",
        "restore purchases",
        "purchase",
        "subscription",
        "locked",
      ],
      answer: `Öffne <code>Einstellungen → ${siteConfig.name} unlimited → ${term("unlimited songs", "de")} freischalten</code> und tippe in dem Bildschirm, der sich öffnet, auf <code>Käufe wiederherstellen</code>. Die Freischaltung gehört zum App-Store-Account, der sie gekauft hat, und nicht zum Gerät – sie lässt sich also überall wiederherstellen, wo dieser Account angemeldet ist. Prüfe deshalb zuerst, ob auf dem Gerät der richtige Account angemeldet ist. Bleibt es gesperrt, schreib mit dem Beleg aus dem App Store an ${siteConfig.contact.support}; wir kümmern uns darum.`,
    },
    {
      question: "Ich möchte mein Geld zurück.",
      keywords: [
        "Rückerstattung",
        "Erstattung",
        "Geld zurück",
        "stornieren",
        "Stornierung",
        "abgebucht",
        "doppelt abgebucht",
        "Abrechnung",
        "Rechnung",
        "Beleg",
        "Problem melden",
        "Apple Support",
        "refund",
        "money back",
        "cancel",
        "billing",
        "receipt",
        "report a problem",
      ],
      answer: `Käufe in der App laufen über den App Store, und nur Apple kann sie erstatten: Stell die Anfrage auf reportaproblem.apple.com mit dem Apple-Account, der den Kauf getätigt hat. Wenn etwas nicht funktioniert, schreib zuerst an ${siteConfig.contact.support} – eine Lösung ist meist schneller da als eine Rückerstattung.`,
      link: { href: "https://reportaproblem.apple.com", label: "Rückerstattung bei Apple anfragen" },
    },
    {
      question: "Ich habe eine Frage zu einer chordlink-Bestellung.",
      keywords: [
        "Bestellung",
        "Versand",
        "Lieferung",
        "Sendungsverfolgung",
        "Paket",
        "nicht angekommen",
        "Rückgabe",
        "Widerruf",
        "Stripe",
        "einlösen",
        "Einlöse-Link",
        "NFC",
        "Tag",
        "Aufkleber",
        "order",
        "shipping",
        "delivery",
        "tracking",
        "return",
        "redeem",
      ],
      answer: `chordlink ist ein physisches Produkt, das über Stripe verkauft und an Adressen in Deutschland geliefert wird. Bestellung, Lieferung, Widerruf und Rückerstattung laufen deshalb per E-Mail statt über Apple – auch der Einlöse-Link für ${siteConfig.name} unlimited, der nach der Bestellung kommt. Schreib von der Adresse, mit der du bestellt hast, an ${siteConfig.contact.support}.`,
      link: { href: "/de/chordlink/terms", label: "chordlink: Bedingungen, Widerruf und Rückgabe" },
    },
    {
      question: "Wie melde ich einen Fehler oder wünsche mir eine Funktion?",
      keywords: [
        "Fehler",
        "Bug",
        "Absturz",
        "abgestürzt",
        "hängt",
        "kaputt",
        "funktioniert nicht",
        "Funktionswunsch",
        "Vorschlag",
        "Idee",
        "Feedback",
        "Beta",
        "TestFlight",
        "Entwickler kontaktieren",
        "bug",
        "crash",
        "not working",
        "feature request",
        "feedback",
      ],
      answer: `<code>Einstellungen → Feedback senden</code> öffnet eine E-Mail an ${siteConfig.contact.feedback}, in der App- und iOS-Version schon eingetragen sind. Aus einer TestFlight-Version kannst du zusätzlich <code>Beta-Feedback senden</code> in der TestFlight-App nutzen; das hängt einen Screenshot und die Gerätedaten an.`,
      link: { href: `mailto:${siteConfig.contact.feedback}`, label: "Feedback senden" },
    },
  ],
  faq: {
    prefix: "Suchst du eher Produktinfos als Hilfe? Die",
    link: "häufig gestellten Fragen",
    suffix: " beantworten Fragen zu Dateien, Datenschutz, Preis, Kompatibilität und Verfügbarkeit.",
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
