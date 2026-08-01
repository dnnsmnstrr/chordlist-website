import Link from "next/link"

import { AppCTA } from "@/components/app-cta"
import { ChordlistIcon } from "@/components/chordlist-icon"
import { siteConfig } from "@/lib/site-config"
import { commonCopy } from "@/locales/en"

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        aria-label={commonCopy.navigation.homeLabel}
        className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-foreground text-background">
          <ChordlistIcon className="h-full w-full" />
        </span>
        <span className="font-mono text-lg font-semibold tracking-tight">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-6">
        <Link href="/#features" className="hidden transition-colors hover:text-foreground sm:inline">
          {commonCopy.navigation.features}
        </Link>
        <AppCTA />
      </nav>
    </header>
  )
}
