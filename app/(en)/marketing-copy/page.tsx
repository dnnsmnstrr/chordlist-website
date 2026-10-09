import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { CopyableMarkdown } from "@/components/copyable-markdown"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { renderMarkdown } from "@/lib/markdown"
import { marketingCopyPath, prepareMarketingCopy } from "@/lib/marketing-copy"
import { pageMetadata } from "@/lib/page-metadata"
import { requireAdmin } from "@/lib/server/admin-auth"
import { marketingCopyPageCopy as copy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/marketing-copy",
  title: copy.metadata.title,
  description: copy.metadata.description,
  // Unlisted, so it gets no generated card of its own.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

/**
 * docs/launch-copy.md, rendered. The file stays the source: it is reviewed in pull requests like
 * any other doc, and this page only reads it, so there is no second copy of the text to drift.
 */
export default async function MarketingCopyPage() {
  await requireAdmin("/marketing-copy")

  const source = await readFile(path.join(process.cwd(), marketingCopyPath), "utf8")
  const html = renderMarkdown(prepareMarketingCopy(source))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {copy.backToAdmin}
        </Link>

        <header className="mt-6 border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{copy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{copy.introduction}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{copy.source}</p>
        </header>

        <div className="mt-10">
          <CopyableMarkdown html={html} copyLabel={copy.copy} copiedLabel={copy.copied} />
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}
