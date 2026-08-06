export const siteConfig = {
  projectName: "chordlist-website",
  name: "chordlist",
  operator: "makerer studio",
  url: "https://chordlist.app",
  launchDate: "2026-08-30",
  minimumOSVersion: 18,
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
    // Add the public TestFlight URL here to use the TestFlight CTA.
    testFlight: "https://testflight.apple.com/join/HS4DNEH8" as string | null,
    // Add the public App Store URL here once the listing is live.
    appStore: null as string | null,
    // Add a pre-order URL here to turn every app CTA into a pre-order link.
    preorder: null as string | null,
    pressKitArchive: "/press/chordlist-press-kit.zip" as string | null,
    terms: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  },
} as const

export const primaryAppLink = siteConfig.links.testFlight ?? siteConfig.links.appStore ?? siteConfig.links.preorder
