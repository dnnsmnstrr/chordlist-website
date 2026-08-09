import { AppCTA } from "@/components/app-cta"
import { Button } from "@/components/ui/button"
import { commonCopy, homeCopy } from "@/locales/en"

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-20 text-center sm:pt-20">
      <span className="inline-block rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
        {homeCopy.hero.eyebrow}
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        {commonCopy.tagline}
      </h1>
      {/* The description carries an authored newline to balance it over two lines. `pre` would honour
          it but forbid wrapping, overflowing the viewport on phones, so the break only applies from sm
          up — below that the copy wraps to the column like any other paragraph. */}
      <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground whitespace-normal sm:whitespace-pre-line">
        {homeCopy.hero.description}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <AppCTA large />
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<a href="#preview">{homeCopy.hero.formatLink}</a>}
        />
      </div>
    </section>
  )
}
