import { Button } from "@/components/ui/button"
import { Apple } from "lucide-react"

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-20 text-center sm:pt-20">
      <span className="inline-block rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
        Local-first songbook for iOS
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Your lyrics and chords, as files in your folder.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        chordlist keeps every song as a simple markdown file on your device. No accounts, no cloud, no lock-in. The data
        is yours and is never shared (unless you share it).
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="gap-2">
          <Apple className="size-4" aria-hidden="true" />
          Download on iOS
        </Button>
        <Button size="lg" variant="outline" nativeButton={false} render={<a href="#preview">See the format</a>} />
      </div>
    </section>
  )
}
