import type { Route } from "next"
import Link from "next/link"
import { FileDigit, Gift, Nfc, PackageCheck, Printer, Smartphone } from "lucide-react"

import { startChordlinkCheckout } from "@/app/chordlink/actions"
import {
  type ChordlinkAvailability,
  type ChordlinkCheckoutNotice,
  chordlinkNumberingRange,
} from "@/lib/chordlink-availability"
import { ChordlinkModelViewer } from "@/components/chordlink-model-viewer"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { chordlinkCheckoutEnabled, siteConfig } from "@/lib/site-config"
import { isChordlinkStripeConfigured } from "@/lib/server/stripe-chordlink"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const numbering = chordlinkNumberingRange(siteConfig.chordlink.saleQuantity)

const copy = {
  en: {
    eyebrow: "chordlink · first edition",
    title: "Tap your instrument. Open your songbook.",
    intro: "A 3D-printed NFC tag that opens chordlist exactly where you want it.",
    priceSuffix: "including postage within Germany",
    buy: "Buy chordlink",
    unavailable: "Coming soon",
    soldOut: "Sold out",
    checkoutUnavailable: "Checkout is temporarily unavailable. Please try again later.",
    soldOutNotice: "The first edition is sold out. Every numbered chordlink has found an owner.",
    availability: (available: number) => `${available} available · numbered ${numbering}`,
    availabilitySoldOut: `Sold out · numbered ${numbering}`,
    // Shown when the count cannot be read. Stating the run without a number is the one claim that
    // is still true during an outage.
    availabilityUnknown: `Numbered ${numbering}`,
    unlimited: "Includes chordlist unlimited",
    howTitle: "One tap, your choice",
    how: [
      "Attach chordlink to your instrument or case.",
      "Scan it once and choose Library, Shuffle, or Add Song.",
      "Every later scan opens that action immediately.",
    ],
    details: [
      "Numbered first edition", 
      "Works as a quick link into the app",
      "Produced by Linus3d", 
    ],
    diyTitle: "Have a 3D printer? Make your own.",
    diyBody: "The browser-based model generator is free to use for a personal chordlink. Add your own NFC tag and program its link at home.",
    diyAction: "See the DIY instructions",
    manufacturingNote: "Because every chordlink is 3D-printed, small cosmetic layer lines, marks, or variations can occur. These are part of the production method and are not considered defects. Your statutory warranty and withdrawal rights remain unaffected.",
    legal: "Physical-product terms and withdrawal information",
  },
  de: {
    eyebrow: "chordlink · first edition",
    title: "Instrument antippen. Songbook öffnen.",
    intro: "Ein 3D-gedruckter NFC-Tag, der chordlist genau dort öffnet, wo du hinwillst.",
    priceSuffix: "inklusive Versand innerhalb Deutschlands",
    buy: "chordlink kaufen",
    unavailable: "Bald verfügbar",
    soldOut: "Ausverkauft",
    checkoutUnavailable: "Der Checkout ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.",
    soldOutNotice: "Die erste Edition ist ausverkauft. Jeder nummerierte chordlink hat seinen Platz gefunden.",
    availability: (available: number) => `${available} verfügbar · nummeriert ${numbering}`,
    availabilitySoldOut: `Ausverkauft · nummeriert ${numbering}`,
    availabilityUnknown: `Nummeriert ${numbering}`,
    unlimited: "chordlist unlimited inklusive",
    howTitle: "Ein Scan, deine Songs",
    how: [
      "Befestige chordlink an deinem Instrument oder Koffer.",
      "Scanne ihn einmal und wähle Bibliothek, Zufall oder Song hinzufügen.",
      "Jeder weitere Scan öffnet diese Aktion sofort.",
    ],
    details: [
      "Nummerierte erste Edition", 
      "Schneller Link in die App",
      "Produziert von Linus3d", 
    ],
    diyTitle: "Du hast einen 3D-Drucker? Bau deinen eigenen.",
    diyBody: "Der Modellgenerator im Browser ist für einen persönlichen chordlink kostenlos nutzbar. Ergänze zu Hause deinen eigenen NFC-Tag und programmiere den Link.",
    diyAction: "Zur DIY-Anleitung",
    manufacturingNote: "Da jeder chordlink 3D-gedruckt wird, können kleine kosmetische Schichtlinien, Spuren oder Abweichungen entstehen. Sie sind Teil des Herstellungsverfahrens und gelten nicht als Mangel. Deine gesetzlichen Gewährleistungs- und Widerrufsrechte bleiben unberührt.",
    legal: "Bedingungen und Widerrufsbelehrung für physische Produkte",
  },
} as const

export function ChordlinkPage({
  availability = null,
  checkoutNotice = null,
  language,
}: {
  availability?: ChordlinkAvailability | null
  checkoutNotice?: ChordlinkCheckoutNotice
  language: Language
}) {
  const text = copy[language]
  const soldOut = availability?.soldOut === true
  const paths = language === "de"
    ? { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/de/chordlink/terms" as Route, diy: "/de/chordlink/diy" as Route }
    : { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/chordlink/terms" as Route, diy: "/chordlink/diy" as Route }

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader language={language} alternates={{ en: paths.en, de: paths.de }} />

      <section id="main-content" tabIndex={-1} className="mx-auto grid w-full max-w-5xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">{text.title}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">{text.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {chordlinkCheckoutEnabled && isChordlinkStripeConfigured() && !soldOut ? (
              <form action={startChordlinkCheckout}>
                <input name="language" type="hidden" value={language} />
                <button className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} type="submit">
                  {text.buy}
                </button>
              </form>
            ) : (
              // Sold out is shown on the button itself, so nobody clicks Buy to find out.
              <button className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} disabled>
                {soldOut ? text.soldOut : text.unavailable}
              </button>
            )}
            <span className="text-sm text-muted-foreground">
              {availability === null
                ? text.availabilityUnknown
                : availability.soldOut
                ? text.availabilitySoldOut
                : text.availability(availability.available)}
            </span>
          </div>

          {checkoutNotice ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {checkoutNotice === "sold-out" ? text.soldOutNotice : text.checkoutUnavailable}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{siteConfig.chordlink.price.display}</span>
            <span>{text.priceSuffix}</span>
            <span className="inline-flex items-center gap-2"><Gift className="size-4" />{text.unlimited}</span>
          </div>
        </div>

        <div className="mx-auto aspect-square w-full max-w-md">
          <ChordlinkModelViewer
            label={language === "de" ? "Interaktives 3D-Modell des chordlink" : "Interactive 3D model of chordlink"}
          />
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <Nfc className="size-7" />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">{text.howTitle}</h2>
            <ol className="mt-6 space-y-5 text-muted-foreground">
              {text.how.map((step, index) => <li key={step} className="flex gap-4"><span className="font-mono text-foreground">0{index + 1}</span><span>{step}</span></li>)}
            </ol>
          </div>
          <div className="grid gap-4">
            {[FileDigit, Smartphone, PackageCheck].map((Icon, index) => (
              <div key={text.details[index]} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5">
                <Icon className="size-5 shrink-0" />
                {index === 2 ? (
                  <a
                    className="underline underline-offset-4 transition-colors hover:text-muted-foreground"
                    href="https://linus3d.de/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {text.details[index]}
                  </a>
                ) : (
                  <span>{text.details[index]}</span>
                )}
              </div>
            ))}
          </div>
          <p className="border-t border-border pt-6 text-xs leading-5 text-muted-foreground md:col-span-2">
            {text.manufacturingNote}
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <Printer className="size-6" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{text.diyTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{text.diyBody}</p>
          </div>
          <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }), "shrink-0")} href={paths.diy}>
            {text.diyAction}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-8 text-center text-sm text-muted-foreground">
        <Link className="underline underline-offset-4" href={paths.terms}>{text.legal}</Link>
      </div>
      <SiteFooter language={language} alternates={{ en: paths.en, de: paths.de }} />
    </main>
  )
}
