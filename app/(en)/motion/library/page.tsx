import type { Metadata } from "next"

import { InlineMarkup } from "@/components/inline-markup"
import { MotionLibrary } from "@/components/motion-library"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { plainInlineText } from "@/lib/inline-markup"
import { customItems, suiteItems } from "@/lib/motion/library"
import { pageMetadata } from "@/lib/page-metadata"
import { requireAdmin } from "@/lib/server/admin-auth"
import { motionLibraryCopy } from "@/locales/en"

/// Every rendered motion video, to share or download from a phone. Unlike the editor beside it,
/// it only reads committed files under public/, so it works on the deployed site behind the login.
export const metadata: Metadata = pageMetadata({
  path: "/motion/library",
  title: motionLibraryCopy.metadata.title,
  description: plainInlineText(motionLibraryCopy.metadata.description),
  // Unlisted, so it gets no generated card of its own.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

export default async function MotionLibraryPage() {
  await requireAdmin("/motion/library")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-2xl border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{motionLibraryCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {motionLibraryCopy.title}
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            <InlineMarkup text={motionLibraryCopy.introduction} />
          </p>
        </header>

        <MotionLibrary title={motionLibraryCopy.sections.suite} items={suiteItems()} />
        <MotionLibrary title={motionLibraryCopy.sections.custom} items={customItems()} />
      </article>

      <SiteFooter />
    </main>
  )
}
