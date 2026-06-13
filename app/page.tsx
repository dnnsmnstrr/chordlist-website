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

      <section id="keys" className="border-t border-border bg-foreground/[0.02]">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Play a few notes.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Black keys, white keys — the same palette this whole site is built on.
            </p>
          </div>
          <div className="mt-12">
            <PianoKeyboard />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <span className="font-mono">Chordlist</span>
        <span>Local-first. No lock-in. Your data, always.</span>
      </footer>
    </main>
  )
}
