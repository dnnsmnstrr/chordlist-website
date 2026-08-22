import type { Metadata } from "next"
import Link from "next/link"
import { Download } from "lucide-react"

import { CollapsibleSection } from "@/components/collapsible-section"
import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig, storeListingLink } from "@/lib/site-config"
import { pressCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/press",
  title: pressCopy.metadata.title,
  description: pressCopy.metadata.description,
})

const screenshots: readonly Screenshot[] = [
  {
    lightSrc: "/app-screenshots/light/01-Song-List.png",
    darkSrc: "/app-screenshots/dark/01-Song-List.png",
    ...pressCopy.screenshots.items[0],
  },
  {
    lightSrc: "/app-screenshots/light/02-Song-Detail.png",
    darkSrc: "/app-screenshots/dark/02-Song-Detail.png",
    ...pressCopy.screenshots.items[1],
  },
  {
    lightSrc: "/app-screenshots/light/03-Creation-Flow.png",
    darkSrc: "/app-screenshots/dark/03-Creation-Flow.png",
    ...pressCopy.screenshots.items[2],
  },
  {
    lightSrc: "/app-screenshots/light/04-Search.png",
    darkSrc: "/app-screenshots/dark/04-Search.png",
    ...pressCopy.screenshots.items[3],
  },
  {
    lightSrc: "/app-screenshots/light/05-Tag-Filter.png",
    darkSrc: "/app-screenshots/dark/05-Tag-Filter.png",
    ...pressCopy.screenshots.items[4],
  },
  {
    lightSrc: "/app-screenshots/light/06-Settings.png",
    darkSrc: "/app-screenshots/dark/06-Settings.png",
    ...pressCopy.screenshots.items[5],
  },
  {
    lightSrc: "/app-screenshots/light/07-Song-Suggestions.png",
    darkSrc: "/app-screenshots/dark/07-Song-Suggestions.png",
    ...pressCopy.screenshots.items[6],
  },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{pressCopy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {pressCopy.introduction}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {siteConfig.links.pressKitArchive ? (
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a href={siteConfig.links.pressKitArchive} download>
                    <Download aria-hidden="true" />
                    {pressCopy.downloadArchive}
                  </a>
                }
              />
            ) : (
              <Button size="lg" disabled>
                <Download aria-hidden="true" />
                {pressCopy.archiveComingSoon}
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
          <CollapsibleSection
            title={pressCopy.screenshots.sectionTitle}
            meta={pressCopy.screenshots.count(screenshots.length)}
            defaultOpen
          >
            <div className="flex flex-col gap-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pressCopy.screenshots.introductionBeforeLink}
                <Link
                  href="/screens"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  {pressCopy.screenshots.screensLink}
                </Link>
                {pressCopy.screenshots.introductionAfterLink}
              </p>
              <ScreenshotGallery screenshots={screenshots} />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title={pressCopy.availability.sectionTitle}>
            <p className="text-sm leading-relaxed text-muted-foreground">{pressCopy.availability.body}</p>
          </CollapsibleSection>

          <CollapsibleSection title={pressCopy.details.sectionTitle}>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[10rem_1fr]">
              <DetailRow label={pressCopy.details.labels.name} value={siteConfig.name} />
              <DetailRow label={pressCopy.details.labels.developer} value={siteConfig.operator} />
              <DetailRow label={pressCopy.details.labels.platforms} value={pressCopy.details.platforms} />
              <DetailRow label={pressCopy.details.labels.requirements} value={pressCopy.details.requirements} />
              <DetailRow label={pressCopy.details.labels.category} value={pressCopy.details.category} />
              <DetailRow label={pressCopy.details.labels.website} value={pressCopy.details.website} href={siteConfig.url} />
              <DetailRow
                label={pressCopy.details.labels.pressContact}
                value={siteConfig.contact.press}
                href={`mailto:${siteConfig.contact.press}`}
              />
              {storeListingLink ? (
                <DetailRow
                  label={pressCopy.details.labels.appStoreLink}
                  value={pressCopy.details.appStoreLink}
                  href={storeListingLink}
                />
              ) : null}
            </dl>
          </CollapsibleSection>

          <CollapsibleSection title={pressCopy.boilerplate.sectionTitle}>
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              {pressCopy.boilerplate.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
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
