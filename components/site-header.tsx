import { KeySquare } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
          <KeySquare className="size-4" aria-hidden="true" />
        </span>
        <span className="font-mono text-lg font-semibold tracking-tight">Chordlist</span>
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
