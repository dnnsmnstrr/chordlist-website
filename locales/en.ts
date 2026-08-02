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

export const commonCopy = {
  appName: siteConfig.name,
  appDescription:
    "A local-first songbook for iPhone and iPad that keeps lyrics and chords in portable Markdown files you control.",
  tagline: "Your lyrics and chords, as files in your pocket.",
  navigation: {
    homeLabel: `${siteConfig.name} home`,
    features: "Features",
    footerLabel: "Footer",
    docs: "Docs",
    faq: "FAQ",
    support: "Support",
    press: "Press",
    privacy: "Privacy",
    x: "X",
    instagram: "Instagram",
  },
  appCta: {
    download: "Download",
    preorder: "Pre-order",
    comingSoon: "Coming soon",
    largeSuffix: "on iOS",
  },
} as const

export const metadataCopy = {
  defaultTitle: `${siteConfig.name} — Local-first songbook for lyrics and chords`,
  titleTemplate: `%s — ${siteConfig.name}`,
  category: "Music",
  keywords: ["songbook", "lyrics", "chords", "Markdown", "iPhone", "iPad", "local-first"],
  socialTitle: `${siteConfig.name} — ${commonCopy.tagline}`,
  socialImageAlt: `${siteConfig.name}: ${commonCopy.tagline}`,
} as const

export const homeCopy = {
  hero: {
    eyebrow: "Local-first songbook for iOS",
    description: `${siteConfig.name} keeps every song as a Markdown file in a folder you choose. No logins or cloud sync. Your files remain portable, readable, and under your control.`,
    formatLink: "See the format",
  },
  showcase: {
    eyebrow: "Made for the set list",
    title: "Find a song, play it, keep moving.",
    description:
      "Search and filter your library, transpose as you play, and keep related songs close without giving up the simplicity of ordinary files.",
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
        title: "No lock-in",
        body: "Export and move your files anytime. Open them in any editor — the data always belongs to you.",
      },
    ],
  },
  lyricPreview: {
    title: "One song, one file.",
    description:
      "Chords sit right above the words, so you can read and play at a glance. This is a real file — download it and open it anywhere.",
    download: "Download",
    downloadLabel: "Download sample song",
    frontmatterHelp:
      "Frontmatter: metadata about the song stored at the top of the file. Used by the app to track chord progressions and other song details.",
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
      answer: `In a folder you choose through the Files picker. ${siteConfig.name} reads and writes the Markdown files in that folder and does not upload or sync your library. If you select a folder managed by iCloud Drive or another file provider, that provider may sync it according to your settings.`,
    },
    {
      question: `Can I open my songs without ${siteConfig.name}?`,
      answer:
        "Yes. Each song is an ordinary Markdown file containing its title, artist, chord progression, tags, and lyrics. You can open, copy, move, back up, or edit those files with other compatible apps.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Yes. Browsing, editing, searching, transposing, and playing from your local library work offline. Importing a song from a website requires a connection to retrieve the page you requested.",
    },
    {
      question: `Does ${siteConfig.name} collect analytics?`,
      answer:
        "The app can send anonymous usage and device information through TelemetryDeck. You can disable this in Settings. Sharing song titles, artists, and chord progressions is a separate opt-in setting; lyrics and tags are never included.",
    },
    {
      question: "How much will it cost?",
      answer: `The app is planned as a free download for libraries of up to ${siteConfig.freeSongLimit} songs, with an optional one-time purchase for unlimited songs. Final pricing will be announced before launch.`,
    },
    {
      question: "Which devices are supported?",
      answer: `${siteConfig.name} is built for iPhone and iPad and requires iOS or iPadOS ${siteConfig.minimumOSVersion} or later.`,
    },
    {
      question: "Will there be an Android version?",
      answer: "An Android version is not currently planned.",
    },
  ],
  contactPrefix: "Still have a question? Email",
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
    introduction:
      "These images come from the app's automated screenshot tests. Select one to inspect or download the full-resolution PNG.",
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
        title: "Song editor",
        description: "Create a portable song file with title, artist, chord progression, tags, and lyrics.",
      },
    ],
  },
  availability: {
    sectionTitle: "Availability and pricing",
    body: `${siteConfig.name} is planned for ${launchDate}. It will be a free download with a library of up to ${siteConfig.freeSongLimit} songs and an optional one-time purchase for unlimited songs. Final pricing will be announced closer to launch.`,
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
    },
    platforms: "iPhone and iPad",
    requirements: `iOS or iPadOS ${siteConfig.minimumOSVersion} or later`,
    category: "Music",
    website: "chordlist.app",
  },
  boilerplate: {
    sectionTitle: "Boilerplate description",
    paragraphs: [
      `${siteConfig.name} is a local-first songbook for iPhone and iPad that stores lyrics and chords as plain Markdown files in a folder chosen by the user.`,
      "Musicians can search and filter songs, transpose chords, use automatic scrolling, and find songs with matching chord progressions. The app does not upload or sync the song library, and the files remain readable outside the app.",
    ],
  },
} as const

export const privacyCopy = {
  metadata: {
    title: "Privacy Policy",
    description: `How ${siteConfig.name} handles song files, optional analytics, imports, purchases, and website visits.`,
  },
  title: "Privacy Policy",
  lastUpdated: "Last updated: 1 August 2026",
  sections: {
    shortVersion: {
      title: "The short version",
      paragraphs: [
        `Your song library is made of files in a folder you choose. ${siteConfig.name} does not upload that library to a developer-operated account, server, or sync service. Optional analytics, explicit website imports, App Store purchases, support emails, and visits to this website are handled as described below.`,
      ],
    },
    operator: {
      title: `Who operates ${siteConfig.name}`,
      beforeEmail: `${siteConfig.name} is operated by ${siteConfig.operator}. Privacy questions can be sent to`,
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
      title: "Anonymous app analytics",
      paragraphs: [
        `Anonymous analytics are enabled by default and can be disabled at any time in the app's Settings. When enabled, ${siteConfig.name} uses TelemetryDeck to send app interaction events such as viewing the song list, shuffling, transposing, creating, or editing a song.`,
        "TelemetryDeck may process an anonymized installation identifier, the event, an hour-level timestamp, and device or app metadata such as device type, operating-system version, app version, and build information. TelemetryDeck states that it does not store IP addresses or personally identifiable information for app analytics.",
      ],
      linkPrefix: "Learn more in the",
      linkLabel: "TelemetryDeck privacy FAQ",
    },
    chordContribution: {
      title: "Optional chord-data contribution",
      paragraphs: [
        "A separate setting lets you choose to contribute chord data. It is off by default and works only while anonymous analytics are also enabled.",
        "When you add or change chords with this option enabled, the song title, artist, chord progression, normalized chord progression, and whether the progression was added or updated may be sent to TelemetryDeck. Lyrics and tags are never included. Turning off anonymous analytics also turns off chord data contribution.",
      ],
    },
    importing: {
      title: "Importing from a website",
      paragraphs: [
        `If you ask the app to import a song from a URL, your device requests that page from the selected website and processes the returned content to create a song. The website may receive standard request information such as your IP address and device user-agent under its own privacy policy. The import is initiated only when you provide a URL; ${siteConfig.operator} does not receive the fetched page through a separate import server.`,
      ],
    },
    purchases: {
      title: "Purchases",
      paragraphs: [
        `The optional unlimited-song unlock is processed by Apple through StoreKit. Apple handles the App Store account and payment method. The app receives product and transaction information needed to determine whether the unlock is available; ${siteConfig.operator} does not receive your payment-card or bank-account details.`,
      ],
      linkPrefix: "Apple's handling of App Store data is covered by the",
      linkLabel: "App Store privacy information",
    },
    support: {
      title: "Support and feedback",
      paragraphs: [
        "Choosing “Send Feedback” opens an email draft. If you send it, the message can include the content you write plus app-version and iOS details included in the draft. Your email provider and ours process that message. Support correspondence is retained only as long as reasonably needed to respond, keep support records, or meet legal obligations.",
      ],
    },
    website: {
      title: "This website",
      paragraphs: [
        "This website is hosted by Vercel. Like other hosting providers, Vercel may process request and technical information needed to deliver and secure the site.",
        "The production website also uses Vercel Web Analytics for aggregate traffic statistics. Vercel states that Web Analytics does not use third-party cookies, does not associate page views with personal identifiers, and uses a daily-changing hash rather than a persistent cross-site identifier. Data points can include the page visited, referrer, filtered query parameters, approximate location, device type, operating system, browser, and timestamp.",
      ],
      linkPrefix: "See Vercel's",
      linkLabel: "Web Analytics privacy and compliance information",
    },
    sharing: {
      title: "Sharing and sale of data",
      paragraphs: [
        `${siteConfig.operator} does not sell your song library or personal information. Data is shared only when you initiate an action, enable an optional feature described above, or when a service provider needs it to operate the app, website, purchase, or support channel. Information may also be disclosed when required by law or necessary to protect rights, safety, and service integrity.`,
      ],
    },
    rights: {
      title: "Your choices and rights",
      choices: [
        "Disable anonymous analytics in the app's Settings.",
        "Leave optional chord-data contribution disabled or turn it off at any time.",
        "Choose, move, edit, export, or delete your song files using compatible file-management tools.",
        "Contact us to ask about support correspondence or other information you provided directly.",
      ],
      beforeEmail:
        "Depending on where you live, privacy law may give you additional access, correction, deletion, restriction, objection, or complaint rights. Send requests to",
    },
    changes: {
      title: "Changes to this policy",
      paragraphs: [
        "This policy may be updated when the app, website, or service providers change. Material changes will be reflected here with a new “Last updated” date.",
      ],
    },
  },
} as const

export const screenshotGalleryCopy = {
  viewFullscreen: (title: string) => `View ${title} full screen`,
  download: (title: string) => `Download ${title}`,
  close: "Close full screen view",
  previous: "Previous screenshot",
  next: "Next screenshot",
} as const

export const pianoCopy = {
  label: "Interactive piano keyboard",
  playNote: (note: string) => `Play note ${note}`,
  chordModeHint: "Press A–G three times quickly to enter chord mode",
  chordModeActive: "Chord mode · Shift for minor · Esc to exit",
} as const
