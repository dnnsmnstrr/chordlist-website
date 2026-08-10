import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { AppShowcase } from "@/components/app-showcase"
import { Features } from "@/components/features"
import { LyricPreview } from "@/components/lyric-preview"
import { ClosingCTA } from "@/components/closing-cta"
import { PianoKeyboard } from "@/components/piano-keyboard"
import { SiteFooter } from "@/components/site-footer"
import { StructuredData } from "@/components/structured-data"
import { pianoCopy } from "@/locales/en"

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <StructuredData />
      <SiteHeader />
      <Hero />
      <AppShowcase />
      <Features />
      <LyricPreview />
      <ClosingCTA />

      <SiteFooter />

      <section aria-label={pianoCopy.label} className="w-full border-t border-border">
        <PianoKeyboard />
      </section>
    </main>
  )
}
