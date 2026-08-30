import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import Link from "next/link"
import { Download } from "lucide-react"

import { ScreenshotGallery, type GalleryMedia } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/page-metadata"
import { cn } from "@/lib/utils"
import { screensCopy } from "@/locales/en"
import { requireAdmin } from "@/lib/server/admin-auth"

type ScreenshotVariant = "classic" | "analog"
type ScreenshotDevice = "iphone" | "ipad"

type AppStoreScreenshot = {
  language: string
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
  language: string
  variant: ScreenshotVariant
  device: ScreenshotDevice
  label: string
  width: number
  height: number
  archive: string
  screenshots: AppStoreScreenshot[]
}

/**
 * Display order for the page, deliberately independent of `manifest.json`: the
 * analog sets lead, and a rebuild or a re-import of the app screenshots cannot
 * reshuffle them. Change the order here, not in the generator.
 *
 * Languages are the one axis the manifest still decides, because the generator's
 * order is the upload order and a new one should not need a change here to appear.
 */
const setOrder = [
  { variant: "analog", device: "iphone" },
  { variant: "analog", device: "ipad" },
  { variant: "classic", device: "iphone" },
  { variant: "classic", device: "ipad" },
] as const

/// A language name for a manifest code, falling back to the code itself so a set is never hidden
/// just because `screensCopy` has not been told what to call its language yet.
const languageNames = new Map<string, string>(Object.entries(screensCopy.languages))

function languageName(code: string): string {
  return languageNames.get(code) ?? code.toUpperCase()
}

/**
 * Read per render rather than once per module.
 *
 * `manifest.json` is written by `pnpm build:screens`, which is run against a server that is already
 * up — and because the file is read rather than imported, nothing tells the module to evaluate
 * again. A module-level promise therefore pins whichever sets existed when the page was first
 * requested, and a language or device added afterwards stays invisible until the server restarts.
 * A production build resolves this once anyway, at build time.
 */
let lastReadManifest: AppStoreScreenshot[] | null = null

async function readManifest(): Promise<AppStoreScreenshot[]> {
  try {
    const contents = await readFile(
      path.join(process.cwd(), "public", "app-store-screenshots", "manifest.json"),
      "utf8",
    )
    lastReadManifest = JSON.parse(contents) as AppStoreScreenshot[]
    return lastReadManifest
  } catch (error) {
    // `build:screens` empties the output directory first and writes the manifest last, so for the
    // couple of minutes it runs there is no manifest to read at all. Showing the sets from before
    // the rebuild beats an error page — they are what the directory held a moment ago, and the next
    // request after the build finishes picks up the new ones.
    if (!lastReadManifest) throw error
    console.warn("screens: no readable manifest.json — showing the last one while a build finishes.")
    return lastReadManifest
  }
}

export const metadata: Metadata = pageMetadata({
  path: "/screens",
  title: screensCopy.metadata.title,
  description: screensCopy.metadata.description,
  image: "/og.png",
})

type ScreensPageProps = {
  searchParams: Promise<{ language?: string }>
}

export default async function ScreensPage({ searchParams }: ScreensPageProps) {
  await requireAdmin("/screens")
  const screenshots = await readManifest()
  const languages = [...new Set(screenshots.map((screenshot) => screenshot.language))]
  const requested = (await searchParams).language
  // An unknown or absent code falls back to the first language the generator wrote, rather than an
  // empty page, so a hand-typed URL and a stale link both still show something.
  const active = requested && languages.includes(requested) ? requested : languages[0]
  const sets = screenshotSets(screenshots.filter((screenshot) => screenshot.language === active))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-6 py-16">
        <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{screensCopy.eyebrow}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {screensCopy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              {screensCopy.introduction}
            </p>
          </div>

          {languages.length > 1 ? <LanguageToggle languages={languages} active={active} /> : null}
        </header>

        <div className="mt-12 flex flex-col gap-16">
          {sets.map((set, setIndex) => {
            const variant = screensCopy.variants[set.variant]
            const key = `${set.language}-${set.variant}-${set.device}`

            return (
              <section key={key} id={key}>
                <div className="flex flex-col justify-between gap-5 border-b border-border pb-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {screensCopy.setMeta(set.screenshots.length, set.width, set.height)}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {screensCopy.setTitle(languageName(set.language), variant.title, set.label)}
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
                  <ScreenshotGallery
                    variant="screens"
                    screenshots={galleryMedia(set, variant.title)}
                    // The leading set's first image is what the page paints largest, so it is the
                    // one worth loading eagerly; the sets below it stay lazy.
                    priority={setIndex === 0}
                  />
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
 * Which language's sets the page is showing.
 *
 * Links rather than state: the page stays a server component, the choice survives a reload, and a
 * review can be sent as a URL. The language lives in the query string because `/screens` is one
 * page listing one thing — the sets it happens to be built in — not a set of routes.
 */
function LanguageToggle({ languages, active }: { languages: string[]; active: string | undefined }) {
  return (
    <nav
      aria-label={screensCopy.languageToggle.label}
      className="flex shrink-0 items-center gap-1 self-start rounded-full border border-border p-1"
    >
      {languages.map((language) => {
        const name = languageName(language)
        const isActive = language === active

        return (
          <Link
            key={language}
            href={`/screens?language=${language}`}
            aria-current={isActive ? "true" : undefined}
            aria-label={screensCopy.languageToggle.optionLabel(name)}
            className={cn(
              "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {name}
          </Link>
        )
      })}
    </nav>
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
      alt: screensCopy.screenshotAlt(title, languageName(set.language), variantTitle, set.label),
    }
  })
}

function screenshotSets(screenshots: AppStoreScreenshot[]): ScreenshotSet[] {
  const languages = [...new Set(screenshots.map((screenshot) => screenshot.language))]

  return languages.flatMap((language) =>
    setOrder.flatMap(({ variant, device }) => {
      const entries = screenshots.filter(
        (screenshot) =>
          screenshot.language === language && screenshot.variant === variant && screenshot.device === device,
      )
      const first = entries[0]
      if (!first) return []

      return [
        {
          language,
          variant,
          device,
          label: first.label,
          width: first.width,
          height: first.height,
          archive: first.archive,
          screenshots: entries,
        },
      ]
    }),
  )
}
