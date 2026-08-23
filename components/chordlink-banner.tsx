import type { Route } from "next"
import Link from "next/link"
import { ArrowRight, Nfc } from "lucide-react"

import { defaultLanguage, dictionary, type Language } from "@/locales"

export function ChordlinkBanner({ language = defaultLanguage }: { language?: Language }) {
  const { chordlinkBanner } = dictionary(language).home
  const href = language === "de" ? "/de/chordlink" as Route : "/chordlink" as Route

  return (
    <aside aria-label={chordlinkBanner.title} className="mx-auto w-full max-w-5xl px-6 pt-2">
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-2xl border border-border bg-card/70 px-4 py-3 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-logo-tile text-logo-glyph shadow-logo">
          <Nfc aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {chordlinkBanner.eyebrow}
          </span>
          <span className="mt-0.5 block text-sm font-medium sm:text-base">{chordlinkBanner.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          <span className="hidden sm:inline">{chordlinkBanner.action}</span>
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </aside>
  )
}
