import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { imprintHref } from "@/lib/legal-routes"
import { siteConfig } from "@/lib/site-config"
import { dictionary, type Language } from "@/locales"

type ImprintPageProps = {
  language: Language
}

export function ImprintPage({ language }: ImprintPageProps) {
  const copy = dictionary(language).imprint

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader language={language} alternates={imprintHref} />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{copy.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-semibold">{copy.provider.title}</h2>
            <address className="mt-3 space-y-1 not-italic leading-7 text-muted-foreground">
              <p className="font-medium text-foreground">{siteConfig.legalName}</p>
              <p>{copy.provider.tradingAs}</p>
              <p>{siteConfig.businessAddress.street}</p>
              <p>
                {siteConfig.businessAddress.postalCode} {siteConfig.businessAddress.city}
              </p>
              <p>{copy.provider.country}</p>
              <p className="pt-3">
                {copy.provider.contactLabel}:{" "}
                <a
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                  href={`mailto:${siteConfig.contact.support}`}
                >
                  {siteConfig.contact.support}
                </a>
              </p>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{copy.editorial.title}</h2>
            <div className="mt-3 space-y-2 leading-7 text-muted-foreground">
              <p>{copy.editorial.introduction}</p>
              <p className="font-medium text-foreground">{siteConfig.legalName}</p>
              <p>{copy.editorial.addressReference}</p>
            </div>
          </section>
        </div>
      </article>

      <SiteFooter compact language={language} alternates={imprintHref} />
    </main>
  )
}
