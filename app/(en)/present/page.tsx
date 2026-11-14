import type { Metadata } from "next"
import QRCode from "qrcode"

import { PresentStage } from "@/components/present-stage"
import type { Screenshot } from "@/components/screenshot-gallery"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig } from "@/lib/site-config"
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

export default function PresentPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PresentStage code={qrCode(siteConfig.url)} screenshots={screenshots} />
    </main>
  )
}
