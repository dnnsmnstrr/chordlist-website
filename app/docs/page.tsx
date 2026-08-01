import type { Metadata } from "next"

import { DocsSidebar } from "@/components/docs-sidebar"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"
import { docsCopy } from "@/locales/en"

export const metadata: Metadata = {
  title: docsCopy.metadata.title,
  description: docsCopy.metadata.description,
  alternates: { canonical: "/docs" },
}

const externalLinks = {
  appleKeepDownloaded:
    "https://support.apple.com/guide/iphone/transfer-files-iphone-a-storage-device-server-iphe9aff429a/ios",
  obsidianICloud: "https://obsidian.md/help/Getting%20started/Sync%20your%20notes%20across%20devices#iCloud",
} as const

export default function DocsPage() {
  const sections = docsCopy.sections

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-3xl border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{docsCopy.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {docsCopy.introduction}
          </p>
        </header>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <DocsSidebar title={docsCopy.onThisPage} items={docsCopy.tableOfContents} />

          <div className="min-w-0 flex flex-col gap-14">
            <DocsSection id="getting-started" title={sections.gettingStarted.title}>
              <Paragraphs paragraphs={sections.gettingStarted.paragraphs} />
            </DocsSection>

            <DocsSection id="library" title={sections.library.title}>
              <FeatureList features={sections.library.features} />
            </DocsSection>

            <DocsSection id="playing" title={sections.playing.title}>
              <FeatureList features={sections.playing.features} />
            </DocsSection>

            <DocsSection id="adding-songs" title={sections.addingSongs.title}>
              <Paragraphs paragraphs={sections.addingSongs.paragraphs} />
            </DocsSection>

            <DocsSection id="file-format" title={sections.fileFormat.title}>
              <p>{sections.fileFormat.introduction}</p>
              <CodeExample label={sections.fileFormat.fileTreeLabel} code={sections.fileFormat.fileTree} />
              <CodeExample label={sections.fileFormat.markdownLabel} code={sections.fileFormat.markdown} />
              <BulletList items={sections.fileFormat.notes} />
            </DocsSection>

            <DocsSection id="other-apps" title={sections.otherApps.title}>
              <p>{sections.otherApps.introduction}</p>
              <FeatureList features={sections.otherApps.options} />
            </DocsSection>

            <DocsSection id="obsidian" title={sections.obsidian.title}>
              <p>{sections.obsidian.introduction}</p>
              <NumberedList items={sections.obsidian.steps} />
              <Callout>{sections.obsidian.note}</Callout>
              <ExternalLink href={externalLinks.obsidianICloud}>{sections.obsidian.helpLink}</ExternalLink>
            </DocsSection>

            <DocsSection id="offline" title={sections.offline.title}>
              <p>{sections.offline.introduction}</p>
              <NumberedList items={sections.offline.steps} />
              <BulletList items={sections.offline.notes} />
              <ExternalLink href={externalLinks.appleKeepDownloaded}>{sections.offline.appleLink}</ExternalLink>
            </DocsSection>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}

function DocsSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-balance text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 flex flex-col gap-5 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
}

function FeatureList({ features }: { features: readonly { title: string; body: string }[] }) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2">
      {features.map((feature) => (
        <div key={feature.title} className="rounded-xl border border-border p-5">
          <dt className="font-medium text-foreground">{feature.title}</dt>
          <dd className="mt-2 text-sm leading-relaxed">{feature.body}</dd>
        </div>
      ))}
    </dl>
  )
}

function CodeExample({ label, code }: { label: string; code: string }) {
  return (
    <figure>
      <figcaption className="mb-2 font-mono text-xs uppercase tracking-wide">{label}</figcaption>
      <pre className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-5 font-mono text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </figure>
  )
}

function NumberedList({ items }: { items: readonly string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-3 pl-5 marker:font-mono marker:text-foreground">
      {items.map((item) => (
        <li key={item} className="pl-2">
          {item}
        </li>
      ))}
    </ol>
  )
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-3 pl-5 marker:text-foreground">
      {items.map((item) => (
        <li key={item} className="pl-2">
          {item}
        </li>
      ))}
    </ul>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return <aside className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed">{children}</aside>
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
    >
      {children}
    </a>
  )
}
