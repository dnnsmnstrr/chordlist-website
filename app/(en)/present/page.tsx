import type { Metadata } from "next"
import QRCode from "qrcode"

import { PresentStage, type PresentTarget } from "@/components/present-stage"
import type { Screenshot } from "@/components/screenshot-gallery"
import { pageMetadata } from "@/lib/page-metadata"
import { PRESENT_NOTE_PARAM } from "@/lib/present-params"
import { offerCodeRedemptionLink, siteConfig } from "@/lib/site-config"
import { presentCopy, pressCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/present",
  title: presentCopy.metadata.title,
  description: presentCopy.metadata.description,
  // Unlisted, like /gallery: it is a screen to stand next to, not a page to find.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

const screenshotNames = [
  "01-Song-List",
  "02-Song-Detail",
  "03-Creation-Flow",
  "04-Search",
  "05-Tag-Filter",
  "06-Settings",
  "07-Song-Suggestions",
] as const

const screenshots: readonly Screenshot[] = screenshotNames.flatMap((name, index) => {
  const copy = pressCopy.screenshots.items[index]
  if (!copy) return []

  return [{ lightSrc: `/app-screenshots/light/${name}.png`, darkSrc: `/app-screenshots/dark/${name}.png`, ...copy }]
})

/**
 * The code as one SVG path, a unit square per dark module. Built here rather than in the browser so
 * the QR library never reaches the client bundle, and as a path rather than markup so nothing needs
 * `dangerouslySetInnerHTML`.
 */
function qrCode(text: string) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" })
  const segments: string[] = []

  for (let row = 0; row < modules.size; row++) {
    for (let column = 0; column < modules.size; column++) {
      if (modules.data[row * modules.size + column]) segments.push(`M${column} ${row}h1v1h-1z`)
    }
  }

  return { size: modules.size, path: segments.join("") }
}

/** Offer codes are letters and digits; anything else in the parameter is a typo, not part of a code. */
const OFFER_CODE = /^[A-Za-z0-9]{1,64}$/

type PresentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * What the QR code opens, chosen by the URL so it can be set before the screen goes up:
 *
 * - `/present` — the website.
 * - `/present?qr=testflight` — the public TestFlight beta.
 * - `/present?qr=appstore` — the App Store listing.
 * - `/present?code=ABC123` — Apple's redeem page with that offer code filled in. It wins over `qr`.
 *
 * `?note=Station%2007` sets the line above the logo; typing in it keeps the parameter in step.
 *
 * A target whose link is not configured, or a code that is not one, falls back to the website rather
 * than failing: this is read off a URL typed on the spot, and a working page beats an error on a big
 * screen.
 */
function presentTarget(params: Record<string, string | string[] | undefined>): PresentTarget {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim()
  const code = first(params.code)
  const qr = first(params.qr)?.toLowerCase()

  if (code && OFFER_CODE.test(code)) {
    return { url: offerCodeRedemptionLink(code), hint: presentCopy.scanHints.offerCode(code) }
  }
  if (qr === "testflight" && siteConfig.links.testFlight) {
    return { url: siteConfig.links.testFlight, hint: presentCopy.scanHints.testFlight }
  }
  if (qr === "appstore" && siteConfig.links.appStore) {
    return { url: siteConfig.links.appStore, hint: presentCopy.scanHints.appStore }
  }
  return { url: siteConfig.url, hint: presentCopy.scanHints.site(siteConfig.url.replace(/^https?:\/\//, "")) }
}

export default async function PresentPage({ searchParams }: PresentPageProps) {
  const params = await searchParams
  const target = presentTarget(params)
  const noteParam = params[PRESENT_NOTE_PARAM]
  const note = (Array.isArray(noteParam) ? noteParam[0] : noteParam) ?? ""

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PresentStage code={qrCode(target.url)} target={target} initialNote={note} screenshots={screenshots} />
    </main>
  )
}
