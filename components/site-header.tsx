import { ChordlistIcon } from "@/components/chordlist-icon"

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <ChordlistIcon className="h-6 w-auto text-foreground" />
        <span className="font-mono text-lg font-semibold tracking-tight">chordlist</span>
      </div>
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
