import type { Route } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/site-config"
import type { Language } from "@/locales"

const copy = {
  en: {
    title: "Physical-product terms",
    status: "Sales are not open yet. The final seller address and reviewed legal text will be published before checkout is enabled.",
    sections: [
      ["Seller", `${siteConfig.operator}, contact: ${siteConfig.contact.support}. The complete postal address will appear here before sales open.`],
      ["Product and price", `One numbered chordlink first-edition NFC tag for ${siteConfig.chordlink.price.display}. Postage within Germany is included. Quantity is limited to one per checkout.`],
      ["Delivery", "Delivery is limited to addresses in Germany. The dispatch estimate and final letter dimensions will be confirmed before sales open."],
      ["3D printing and NFC functionality", "Small cosmetic layer lines, marks, and variations can occur during 3D printing. These characteristics are inherent to the production method and are not considered product defects. If the NFC function is faulty, chordlink will repair or replace the unit. This does not limit statutory warranty or withdrawal rights."],
      ["Withdrawal and returns", "Consumers generally have 14 days after receiving the goods to withdraw from a distance-sale contract. Before checkout opens, this page will include the reviewed withdrawal instructions, model form, return address, and information about return costs."],
      ["VAT", "The final invoice wording will reflect the confirmed small-business treatment under §19 UStG; VAT will not be shown separately when that treatment applies."],
      ["chordlist unlimited", "A unique Apple offer-code redemption link is supplied separately. The public NFC number is not an entitlement credential."],
      ["Order data and privacy", "Stripe processes payment, buyer email, and the German delivery address. chordlist stores only the Checkout Session reference with the private unit record; email and address remain in Stripe. See the website privacy policy for details."],
    ],
  },
  de: {
    title: "Bedingungen für physische Produkte",
    status: "Der Verkauf ist noch nicht geöffnet. Die vollständige Anbieteranschrift und der geprüfte Rechtstext werden veröffentlicht, bevor der Checkout aktiviert wird.",
    sections: [
      ["Verkäufer", `${siteConfig.operator}, Kontakt: ${siteConfig.contact.support}. Die vollständige Postanschrift erscheint hier vor Verkaufsstart.`],
      ["Produkt und Preis", `Ein nummerierter NFC-Tag der ersten chordlink-Edition für ${siteConfig.chordlink.price.display}. Der Versand innerhalb Deutschlands ist enthalten. Pro Checkout kann ein Stück bestellt werden.`],
      ["Lieferung", "Die Lieferung ist auf Adressen in Deutschland beschränkt. Versandzeit und endgültige Briefformate werden vor Verkaufsstart bestätigt."],
      ["3D-Druck und NFC-Funktion", "Beim 3D-Druck können kleine kosmetische Schichtlinien, Spuren und Abweichungen entstehen. Diese Merkmale sind herstellungsbedingt und gelten nicht als Produktmangel. Ist die NFC-Funktion fehlerhaft, wird der chordlink repariert oder ersetzt. Gesetzliche Gewährleistungs- und Widerrufsrechte werden dadurch nicht eingeschränkt."],
      ["Widerruf und Rückgabe", "Verbraucher haben bei Fernabsatzverträgen grundsätzlich 14 Tage ab Erhalt der Ware Zeit für den Widerruf. Vor Verkaufsstart ergänzt diese Seite die geprüfte Widerrufsbelehrung, das Musterformular, die Rücksendeanschrift und Angaben zu Rücksendekosten."],
      ["Umsatzsteuer", "Die endgültige Rechnungsformulierung folgt der bestätigten Kleinunternehmerregelung nach §19 UStG; bei Anwendung wird keine Umsatzsteuer gesondert ausgewiesen."],
      ["chordlist unlimited", "Ein individueller Apple-Einlöse-Link wird separat bereitgestellt. Die öffentliche NFC-Nummer ist kein Berechtigungsnachweis."],
      ["Bestelldaten und Datenschutz", "Stripe verarbeitet Zahlung, E-Mail-Adresse und deutsche Lieferanschrift. chordlist speichert beim privaten Datensatz der Einheit nur die Checkout-Session-Referenz; E-Mail- und Lieferadresse bleiben bei Stripe. Details stehen in der Datenschutzerklärung der Website."],
    ],
  },
} as const

export function ChordlinkTermsPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/terms" as Route, de: "/de/chordlink/terms" as Route }
  return <main className="min-h-screen"><SiteHeader language={language} alternates={paths} /><article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16"><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1><p className="mt-6 rounded-2xl border border-border bg-muted p-5 text-sm leading-6">{text.status}</p><div className="mt-10 space-y-10">{text.sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{body}</p></section>)}</div></article><SiteFooter compact language={language} alternates={paths} /></main>
}
