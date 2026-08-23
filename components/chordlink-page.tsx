import type { Route } from "next"
import Link from "next/link"
import { Check, Gift, Nfc, PackageCheck, Smartphone } from "lucide-react"

import { ChordlistIcon } from "@/components/chordlist-icon"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { chordlinkCheckoutEnabled, siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

const copy = {
  en: {
    eyebrow: "chordlink · first edition",
    title: "Tap your instrument. Open your songbook.",
    intro: "A numbered, 3D-printed NFC tag that opens chordlist exactly where you want it.",
    priceSuffix: "including postage within Germany",
    buy: "Buy chordlink",
    unavailable: "Pilot sale coming soon",
    availability: "10 available · numbered 001–010",
    unlimited: "Includes chordlist unlimited",
    howTitle: "One tap, your choice",
    how: [
      "Attach chordlink to your instrument or case.",
      "Scan it once and choose Library, Shuffle, or Add Song.",
      "Every later scan opens that action immediately.",
    ],
    details: ["Printed with linus3d.de", "Numbered first edition", "Works as a web link without the app"],
    manufacturingNote: "Because every chordlink is 3D-printed, small cosmetic layer lines, marks, or variations can occur. These are part of the production method and are not considered defects. If the NFC function has a fault, the chordlink will be repaired or replaced. Your statutory warranty and withdrawal rights remain unaffected.",
    legal: "Physical-product terms and withdrawal information",
  },
  de: {
    eyebrow: "chordlink · erste Edition",
    title: "Instrument antippen. Songbook öffnen.",
    intro: "Ein nummerierter, 3D-gedruckter NFC-Tag, der chordlist genau dort öffnet, wo du hinwillst.",
    priceSuffix: "inklusive Versand innerhalb Deutschlands",
    buy: "chordlink kaufen",
    unavailable: "Pilotverkauf startet bald",
    availability: "10 verfügbar · nummeriert 001–010",
    unlimited: "chordlist unlimited inklusive",
    howTitle: "Ein Tap, deine Auswahl",
    how: [
      "Befestige chordlink an deinem Instrument oder Koffer.",
      "Scanne ihn einmal und wähle Bibliothek, Zufall oder Song hinzufügen.",
      "Jeder weitere Scan öffnet diese Aktion sofort.",
    ],
    details: ["Gedruckt mit linus3d.de", "Nummerierte erste Edition", "Funktioniert ohne App auch als Weblink"],
    manufacturingNote: "Da jeder chordlink 3D-gedruckt wird, können kleine kosmetische Schichtlinien, Spuren oder Abweichungen entstehen. Sie sind Teil des Herstellungsverfahrens und gelten nicht als Mangel. Bei einem Fehler der NFC-Funktion wird der chordlink repariert oder ersetzt. Deine gesetzlichen Gewährleistungs- und Widerrufsrechte bleiben unberührt.",
    legal: "Bedingungen und Widerrufsbelehrung für physische Produkte",
  },
} as const

export function ChordlinkPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = language === "de"
    ? { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/de/chordlink/terms" as Route }
    : { en: "/chordlink" as Route, de: "/de/chordlink" as Route, terms: "/chordlink/terms" as Route }

  return (
    <main className="min-h-screen text-foreground">
      <SiteHeader language={language} alternates={{ en: paths.en, de: paths.de }} />

      <section id="main-content" tabIndex={-1} className="mx-auto grid w-full max-w-5xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">{text.title}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">{text.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {chordlinkCheckoutEnabled && siteConfig.chordlink.stripePaymentLink ? (
              <a className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} href={siteConfig.chordlink.stripePaymentLink}>
                {text.buy}
              </a>
            ) : (
              <button className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")} disabled>
                {text.unavailable}
              </button>
            )}
            <span className="text-sm text-muted-foreground">{text.availability}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{siteConfig.chordlink.price.display}</span>
            <span>{text.priceSuffix}</span>
            <span className="inline-flex items-center gap-2"><Gift className="size-4" />{text.unlimited}</span>
          </div>
        </div>

        <div aria-hidden="true" className="mx-auto flex aspect-square w-full max-w-sm rotate-3 items-center justify-center overflow-hidden rounded-[4rem] bg-logo-tile text-logo-glyph shadow-logo">
          <ChordlistIcon className="h-full w-auto" />
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
            {[PackageCheck, Smartphone, Check].map((Icon, index) => (
              <div key={text.details[index]} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5">
                <Icon className="size-5 shrink-0" />
                <span>{text.details[index]}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-border pt-6 text-xs leading-5 text-muted-foreground md:col-span-2">
            {text.manufacturingNote}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-8 text-center text-sm text-muted-foreground">
        <Link className="underline underline-offset-4" href={paths.terms}>{text.legal}</Link>
      </div>
      <SiteFooter language={language} alternates={{ en: paths.en, de: paths.de }} />
    </main>
  )
}
