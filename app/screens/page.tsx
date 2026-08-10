import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import Image from "next/image"
import { Download } from "lucide-react"

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

                <ul className="mt-6 grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {set.screenshots.map((screenshot, index) => {
                    const source = `/app-store-screenshots/${screenshot.file}`
                    const title = screensCopy.screenshotTitle(index + 1, screenshot.headline)

                    return (
                      <li key={screenshot.file} className="overflow-hidden rounded-xl border border-border bg-card">
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={screensCopy.viewFullSize(title)}
                          className="group block overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <Image
                            src={source}
                            alt={screensCopy.screenshotAlt(title, variant.title, set.label)}
                            width={screenshot.width}
                            height={screenshot.height}
                            loading={set.variant === "classic" && set.device === "iphone" ? "eager" : "lazy"}
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 240px"
                            className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]"
                          />
                        </a>

                        <div className="flex flex-col gap-3 p-4">
                          <div>
                            <h3 className="text-sm font-medium leading-snug">{title}</h3>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {screenshot.supporting}
                            </p>
                          </div>
                          <a
                            href={source}
                            download
                            className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Download className="size-3.5" aria-hidden="true" />
                            {screensCopy.downloadPng}
                          </a>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </article>

      <SiteFooter />
    </main>
  )
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
