import type { Metadata } from "next"
import Link from "next/link"

import { RootShell } from "@/components/root-shell"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { defaultLanguage, dictionary, homeHref } from "@/locales"

/**
 * The 404 page, with its own document.
 *
 * There is one root layout per language now, and a URL that matched nothing belongs to neither, so
 * nothing would wrap the built-in 404 — it rendered a bare `<html>` with no fonts, no stylesheet,
 * and no `lang`. This renders the same shell every real page does, in the default language, since
 * an unmatched path says nothing about what the visitor reads.
 */

const { common } = dictionary(defaultLanguage)

export const metadata: Metadata = {
  title: common.notFound.title,
  description: common.notFound.description,
  robots: { index: false, follow: true },
}

export default function GlobalNotFound() {
  return (
    <RootShell language={defaultLanguage}>
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <section id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">404</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {common.notFound.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            {common.notFound.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={homeHref[defaultLanguage]}>{common.notFound.backHome}</Link>}
            />
          </div>
        </section>
        <SiteFooter />
      </main>
    </RootShell>
  )
}
