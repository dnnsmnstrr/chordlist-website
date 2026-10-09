import type { BlogTag } from "@/lib/blog-tags"
import { siteConfig } from "@/lib/site-config"

export const locale = {
  htmlLang: "en",
  openGraph: "en_US",
  dateLocale: "en-GB",
} as const

const launchDate = new Intl.DateTimeFormat(locale.dateLocale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${siteConfig.launchDate}T00:00:00Z`))

const isEvening = new Date().getTime() >= new Date().setHours(18, 0, 0, 0) || new Date().getTime() < new Date().setHours(2, 0, 0, 0)

export const commonCopy = {
  appName: siteConfig.name,
  appDescription:
    "A local-first songbook for iPhone and iPad that keeps lyrics and chords in portable Markdown files you control.",
  tagline: "Your lyrics and chords, as files in your pocket.",
  navigation: {
    homeLabel: `${siteConfig.name} home`,
    languageLabel: "Language",
    features: "Features",
    footerLabel: "Footer",
    docs: "Docs",
    blog: "Blog",
    faq: "FAQ",
    support: "Support",
    press: "Press",
    screens: "Screens",
    socialPosts: "Social posts",
    privacy: "Privacy",
    imprint: "Imprint",
    x: "X",
    instagram: "Instagram",
  },
  appCta: {
    download: "Download",
    testFlight: "Join TestFlight",
    preorder: "Pre-order",
    comingSoon: "Coming soon",
    largeSuffix: "on iOS",
    // Apple's official badge, shown in the hero once there is a store listing. The alt text is the
    // badge's own wording; `locale` picks the matching artwork from Apple's marketing tools.
    storeBadge: {
      locale: "en-us",
      alt: "Download on the App Store",
    },
    // One note per CTA state, so the line under the button always describes the
    // link that is actually configured. See components/app-cta.tsx.
    note: {
      testFlight: `Free public beta for iPhone and iPad. Needs Apple's TestFlight app and iOS ${siteConfig.minimumOSVersion} or later.`,
      download: `Free download for iPhone and iPad. Needs iOS ${siteConfig.minimumOSVersion} or later.`,
      preorder: `Pre-order for iPhone and iPad. Needs iOS ${siteConfig.minimumOSVersion} or later.`,
      comingSoon: `Coming to iPhone and iPad, for iOS ${siteConfig.minimumOSVersion} or later.`,
    },
    // Appended to the pre-order note while the beta is still open, so someone who
    // does not want to wait for the release has somewhere to go. See
    // components/app-cta.tsx.
    betaAside: {
      prefix: `Want it before the official release?`,
      link: "Join the TestFlight beta",
      suffix: ".",
    },
  },
  // The question search on /faq and /support. Chrome rather than page copy: the same widget, the
  // same words, whichever list it is filtering.
  faqSearch: {
    label: "Search the questions",
    placeholder: "Search",
    clear: "Clear the search",
    resultCount: (count: number) => (count === 1 ? "1 question" : `${count} questions`),
    empty: "No question matches that search.",
  },
  skipToContent: "Skip to content",
  notFound: {
    title: "Page not found",
    description: "This page has moved or never existed. The songbook is still here.",
    backHome: "Back to the home page",
  },
} as const

export const metadataCopy = {
  defaultTitle: `${siteConfig.name} — Local-first songbook for lyrics and chords`,
  titleTemplate: `%s — ${siteConfig.name}`,
  category: "Music",
  /**
   * The home page's meta description, and the sentence a search engine or an AI
   * summary is most likely to quote. Aimed at 120–160 characters: shorter and
   * Google pads it with copy scraped from the page, longer and it truncates.
   * It leads with what the product is, so the first clause survives either way.
   */
  defaultDescription:
    `${siteConfig.name} is a local-first songbook for iPhone and iPad. Every song stays a plain Markdown ` +
    "file in a folder you choose — offline, with no account.",
  // Share cards crop far harder than search results do. The title stays near 30
  // characters and the description near 60, so neither is cut mid-word in a
  // Slack, iMessage, or Facebook preview.
  socialTitle: `${siteConfig.name} — lyrics and chords`,
  socialDescription: "A local-first songbook for iPhone and iPad, in Markdown.",
  // X shows a longer summary than the Open Graph card does, so it gets its own.
  // Longer means room for a second sentence, not room for a feature list.
  twitterDescription:
    `A songbook made of files you own. ${siteConfig.name} keeps every song as a plain Markdown file on ` +
    "iPhone and iPad, so your lyrics and chords stay readable, portable, and available offline.",
  socialImageAlt: `${siteConfig.name}: ${commonCopy.tagline}`,
  // Search engines have ignored meta keywords for years; these are here for the
  // assistants and site auditors that still read them, and for nothing else. Keep
  // them to terms the site can actually back up — see the content accuracy rules.
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

export const homeCopy = {
  chordlinkBanner: {
    eyebrow: "New · chordlink",
    title: "Tap your instrument and open chordlist.",
    action: "Meet chordlink",
  },
  hero: {
    eyebrow: "Local-first songbook for iOS",
    // Says plainly what the product is, so the tagline above it does not have to
    // carry that job on its own.
    subheadline: "An offline songbook for musicians who want portable charts on iPhone and iPad.",
    description: `${siteConfig.name} keeps every song as a Markdown file in a folder you choose. \nNo logins or cloud sync. Your files remain portable and under your control.`,
  },
  showcase: {
    eyebrow: "Made for the set list",
    title: "Find a song, play it, keep moving.",
    description:
      "Search and filter your library, transpose as you play, and keep related songs close without giving up the simplicity of ordinary files.",
    video: {
      title: "chordlist in motion",
      description:
        "A short tour through the library, search, autoscroll, transposition, and theme customization.",
      alt: "Play a short chordlist product video",
    },
    screenshots: [
      {
        title: "Song library",
        description: "Browse a song library grouped by artist, with chord progressions and tags visible at a glance.",
      },
      {
        title: "Song detail",
        description:
          "Read lyrics and chords, transpose while playing, and find suggestions with matching progressions.",
      },
      {
        title: "Song editor",
        description: "Create a portable song file with title, artist, chord progression, tags, and lyrics.",
      },
    ],
  },
  features: {
    title: "Built around files you own.",
    items: [
      {
        title: "Plain markdown",
        body: "Every song is a readable .md file. Write lyrics and chords with nothing but text you already understand.",
      },
      {
        title: "Works offline",
        body: "Browse, edit, search, and transpose your existing library without a connection. Online import runs only when you request it.",
      },
      {
        title: "Your files stay yours",
        body: `${siteConfig.name} does not upload your song library. Choose where the files live and share them only when you decide to.`,
      },
      {
        title: "Matching progressions",
        body: "Finish a song and see what else you can already play. Songs sharing a chord progression are automatically recognized and suggested.",
      },
    ],
  },
  lyricPreview: {
    title: "One song, one file.",
    description:
      "Chords sit right above the words, so you can read and play at a glance. This is a real file — download it and open it anywhere.",
    download: "Download",
    downloadLabel: "Download sample song",
    openInApp: `Open this song in ${siteConfig.name}`,
    frontmatterHelp:
      "Frontmatter: metadata about the song stored at the top of the file. Used by the app to track chord progressions and other song details.",
    frontmatterHelpLabel: "What is frontmatter?",
  },
  closingCta: {
    title: `Start your songbook ${isEvening ? 'tonight' : 'today'}.`,
    description: `Point ${siteConfig.name} at a folder and your first song is already a file you own — readable, portable, and yours to move anywhere.`,
  },
} as const

export const docsCopy = {
  metadata: {
    title: "Documentation",
    description: `Learn how to use ${siteConfig.name}, organize its Markdown files, work with Obsidian, and keep an iCloud song folder available offline.`,
  },
  title: "Documentation",
  introduction: `${siteConfig.name} is a songbook built on ordinary Markdown files. This guide covers the main features and the ways you can organize, edit, sync, and back up those files outside the app.`,
  onThisPage: "On this page",
  tableOfContents: [
    { href: "#getting-started", label: "Getting started" },
    { href: "#library", label: "Organize and find songs" },
    { href: "#playing", label: "Play from your songbook" },
    { href: "#adding-songs", label: "Add and import songs" },
    { href: "#file-format", label: "File and folder format" },
    { href: "#other-apps", label: "Manage files with other apps" },
    { href: "#obsidian", label: "Use chordlist with Obsidian" },
    { href: "#offline", label: "Keep an iCloud folder offline" },
  ],
  sections: {
    gettingStarted: {
      title: "Getting started",
      paragraphs: [
        `The first time you open ${siteConfig.name}, choose the folder that will contain your song library. You can use a folder under On My iPhone or On My iPad for device-only storage, or choose iCloud Drive when you want Apple's file service to sync the library between your devices.`,
        `You can change the selected folder later under Settings → Songs Folder. ${siteConfig.name} remembers permission to that folder and scans it again when the app returns to the foreground. Pull down on the song list to refresh immediately after making changes elsewhere.`,
      ],
    },
    library: {
      title: "Organize and find songs",
      features: [
        {
          title: "Search and filter",
          body: "Search song titles, artists, and tags together. Tag filters can narrow the library further, and you can hide or reorder tags from the app's settings.",
        },
        {
          title: "Sort the library",
          body: "Group songs by artist or title, or sort them using when they were last played and how many times they have been played.",
        },
        {
          title: "Shuffle",
          body: "Open a random song from the currently filtered library when you want a prompt for practice or a set.",
        },
        {
          title: "Now Playing",
          body: "If you connect Apple Music, chordlist can match the currently playing title and artist to a song already in your library.",
        },
      ],
    },
    playing: {
      title: "Play from your songbook",
      features: [
        {
          title: "Autoscroll",
          body: "Start and pause automatic lyric scrolling from the song view. A speed control adjusts the pace, and the global multiplier in Settings lets you tune every speed to your preference.",
        },
        {
          title: "Transpose chords",
          body: "Tap the chord progression to move it up or down by semitones while you play. Transposition changes the current view and resets when you leave the song; it does not rewrite the source file.",
        },
        {
          title: "Keep the session moving",
          body: "Move back through songs opened during the current session or skip to another random song without returning to the library.",
        },
        {
          title: "Matching progressions",
          body: "Songs with the same normalized chord progression appear together, making it easier to find transitions, medleys, and mashups.",
        },
        {
          title: "Play history",
          body: "Mark a song as played to update its play count and last-played date. These values are stored in the song file and can be used to sort the library.",
        },
      ],
    },
    addingSongs: {
      title: "Add and import songs",
      paragraphs: [
        "Create a song by entering its title, artist, lyrics, and optional chord progression and tags. The app creates the artist folder and Markdown file for you.",
        "You can also paste a lyrics or tab URL, share a supported webpage to chordlist, or start from the track currently playing in Apple Music. Always review imported material before saving and make sure you have the right to use it.",
      ],
    },
    fileFormat: {
      title: "File and folder format",
      introduction: `${siteConfig.name} reads Markdown files one level below the selected songs folder. The artist comes from the folder name and the song title comes from the filename.`,
      fileTreeLabel: "Example folder structure",
      fileTree: "Songs/\n├── The Beatles/\n│   └── Let It Be.md\n└── Tracy Chapman/\n    └── Fast Car.md",
      markdownLabel: "Example song file",
      markdown:
        "---\nchords: C G Am F\ntags:\n  - ballad\n  - piano\n---\n\n[Verse]\nC              G\nLyrics go here…",
      notes: [
        "Only .md files inside an artist folder are treated as songs.",
        "The Markdown body contains the lyrics and any inline chord notation you want to display.",
        "chords and tags are optional YAML frontmatter fields used by the app.",
        "playCount and lastPlay are maintained by chordlist when you mark a song as played.",
        "Other YAML frontmatter is preserved when chordlist edits the file, so metadata added by another tool can live alongside the app's fields.",
      ],
    },
    otherApps: {
      title: "Manage files with other apps",
      introduction:
        "Because the library is made of folders and text files, chordlist is not the only way to work with it. Close or leave the song editor before changing the same file elsewhere, then refresh the library when you return.",
      options: [
        {
          title: "Files and Finder",
          body: "Rename, move, duplicate, share, or back up songs with Apple's Files app or Finder. Remember that moving a file changes its title or artist when its filename or parent folder changes.",
        },
        {
          title: "Markdown editors",
          body: "Open a song in any editor that can write plain Markdown. Keep the Artist/Song.md structure intact and use UTF-8 text for the most predictable results.",
        },
        {
          title: "Backups and version control",
          body: "Copy the complete songs folder to another drive or backup service. On a computer, you can also use Git to keep a version history of every text change.",
        },
      ],
    },
    obsidian: {
      title: `Use ${siteConfig.name} with Obsidian`,
      introduction:
        "An Obsidian vault is also a folder of Markdown files, so the same folder can serve as both an Obsidian vault and a chordlist library.",
      steps: [
        "On iPhone or iPad, create an Obsidian vault with Store in iCloud enabled. Obsidian's mobile documentation requires iCloud vaults to live under iCloud Drive/Obsidian/[Vault Name].",
        `In ${siteConfig.name}, open Settings → Songs Folder and select that vault folder.`,
        "Inside the vault, create one folder per artist and keep each song as Artist/Song Title.md. Obsidian's hidden .obsidian settings folder is ignored by chordlist.",
        "Edit lyrics and frontmatter in either app. Return to chordlist and pull down on the library if an external edit has not appeared yet.",
      ],
      note: "On macOS, Obsidian can open an existing chordlist folder directly as a vault. On iPhone and iPad, the vault must be inside Obsidian's designated iCloud Drive folder, so it is usually easiest to create or move the vault there first and then select it in chordlist.",
      helpLink: "Read Obsidian's iCloud setup guide",
    },
    offline: {
      title: "Keep an iCloud folder available offline",
      introduction:
        "An iCloud Drive folder can be visible in Files while some of its contents are stored only in the cloud. Mark the songs folder as downloaded before a rehearsal, trip, or performance where you may not have a connection.",
      steps: [
        "Open the Files app on the iPhone or iPad you will use.",
        "Choose Browse, then open iCloud Drive.",
        "Find the songs folder—or the Obsidian vault folder if you use Obsidian—and touch and hold it.",
        "Choose Keep Downloaded. Files downloads the folder's contents and keeps them available on that device.",
        "Wait for any cloud download indicators to disappear before going offline, then open chordlist once to confirm the library is available.",
      ],
      notes: [
        "Repeat this on every iPhone or iPad that needs offline access; the setting is device-specific.",
        "If Keep Downloaded is not shown, the item may already be stored on the device.",
        "Changes made offline sync back to iCloud after the device reconnects. Avoid editing the same song on two offline devices at once, because the file provider may create a conflict.",
        "Keep Downloaded improves availability but is not a backup. Keep a separate copy of important libraries.",
      ],
      appleLink: "Read Apple's Keep Downloaded instructions",
    },
  },
} as const

export const faqCopy = {
  metadata: {
    title: "Frequently Asked Questions",
    description: `Answers about files, privacy, pricing, compatibility, and availability for ${siteConfig.name}.`,
  },
  title: "Frequently Asked Questions",
  introduction: "The practical details about your files, privacy, compatibility, and launch.",
  questions: [
    {
      question: "Where are my songs stored?",
      keywords: searchAliases(
        "storage",
        "location",
        "where are my files",
        "path",
        "on my iphone",
        "icloud drive",
        "file provider",
        "local",
        "backup",
        "sync",
      ),
      answer: `In a folder you choose through the Files picker. ${siteConfig.name} reads and writes the Markdown files in that folder and does not upload or sync your library. If you select a folder managed by iCloud Drive or another file provider, that provider may sync it according to your settings.`,
    },
    {
      question: `Can I open my songs without ${siteConfig.name}?`,
      keywords: searchAliases(
        "export",
        "portable",
        "lock-in",
        "other apps",
        "markdown editor",
        "text editor",
        "obsidian",
        "plain text",
        "open elsewhere",
        "leave the app",
      ),
      answer:
        "Yes. Each song is an ordinary Markdown file containing its title, artist, chord progression, tags, and lyrics. You can open, copy, move, back up, or edit those files with other compatible apps.",
    },
    {
      question: "Does it work offline?",
      keywords: searchAliases(
        "offline",
        "no internet",
        "no signal",
        "airplane mode",
        "without wifi",
        "on a flight",
        "rehearsal",
        "gig",
      ),
      answer:
        "Yes. Browsing, editing, searching, transposing, and playing from your local library work offline. Importing a song from a website requires a connection to retrieve the page you requested.",
    },
    {
      question: `Does ${siteConfig.name} collect analytics?`,
      keywords: searchAliases(
        "privacy",
        "tracking",
        "telemetry",
        "telemetrydeck",
        "data collection",
        "gdpr",
        "opt out",
        "disable analytics",
        "personal data",
        "chord sharing",
      ),
      answer:
        "Only if you allow it. Analytics are off until you say yes to the question the app asks after onboarding, and the choice can be changed at any time in Settings. When they are on, anonymous usage and device information is sent through TelemetryDeck. Sharing song titles, artists, and chord progressions is a separate opt-in; lyrics and tags are never included.",
    },
    {
      question: "When is it out?",
      keywords: searchAliases(
        "release date",
        "launch",
        "available",
        "availability",
        "out now",
        "pre-order",
        "preorder",
        "testflight",
        "beta",
        "waiting list",
      ),
      answer: `${siteConfig.name} is available on the App Store from ${launchDate}, as a free download for iPhone and iPad.`,
    },
    {
      question: "How much will it cost?",
      keywords: searchAliases(
        "price",
        "pricing",
        "cost",
        "free",
        "paid",
        "in-app purchase",
        "one-time",
        "subscription",
        "unlimited songs",
        "song limit",
        "trial",
      ),
      answer: `The app is planned as a free download for libraries of up to ${siteConfig.freeSongLimit} songs, with an optional one-time purchase for unlimited songs.`,
    },
    {
      question: "What is chordlink?",
      keywords: searchAliases(
        "chordlink",
        "nfc",
        "tag",
        "sticker",
        "accessory",
        "hardware",
        "3d print",
        "diy",
        "gift",
        "buy",
      ),
      answer: `A numbered, 3D-printed NFC tag you attach to an instrument or its case. Scanning it the first time is where you choose what it does — open the library, shuffle, or add a song — and every later tap goes straight there. The first edition is ${siteConfig.chordlink.price.display} including postage within Germany and comes with ${siteConfig.name} unlimited. If you have a 3D printer of your own, the model generator and the instructions for programming a tag are free.`,
      link: { href: "/chordlink", label: "See chordlink" },
    },
    {
      question: "Which devices are supported?",
      keywords: searchAliases(
        "compatibility",
        "requirements",
        "iphone",
        "ipad",
        "ipados",
        "minimum ios",
        "old iphone",
        "mac",
        "supported devices",
      ),
      answer: `${siteConfig.name} is built for iPhone and iPad and requires iOS or iPadOS ${siteConfig.minimumOSVersion} or later.`,
    },
    {
      question: "Will there be an Android version?",
      keywords: searchAliases(
        "android",
        "samsung",
        "pixel",
        "google play",
        "windows",
        "web version",
        "browser",
        "desktop",
      ),
      answer: "An Android version is not currently planned.",
    },
  ],
  contactPrefix: "Still have a question? Email",
} as const

/**
 * Extra words a support question should match in the search, and that nothing renders.
 *
 * Widened to `string[]` on purpose: `as const` would make each list a tuple, and `Localized` maps a
 * tuple element by element, which would force every translation to invent exactly as many aliases
 * as English has. Synonyms do not translate one for one.
 */
function searchAliases(...values: string[]): readonly string[] {
  return values
}

export const supportCopy = {
  metadata: {
    title: "Support",
    description: `Help with ${siteConfig.name}: adding songs, failed purchases, refunds, and how to reach someone.`,
  },
  title: "Support",
  introduction:
    "Start by checking if your question is answered below. Should none of them fit, this address reaches a person who can look at it.",
  contact: {
    label: "Email support",
    hint: `Mention what you expected and what happened instead. Please include your device, its iOS version, and the app version shown at the bottom of Settings. <code>Settings → Send Feedback</code> opens a message with those details already filled in.`,
  },
  questionsTitle: "Common questions",
  // Added under the shared empty state, where this page has somewhere better to send a reader.
  searchEmptyHint: "The address above still reaches a person.",
  questions: [
    {
      question: "How do I get my songs into chordlist?",
      keywords: searchAliases(
        "import",
        "importing",
        "add a song",
        "new song",
        "create a song",
        "move my library",
        "transfer",
        "migrate",
        "share sheet",
        "share extension",
        "paste a link",
        "url",
        "ultimate guitar",
        "genius",
        "azlyrics",
        "tab",
        "getting started",
        "first launch",
        "choose a folder",
      ),
      answer: `Choose the folder your library lives in when you first open the app. It can be changed later under <code>Settings → Songs Folder</code>. Then add songs whichever way suits: write your own in the app, paste a lyrics or tab URL, share a supported page to ${siteConfig.name} from another app, or copy <code>Artist/Song Title.md</code> files into the folder with Files or Finder and pull down on the library to rescan.`,
      link: { href: "/docs#adding-songs", label: "How adding and importing songs works" },
    },
    {
      question: "My songs are not showing up.",
      keywords: searchAliases(
        "missing",
        "disappeared",
        "empty library",
        "not listed",
        "cannot find my songs",
        "nothing shows",
        "sync",
        "syncing",
        "icloud",
        "offline",
        "download",
        "refresh",
        "reload",
        "subfolder",
        "nested",
        "folder structure",
        "obsidian",
        "vault",
      ),
      answer: `${siteConfig.name} reads Markdown files one level below the songs folder, so a song has to sit in an artist folder as <code>Artist/Song Title.md</code> — a file directly in the folder, or nested deeper, is not listed. Pull down on the library to rescan after editing files elsewhere. If the folder is in iCloud Drive, its contents can still be in the cloud rather than on the device; mark it <code>Keep Downloaded</code> in Files before a rehearsal.`,
      link: { href: "/docs#offline", label: "Keep an iCloud folder available offline" },
    },
    {
      question: "I paid and Unlimited Songs did not unlock.",
      keywords: searchAliases(
        "unlock",
        "locked",
        "purchase",
        "bought",
        "paid",
        "restore",
        "in-app purchase",
        "iap",
        "subscription",
        "upgrade",
        "pro",
        "premium",
        "unlimited",
        "song limit",
        "apple account",
        "wrong account",
        "another device",
        "new iphone",
      ),
      answer: `Open <code>Settings → ${siteConfig.name} unlimited → Unlock Unlimited Songs</code>, then tap <code>Restore Purchases</code> on the screen that appears. The unlock belongs to the App Store account that bought it rather than to a device, so restoring works anywhere that account is signed in — check the device is signed in with the right one. If it stays locked, email ${siteConfig.contact.support} with the App Store receipt and we will look into it.`,
    },
    {
      question: "I want a refund.",
      keywords: searchAliases(
        "refund",
        "money back",
        "cancel",
        "cancellation",
        "charged",
        "charged twice",
        "billing",
        "invoice",
        "receipt",
        "report a problem",
        "apple support",
      ),
      answer: `Purchases in the app are made through the App Store, and only Apple can refund them: ask at reportaproblem.apple.com with the Apple Account that made the purchase. If something is not working, email ${siteConfig.contact.support} first — a fix usually arrives sooner than a refund does.`,
      link: { href: "https://reportaproblem.apple.com", label: "Request a refund from Apple" },
    },
    {
      question: "I have a question about a chordlink order.",
      keywords: searchAliases(
        "order",
        "shipping",
        "delivery",
        "tracking",
        "parcel",
        "not arrived",
        "return",
        "withdrawal",
        "stripe",
        "redeem",
        "redemption link",
        "nfc",
        "tag",
        "sticker",
      ),
      answer: `chordlink is a physical product bought through Stripe and delivered to addresses in Germany, so its orders, deliveries, returns, and refunds are handled by email rather than by Apple — including the redemption link for ${siteConfig.name} unlimited that arrives after an order. Write to ${siteConfig.contact.support} from the address you ordered with.`,
      link: { href: "/chordlink/terms", label: "chordlink terms, withdrawal, and returns" },
    },
    {
      question: "How do I report a bug or ask for a feature?",
      keywords: searchAliases(
        "bug",
        "crash",
        "crashing",
        "freeze",
        "broken",
        "not working",
        "feature request",
        "suggestion",
        "idea",
        "feedback",
        "beta",
        "testflight",
        "contact the developer",
      ),
      answer: `<code>Settings → Send Feedback</code> opens an email to ${siteConfig.contact.feedback} with your app version and iOS version already filled in. From a TestFlight build you can also use <code>Send Beta Feedback</code> in the TestFlight app, which attaches a screenshot and the device details for you.`,
      link: { href: `mailto:${siteConfig.contact.feedback}`, label: "Send feedback by email" },
    },
  ],
  faq: {
    prefix: "Looking for product details rather than help? The",
    link: "frequently asked questions",
    suffix: " cover files, privacy, pricing, compatibility, and availability.",
  },
} as const

export const pressCopy = {
  metadata: {
    title: "Press Kit",
    description: `Product details, screenshots, and press information for ${siteConfig.name}.`,
  },
  title: "Press Kit",
  introduction: "Product details and current, reproducible app screenshots for press, reviewers, and creators.",
  downloadArchive: "Download press kit",
  archiveComingSoon: "Archive coming soon",
  screenshots: {
    sectionTitle: "Screenshots",
    count: (count: number) => `${count} images`,
    introductionBeforeLink:
      "These images come from the app's automated screenshot tests. Select one to inspect or download the full-resolution PNG. For composed, upload-ready artwork, browse the ",
    screensLink: "App Store screenshots",
    introductionAfterLink: ".",
    items: [
      {
        title: "Song library",
        description:
          "A searchable song library grouped by artist, with chord progressions and tags visible at a glance.",
      },
      {
        title: "Song detail",
        description: "A distraction-free song view with playback controls and suggestions based on matching chords.",
      },
      {
        title: "Chord keyboard",
        description: "Enter a song's chord progression quickly with a purpose-built musical keyboard.",
      },
      {
        title: "Search results",
        description: "Search across songs, artists, and tags while keeping the matching library in view.",
      },
      {
        title: "Tag filter",
        description: "Narrow the library to the songs that share a selected tag.",
      },
      {
        title: "Settings",
        description: "Choose the app's accent colour and preferred light, dark, or system appearance.",
      },
      {
        title: "Matching songs",
        description:
          "Finish a song and see which others in the library share its chord progression, ready to play next.",
      },
    ],
  },
  availability: {
    sectionTitle: "Availability and pricing",
    body: `${siteConfig.name} is available on the App Store from ${launchDate}. It is a free download with a library of up to ${siteConfig.freeSongLimit} songs and an optional one-time purchase for unlimited songs.`,
  },
  details: {
    sectionTitle: "App details",
    labels: {
      name: "Name",
      developer: "Developer",
      platforms: "Platforms",
      requirements: "Requirements",
      category: "Category",
      website: "Website",
      pressContact: "Press contact",
      appStoreLink: "App Store"
    },
    platforms: "iPhone and iPad",
    requirements: `iOS or iPadOS ${siteConfig.minimumOSVersion} or later`,
    category: "Music",
    website: "chordlist.app",
    appStoreLink: siteConfig.appStoreId
  },
  boilerplate: {
    sectionTitle: "Boilerplate description",
    paragraphs: [
      `${siteConfig.name} is a local-first songbook for iPhone and iPad that stores lyrics and chords as plain Markdown files in a folder chosen by the user.`,
      "Musicians can search and filter songs, transpose chords, use automatic scrolling, and find songs with matching chord progressions. The app does not upload or sync the song library, and the files remain readable outside the app.",
    ],
  },
} as const

export const screensCopy = {
  metadata: {
    title: "App Store Screenshots",
    description: `View and download the current App Store screenshot sets for ${siteConfig.name}.`,
  },
  eyebrow: "App Store assets",
  title: "App Store screenshot sets",
  introduction:
    "Review every current iPhone and iPad image at a glance, in each language the listing ships in. Download an individual full-resolution PNG or take a complete, upload-ready set as a ZIP archive.",
  variants: {
    classic: {
      title: "Classic",
      description: "Product screenshots framed by chordlist's coloured gradient treatment.",
    },
    analog: {
      title: "Analog",
      description: "The same product story set against atmospheric black-and-white rehearsal photography.",
    },
  },
  /// The App Store locales a set can be built for. The manifest carries the code, so a language
  /// added to the generator before its name reaches this map still lists, under its code.
  languages: {
    en: "English",
    de: "German",
  },
  languageToggle: {
    label: "Screenshot language",
    optionLabel: (language: string) => `Show the ${language} screenshot sets`,
  },
  setTitle: (language: string, variant: string, device: string) => `${language} · ${variant} · ${device}`,
  setMeta: (count: number, width: number, height: number) => `${count} PNGs · ${width} × ${height}`,
  screenshotTitle: (index: number, headline: string) => `${String(index).padStart(2, "0")} · ${headline}`,
  screenshotAlt: (title: string, language: string, variant: string, device: string) =>
    `${title}, from the ${language} ${variant.toLowerCase()} ${device} App Store screenshot set.`,
  downloadSet: "Download set (.zip)",
  creative: {
    title: "Creative assets",
    description:
      "The product page header, the search results asset, the universal asset that can serve as either, and In-App Event media, for iOS 27 and iPadOS 27. Each is drawn at the size of Apple's template, with its words and devices inside the centred safe area Apple crops around.",
    setTitle: (language: string, variant: string) => `${language} · ${variant}`,
    meta: (width: number, height: number) => `${width} × ${height} PNG`,
    download: "Download PNG",
    alt: (label: string, language: string, variant: string) =>
      `${label} App Store creative asset, ${language}, ${variant.toLowerCase()} treatment.`,
  },
} as const

export const privacyCopy = {
  metadata: {
    title: "Privacy Policy",
    description: `How ${siteConfig.name} handles song files, optional analytics, adverts, imports, purchases, chordlink orders, and website visits.`,
  },
  title: "Privacy Policy",
  lastUpdated: "Last updated: 5 October 2026",
  sections: {
    shortVersion: {
      title: "The short version",
      paragraphs: [
        `Your song library is made of files in a folder you choose. ${siteConfig.name} does not upload that library to a developer-operated account, server, or sync service. Optional analytics and chord contributions, adverts shown to free users, explicit website imports, purchases, chordlink orders and notifications, support emails, and visits to this website are handled as described below, together with the legal basis for each and how long the data is kept.`,
      ],
    },
    operator: {
      title: `Who operates ${siteConfig.name}`,
      beforeEmail: `${siteConfig.name} is operated by ${siteConfig.operator}, the controller responsible for the processing described here. Privacy questions can be sent to`,
      imprintPrefix: "The postal address is listed in the",
      imprintLabel: "imprint",
    },
    songFiles: {
      title: "Your song files",
      paragraphs: [
        "The app reads and writes Markdown files in a folder you select through Apple's Files interface. Those files can contain titles, artists, chord progressions, tags, lyrics, and play information.",
        `${siteConfig.name} does not automatically upload or sync these files. If you choose a folder managed by iCloud Drive or another file provider, that provider may store or sync the files under its own terms and your device settings.`,
        "Files are retained until you edit or delete them, remove them using another file-management app, or change the selected folder. Deleting the app does not necessarily delete files stored outside its app container.",
      ],
    },
    analytics: {
      title: "Optional app analytics",
      paragraphs: [
        `Analytics are off by default. After onboarding, ${siteConfig.name} asks whether you want to allow usage analytics. No analytics are sent unless you choose “Allow Analytics”. You can change the choice at any time in the app's Settings.`,
        "The app stores your choice and the version of the consent notice on your device. Declining analytics does not limit the app's features.",
        `When enabled, ${siteConfig.name} uses TelemetryDeck to send app interaction events such as viewing the song list, shuffling, transposing, creating, or editing a song. Song files, lyrics, titles, artists, and chord data are not included in usage analytics.`,
        "TelemetryDeck may process an anonymized installation identifier, the event, an hour-level timestamp, and device or app metadata such as device type, operating-system version, app version, and build information. TelemetryDeck states that it does not store IP addresses or personally identifiable information for app analytics.",
        "Analytics are based on your consent (Art. 6(1)(a) GDPR and § 25(1) TDDDG). You can withdraw it at any time by turning analytics off in Settings; this stops all further events and does not affect processing that happened before.",
      ],
      linkPrefix: "Learn more in the",
      linkLabel: "TelemetryDeck privacy FAQ",
    },
    chordContribution: {
      title: "Optional chord-data contribution",
      paragraphs: [
        "A separate setting lets you choose to contribute chord data. It is off by default and works only while anonymous analytics are also enabled.",
        "When you add or change chords with this option enabled, the song title, artist, key, capo, tuning, section names and their chords, a random contribution identifier, a one-way hash of the song's local identifier, and the app version are sent to TelemetryDeck as part of an analytics event. Lyrics, tags, and notes are never included. Turning off anonymous analytics also turns off chord data contribution.",
        `${siteConfig.operator} then copies these contributions from TelemetryDeck into the ${siteConfig.name} chord database, hosted by Supabase in its Ireland region, to compare independent contributions and suggest chords. Before a contribution is stored, TelemetryDeck's anonymized installation identifier is hashed again with a secret key held only by ${siteConfig.operator}, and the original identifier is discarded. Contributions are reviewed and can be removed during moderation.`,
        "Contributions are based on your consent (Art. 6(1)(a) GDPR). You can withdraw it at any time by turning the setting off, which stops all further contributions. Stored contributions are kept for as long as the chord database is operated. Because they cannot be linked back to you, your Apple account, or your device, we cannot find your earlier contributions on request (Art. 11 GDPR).",
      ],
    },
    importing: {
      title: "Importing from a website",
      paragraphs: [
        `If you ask the app to import a song from a URL, your device requests that page from the selected website and processes the returned content to create a song. The website may receive standard request information such as your IP address and device user-agent under its own privacy policy. The import is initiated only when you provide a URL; ${siteConfig.operator} does not receive the fetched page through a separate import server.`,
      ],
    },
    adverts: {
      title: "Adverts for free users",
      paragraphs: [
        `Until the unlimited-song unlock is purchased, ${siteConfig.name} shows a small advert for another independent app at the end of the song list and of each song. Adverts are provided by Kickstart Exchange, operated by Hudson Heavy Industries Ltd in the United Kingdom, which decides independently how it processes this data.`,
        "To show and count adverts, Kickstart Exchange receives your App Store country and records which advert was shown or tapped. According to Kickstart Exchange, it does not collect IP addresses, device identifiers, the advertising identifier, or cookies, does not track you across apps or build profiles, and keeps advert records for about 30 days before keeping only daily totals. Its network provider, Cloudflare, carries the connection; Kickstart Exchange states that it does not retain IP addresses.",
        `${siteConfig.operator} shows these adverts on the basis of its legitimate interest in financing the free version of ${siteConfig.name} (Art. 6(1)(f) GDPR). Buying the unlimited-song unlock removes the adverts. The European Commission has recognised the United Kingdom as providing an adequate level of data protection.`,
      ],
      linkPrefix: "Kickstart Exchange describes its handling of this data in its",
      linkLabel: "privacy notice",
    },
    purchases: {
      title: "Purchases",
      paragraphs: [
        `The optional unlimited-song unlock is processed by Apple through StoreKit. Apple handles the App Store account and payment method. The app receives product and transaction information needed to determine whether the unlock is available; ${siteConfig.operator} does not receive your payment-card or bank-account details.`,
        `${siteConfig.name} uses RevenueCat to manage purchases and verify entitlements. RevenueCat processes an anonymous app user identifier it generates, purchase and receipt information from Apple, and device or app metadata such as platform, app version, and country. It does not receive your payment-card or bank-account details, and ${siteConfig.name} does not send it your song library.`,
        "RevenueCat processes this data on our behalf. It is based in the United States, so the data is transferred outside the European Union under the standard contractual clauses in RevenueCat's data-processing addendum. Purchase processing is necessary to provide what you bought (Art. 6(1)(b) GDPR).",
      ],
      linkPrefix: "Apple's handling of App Store data is covered by the",
      linkLabel: "App Store privacy information",
      revenueCatLinkPrefix: "RevenueCat's handling of that data is described in its",
      revenueCatLinkLabel: "privacy policy",
    },
    chordlinkOrders: {
      title: "chordlink orders",
      paragraphs: [
        `When chordlink sales open, Stripe will process the checkout, buyer email, payment, and German delivery address. ${siteConfig.operator} will use that information to fulfil the physical order and send the individual Apple offer-code redemption link. Payment-card and bank-account details remain with Stripe.`,
        "The private chordlink inventory stores only the Stripe Checkout Session reference, the unit's public number and edition metadata, fulfillment state, an optional operator note, and its assigned Apple offer code. The public NFC number is not used as an entitlement secret. Buyer email and delivery address are not copied into the chordlist database.",
        `That inventory is a Postgres database hosted by Supabase, which stores and processes it as a service provider on behalf of ${siteConfig.operator} and under its instructions. Supabase may also process the connection, request, and security information needed to operate the database and the functions that read it.`,
        "The database is located in Supabase's Ireland region, so these records are stored in the European Union. Supabase is a company based in the United States, and it may access stored data from outside the European Union where that is necessary to operate, secure, and support the service, under the terms and transfer safeguards of its data-processing agreement.",
        `If you use the online chordlink withdrawal function, Brevo sends your declaration to ${siteConfig.operator} and immediately emails you a confirmation containing its content, date, and time. Brevo processes the name, order identifier, confirmation email address, and withdrawal record only to receive and document the withdrawal and to meet legal obligations.`,
        "Individual /link/ URLs redirect to a shared setup page without carrying the unit number into page analytics. Hosting infrastructure may still process the requested URL in ordinary security and delivery logs.",
        `When you scan a chordlink in the app, the app sends the chordlink's public number, the secret setup code stored in the tag, and a random claim identifier created by the app to the ${siteConfig.name} chordlink service at Supabase. The setup code and claim identifier are stored only as one-way hashes, so the same app installation can retrieve its offer again and no other installation can claim it. No name, Apple account, or device identifier is sent.`,
        "Checkout, fulfilment, and offer delivery are necessary to perform the purchase contract (Art. 6(1)(b) GDPR). Withdrawal records and order and invoice records are kept to meet legal obligations (Art. 6(1)(c) GDPR): order, invoice, and accounting records for the periods required by German commercial and tax law, generally up to ten years (§ 147 AO, § 257 HGB), and withdrawal records until the end of the regular three-year limitation period.",
      ],
      stripeLinkPrefix: "Stripe describes its handling of checkout data in its",
      stripeLinkLabel: "privacy policy",
      supabaseLinkPrefix: "Supabase describes its handling of data it stores for its customers in its",
      supabaseLinkLabel: "privacy policy",
    },
    chordlinkNotifications: {
      title: "chordlink availability notifications",
      paragraphs: [
        `While chordlink is not on sale, the product page offers to notify you by email when it becomes available. Giving your address is voluntary and is never required to read the site or use the app. ${siteConfig.operator} uses it for that one purpose and does not sell, rent, or share it for anyone else's marketing.`,
        "The list uses confirmed opt-in: submitting the form sends one confirmation email, and you are added only when you select the link in it. An address that is never confirmed is never written to again. Every message includes an unsubscribe link, and unsubscribing removes you from the list.",
        `The list is operated by Brevo, a company based in France, which sends the confirmation and later messages, records the confirmation as proof of consent, and handles unsubscribes. It stores the email address, the language the form was submitted in, whether you signed up before the first sale or after it sold out, and the technical record of your confirmation. Brevo stores this data on servers in the European Union and processes it as a service provider on behalf of ${siteConfig.operator}.`,
        "The notification list is kept separate from the chordlink order inventory: an address given here is not added to the order database, and buying a chordlink does not add you to this list.",
        `The list is based on your consent (Art. 6(1)(a) GDPR). You can withdraw it at any time through the unsubscribe link in every message or by emailing ${siteConfig.contact.support}; this does not affect messages sent before. After you unsubscribe, Brevo keeps your address only on a suppression list so you are not emailed again, together with the record of your original confirmation as proof of consent. The whole list is deleted once chordlink is no longer offered.`,
      ],
      linkPrefix: "Brevo describes its handling of this data in its",
      linkLabel: "privacy policy",
    },
    support: {
      title: "Support and feedback",
      paragraphs: [
        "Choosing “Send Feedback” opens an email draft. If you send it, the message can include the content you write plus app-version and iOS details included in the draft. Your email provider and ours process that message; our support mailbox is hosted by Apple through iCloud Mail. Support correspondence is retained only as long as reasonably needed to respond, keep support records, or meet legal obligations.",
        "Answering your message is based on our legitimate interest in providing support (Art. 6(1)(f) GDPR), or is necessary for the contract when it concerns a purchase or chordlink order (Art. 6(1)(b) GDPR).",
      ],
    },
    website: {
      title: "This website",
      paragraphs: [
        "This website is hosted by Vercel. Like other hosting providers, Vercel may process request and technical information needed to deliver and secure the site.",
        "The production website also uses Vercel Web Analytics for aggregate traffic statistics. Vercel states that Web Analytics does not use third-party cookies, does not associate page views with personal identifiers, and uses a daily-changing hash rather than a persistent cross-site identifier. Data points can include the page visited, referrer, filtered query parameters, approximate location, device type, operating system, browser, and timestamp.",
        "Delivering and securing the site and measuring aggregate traffic are based on our legitimate interest in operating a reliable, secure website and understanding which pages are useful (Art. 6(1)(f) GDPR). Vercel is based in the United States, so this data may be processed outside the European Union.",
      ],
      linkPrefix: "See Vercel's",
      linkLabel: "Web Analytics privacy and compliance information",
    },
    sharing: {
      title: "Sharing and sale of data",
      paragraphs: [
        `${siteConfig.operator} does not sell your song library or personal information. Data is shared only when you initiate an action, enable an optional feature described above, when adverts are shown to free users as described above, or when a service provider needs it to operate the app, website, purchase, or support channel. Information may also be disclosed when required by law or necessary to protect rights, safety, and service integrity.`,
      ],
    },
    rights: {
      title: "Your choices and rights",
      choices: [
        "Disable anonymous analytics in the app's Settings.",
        "Leave optional chord-data contribution disabled or turn it off at any time.",
        "Choose, move, edit, export, or delete your song files using compatible file-management tools.",
        "Unsubscribe from chordlink notifications through the link in any message.",
        "Withdraw any consent at any time, with effect for the future.",
        "Object to processing based on our legitimate interest, including adverts, for reasons arising from your particular situation (Art. 21 GDPR).",
        "Ask for access to, correction, deletion, restriction, or a portable copy of personal data we hold about you (Art. 15–20 GDPR).",
        "Complain to a data-protection supervisory authority, in particular the one where you live or where we are established.",
      ],
      beforeEmail:
        "Send requests to",
    },
    changes: {
      title: "Changes to this policy",
      paragraphs: [
        "This policy may be updated when the app, website, or service providers change. Material changes will be reflected here with a new “Last updated” date.",
      ],
    },
  },
} as const

export const imprintCopy = {
  metadata: {
    title: "Imprint",
    description: `Provider and contact information for ${siteConfig.name}.`,
  },
  eyebrow: siteConfig.name,
  title: "Imprint",
  provider: {
    title: "Provider information under Section 5 DDG",
    tradingAs: `trading as ${siteConfig.operator}`,
    country: "Germany",
    contactLabel: "Email",
  },
  editorial: {
    title: "Responsibility for editorial content",
    introduction: "Responsible under Section 18(2) of the German State Media Treaty:",
    addressReference: "Address as above.",
  },
} as const

export const blogCopy = {
  metadata: {
    title: "Blog",
    description: `Notes on plain-text songbooks, chord progressions, and building ${siteConfig.name}.`,
    feedTitle: `${siteConfig.name} blog`,
  },
  title: "Blog",
  // Shown when nothing has been published yet — distinct from the filter empty
  // state, which is about a search that matched nothing.
  noPosts: "No posts yet. The first one goes live soon.",
  introduction:
    "Notes on keeping a songbook in plain text, working with the files outside the app, and what is changing in " +
    `${siteConfig.name}.`,
  search: {
    label: "Search posts",
    placeholder: "Search posts",
    clear: "Clear filters",
  },
  feed: {
    label: "RSS",
    // The visible label is two letters, so the accessible name says what
    // subscribing actually gets you. It still contains "RSS", which is what a
    // voice-control user will say to activate the link.
    ariaLabel: `Subscribe to the ${siteConfig.name} blog with RSS`,
  },
  filters: {
    label: "Filter by tag",
    all: "All",
    resultCount: (count: number) => (count === 1 ? "1 post" : `${count} posts`),
    empty: "No posts match that search yet.",
    // Only rendered where unreleased posts are listed — a preview deployment or
    // the dev server. See blogCopy.status.
    liveOnly: "Live only",
    liveOnlyHint: "Hide drafts and scheduled posts to see what production shows",
  },
  // Label for every tag in `blogTags`. Typed against that list, so adding a tag
  // without a label here is a typecheck error.
  tags: {
    markdown: "Markdown",
    workflow: "Workflow",
    ios: "iOS",
    obsidian: "Obsidian",
    offline: "Offline",
    chords: "Chords",
    release: "Release",
  } satisfies Record<BlogTag, string>,
  card: {
    readingTime: (minutes: number) => `${minutes} min read`,
  },
  // Only ever rendered on a preview deployment or the dev server, where posts that
  // are not public yet are shown so they can be reviewed.
  status: {
    draft: "Draft",
    // Approval outranks the date: an unapproved post never goes live, so "Scheduled" would lie.
    unapproved: "Awaiting approval",
    stale: "Changed since approval",
    scheduled: (date: string) => `Scheduled for ${date}`,
  },
  author: {
    byline: (name: string) => `By ${name}`,
    title: "About the author",
    bio: `${siteConfig.author.firstName} is the solo developer behind ${siteConfig.name}. He created the app to help him play his favorite songs on the piano.`,
    contact: "Questions, corrections, or a topic you would like covered?",
    contactLink: `Write to ${siteConfig.contact.feedback}`,
  },
  post: {
    back: "All posts",
    related: "Related posts",
    cta: {
      title: `Keep your songs as files you own.`,
      description: `${siteConfig.name} stores every song as a Markdown file in a folder you choose.`,
    },
  },
} as const

export const screenshotGalleryCopy = {
  viewFullscreen: (title: string) => `View ${title} full screen`,
  download: (title: string) => `Download ${title}`,
  downloadPng: "Download PNG",
  close: "Close full screen view",
  previous: "Previous item",
  next: "Next item",
} as const

export const galleryCopy = {
  metadata: {
    title: "Gallery",
    description: `A hidden collection of imagery and video made for ${siteConfig.name}.`,
  },
  eyebrow: "A hidden corner",
  title: "Gallery",
  introduction:
    "Black-and-white studies and a product film made for chordlist. Open any item to view it full screen or download the original.",
  video: {
    title: "chordlist in motion",
    description: "A short product film following chordlist from song library to hands-free play-through.",
    alt: "Play the chordlist product film",
  },
  images: [
    {
      title: "Between paper and screen",
      description: "A phone resting on an open score, somewhere between a physical songbook and a digital one.",
      alt: "A black phone resting on an open book of sheet music in soft, grainy light.",
    },
    {
      title: "Finding the changes",
      description: "A guitarist caught in motion, with the fretting hand and instrument dissolving into stage light.",
      alt: "A guitarist's fretting hand and instrument blurred by movement under bright stage lights.",
    },
    {
      title: "At the keys",
      description: "A low, unstable view along a piano keyboard towards an open score.",
      alt: "A piano keyboard and open sheet music seen through grain, bloom, and shallow focus.",
    },
    {
      title: "Four chords in motion",
      description: "Piano keys stretched by movement into alternating bands of light and shadow.",
      alt: "Black-and-white piano keys stretching into soft vertical streaks of motion.",
    },
  ],
} as const

export const editorialCopy = {
  metadata: {
    title: "Editorial",
    description: `Plan, write, and approve ${siteConfig.name} blog posts.`,
  },
  eyebrow: "Internal · blog plan",
  title: "Editorial plan",
  introduction:
    "Every post is written from an outline and goes live only once you have approved its exact words. Editing an approved post withdraws the approval until you approve it again.",
  unavailable: "The editorial tool writes files in this checkout, so it only runs under pnpm dev.",
  calendar: "Calendar",
  summary: {
    live: (count: number) => `${count} live`,
    upcoming: (count: number) => `${count} planned`,
    awaiting: (count: number) => `${count} awaiting approval`,
  },
  status: {
    idea: "Idea",
    writing: "Writing",
    stale: "Changed since approval",
    approved: "Approved",
    live: "Live",
    draft: "Held as draft",
  },
  // Shown under a planned post whose date has passed without an approval. It is not live, and the
  // next change to the plan moves it to the first free slot.
  overdue: "Date passed without approval — not live. Any change to the plan moves it to the next free week.",
  cadence: {
    title: "Release cadence",
    start: "First release",
    everyDays: "Days between posts",
    skip: "Weeks to skip",
    skipHint: "One date per line, YYYY-MM-DD — a holiday, a busy week.",
    save: "Save and reschedule",
    explanation:
      "Changing the cadence or the order reassigns every post that is not live yet to the next free slots, in order. Live posts never move, and approval survives a new date.",
  },
  queue: {
    title: "Planned",
    empty: "Nothing planned. Add an idea below.",
    moveUp: (title: string) => `Move “${title}” a week earlier`,
    moveDown: (title: string) => `Move “${title}” a week later`,
    write: "Write",
    approve: "Approve",
    revoke: "Withdraw approval",
    delete: "Delete",
    words: (count: number) => (count === 1 ? "1 word" : `${count} words`),
    confirmApprove: (title: string, date: string) =>
      `Approve “${title}”?\n\nYou are confirming you have read every word as it is now. It goes live on ${date}.`,
    confirmDelete: (title: string) => `Delete “${title}”? The file is removed from content/blog.`,
  },
  live: {
    title: "Live",
    empty: "Nothing is live yet.",
  },
  add: {
    title: "Add an idea",
    titleLabel: "Working title",
    slugLabel: "Slug — the permanent URL",
    promiseLabel: "Promise — one sentence, becomes the description",
    tagsLabel: "Tags",
    outlineLabel: "Outline — one idea per line",
    submit: "Add to the end of the plan",
  },
  writing: {
    back: "Plan",
    showOutline: "Outline",
    format: {
      label: "Formatting",
      heading: "Heading — cycles through ## and ###",
      bold: "Bold (⌘B)",
      italic: "Italic (⌘I)",
      link: "Link (⌘K)",
      code: "Code (⌘E) — inline within a line, a block across lines",
      codeBlock: "Code block",
      quote: "Quote",
      list: "Bulleted list",
      placeholders: {
        bold: "bold text",
        italic: "italic text",
        code: "code",
        linkText: "link text",
        linkUrl: "https://",
      },
    },
    preview: "Preview",
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved",
    failed: "Not saved",
    placeholder: "Write it your way. The outline is only a map.",
    outlineTitle: "Outline",
    outlineHint: "One idea per line. Nothing here is published.",
    detailsTitle: "Details",
    titleLabel: "Title",
    promiseLabel: "Promise",
    tagsLabel: "Tags",
    scheduled: (date: string) => `Planned for ${date}`,
    approvedNotice:
      "This post is approved. Any edit withdraws the approval until you approve it again.",
    staleNotice: "Edited since you approved it — it will not go live until you approve this version.",
    approve: "Approve this version",
    revoke: "Withdraw approval",
    images: {
      title: "Images",
      hint: "Drop or paste an image onto the page, or add one here. It is resized to 1600px and saved as WebP in public/blog.",
      add: "Add images",
      empty: "No images for this post yet.",
      use: "Use",
      useLabel: (name: string) => `Use ${name} in the post or as its key visual`,
      uploading: (count: number) => (count === 1 ? "Uploading 1 image…" : `Uploading ${count} images…`),
      size: (kilobytes: number) => `${kilobytes} KB`,
      dialogTitle: "Use image",
      fileNameLabel: "File name",
      fileNameHint:
        "Lowercase words and hyphens, describing the picture. It becomes part of the image's URL, so it cannot change once a post uses it.",
      altLabel: "Alt text",
      altHint: "What matters in the image, for someone who cannot see it. Required.",
      altFromCatalog: "Filled in from the photography catalog. Make it more specific if the post needs it.",
      fromCollection: "From the collection",
      collectionTitle: "Photography collection",
      collectionHint:
        "The black-and-white masters in assets/visual-references. Picking one copies a 1600px WebP into this post's folder, with its alt text from the catalog.",
      collectionLoading: "Loading the collection…",
      collectionEmpty: "The collection is empty.",
      collectionPick: (file: string) => `Add ${file} to this post`,
      collectionNoAlt: "No alt text yet",
      close: "Close",
      captionLabel: "Caption",
      captionHint: "Optional. Shown under the image in the post — say something the alt text does not. Key visuals have none.",
      confirm: "Insert at cursor",
      useAsKeyVisual: "Use as key visual",
      cancel: "Cancel",
      keyVisualTitle: "Key visual",
      keyVisualHint:
        "Shown above the post and on its card in the blog index, cropped to 1200 × 630, and used when the post is shared. Part of what you approve.",
      keyVisualEmpty: "None yet. Pick an image below and choose “Use as key visual”.",
      keyVisualBadge: "Key visual",
      removeKeyVisual: "Remove key visual",
    },
  },
} as const

export const pianoCopy = {
  label: "Interactive piano keyboard",
  playNote: (note: string) => `Play note ${note}`,
  chordModeHint: "Press A–G three times quickly to enter chord mode",
  chordModeActive: "Chord mode · Shift for minor · Esc to exit",
} as const

export const adminCopy = {
  metadata: {
    title: "Admin",
    description: `The internal tools behind ${siteConfig.name}, in one place.`,
  },
  eyebrow: "Internal",
  title: "Admin",
  introduction:
    "Every internal page of this site, and the way to the admin backend. Tools marked local only edit files in the checkout, so they open under pnpm dev and nowhere else.",
  backend: {
    title: "Admin backend",
    description: "chordlink orders, settings, and everything else that lives in the database.",
    host: siteConfig.adminBackendUrl.replace(/^https?:\/\//, ""),
    label: "Open the admin backend",
  },
  sections: {
    content: "Content",
    marketing: "Marketing assets",
  },
  badges: {
    localOnly: "Local only",
    public: "Public",
  },
  tools: {
    editorial: {
      title: "Editorial",
      description: "Plan, write, and approve blog posts.",
    },
    translations: {
      title: "Translations",
      description: "Edit the app's strings and the shared glossary in every language.",
    },
    copy: {
      title: "Copy variants",
      description: "The alternative home page wordings, side by side.",
    },
    screens: {
      title: "App Store assets",
      description: "Screenshot sets and creative assets, ready to upload.",
    },
    socialPosts: {
      title: "Social posts",
      description: "Browse, share, and download ready-to-publish posts.",
    },
    socialEditor: {
      title: "Social post editor",
      description: "Compose, preview, and export social post configurations.",
    },
    emails: {
      title: "Email templates",
      description: "Review the built emails before pasting them into Brevo.",
    },
    gallery: {
      title: "Gallery",
      description: "Imagery and video made for the brand.",
    },
    marketingCopy: {
      title: "Marketing copy",
      description: "Listings, launch posts, and hashtags, ready to copy.",
    },
  },
  signOut: "Sign out",
} as const

export const marketingCopyPageCopy = {
  metadata: {
    title: "Marketing copy",
    description: `The text ${siteConfig.name} posts outside its own site, ready to copy.`,
  },
  eyebrow: "Marketing",
  title: "Marketing copy",
  introduction:
    "Every listing and post that goes out without an image of its own. Quoted blocks are ready to paste; the copy button takes the whole block and nothing around it.",
  source: "Edit docs/launch-copy.md to change this page.",
  backToAdmin: "Admin",
  copy: "Copy",
  copied: "Copied",
} as const

export const copyReviewCopy = {
  metadata: {
    title: "Copy variants",
    description: `The alternative home page wordings ${siteConfig.name} can ship, side by side.`,
  },
  eyebrow: "Unlisted · review",
  title: "Home page copy variants",
  introduction:
    "Three wordings of the same home page, held in locales/copy-variants.ts. A variant replaces whole sections rather than single lines, so the page never argues with itself. The headline and the feature order are the same in all three — the headline is the shared tagline, and the feature cards are paired to their icons by position.",
  activeLabel: "Shipping now",
  switchTitle: "Switching",
  switchBody:
    "Set NEXT_PUBLIC_COPY_VARIANT on the deployment and rebuild. Unset ships the default. An unknown value fails the build rather than quietly shipping the default, which would look exactly like a variant that did not work.",
  languageLabel: "Language",
  unchangedLabel: "unchanged",
  unchangedHint: "Grey cells repeat the shipping wording.",
  variants: {
    files: {
      name: "Files",
      role: "Shipping",
      summary:
        "Ownership first: plain Markdown, offline, your files stay yours. Written for someone who has already been burned by a subscription songbook, and the reason the blog and the Obsidian audience work.",
      risk: "Answers four objections a stranger has not raised yet.",
    },
    progressions: {
      name: "Progressions",
      role: "Alternative",
      summary:
        "Leads with the only feature no competitor has, and with the question a stranger actually arrives with: I do not know what to play. The file story moves down into the feature grid, where it is an answer rather than an opening argument.",
      risk: "Spends the hero on one feature, and reads as a learning tool rather than a songbook to anyone with a library already.",
    },
    setlist: {
      name: "Set list",
      role: "Alternative",
      summary:
        "Promotes the strongest sentence on the site out of the carousel header and into the hero, and rewrites the showcase around it so the line is not on the page twice. Aimed at the player about to perform rather than the reader about to be convinced.",
      risk: "Sells speed rather than ownership, which is the part the press and the plain-text audience respond to.",
    },
  },
  fields: {
    heroEyebrow: "Hero · eyebrow",
    heroSubheadline: "Hero · subheadline",
    heroDescription: "Hero · description",
    showcaseEyebrow: "Showcase · eyebrow",
    showcaseTitle: "Showcase · title",
    showcaseDescription: "Showcase · description",
    featuresTitle: "Features · title",
    featureTitle: (position: number) => `Feature ${position} · title`,
    featureBody: (position: number) => `Feature ${position} · body`,
    closingCtaTitle: "Closing CTA · title",
    closingCtaDescription: "Closing CTA · description",
  },
} as const
