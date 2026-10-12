import type { Metadata } from "next"

import { BannerBuilder } from "@/components/banner-builder"
import { InlineMarkup } from "@/components/inline-markup"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { pageMetadata } from "@/lib/page-metadata"
import { requireAdmin } from "@/lib/server/admin-auth"
import { bannerCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/banner",
  title: bannerCopy.metadata.title,
  description: bannerCopy.metadata.description,
  // Unlisted, so it gets no generated card of its own.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

/// Headers and banners at any size. Everything happens on a canvas in the browser — the
/// screenshots and photographs it draws are already public — so the page needs nothing from the
/// server beyond the login.
export default async function BannerPage() {
  await requireAdmin("/banner")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-6 py-16">
        <header className="mx-auto max-w-5xl border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{bannerCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{bannerCopy.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            <InlineMarkup text={bannerCopy.introduction} />
          </p>
        </header>

        <div className="mt-8">
          <BannerBuilder />
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}
