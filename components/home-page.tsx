import { AppShowcase } from "@/components/app-showcase"
import { ChordlinkBanner } from "@/components/chordlink-banner"
import { ClosingCTA } from "@/components/closing-cta"
import { Features } from "@/components/features"
import { Hero } from "@/components/hero"
import { LyricPreview } from "@/components/lyric-preview"
import { PianoKeyboard } from "@/components/piano-keyboard"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { StructuredData } from "@/components/structured-data"
import { dictionary, homeHref, type Language } from "@/locales"

/**
 * The home page, in one language.
 *
 * `app/(en)/page.tsx` and `app/(de)/de/page.tsx` are each three lines around this, so the two
 * languages cannot drift into different pages. Every section takes the language and reads its own
 * copy from the dictionary; nothing here holds a string.
 */
export function HomePage({ language }: { language: Language }) {
  const { piano } = dictionary(language)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData language={language} />
      <SiteHeader language={language} alternates={homeHref} />

      {/* The skip link's target sits after the header — landing on <main> would put the
          nav back in front of the first Tab and of sequential reading, which is the one
          thing the link exists to avoid. */}
      <div id="main-content" tabIndex={-1}>
        <ChordlinkBanner language={language} />
        <Hero language={language} />
        <AppShowcase language={language} />
        <Features language={language} />
        <LyricPreview language={language} />
        <ClosingCTA language={language} />
      </div>

      <SiteFooter language={language} alternates={homeHref} />

      <section aria-label={piano.label} className="w-full border-t border-border">
        <PianoKeyboard language={language} />
      </section>
    </main>
  )
}
