import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { LyricPreview } from "@/components/lyric-preview"
import { PianoKeyboard } from "@/components/piano-keyboard"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <Features />
      <LyricPreview />

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <span className="font-mono">chordlist</span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </a>
          <span>Local-first. No lock-in. Your data, always.</span>
        </div>
      </footer>

      <section id="keys" aria-label="Interactive piano keyboard" className="w-full border-t border-border">
        <PianoKeyboard />
      </section>
    </main>
  )
}
