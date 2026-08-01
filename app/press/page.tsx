import type { Metadata } from "next"
import { Download } from "lucide-react"

import { CollapsibleSection } from "@/components/collapsible-section"
import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Press Kit",
  description: `Product details, screenshots, and press information for ${siteConfig.name}.`,
  alternates: { canonical: "/press" },
}

const screenshots: readonly Screenshot[] = [
  {
    src: "/app-screenshots/light/01-Song-List---4-Chord-Library.png",
    title: "Song library",
    description: "A searchable song library grouped by artist, with chord progressions and tags visible at a glance.",
  },
  {
    src: "/app-screenshots/light/02-Song-Detail---Matching-Suggestions.png",
    title: "Song detail",
    description: "A distraction-free song view with playback controls and suggestions based on matching chords.",
  },
  {
    src: "/app-screenshots/light/03-Creation-Flow---New-Song.png",
    title: "Song editor",
    description: "Create a portable song file with title, artist, chord progression, tags, and lyrics.",
  },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Press Kit</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Product details and current, reproducible app screenshots for press, reviewers, and creators.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {siteConfig.links.pressKitArchive ? (
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a href={siteConfig.links.pressKitArchive} download>
                    <Download aria-hidden="true" />
                    Download press kit
                  </a>
                }
              />
            ) : (
              <Button size="lg" disabled>
                <Download aria-hidden="true" />
                Archive coming soon
              </Button>
            )}
            <a
              href={`mailto:${siteConfig.contact.press}`}
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              {siteConfig.contact.press}
            </a>
          </div>
        </header>

        <div className="mt-4 flex flex-col">
          <CollapsibleSection title="Screenshots" meta={`${screenshots.length} images`} defaultOpen>
            <div className="flex flex-col gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                These images come from the app&apos;s automated screenshot tests. Select one to inspect or download the
                full-resolution PNG.
              </p>
              <ScreenshotGallery screenshots={screenshots} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Availability and pricing">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.name} is planned for {siteConfig.launchDate}. It will be a free download with a library of up
              to {siteConfig.freeSongLimit} songs and an optional one-time purchase for unlimited songs. Final pricing
              will be announced closer to launch.
            </p>
          </CollapsibleSection>

          <CollapsibleSection title="App details">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[10rem_1fr]">
              <DetailRow label="Name" value={siteConfig.name} />
              <DetailRow label="Developer" value={siteConfig.operator} />
              <DetailRow label="Platforms" value="iPhone and iPad" />
              <DetailRow label="Requirements" value={siteConfig.minimumOS} />
              <DetailRow label="Category" value="Music" />
              <DetailRow label="Website" value="chordlist.app" href={siteConfig.url} />
              <DetailRow label="Press contact" value={siteConfig.contact.press} href={`mailto:${siteConfig.contact.press}`} />
            </dl>
          </CollapsibleSection>

          <CollapsibleSection title="Boilerplate description">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                {siteConfig.name} is a local-first songbook for iPhone and iPad that stores lyrics and chords as plain
                Markdown files in a folder chosen by the user.
              </p>
              <p>
                Musicians can search and filter songs, transpose chords, use automatic scrolling, and find songs with
                matching chord progressions. The app does not upload or sync the song library, and the files remain
                readable outside the app.
              </p>
            </div>
          </CollapsibleSection>
        </div>
      </article>

      <SiteFooter compact />
    </main>
  )
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <>
      <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">
        {href ? (
          <a
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="underline underline-offset-4 transition-colors hover:text-muted-foreground"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </>
  )
}

