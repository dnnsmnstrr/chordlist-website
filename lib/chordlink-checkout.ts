import type { Language } from "@/locales"

export const chordlinkStripeCheckoutReference = "chordlink:first-edition"

// Stripe asks integrations on current API versions to identify their Checkout
// flow with a stable label carrying an eight-letter collision-resistant suffix.
export const chordlinkStripeIntegrationIdentifier = "chordlink_web_qjmzvksa"

export type ChordlinkCheckoutSession = {
  id: string
  object: string
  mode: string
  status: string | null
  payment_status: string
  amount_total: number | null
  currency: string | null
  client_reference_id: string | null
  metadata: Record<string, string> | null
}

export type ChordlinkCheckoutExpectation = {
  sessionId: string
  checkoutReference: string
  amount: number
  currency: string
}

type ChordlinkCheckoutParametersOptions = {
  baseUrl: string
  language: Language
  priceId: string
}

export function chordlinkCheckoutSessionParameters({
  baseUrl,
  language,
  priceId,
}: ChordlinkCheckoutParametersOptions) {
  const origin = baseUrl.replace(/\/$/u, "")
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"

  return {
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment" as const,
    success_url: `${origin}/chordlink/complete?session_id={CHECKOUT_SESSION_ID}&language=${language}`,
    cancel_url: `${origin}${productPath}`,
    client_reference_id: chordlinkStripeCheckoutReference,
    metadata: { chordlink_order: chordlinkStripeCheckoutReference },
    shipping_address_collection: { allowed_countries: ["DE"] as ["DE"] },
    locale: language,
    integration_identifier: chordlinkStripeIntegrationIdentifier,
  }
}

export function isCompletedChordlinkCheckoutSession(
  session: ChordlinkCheckoutSession,
  expected: ChordlinkCheckoutExpectation,
): boolean {
  return session.object === "checkout.session"
    && session.id === expected.sessionId
    && session.mode === "payment"
    && session.status === "complete"
    && session.payment_status === "paid"
    && session.amount_total === expected.amount
    && session.currency?.toUpperCase() === expected.currency.toUpperCase()
    && session.client_reference_id === expected.checkoutReference
    && session.metadata?.chordlink_order === expected.checkoutReference
}
