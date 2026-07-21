import Link from "next/link"
import { ChordlistIcon } from "@/components/chordlist-icon"

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        aria-label="chordlist home"
        className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-foreground text-background">
          <ChordlistIcon className="h-full w-full" />
        </span>
        <span className="font-mono text-lg font-semibold tracking-tight">chordlist</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#features" className="transition-colors hover:text-foreground">
          Features
        </a>
        <a href="#preview" className="hidden transition-colors hover:text-foreground sm:inline">
          Format
        </a>
        <a href="#keys" className="transition-colors hover:text-foreground">
          Play
        </a>
      </nav>
    </header>
  )
}
