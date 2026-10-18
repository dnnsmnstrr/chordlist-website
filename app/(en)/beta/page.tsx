import type { Metadata } from "next"
import { Apple } from "lucide-react"

import { InlineMarkup } from "@/components/inline-markup"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig, storeListingLink } from "@/lib/site-config"
import { betaCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/beta",
  title: betaCopy.metadata.title,
  description: betaCopy.metadata.description,
})

export default function BetaPage() {
  const testFlight = siteConfig.links.testFlight

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{betaCopy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{betaCopy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">{betaCopy.introduction}</p>

          <div className="mt-8 flex flex-col items-start gap-3">
            {testFlight ? (
              <Button
                size="lg"
                className="gap-2"
                nativeButton={false}
                render={
                  <a href={testFlight}>
                    <Apple aria-hidden="true" />
                    {betaCopy.join}
                  </a>
                }
              />
            ) : (
              <Button size="lg" className="gap-2" disabled>
                <Apple aria-hidden="true" />
                {betaCopy.closed}
              </Button>
            )}
            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {betaCopy.requirements}
              {storeListingLink ? (
                <>
                  {" "}
                  {betaCopy.storeAside.prefix}{" "}
                  <a
                    href={storeListingLink}
                    className="underline underline-offset-2 transition-colors hover:text-foreground"
                  >
                    {betaCopy.storeAside.link}
                  </a>
                  {betaCopy.storeAside.suffix}
                </>
              ) : null}
            </p>
          </div>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-semibold">{betaCopy.steps.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-muted-foreground marker:font-mono marker:text-sm">
              {betaCopy.steps.items.map((item) => (
                <li key={item} className="text-pretty pl-1">
                  <InlineMarkup text={item} />
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{betaCopy.expectations.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
              {betaCopy.expectations.items.map((item) => (
                <li key={item} className="text-pretty pl-1">
                  <InlineMarkup text={item} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{betaCopy.feedback.title}</h2>
            <div className="mt-3 space-y-3 leading-7 text-muted-foreground">
              {betaCopy.feedback.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-pretty">
                  <InlineMarkup text={paragraph} />
                </p>
              ))}
              <p>
                <a
                  href={`mailto:${siteConfig.contact.feedback}`}
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                >
                  {betaCopy.feedback.email}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{betaCopy.leaving.title}</h2>
            <p className="mt-3 text-pretty leading-7 text-muted-foreground">
              <InlineMarkup text={betaCopy.leaving.body} />
            </p>
          </section>
        </div>
      </article>

      <SiteFooter compact />
    </main>
  )
}
