import type { Metadata } from "next"

import { CollapsibleSection } from "@/components/collapsible-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { FaqStructuredData } from "@/components/structured-data"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig } from "@/lib/site-config"
import { faqCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/faq",
  title: faqCopy.metadata.title,
  description: faqCopy.metadata.description,
})

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <FaqStructuredData />
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{faqCopy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {faqCopy.introduction}
          </p>
        </header>

        <div className="mt-4 flex flex-col">
          {faqCopy.questions.map((item, index) => (
            <CollapsibleSection key={item.question} title={item.question} defaultOpen={index === 0}>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </CollapsibleSection>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          {faqCopy.contactPrefix}{" "}
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {siteConfig.contact.support}
          </a>
          .
        </p>
      </article>

      <SiteFooter compact />
    </main>
  )
}
