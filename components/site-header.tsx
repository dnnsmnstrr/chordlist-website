import type { Route } from "next"
import Link from "next/link"

import { AppCTA } from "@/components/app-cta"
import { ChordlistIcon } from "@/components/chordlist-icon"
import { siteConfig } from "@/lib/site-config"
import { defaultLanguage, dictionary, homeHref, type Language } from "@/locales"

type SiteHeaderProps = {
  language?: Language
  /** This page in every language it exists in. Omitted on routes that are English-only. */
  alternates?: Partial<Record<Language, Route>>
}

export function SiteHeader({ language = defaultLanguage }: SiteHeaderProps) {
  const { common } = dictionary(language)

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link
        href={homeHref[language]}
        aria-label={common.navigation.homeLabel}
        className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-logo-tile text-logo-glyph shadow-logo">
          <ChordlistIcon className="h-full w-full" />
        </span>
        {/* The icon carries the brand on narrow phones; the full row does not fit
            below sm once Docs, Blog, and the CTA are all present. The link keeps its
            aria-label, so its accessible name is unchanged. */}
        <span className="hidden font-mono text-lg font-semibold tracking-tight sm:inline">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-6">
        <Link href={`${homeHref[language]}#features`} className="hidden transition-colors hover:text-foreground sm:inline">
          {common.navigation.features}
        </Link>
        {/* Docs and Blog are English-only, so they keep their English URLs in every
            language rather than pointing at a translation that does not exist. */}
        <Link href="/docs" className="transition-colors hover:text-foreground">
          {common.navigation.docs}
        </Link>
        <Link href="/blog" className="transition-colors hover:text-foreground">
          {common.navigation.blog}
        </Link>
        <AppCTA language={language} />
      </nav>
    </header>
  )
}
