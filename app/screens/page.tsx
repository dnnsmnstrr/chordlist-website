import { readdir } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import { Download } from "lucide-react"

import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { screensCopy } from "@/locales/en"

export const metadata: Metadata = {
  title: screensCopy.metadata.title,
  description: screensCopy.metadata.description,
  // A reference page for our own use, like /gallery — not part of the public site.
  robots: { index: false, follow: false },
}

const LIGHT = "/app-screenshots/light"
const DARK = "/app-screenshots/dark"

/** Built by `pnpm build:screens` from the same files listed below. */
const ARCHIVE = "/app-screenshots/chordlist-app-screenshots.zip"

/**
 * Both themes are generated for every screen by `pnpm build:app-store`. Adding one
 * means adding its filename to `screenshotNames` in scripts/sync-app-assets.mjs and
 * its copy to `screensCopy.screenshots`.
 */
const screenshots: readonly Screenshot[] = [
  {
    lightSrc: `${LIGHT}/01-Song-List---4-Chord-Library.png`,
    darkSrc: `${DARK}/01-Song-List---4-Chord-Library.png`,
    ...screensCopy.screenshots[0],
  },
  {
    lightSrc: `${LIGHT}/02-Song-Detail---Matching-Suggestions.png`,
    darkSrc: `${DARK}/02-Song-Detail---Matching-Suggestions.png`,
    ...screensCopy.screenshots[1],
  },
  {
    lightSrc: `${LIGHT}/03-Creation-Flow---New-Song.png`,
    darkSrc: `${DARK}/03-Creation-Flow---New-Song.png`,
    ...screensCopy.screenshots[2],
  },
  {
    lightSrc: `${LIGHT}/04-Search---Piano-Results.png`,
    darkSrc: `${DARK}/04-Search---Piano-Results.png`,
    ...screensCopy.screenshots[3],
  },
  {
    lightSrc: `${LIGHT}/05-Tag-Filter---Piano.png`,
    darkSrc: `${DARK}/05-Tag-Filter---Piano.png`,
    ...screensCopy.screenshots[4],
  },
]

/**
 * Counts what the archive actually contains, rather than deriving it from the list
 * above — light and dark hold different numbers of files, and the zip is built from
 * these same folders by scripts/build-screens-zip.mjs.
 */
async function countArchivedImages() {
  const root = path.join(process.cwd(), "public", "app-screenshots")

  const counts = await Promise.all(
    ["light", "dark"].map(async (folder) => {
      try {
        const files = await readdir(path.join(root, folder))
        return files.filter((file) => file.endsWith(".png")).length
      } catch {
        return 0
      }
    }),
  )

  return counts.reduce((total, count) => total + count, 0)
}

export default async function ScreensPage() {
  const imageCount = await countArchivedImages()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-2xl border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{screensCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{screensCopy.title}</h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{screensCopy.introduction}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a href={ARCHIVE} download>
                  <Download aria-hidden="true" />
                  {screensCopy.downloadAll}
                </a>
              }
            />
            <span className="font-mono text-xs text-muted-foreground">
              {screensCopy.downloadAllHint(imageCount)}
            </span>
          </div>
        </header>

        <div className="mt-10">
          <ScreenshotGallery screenshots={screenshots} variant="press" />
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}
