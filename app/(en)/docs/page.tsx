import type { Metadata } from "next"
import Link from "next/link"

import { CollapsibleSection } from "@/components/collapsible-section"
import { DocsSidebar } from "@/components/docs-sidebar"
import { CalloutList, DocsScreenshot, type DocsScreenshotName, type ScreenshotMarker } from "@/components/docs-screenshot"
import { InlineMarkup } from "@/components/inline-markup"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig } from "@/lib/site-config"
import { docsCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/docs",
  title: docsCopy.metadata.title,
  description: docsCopy.metadata.description,
})

const externalLinks = {
  appleKeepDownloaded:
    "https://support.apple.com/guide/iphone/transfer-files-iphone-a-storage-device-server-iphe9aff429a/ios",
  obsidianICloud: "https://obsidian.md/help/Getting%20started/Sync%20your%20notes%20across%20devices#iCloud",
  appleRefund: "https://reportaproblem.apple.com",
} as const

/** Paired by position with `sections.gettingStarted.steps`. */
const quickStartScreenshots: readonly DocsScreenshotName[] = ["01-Song-List", "03-Creation-Flow", "02-Song-Detail"]

/** Paired by position with `sections.library.figures`. */
const libraryScreenshots: readonly DocsScreenshotName[] = ["04-Search", "05-Tag-Filter"]

/**
 * Where each numbered marker sits, as percentages of the capture. Paired by position with the
 * `callouts` of the section they illustrate, so reordering one means reordering the other.
 * The playing callouts run across two captures: the first five on the song, the rest on its end.
 */
const markers = {
  playing: [
    [
      { x: 64, y: 15.2 },
      { x: 66, y: 38.4 },
      { x: 34, y: 91.5 },
      { x: 66, y: 88 },
      { x: 93, y: 88 },
    ],
    [
      { x: 76, y: 27.4 },
      { x: 44, y: 36.3 },
    ],
  ],
  unlimited: [
    { x: 27, y: 56.8 },
    { x: 94, y: 77.5 },
    { x: 94, y: 84.5 },
    { x: 23, y: 97.6 },
  ],
  addingSongs: [
    { x: 70, y: 13.4 },
    { x: 88, y: 31.6 },
    { x: 72, y: 46.7 },
    { x: 64, y: 80.6 },
    { x: 88, y: 71 },
  ],
} as const satisfies {
  playing: readonly (readonly ScreenshotMarker[])[]
  unlimited: readonly ScreenshotMarker[]
  addingSongs: readonly ScreenshotMarker[]
}

export default function DocsPage() {
  const sections = docsCopy.sections
  const [songsGroup, filesGroup, otherGroup] = docsCopy.tableOfContents
  const playingOnSong = markers.playing[0].length

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-3xl border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{docsCopy.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {docsCopy.introduction}
          </p>
        </header>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <DocsSidebar title={docsCopy.onThisPage} groups={docsCopy.tableOfContents} />

          <div className="min-w-0 flex flex-col gap-16">
            <GroupLabel>{songsGroup.label}</GroupLabel>
            <DocsSection id="getting-started" title={sections.gettingStarted.title}>
              <p>{sections.gettingStarted.introduction}</p>
              <ol className="grid gap-8 sm:grid-cols-3 sm:gap-5">
                {sections.gettingStarted.steps.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-4">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 font-medium text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed">
                        <InlineMarkup text={step.body} />
                      </p>
                    </div>
                    <DocsScreenshot
                      name={quickStartScreenshots[index] ?? "01-Song-List"}
                      alt={step.alt}
                      className="mt-auto max-w-56"
                    />
                  </li>
                ))}
              </ol>
              <BulletList items={sections.gettingStarted.notes} />
            </DocsSection>

            <DocsSection id="library" title={sections.library.title}>
              <p>{sections.library.introduction}</p>
              <div className="grid grid-cols-2 gap-4 sm:max-w-md sm:gap-6">
                {sections.library.figures.map((figure, index) => (
                  <figure key={figure.caption}>
                    <DocsScreenshot name={libraryScreenshots[index] ?? "04-Search"} alt={figure.alt} />
                    <figcaption className="mt-3 text-pretty text-sm">{figure.caption}</figcaption>
                  </figure>
                ))}
              </div>
              <FeatureList features={sections.library.features} />
            </DocsSection>

            <DocsSection id="playing" title={sections.playing.title}>
              <p>{sections.playing.introduction}</p>
              <AnnotatedFigure
                screenshots={
                  <div className="grid grid-cols-2 gap-4">
                    <DocsScreenshot
                      name="02-Song-Detail"
                      alt={sections.playing.figures[0].alt}
                      markers={markers.playing[0]}
                    />
                    <DocsScreenshot
                      name="07-Song-Suggestions"
                      alt={sections.playing.figures[1].alt}
                      markers={markers.playing[1]}
                      firstMarker={playingOnSong + 1}
                    />
                  </div>
                }
                callouts={sections.playing.callouts}
                wide
              />
              <Callout>
                <InlineMarkup text={sections.playing.tip} />
              </Callout>
            </DocsSection>

            <DocsSection id="adding-songs" title={sections.addingSongs.title}>
              <p>
                <InlineMarkup text={sections.addingSongs.introduction} />
              </p>
              <AnnotatedFigure
                screenshots={
                  <DocsScreenshot
                    name="03-Creation-Flow"
                    alt={sections.addingSongs.figure.alt}
                    markers={markers.addingSongs}
                  />
                }
                callouts={sections.addingSongs.callouts}
              />
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.addingSongs.otherWaysTitle}
              </h3>
              <FeatureList features={sections.addingSongs.otherWays} columns={3} />
              <p className="text-sm">{sections.addingSongs.note}</p>
            </DocsSection>

            <DocsSection id="chords" title={sections.chords.title}>
              <p>{sections.chords.introduction}</p>
              <div className="flex flex-col gap-8">
                {sections.chords.examples.map((example, index) => (
                  <div key={example.title} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-6">
                    <div>
                      <h3 className="font-medium text-foreground">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {example.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed">{example.body}</p>
                    </div>
                    <CodeExample label={example.label} code={example.code} />
                  </div>
                ))}
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.chords.headingsTitle}
              </h3>
              <p>
                <InlineMarkup text={sections.chords.headingsIntroduction} />
              </p>
              <ul className="flex flex-wrap gap-2">
                {sections.chords.headings.map((heading) => (
                  <li
                    key={heading}
                    className="rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-sm text-foreground"
                  >
                    [{heading}]
                  </li>
                ))}
              </ul>
              <p>
                <InlineMarkup text={sections.chords.headingsNote} />
              </p>
              <Callout>
                <InlineMarkup text={sections.chords.progressionNote} />
              </Callout>
            </DocsSection>

            <GroupLabel>{filesGroup.label}</GroupLabel>
            <DocsSection id="file-format" title={sections.fileFormat.title}>
              <p>{sections.fileFormat.introduction}</p>
              <PathDiagram label={sections.fileFormat.diagram.label} parts={sections.fileFormat.diagram.parts} />
              <CodeExample label={sections.fileFormat.fileTreeLabel} code={sections.fileFormat.fileTree} />
              <SongFileAnatomy {...sections.fileFormat.songFile} />

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.fileFormat.fieldsTitle}
              </h3>
              <FieldTable columns={sections.fileFormat.fieldsColumns} fields={sections.fileFormat.fields} />
              <BulletList items={sections.fileFormat.notes} />
            </DocsSection>

            <DocsSection id="other-apps" title={sections.otherApps.title}>
              <p>{sections.otherApps.introduction}</p>
              <FeatureList features={sections.otherApps.options} columns={3} />
            </DocsSection>

            <DocsSection id="obsidian" title={sections.obsidian.title}>
              <p>{sections.obsidian.introduction}</p>
              <NumberedList items={sections.obsidian.steps} />
              <CodeExample label={sections.obsidian.exampleLabel} code={sections.obsidian.example} />
              <Callout>{sections.obsidian.note}</Callout>
              <ExternalLink href={externalLinks.obsidianICloud}>{sections.obsidian.helpLink}</ExternalLink>
            </DocsSection>

            <DocsSection id="offline" title={sections.offline.title}>
              <p>{sections.offline.introduction}</p>
              <NumberedList items={sections.offline.steps} />
              <BulletList items={sections.offline.notes} />
              <ExternalLink href={externalLinks.appleKeepDownloaded}>{sections.offline.appleLink}</ExternalLink>
            </DocsSection>

            <GroupLabel>{otherGroup.label}</GroupLabel>
            <DocsSection id="unlimited" title={sections.unlimited.title}>
              <p>
                <InlineMarkup text={sections.unlimited.introduction} />
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {sections.unlimited.includesTitle}
              </h3>
              <FeatureList features={sections.unlimited.includes} columns={3} />

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.unlimited.freeTitle}
              </h3>
              <BulletList items={sections.unlimited.free} />

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.unlimited.buyTitle}
              </h3>
              <NumberedList items={sections.unlimited.buySteps} />
              <AnnotatedFigure
                screenshots={
                  <DocsScreenshot
                    name="08-Paywall"
                    alt={sections.unlimited.figure.alt}
                    markers={markers.unlimited}
                  />
                }
                callouts={sections.unlimited.callouts}
              />
              <Callout>
                <InlineMarkup text={sections.unlimited.offerCode} />
              </Callout>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {sections.unlimited.problemsTitle}
              </h3>
              <div className="border-t border-border">
                {sections.unlimited.problems.map((item) => (
                  <CollapsibleSection key={item.question} title={item.question}>
                    <p className="text-pretty leading-relaxed">
                      <InlineMarkup text={item.answer} />
                    </p>
                  </CollapsibleSection>
                ))}
              </div>
              <ExternalLink href={externalLinks.appleRefund}>{sections.unlimited.refundLink}</ExternalLink>
              <p className="text-sm">
                {sections.unlimited.privacy}{" "}
                <Link href="/privacy" className={linkClassName}>
                  {sections.unlimited.privacyLink}
                </Link>
                .
              </p>
            </DocsSection>

            <DocsSection id="troubleshooting" title={sections.troubleshooting.title}>
              <p>{sections.troubleshooting.introduction}</p>
              <div className="border-t border-border">
                {sections.troubleshooting.items.map((item) => (
                  <CollapsibleSection key={item.question} title={item.question}>
                    <p className="text-pretty leading-relaxed">
                      <InlineMarkup text={item.answer} />
                    </p>
                  </CollapsibleSection>
                ))}
              </div>
              <p className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="text-foreground">{sections.troubleshooting.moreHelp}</span>
                <Link href="/faq" className={linkClassName}>
                  {sections.troubleshooting.faqLink}
                </Link>
                <Link href="/support" className={linkClassName}>
                  {sections.troubleshooting.supportLink}
                </Link>
              </p>
            </DocsSection>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}

const linkClassName =
  "w-fit font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"

/** Opens a group of sections, matching the group headings in the sidebar. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="-mb-8 border-b border-border pb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground first:mt-0 [&:not(:first-child)]:mt-4">
      {children}
    </p>
  )
}

function DocsSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 lg:scroll-mt-8">
      <h2 className="text-balance text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 flex flex-col gap-5 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

type AnnotatedFigureProps = {
  screenshots: React.ReactNode
  callouts: readonly { title: string; body: string }[]
  /** Two captures side by side need a wider column than one. */
  wide?: boolean
}

function AnnotatedFigure({ screenshots, callouts, wide = false }: AnnotatedFigureProps) {
  return (
    <figure
      className={
        wide
          ? "grid items-start gap-8 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
          : "grid items-start gap-8 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
      }
    >
      <div className={wide ? "max-w-md" : "max-w-60"}>{screenshots}</div>
      <figcaption>
        <p className="mb-4 font-mono text-xs uppercase tracking-wide">{docsCopy.annotatedFigureHint}</p>
        <CalloutList items={callouts} />
      </figcaption>
    </figure>
  )
}

function FeatureList({
  features,
  columns = 2,
}: {
  features: readonly { title: string; body: string }[]
  columns?: 2 | 3
}) {
  return (
    <dl className={columns === 3 ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-5 sm:grid-cols-2"}>
      {features.map((feature) => (
        <div key={feature.title} className="rounded-xl border border-border p-5">
          <dt className="font-medium text-foreground">{feature.title}</dt>
          <dd className="mt-2 text-sm leading-relaxed">
            <InlineMarkup text={feature.body} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

function CodeExample({ label, code }: { label: string; code: string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 font-mono text-xs uppercase tracking-wide">{label}</figcaption>
      <pre className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-5 font-mono text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </figure>
  )
}

type PathDiagramProps = {
  label: string
  parts: readonly { value: string; meaning: string }[]
}

/** A file path split into the pieces the app reads, each labelled with what it becomes. */
function PathDiagram({ label, parts }: PathDiagramProps) {
  return (
    <figure className="rounded-xl border border-border p-5 sm:p-6">
      <figcaption className="mb-5 font-mono text-xs uppercase tracking-wide">{label}</figcaption>
      <ol className="flex flex-wrap gap-x-1.5 gap-y-4">
        {parts.map((part) => (
          <li key={part.value} className="flex flex-col">
            <span className="border-b-2 border-foreground px-1 pb-1.5 font-mono text-base text-foreground sm:text-lg">
              {part.value}
            </span>
            <span className="mt-2 px-1 pr-3 text-xs leading-snug">{part.meaning}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}

type SongFileAnatomyProps = {
  label: string
  fileName: string
  parts: readonly { title: string; body: string; code: string }[]
}

/** One song file, split at the frontmatter, with each part explained beside its own lines. */
function SongFileAnatomy({ label, fileName, parts }: SongFileAnatomyProps) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 font-mono text-xs uppercase tracking-wide">{label}</figcaption>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-muted px-4 py-2.5 font-mono text-xs">{fileName}</div>
        {parts.map((part) => (
          <div
            key={part.title}
            className="grid border-b border-border last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]"
          >
            <pre className="overflow-x-auto bg-muted/50 p-5 font-mono text-sm leading-relaxed text-foreground">
              <code>{part.code}</code>
            </pre>
            <div className="border-t border-border p-5 text-sm leading-relaxed md:border-l md:border-t-0">
              <p className="font-medium text-foreground">{part.title}</p>
              <p className="mt-1">
                <InlineMarkup text={part.body} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </figure>
  )
}

type FieldTableProps = {
  columns: { field: string; purpose: string; example: string }
  fields: readonly { field: string; purpose: string; example: string }[]
}

function FieldTable({ columns, fields }: FieldTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead className="bg-muted/50 text-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              {columns.field}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {columns.purpose}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {columns.example}
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.field} className="border-t border-border align-top">
              <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-normal text-foreground">
                {field.field}
              </th>
              <td className="px-4 py-3 leading-relaxed">{field.purpose}</td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">{field.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NumberedList({ items }: { items: readonly string[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-3 pl-5 marker:font-mono marker:text-foreground">
      {items.map((item) => (
        <li key={item} className="pl-2">
          <InlineMarkup text={item} />
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
          <InlineMarkup text={item} />
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
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {children}
    </a>
  )
}
