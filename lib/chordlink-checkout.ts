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
  amount_subtotal: number | null
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

type ChordlinkCheckoutBaseUrlOptions = {
  isDevelopment: boolean
  productionUrl: string
  requestHost: string | null
}

export function chordlinkCheckoutBaseUrl({
  isDevelopment,
  productionUrl,
  requestHost,
}: ChordlinkCheckoutBaseUrlOptions): string {
  if (!isDevelopment || !requestHost) return productionUrl

  try {
    const localUrl = new URL(`http://${requestHost}`)
    const isLoopback = localUrl.hostname === "localhost"
      || localUrl.hostname === "127.0.0.1"
      || localUrl.hostname === "[::1]"
    return isLoopback ? localUrl.origin : productionUrl
  } catch {
    return productionUrl
  }
}

export function chordlinkCheckoutSessionParameters({
  baseUrl,
  language,
  priceId,
}: ChordlinkCheckoutParametersOptions) {
  const origin = baseUrl.replace(/\/$/u, "")

  return {
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment" as const,
    ui_mode: "custom" as const,
    return_url: `${origin}/chordlink/complete?session_id={CHECKOUT_SESSION_ID}&language=${language}`,
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
  const hasSettledPayment = session.payment_status === "paid"
    || (session.payment_status === "no_payment_required" && session.amount_total === 0)

  return session.object === "checkout.session"
    && session.id === expected.sessionId
    && session.mode === "payment"
    && session.status === "complete"
    && hasSettledPayment
    && session.amount_subtotal === expected.amount
    && session.amount_total === expected.amount
    && session.currency?.toUpperCase() === expected.currency.toUpperCase()
    && session.client_reference_id === expected.checkoutReference
    && session.metadata?.chordlink_order === expected.checkoutReference
}
