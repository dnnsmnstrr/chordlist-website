export const siteConfig = {
  projectName: "chordlist-website",
  name: "chordlist",
  operator: "makerer studio",
  url: "https://chordlist.app",
  tagline: "Your lyrics and chords, as files in your pocket.",
  description:
    "A local-first songbook for iPhone and iPad that keeps lyrics and chords in portable Markdown files you control.",
  launchDate: "30 August 2026",
  minimumOS: "iOS or iPadOS 18 or later",
  freeSongLimit: 10,
  contact: {
    support: "support@chordlist.app",
    feedback: "feedback@chordlist.app",
    press: "marketing@chordlist.app",
  },
  social: {
    x: {
      handle: "@chordlist",
      url: "https://x.com/chordlist",
    },
    instagram: {
      handle: "@chordlist.app",
      url: "https://www.instagram.com/chordlist.app/",
    },
  },
  links: {
    // Add the public App Store URL here once the listing is live.
    appStore: null as string | null,
    // Add a pre-order URL here to turn every app CTA into a pre-order link.
    preorder: null as string | null,
    pressKitArchive: "/press/chordlist-press-kit.zip" as string | null,
    terms: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  },
} as const

export const primaryAppLink = siteConfig.links.appStore ?? siteConfig.links.preorder

export const primaryAppLinkLabel = siteConfig.links.appStore
  ? "Download"
  : siteConfig.links.preorder
    ? "Pre-order"
    : "Coming soon"
