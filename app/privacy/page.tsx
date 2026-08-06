import type { Metadata } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"
import { privacyCopy } from "@/locales/en"

export const metadata: Metadata = {
  title: privacyCopy.metadata.title,
  description: privacyCopy.metadata.description,
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  const sections = privacyCopy.sections

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{privacyCopy.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{privacyCopy.lastUpdated}</p>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <PolicySection title={sections.shortVersion.title}>
            <PolicyParagraphs paragraphs={sections.shortVersion.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.operator.title}>
            <p>
              {sections.operator.beforeEmail}{" "}
              <PolicyLink href={`mailto:${siteConfig.contact.support}`}>{siteConfig.contact.support}</PolicyLink>.
            </p>
          </PolicySection>

          <PolicySection title={sections.songFiles.title}>
            <PolicyParagraphs paragraphs={sections.songFiles.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.analytics.title}>
            <PolicyParagraphs paragraphs={sections.analytics.paragraphs} />
            <p>
              {sections.analytics.linkPrefix}{" "}
              <PolicyLink href="https://telemetrydeck.com/docs/guides/privacy-faq/">
                {sections.analytics.linkLabel}
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title={sections.chordContribution.title}>
            <PolicyParagraphs paragraphs={sections.chordContribution.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.importing.title}>
            <PolicyParagraphs paragraphs={sections.importing.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.purchases.title}>
            <PolicyParagraphs paragraphs={sections.purchases.paragraphs} />
            <p>
              {sections.purchases.linkPrefix}{" "}
              <PolicyLink href="https://www.apple.com/legal/privacy/data/en/app-store/">
                {sections.purchases.linkLabel}
              </PolicyLink>
              .
            </p>
            <p>
              {sections.purchases.revenueCatLinkPrefix}{" "}
              <PolicyLink href="https://www.revenuecat.com/privacy/">
                {sections.purchases.revenueCatLinkLabel}
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title={sections.support.title}>
            <PolicyParagraphs paragraphs={sections.support.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.website.title}>
            <PolicyParagraphs paragraphs={sections.website.paragraphs} />
            <p>
              {sections.website.linkPrefix}{" "}
              <PolicyLink href="https://vercel.com/docs/analytics/privacy-policy">
                {sections.website.linkLabel}
              </PolicyLink>
              .
            </p>
          </PolicySection>

          <PolicySection title={sections.sharing.title}>
            <PolicyParagraphs paragraphs={sections.sharing.paragraphs} />
          </PolicySection>

          <PolicySection title={sections.rights.title}>
            <ul>
              {sections.rights.choices.map((choice) => (
                <li key={choice}>{choice}</li>
              ))}
            </ul>
            <p>
              {sections.rights.beforeEmail}{" "}
              <PolicyLink href={`mailto:${siteConfig.contact.support}`}>{siteConfig.contact.support}</PolicyLink>.
            </p>
          </PolicySection>

          <PolicySection title={sections.changes.title}>
            <PolicyParagraphs paragraphs={sections.changes.paragraphs} />
          </PolicySection>
        </div>
      </article>

      <SiteFooter compact />
    </main>
  )
}

function PolicyParagraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-foreground [&_li]:before:content-['—'] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </section>
  )
}

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http")

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </a>
  )
}
