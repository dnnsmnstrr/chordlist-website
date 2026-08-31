import { FaqSearch } from "@/components/faq-search"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FaqStructuredData } from "@/components/structured-data"
import { faqHref } from "@/lib/faq-routes"
import { siteConfig } from "@/lib/site-config"
import { dictionary, type Language } from "@/locales"

type FaqPageProps = {
  language: Language
}

export function FaqPage({ language }: FaqPageProps) {
  const copy = dictionary(language).faq

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FaqStructuredData language={language} />
      <SiteHeader language={language} alternates={faqHref} />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">{copy.introduction}</p>
        </header>

        <FaqSearch items={copy.questions} language={language} />

        <p className="mt-10 text-sm text-muted-foreground">
          {copy.contactPrefix}{" "}
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {siteConfig.contact.support}
          </a>
          .
        </p>
      </article>

      <SiteFooter compact language={language} alternates={faqHref} />
    </main>
  )
}
