import { AppCTA, AppCTANote } from "@/components/app-cta"
import { defaultLanguage, dictionary, type Language } from "@/locales"

/** The last thing on the home page: the hero's ask, repeated for anyone who read to the end. */
export function ClosingCTA({ language = defaultLanguage }: { language?: Language }) {
  const { home: homeCopy } = dictionary(language)

  return (
    <section aria-labelledby="closing-cta-title" className="mx-auto w-full max-w-5xl px-6 pb-20">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/40 p-10 text-center">
        <h2 id="closing-cta-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {homeCopy.closingCta.title}
        </h2>
        <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">{homeCopy.closingCta.description}</p>
        <AppCTA large language={language} />
        <AppCTANote className="max-w-sm" language={language} />
      </div>
    </section>
  )
}
