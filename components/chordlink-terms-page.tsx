import type { Route } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { chordlinkWithdrawalHref } from "@/lib/legal-routes"
import { siteConfig } from "@/lib/site-config"
import type { Language } from "@/locales"

const address = `${siteConfig.businessAddress.street}, ${siteConfig.businessAddress.postalCode} ${siteConfig.businessAddress.city}, Deutschland`
const seller = `${siteConfig.legalName}, handelnd unter ${siteConfig.operator}, ${address}`

const copy = {
  en: {
    title: "Physical-product terms and withdrawal information",
    status: "These terms apply to distance-sales purchases of the physical chordlink product, including the ten units in the first sale run.",
    sellerTitle: "Seller identity",
    sellerBody: `${seller}. Email: ${siteConfig.contact.support}.`,
    productTitle: "Product and total price",
    productBody: `One numbered chordlink first-edition NFC tag, including a separate chordlist unlimited Apple offer-code redemption link. Quantity: one per order. Total price: ${siteConfig.chordlink.price.display}, including all taxes and postage within Germany. Pursuant to § 19 UStG, no VAT is charged.`,
    deliveryTitle: "Payment and delivery",
    deliveryBody: `Delivery is limited to addresses in Germany. The available payment methods are displayed at checkout. Delivery takes place ${siteConfig.chordlink.deliveryTime.en}.`,
    warrantyTitle: "Statutory warranty and production characteristics",
    warrantyBody: "The statutory liability for defects applies. Small cosmetic layer lines, marks, and variations can occur during 3D printing and are inherent to the production method; they do not limit statutory rights. A faulty NFC function is remedied under the statutory warranty.",
    withdrawalHeading: "Withdrawal information",
    rightTitle: "Right of withdrawal",
    right: [
      "You have the right to withdraw from this contract within fourteen days without giving any reason.",
      "The withdrawal period is fourteen days from the day on which you, or a third party named by you who is not the carrier, took possession of the goods.",
      `To exercise your right of withdrawal, you must inform us (${seller}; email: ${siteConfig.contact.support}) by an unambiguous statement (for example, a letter sent by post or an email) of your decision to withdraw from this contract. You may use the model withdrawal form below, but this is not mandatory.`,
      "You can also exercise your right of withdrawal using the online withdrawal function linked below. If you use it, we will immediately send you confirmation of receipt on a durable medium by email.",
      "To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.",
    ],
    effectsTitle: "Effects of withdrawal",
    effects: [
      "If you withdraw from this contract, we will reimburse all payments received from you, including delivery costs (except supplementary costs resulting from your choice of a delivery method other than the least expensive standard delivery offered by us), without undue delay and no later than fourteen days from the day on which we receive your notice of withdrawal.",
      "We will make the reimbursement using the same means of payment that you used for the original transaction, unless expressly agreed otherwise; you will not incur any fees as a result of the reimbursement.",
      "We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent them back, whichever is earlier.",
      `You must send back or hand over the goods to ${seller} without undue delay and no later than fourteen days from the day on which you communicate your withdrawal. The deadline is met if you send the goods before the fourteen-day period has expired.`,
      "You bear the direct cost of returning the goods.",
      "You are only liable for any diminished value of the goods resulting from handling beyond what is necessary to establish the nature, characteristics, and functioning of the goods.",
    ],
    online: "Open online withdrawal function",
    formTitle: "Model withdrawal form",
    formIntro: "If you wish to withdraw from the contract, complete and return this form.",
    formLines: [
      `To: ${seller}; email: ${siteConfig.contact.support}`,
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*):",
      "Ordered on (*) / received on (*):",
      "Name of consumer(s):",
      "Address of consumer(s):",
      "Signature of consumer(s) (only if this form is notified on paper):",
      "Date:",
      "(*) Delete as appropriate.",
    ],
    dataTitle: "Order data and privacy",
    dataBody: "Stripe processes payment, buyer email, and the German delivery address. chordlist stores only the Checkout Session reference with the private unit record; email and address remain in Stripe. The online withdrawal function sends the declaration and its immediate confirmation through Brevo. See the website privacy policy for details.",
  },
  de: {
    title: "Bedingungen und Widerrufsbelehrung für physische Produkte",
    status: "Diese Bedingungen gelten für Fernabsatzkäufe des physischen chordlink-Produkts – auch für die zehn Stück des ersten Verkaufs.",
    sellerTitle: "Identität des Verkäufers",
    sellerBody: `${seller}. E-Mail: ${siteConfig.contact.support}.`,
    productTitle: "Produkt und Gesamtpreis",
    productBody: `Ein nummerierter NFC-Tag der ersten chordlink-Edition inklusive eines separat bereitgestellten Apple-Einlöse-Links für chordlist unlimited. Menge: ein Stück pro Bestellung. Gesamtpreis: ${siteConfig.chordlink.price.display} einschließlich aller Steuern und Versand innerhalb Deutschlands. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`,
    deliveryTitle: "Zahlung und Lieferung",
    deliveryBody: `Die Lieferung ist auf Anschriften in Deutschland beschränkt. Die verfügbaren Zahlungsmittel werden an der Kasse angezeigt. Die Lieferung erfolgt ${siteConfig.chordlink.deliveryTime.de}.`,
    warrantyTitle: "Gesetzliche Mängelhaftung und Herstellungsmerkmale",
    warrantyBody: "Es gilt das gesetzliche Mängelhaftungsrecht. Beim 3D-Druck können kleine kosmetische Schichtlinien, Spuren und Abweichungen entstehen, die herstellungsbedingt sind; die gesetzlichen Rechte werden dadurch nicht eingeschränkt. Eine fehlerhafte NFC-Funktion wird im Rahmen der gesetzlichen Gewährleistung behoben.",
    withdrawalHeading: "Widerrufsbelehrung",
    rightTitle: "Widerrufsrecht",
    right: [
      "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
      "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.",
      `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${seller}; E-Mail: ${siteConfig.contact.support}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
      "Sie können Ihr Widerrufsrecht auch über die unten verlinkte Online-Widerrufsfunktion ausüben. Wenn Sie diese Funktion nutzen, übermitteln wir Ihnen unverzüglich auf einem dauerhaften Datenträger per E-Mail eine Eingangsbestätigung mit Inhalt, Datum und Uhrzeit Ihres Widerrufs.",
      "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
    ],
    effectsTitle: "Folgen des Widerrufs",
    effects: [
      "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.",
      "Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
      "Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.",
      `Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an ${seller} zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.`,
      "Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.",
      "Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.",
    ],
    online: "Online-Widerrufsfunktion öffnen",
    formTitle: "Muster-Widerrufsformular",
    formIntro: "Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.",
    formLines: [
      `An: ${seller}; E-Mail: ${siteConfig.contact.support}`,
      "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):",
      "Bestellt am (*) / erhalten am (*):",
      "Name des/der Verbraucher(s):",
      "Anschrift des/der Verbraucher(s):",
      "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):",
      "Datum:",
      "(*) Unzutreffendes streichen.",
    ],
    dataTitle: "Bestelldaten und Datenschutz",
    dataBody: "Stripe verarbeitet Zahlung, E-Mail-Adresse und deutsche Lieferanschrift. chordlist speichert beim privaten Datensatz der Einheit nur die Checkout-Session-Referenz; E-Mail- und Lieferadresse bleiben bei Stripe. Die Online-Widerrufsfunktion versendet die Erklärung und ihre unverzügliche Eingangsbestätigung über Brevo. Details stehen in der Datenschutzerklärung der Website.",
  },
} as const

export function ChordlinkTermsPage({ language }: { language: Language }) {
  const text = copy[language]
  const paths = { en: "/chordlink/terms" as Route, de: "/de/chordlink/terms" as Route }

  return (
    <main className="min-h-screen">
      <SiteHeader language={language} alternates={paths} />
      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
        <p className="mt-6 rounded-2xl border border-border bg-muted p-5 text-sm leading-6">{text.status}</p>

        <div className="mt-10 space-y-10">
          <TextSection title={text.sellerTitle} body={text.sellerBody} />
          <TextSection title={text.productTitle} body={text.productBody} />
          <TextSection title={text.deliveryTitle} body={text.deliveryBody} />
          <TextSection title={text.warrantyTitle} body={text.warrantyBody} />

          <section className="border-t-2 border-foreground pt-10">
            <h2 className="text-3xl font-semibold tracking-tight">{text.withdrawalHeading}</h2>
            <h3 className="mt-8 text-xl font-semibold">{text.rightTitle}</h3>
            <div className="mt-3 space-y-4 leading-7 text-muted-foreground">
              {text.right.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <h3 className="mt-8 text-xl font-semibold">{text.effectsTitle}</h3>
            <div className="mt-3 space-y-4 leading-7 text-muted-foreground">
              {text.effects.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <Link className="mt-8 inline-flex rounded-md border border-foreground px-4 py-3 font-medium" href={chordlinkWithdrawalHref[language]}>
              {text.online}
            </Link>
          </section>

          <section className="border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">{text.formTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{text.formIntro}</p>
            <div className="mt-5 space-y-5 rounded-2xl border border-border bg-card p-5 leading-7">
              {text.formLines.map((line) => <p key={line}>{line}</p>)}
            </div>
          </section>

          <TextSection title={text.dataTitle} body={text.dataBody} />
        </div>
      </article>
      <SiteFooter compact language={language} alternates={paths} />
    </main>
  )
}

function TextSection({ body, title }: { body: string; title: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
    </section>
  )
}
