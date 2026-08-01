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
    faq: "FAQ",
    press: "Press",
    privacy: "Privacy",
    terms: "Terms",
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
  playNote: (note: string) => `Play note ${note}`,
} as const
