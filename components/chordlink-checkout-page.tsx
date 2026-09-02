"use client"

import type { Route } from "next"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import {
  CheckoutElementsProvider,
  PaymentElement,
  ShippingAddressElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout"
import { loadStripe, type Stripe } from "@stripe/stripe-js"

import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import type { Language } from "@/locales"

let stripeClient: PromiseLike<Stripe | null> | null = null

const copy = {
  en: {
    eyebrow: "chordlink · checkout",
    title: "Complete your order",
    intro: "Delivery is limited to Germany. The available payment methods appear below.",
    contact: "Contact",
    email: "Email address",
    shipping: "Delivery address",
    payment: "Payment",
    summary: "Order summary",
    product: "One numbered chordlink first-edition NFC tag, including chordlist unlimited",
    quantity: "Quantity",
    postage: "Postage within Germany",
    included: "included",
    total: "Total price, including postage",
    delivery: "Delivery time",
    seller: "Seller",
    vat: "Pursuant to § 19 UStG, no VAT is charged.",
    returnCosts: "If you withdraw, you bear the direct cost of returning the goods.",
    legalLead: "The physical-product terms, withdrawal information, and model withdrawal form are available before ordering.",
    terms: "Read terms and withdrawal information",
    submitHelp: "The following button places an order with an obligation to pay.",
    pending: "Order is being submitted…",
    error: "The order could not be submitted. Please check the marked fields and try again.",
    back: "Back to chordlink",
  },
  de: {
    eyebrow: "chordlink · Kasse",
    title: "Bestellung abschließen",
    intro: "Die Lieferung ist auf Deutschland beschränkt. Die verfügbaren Zahlungsmittel werden unten angezeigt.",
    contact: "Kontakt",
    email: "E-Mail-Adresse",
    shipping: "Lieferanschrift",
    payment: "Zahlung",
    summary: "Bestellübersicht",
    product: "Ein nummerierter NFC-Tag der ersten chordlink-Edition inklusive chordlist unlimited",
    quantity: "Menge",
    postage: "Versand innerhalb Deutschlands",
    included: "enthalten",
    total: "Gesamtpreis inklusive Versand",
    delivery: "Lieferzeit",
    seller: "Verkäufer",
    vat: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
    returnCosts: "Im Widerrufsfall trägst du die unmittelbaren Kosten der Rücksendung.",
    legalLead: "Die Bedingungen, Widerrufsbelehrung und das Muster-Widerrufsformular stehen vor der Bestellung bereit.",
    terms: "Bedingungen und Widerrufsbelehrung lesen",
    submitHelp: "Mit der folgenden Schaltfläche gibst du eine zahlungspflichtige Bestellung ab.",
    pending: "Bestellung wird übermittelt…",
    error: "Die Bestellung konnte nicht übermittelt werden. Bitte prüfe die markierten Felder und versuche es erneut.",
    back: "Zurück zu chordlink",
  },
} as const

export function ChordlinkCheckoutPage({
  clientSecret,
  language,
  publishableKey,
}: {
  clientSecret: string
  language: Language
  publishableKey: string
}) {
  const text = copy[language]
  const productPath = language === "de" ? "/de/chordlink" as Route : "/chordlink" as Route
  const termsPath = language === "de" ? "/de/chordlink/terms" as Route : "/chordlink/terms" as Route
  stripeClient ??= loadStripe(publishableKey)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16" id="main-content" tabIndex={-1}>
        <Link className="text-sm text-muted-foreground underline underline-offset-4" href={productPath}>{text.back}</Link>
        <p className="mt-10 font-mono text-sm text-muted-foreground">{text.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{text.title}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{text.intro}</p>

        <CheckoutElementsProvider
          stripe={stripeClient}
          options={{
            clientSecret,
            elementsOptions: {
              appearance: {
                theme: "stripe",
                variables: { borderRadius: "8px", colorPrimary: "#18181b" },
              },
            },
          }}
        >
          <CheckoutForm language={language} termsPath={termsPath} />
        </CheckoutElementsProvider>
      </div>
    </main>
  )
}

function CheckoutForm({ language, termsPath }: { language: Language; termsPath: Route }) {
  const text = copy[language]
  const checkoutState = useCheckoutElements()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (checkoutState.type === "loading") {
    return <p className="mt-10 text-sm text-muted-foreground">{language === "de" ? "Kasse wird geladen…" : "Loading checkout…"}</p>
  }
  if (checkoutState.type === "error") {
    return <p className="mt-10 text-sm text-destructive" role="alert">{text.error}</p>
  }

  const { checkout } = checkoutState

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await checkout.confirm({ email })
    if (result.type === "error") {
      setError(result.error.message || text.error)
      setSubmitting(false)
      return
    }

    const completion = new URL("/chordlink/complete", window.location.origin)
    completion.searchParams.set("session_id", checkout.id)
    completion.searchParams.set("language", language)
    window.location.assign(completion.toString())
  }

  return (
    <form className="mt-10 space-y-10" onSubmit={submit}>
      <section aria-labelledby="checkout-contact">
        <h2 className="text-xl font-semibold" id="checkout-contact">{text.contact}</h2>
        <label className="mt-4 block text-sm font-medium" htmlFor="checkout-email">{text.email}</label>
        <input
          autoComplete="email"
          className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="checkout-email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </section>

      <section aria-labelledby="checkout-shipping">
        <h2 className="mb-4 text-xl font-semibold" id="checkout-shipping">{text.shipping}</h2>
        <ShippingAddressElement />
      </section>

      <section aria-labelledby="checkout-payment">
        <h2 className="mb-4 text-xl font-semibold" id="checkout-payment">{text.payment}</h2>
        <PaymentElement />
      </section>

      <section aria-labelledby="checkout-summary" className="rounded-2xl border-2 border-foreground bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold" id="checkout-summary">{text.summary}</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-medium">{text.product}</dt>
            <dd className="mt-1 text-muted-foreground">{text.quantity}: 1</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-4">
            <dt>{text.postage}</dt>
            <dd>{text.included}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-4 text-base font-semibold">
            <dt>{text.total}</dt>
            <dd>{siteConfig.chordlink.price.display}</dd>
          </div>
          <div className="grid gap-1 border-t border-border pt-4 sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium">{text.delivery}</dt>
            <dd>{siteConfig.chordlink.deliveryTime[language]}</dd>
          </div>
          <div className="grid gap-1 border-t border-border pt-4 sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium">{text.seller}</dt>
            <dd>
              {siteConfig.legalName}, {siteConfig.operator}, {siteConfig.businessAddress.street},{" "}
              {siteConfig.businessAddress.postalCode} {siteConfig.businessAddress.city}, Deutschland
            </dd>
          </div>
        </dl>
        <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          <p>{text.vat}</p>
          <p>{text.returnCosts}</p>
          <p>{text.legalLead} <Link className="underline underline-offset-4" href={termsPath} target="_blank">{text.terms}</Link>.</p>
        </div>
      </section>

      <div>
        <p className="mb-3 text-sm font-medium">{text.submitHelp}</p>
        <button
          className={cn(buttonVariants({ size: "lg" }), "h-auto min-h-12 w-full whitespace-normal px-5 py-3 text-base")}
          disabled={submitting}
          type="submit"
        >
          zahlungspflichtig bestellen
        </button>
        {submitting ? <p className="mt-3 text-sm text-muted-foreground" role="status">{text.pending}</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      </div>
    </form>
  )
}
