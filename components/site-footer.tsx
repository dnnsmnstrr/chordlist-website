import Link from "next/link"

import { siteConfig } from "@/lib/site-config"
import { commonCopy } from "@/locales/en"

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`mx-auto flex w-full flex-col items-center justify-between gap-5 px-6 py-10 text-sm text-muted-foreground sm:flex-row ${
        compact ? "max-w-3xl" : "max-w-5xl"
      }`}
    >
      <Link href="/" className="font-mono transition-colors hover:text-foreground">
        {siteConfig.name}
      </Link>
      <nav
        aria-label={commonCopy.navigation.footerLabel}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
      >
        <Link href="/docs" className="transition-colors hover:text-foreground">
          {commonCopy.navigation.docs}
        </Link>
        <Link href="/faq" className="transition-colors hover:text-foreground">
          {commonCopy.navigation.faq}
        </Link>
        <Link href="/press" className="transition-colors hover:text-foreground">
          {commonCopy.navigation.press}
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-foreground">
          {commonCopy.navigation.privacy}
        </Link>
        <a
          href={siteConfig.links.terms}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          {commonCopy.navigation.terms}
        </a>
        <a
          href={siteConfig.social.x.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          {commonCopy.navigation.x}
        </a>
        <a
          href={siteConfig.social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          {commonCopy.navigation.instagram}
        </a>
      </nav>
    </footer>
  )
}
