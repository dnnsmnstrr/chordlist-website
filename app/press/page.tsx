import type { Metadata } from "next"
import { Download } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { CollapsibleSection } from "@/components/collapsible-section"
import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"

export const metadata: Metadata = {
  title: "Press Kit — chordlist",
  description:
    "Download the chordlist press kit: app icon, screenshots, product details, and pricing information for press and reviewers.",
}

/**
 * Path to the press kit archive in /public.
 * Drop the zip at public/press/chordlist-press-kit.zip to enable the download.
 */
const PRESS_KIT_ZIP = "/press/chordlist-press-kit.zip"

/** Replace or extend these entries as real screenshots are added. */
const screenshots: Screenshot[] = [
  {
    src: "/press/screenshot-library.png",
    title: "Song library",
    description:
      "Every song in one browsable list, backed by a folder of plain markdown files on the device. Search and open a song without an account or a network connection.",
  },
  {
    src: "/press/screenshot-chords.png",
    title: "Chords above lyrics",
    description:
      "Chord symbols sit directly above the words they belong to, so a song can be read and played at a glance. Transpose on the fly without editing the file.",
  },
  {
    src: "/press/screenshot-editor.png",
    title: "Plain markdown editor",
    description:
      "Songs are edited as ordinary markdown with inline chord brackets. The file stays readable in any other text editor, so nothing is locked into the app.",
  },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">chordlist</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Press Kit</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Everything needed to write about chordlist: app icon, screenshots, product details, and pricing. The archive
            below contains full-resolution assets.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a href={PRESS_KIT_ZIP} download>
                  <Download className="size-4" aria-hidden="true" />
                  Download press kit
                </a>
              }
            />
            <a
              href="mailto:marketing@chordlist.app"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Request something else
            </a>
          </div>
        </header>

        <div className="mt-4 flex flex-col">
          <CollapsibleSection title="Screenshots" meta={`${screenshots.length} images`} defaultOpen>
            <div className="flex flex-col gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Select any screenshot to view it full screen with a description. Full-resolution versions are included
                in the press kit archive.
              </p>
              <ScreenshotGallery screenshots={screenshots} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Pricing">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pricing details will be added here.
            </p>
          </CollapsibleSection>

          <CollapsibleSection title="App details">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[10rem_1fr]">
              <DetailRow label="Name" value="chordlist" />
              <DetailRow label="Developer" value="makerer studio" />
              <DetailRow label="Platforms" value="iOS and iPadOS" />
              <DetailRow label="Category" value="Music" />
              <DetailRow label="Website" value="chordlist.app" href="https://chordlist.app" />
              <DetailRow label="Press contact" value="marketing@chordlist.app" href="mailto:marketing@chordlist.app" />
            </dl>
          </CollapsibleSection>

          <CollapsibleSection title="Boilerplate description">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                chordlist is a local-first songbook for iOS that stores lyrics and chords as plain markdown files on the
                user&apos;s own device. Chords are written inline above the words, so a song stays readable both in the
                app and in any other text editor.
              </p>
              <p>
                There are no accounts, no cloud requirement, and no lock-in. The files belong to the user and are never
                shared unless they choose to share them.
              </p>
            </div>
          </CollapsibleSection>
        </div>
      </article>

      <footer className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <a href="/" className="font-mono transition-colors hover:text-foreground">
          chordlist
        </a>
        <span>Local-first. No lock-in. Your data, always.</span>
      </footer>
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
