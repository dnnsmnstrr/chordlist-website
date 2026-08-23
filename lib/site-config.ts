export const siteConfig = {
  projectName: "chordlist-website",
  name: "chordlist",
  operator: "makerer studio",
  url: "https://chordlist.app",
  launchDate: "2026-09-09",
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
    // Add a pre-order URL here to turn every app CTA into a pre-order link.
    preorder: "https://apps.apple.com/us/app/chordlist-personal-songbook/id6798344297" as string | null,
    // Add the public App Store URL here once the listing is live. It is the same
    // URL as the pre-order above, so setting it on launch day is what flips every
    // CTA from "Pre-order" to "Download".
    appStore: null as string | null,
    pressKitArchive: "/press/chordlist-press-kit.zip" as string | null,
    terms: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  },
  chordlink: {
    price: { amount: 999, currency: "EUR", display: "€9.99" },
    firstEditionSize: 20,
    saleQuantity: 10,
    shippingRegion: "DE",
    shippingIncluded: true,
    // Keep null until the reviewed live Payment Link exists. The page renders a
    // disabled launch state when any readiness flag below is false.
    stripePaymentLink: null as string | null,
    stripePaymentLinkId: null as string | null,
    sellerAddressConfirmed: false,
    legalTextReviewed: false,
    postageDimensionsConfirmed: false,
  },
} as const

type ChordlinkCheckoutReadiness = {
  stripePaymentLink: string | null
  stripePaymentLinkId: string | null
  sellerAddressConfirmed: boolean
  legalTextReviewed: boolean
  postageDimensionsConfirmed: boolean
}

export function isChordlinkCheckoutReady(readiness: ChordlinkCheckoutReadiness): boolean {
  return readiness.stripePaymentLink !== null
    && readiness.stripePaymentLinkId !== null
    && readiness.sellerAddressConfirmed
    && readiness.legalTextReviewed
    && readiness.postageDimensionsConfirmed
}

export const chordlinkCheckoutEnabled = isChordlinkCheckoutReady(siteConfig.chordlink)

/**
 * The strongest offer we can make, in order: buying it beats reserving it, and
 * reserving it beats joining a beta. Keeping the beta last means adding a store
 * link is always what moves the CTA forward, never something that has to be
 * paired with clearing `testFlight`.
 */
export const primaryAppLink = siteConfig.links.appStore ?? siteConfig.links.preorder ?? siteConfig.links.testFlight

/**
 * The App Store product page, whether it is selling or taking pre-orders. Press
 * want the listing either way, so this stays linked through the pre-order window.
 */
export const storeListingLink = siteConfig.links.appStore ?? siteConfig.links.preorder
