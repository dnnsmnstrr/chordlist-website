import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

import { imprintHref } from "@/lib/legal-routes"
import { siteConfig } from "@/lib/site-config"
import { supportHref } from "@/lib/support-routes"
import { defaultLanguage, dictionary, homeHref, type Language } from "@/locales"
import type { Route } from "next"

export function SiteFooter({
  compact = false,
  language = defaultLanguage,
  alternates,
}: {
  compact?: boolean
  language?: Language
  alternates?: Partial<Record<Language, Route>>
}) {
  const { common } = dictionary(language)

  return (
    <footer
      className={`mx-auto flex w-full flex-col items-center justify-between gap-5 px-6 py-10 text-sm text-muted-foreground sm:flex-row ${
        compact ? "max-w-3xl" : "max-w-5xl"
      }`}
    >
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <Link href={homeHref[language]} className="font-mono transition-colors hover:text-foreground">
          {siteConfig.name}
        </Link>
        {alternates ? <LanguageSwitcher current={language} alternates={alternates} /> : null}
      </div>

      <nav
        aria-label={common.navigation.footerLabel}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
      >
        <Link href={supportHref[language]} className="transition-colors hover:text-foreground">
          {common.navigation.support}
        </Link>
        <Link href="/faq" className="transition-colors hover:text-foreground">
          {common.navigation.faq}
        </Link>
        <Link href="/press" className="transition-colors hover:text-foreground">
          {common.navigation.press}
        </Link>
        {/* <Link href="/screens" className="transition-colors hover:text-foreground">
          {common.navigation.screens}
        </Link>
        <Link href="/social/posts" className="transition-colors hover:text-foreground">
          {common.navigation.socialPosts}
        </Link> */}
        <Link href="/privacy" className="transition-colors hover:text-foreground">
          {common.navigation.privacy}
        </Link>
        <Link href={imprintHref[language]} className="transition-colors hover:text-foreground">
          {common.navigation.imprint}
        </Link>
        <a
          href={siteConfig.social.x.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={common.navigation.x}
          className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-4" />
        </a>
        <a
          href={siteConfig.social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={common.navigation.instagram}
          className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <InstagramIcon className="size-4" />
        </a>
      </nav>
    </footer>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
