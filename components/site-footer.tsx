import Link from "next/link"

import { siteConfig } from "@/lib/site-config"

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
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Link href="/faq" className="transition-colors hover:text-foreground">
          FAQ
        </Link>
        <Link href="/press" className="transition-colors hover:text-foreground">
          Press
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-foreground">
          Privacy
        </Link>
        <a
          href={siteConfig.links.terms}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Terms
        </a>
        <a
          href={siteConfig.social.x.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          X
        </a>
        <a
          href={siteConfig.social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Instagram
        </a>
      </nav>
    </footer>
  )
}

