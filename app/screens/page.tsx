import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { Download } from "lucide-react"

import { ScreenshotGallery, type GalleryMedia } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/page-metadata"
import { screensCopy } from "@/locales/en"

type ScreenshotVariant = "classic" | "analog"
type ScreenshotDevice = "iphone" | "ipad"

type AppStoreScreenshot = {
  variant: ScreenshotVariant
  device: ScreenshotDevice
  label: string
  width: number
  height: number
  file: string
  headline: string
  supporting: string
  archive: string
}

type ScreenshotSet = {
  variant: ScreenshotVariant
  device: ScreenshotDevice
  label: string
  width: number
  height: number
  archive: string
  screenshots: AppStoreScreenshot[]
}

const setOrder = [
  { variant: "classic", device: "iphone" },
  { variant: "classic", device: "ipad" },
  { variant: "analog", device: "iphone" },
  { variant: "analog", device: "ipad" },
] as const

const manifestPromise = readFile(
  path.join(process.cwd(), "public", "app-store-screenshots", "manifest.json"),
  "utf8",
).then((contents) => JSON.parse(contents) as AppStoreScreenshot[])

export const metadata: Metadata = pageMetadata({
  path: "/screens",
  title: screensCopy.metadata.title,
  description: screensCopy.metadata.description,
  image: "/og.png",
})

export default async function ScreensPage() {
  const screenshots = await manifestPromise
  const sets = screenshotSets(screenshots)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-6 py-16">
        <header className="max-w-3xl border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{screensCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{screensCopy.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {screensCopy.introduction}
          </p>
        </header>

        <div className="mt-12 flex flex-col gap-16">
          {sets.map((set) => {
            const variant = screensCopy.variants[set.variant]

            return (
              <section key={`${set.variant}-${set.device}`} id={`${set.variant}-${set.device}`}>
                <div className="flex flex-col justify-between gap-5 border-b border-border pb-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {screensCopy.setMeta(set.screenshots.length, set.width, set.height)}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {screensCopy.setTitle(variant.title, set.label)}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {variant.description}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    nativeButton={false}
                    render={
                      <a href={`/app-store-screenshots/${set.archive}`} download>
                        <Download aria-hidden="true" />
                        {screensCopy.downloadSet}
                      </a>
                    }
                  />
                </div>

                <div className="mt-6">
                  <ScreenshotGallery variant="screens" screenshots={galleryMedia(set, variant.title)} />
                </div>
              </section>
            )
          })}
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}

/**
 * One App Store rendering serves both themes, so each entry carries only `lightSrc` and
 * the gallery skips its light/dark `<picture>` pair.
 */
function galleryMedia(set: ScreenshotSet, variantTitle: string): GalleryMedia[] {
  return set.screenshots.map((screenshot, index) => {
    const title = screensCopy.screenshotTitle(index + 1, screenshot.headline)

    return {
      lightSrc: `/app-store-screenshots/${screenshot.file}`,
      width: screenshot.width,
      height: screenshot.height,
      title,
      description: screenshot.supporting,
      alt: screensCopy.screenshotAlt(title, variantTitle, set.label),
    }
  })
}

function screenshotSets(screenshots: AppStoreScreenshot[]): ScreenshotSet[] {
  return setOrder.flatMap(({ variant, device }) => {
    const entries = screenshots.filter((screenshot) => screenshot.variant === variant && screenshot.device === device)
    const first = entries[0]
    if (!first) return []

    return [
      {
        variant,
        device,
        label: first.label,
        width: first.width,
        height: first.height,
        archive: first.archive,
        screenshots: entries,
      },
    ]
  })
}
