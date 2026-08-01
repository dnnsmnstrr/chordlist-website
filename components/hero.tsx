import { AppCTA } from "@/components/app-cta"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-20 text-center sm:pt-20">
      <span className="inline-block rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
        Local-first songbook for iOS
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        {siteConfig.tagline}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {siteConfig.name} keeps every song as a Markdown file in a folder you choose. The app does not upload or sync
        your library. Your files remain portable, readable, and under your control.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <AppCTA large />
        <Button size="lg" variant="outline" nativeButton={false} render={<a href="#preview">See the format</a>} />
      </div>
    </section>
  )
}
