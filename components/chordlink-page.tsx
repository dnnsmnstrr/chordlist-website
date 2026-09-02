import type { Route } from "next"
import Link from "next/link"
import { FileDigit, Gift, Nfc, PackageCheck, Printer, Smartphone } from "lucide-react"

import {
  type ChordlinkAvailability,
  type ChordlinkCheckoutNotice,
  chordlinkInterestReason,
  chordlinkNumberingRange,
  mayOpenChordlinkCheckout,
} from "@/lib/chordlink-availability"
import { ChordlinkModelViewer } from "@/components/chordlink-model-viewer"
import { ChordlinkNotifyForm } from "@/components/chordlink-notify-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"
import { isChordlinkInterestConfigured } from "@/lib/server/brevo-interest"
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
    delivery: `Delivery ${siteConfig.chordlink.deliveryTime.en}`,
    vat: "Pursuant to § 19 UStG, no VAT is charged.",
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
    notify: {
      prelaunch: {
        title: "Not on sale yet",
        body: "Leave your email and you will hear from us once the first edition goes on sale. Nothing else is sent to that address.",
      },
      "sold-out": {
        title: "Want the next one?",
        body: "The first edition is gone. Leave your email and you will hear from us when the next batch is made.",
      },
      label: "Email address",
      placeholder: "you@example.com",
      action: "Get notified",
      pending: "Sending…",
      consent: "You will receive one confirmation email; you are only on the list once you click the link in it. We use your address only to tell you about chordlink availability, and every message has an unsubscribe link.",
      sent: "Almost there — check your inbox and click the link in the confirmation email. You are on the list only once you have.",
      invalidEmail: "That does not look like an email address. Please check it and try again.",
      unavailable: "The signup is temporarily unavailable. Please try again later.",
    },
    legal: "Physical-product terms and withdrawal information",
  },
  de: {
    eyebrow: "chordlink · first edition",
    title: "Instrument antippen. Songbook öffnen.",
    intro: "Ein 3D-gedruckter NFC-Tag, der chordlist genau dort öffnet, wo du hinwillst.",
    priceSuffix: "inklusive Versand innerhalb Deutschlands",
    delivery: `Lieferung ${siteConfig.chordlink.deliveryTime.de}`,
    vat: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
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
    notify: {
      prelaunch: {
        title: "Noch nicht im Verkauf",
        body: "Hinterlasse deine E-Mail-Adresse und wir melden uns, sobald die erste Edition in den Verkauf geht. Mehr wird an diese Adresse nicht geschickt.",
      },
      "sold-out": {
        title: "Du willst den nächsten?",
        body: "Die erste Edition ist vergriffen. Hinterlasse deine E-Mail-Adresse und wir melden uns, sobald die nächste Charge gefertigt wird.",
      },
      label: "E-Mail-Adresse",
      placeholder: "du@beispiel.de",
      action: "Benachrichtigen",
      pending: "Wird gesendet…",
      consent: "Du erhältst eine Bestätigungs-E-Mail; erst wenn du den Link darin anklickst, stehst du auf der Liste. Wir nutzen deine Adresse ausschließlich, um dich über die Verfügbarkeit von chordlink zu informieren, und jede Nachricht enthält einen Abmeldelink.",
      sent: "Fast geschafft — sieh in dein Postfach und klicke den Link in der Bestätigungs-E-Mail. Erst danach stehst du auf der Liste.",
      invalidEmail: "Das sieht nicht nach einer E-Mail-Adresse aus. Bitte prüfe sie und versuche es erneut.",
      unavailable: "Die Anmeldung ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.",
    },
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
  const checkoutAllowed = mayOpenChordlinkCheckout(availability)
  const unavailableLabel = soldOut ? text.soldOut : text.unavailable
  // Only offered where being turned away is a fact about the product rather than about an outage,
  // and only where the list can actually be reached — a form that quietly drops an address is worse
  // than no form, because the visitor leaves believing they will hear from us.
  const interestReason = chordlinkInterestReason(availability)
  const notify = interestReason && isChordlinkInterestConfigured(interestReason)
    ? { reason: interestReason, ...text.notify[interestReason] }
    : null
  const paths = language === "de"
    ? { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/de/chordlink/terms" as Route, diy: "/de/chordlink/diy" as Route, checkout: "/de/chordlink/checkout" as Route }
    : { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/chordlink/terms" as Route, diy: "/chordlink/diy" as Route, checkout: "/chordlink/checkout" as Route }

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader language={language} alternates={{ en: paths.en, de: paths.de }} />

      <section id="main-content" tabIndex={-1} className="mx-auto grid w-full max-w-5xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">{text.title}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">{text.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {checkoutAllowed && isChordlinkStripeConfigured() ? (
              <Link className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} href={paths.checkout}>
                {text.buy}
              </Link>
            ) : (
              // Sold out is shown on the button itself, so nobody clicks Buy to find out.
              <button className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} disabled>
                {unavailableLabel}
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

          {notify ? (
            <section aria-labelledby="chordlink-notify" className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
              <h2 className="text-lg font-semibold tracking-tight" id="chordlink-notify">{notify.title}</h2>
              <p className="mt-2 max-w-md text-pretty text-sm leading-6 text-muted-foreground">{notify.body}</p>
              <ChordlinkNotifyForm copy={text.notify} language={language} />
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{siteConfig.chordlink.price.display}</span>
            <span>{text.priceSuffix}</span>
            <span>{text.delivery}</span>
            <span className="inline-flex items-center gap-2"><Gift className="size-4" />{text.unlimited}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{text.vat}</p>
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
