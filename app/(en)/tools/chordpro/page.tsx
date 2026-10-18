import type { Metadata } from "next"
import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"

import { ChordProConverter } from "@/components/chordpro-converter"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { pageMetadata } from "@/lib/page-metadata"
import { chordProCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/tools/chordpro",
  title: chordProCopy.metadata.title,
  description: chordProCopy.metadata.description,
})

/** Also offered as a download, beside the Markdown version of the same song. */
const SAMPLE_FILE = "morning-light.pro"

export default async function ChordProToolPage() {
  const sample = await readFile(path.join(process.cwd(), "public", "songs", SAMPLE_FILE), "utf8")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-2xl">
          <p className="font-mono text-sm text-muted-foreground">{chordProCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{chordProCopy.title}</h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{chordProCopy.introduction}</p>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            {chordProCopy.privacy}{" "}
            <Link
              href="/docs#chordpro"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {chordProCopy.docsLink}
            </Link>
          </p>
        </header>

        <ChordProConverter sample={sample} sampleFileName={SAMPLE_FILE} />
      </article>

      <SiteFooter />
    </main>
  )
}
