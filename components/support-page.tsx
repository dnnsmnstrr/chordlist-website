import Link from "next/link"

import { FaqList } from "@/components/faq-list"
import { InlineMarkup } from "@/components/inline-markup"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"
import { supportHref } from "@/lib/support-routes"
import { dictionary, type Language } from "@/locales"

type SupportPageProps = {
  language: Language
}

export function SupportPage({ language }: SupportPageProps) {
  const copy = dictionary(language).support

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader language={language} alternates={supportHref} />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            <InlineMarkup text={copy.introduction} />
          </p>
        </header>

        {/* Above the questions on purpose: someone who arrives from the App Store with a problem no
            answer here covers should reach a person without reading the page first. */}
        <section aria-labelledby="contact" className="mt-8 rounded-lg border border-border bg-muted/40 p-6">
          <h2 id="contact" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {copy.contact.label}
          </h2>
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="mt-2 inline-block text-xl font-semibold tracking-tight underline underline-offset-4 sm:text-2xl"
          >
            {siteConfig.contact.support}
          </a>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            <InlineMarkup text={copy.contact.hint} />
          </p>
        </section>

        <h2 className="mt-12 text-lg font-semibold tracking-tight">{copy.questionsTitle}</h2>
        <FaqList items={copy.questions} />

        <p className="mt-10 text-sm text-muted-foreground">
          {copy.faq.prefix}{" "}
          <Link href="/faq" className="font-medium text-foreground underline underline-offset-4">
            {copy.faq.link}
          </Link>
          {copy.faq.suffix}
        </p>
      </article>

      <SiteFooter compact language={language} alternates={supportHref} />
    </main>
  )
}
