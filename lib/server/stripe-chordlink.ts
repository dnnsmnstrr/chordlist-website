import "server-only"

import Stripe from "stripe"

import {
  chordlinkCheckoutSessionParameters,
  chordlinkStripeCheckoutReference,
  isCompletedChordlinkCheckoutSession,
} from "@/lib/chordlink-checkout"
import { siteConfig } from "@/lib/site-config"
import { isChordlinkWithdrawalConfigured } from "@/lib/server/brevo-withdrawal"
import type { Language } from "@/locales"

const checkoutSessionPattern = /^cs_(?:test_|live_)?[A-Za-z0-9]{8,255}$/

type VerifyChordlinkCheckoutOptions = {
  sessionId: string | null
}

function stripeConfiguration(): { priceId: string; publishableKey: string; secretKey: string } | null {
  const priceId = process.env.CHORDLINK_STRIPE_PRICE_ID
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const secretKey = process.env.STRIPE_SECRET_KEY
  return priceId && publishableKey && secretKey ? { priceId, publishableKey, secretKey } : null
}

export function isChordlinkStripeConfigured(): boolean {
  // The 2026 online-withdrawal function is part of the sale, not an optional support feature.
  // Keep the storefront closed if its immediate confirmation mail cannot be delivered.
  return stripeConfiguration() !== null && isChordlinkWithdrawalConfigured()
}

export async function createChordlinkCheckoutSession(
  language: Language,
  baseUrl: string = siteConfig.url,
): Promise<{ clientSecret: string; publishableKey: string } | null> {
  const configuration = stripeConfiguration()
  if (!configuration || !isChordlinkWithdrawalConfigured()) return null

  try {
    const stripe = new Stripe(configuration.secretKey)
    const price = await stripe.prices.retrieve(configuration.priceId)
    const configuredPriceMatches = price.active
      && price.unit_amount === siteConfig.chordlink.price.amount
      && price.currency.toUpperCase() === siteConfig.chordlink.price.currency
      && price.type === "one_time"
    if (!configuredPriceMatches) return null

    const session = await stripe.checkout.sessions.create(
      chordlinkCheckoutSessionParameters({
        baseUrl,
        language,
        priceId: configuration.priceId,
      }),
    )
    return session.client_secret
      ? { clientSecret: session.client_secret, publishableKey: configuration.publishableKey }
      : null
  } catch {
    return null
  }
}

export async function verifyChordlinkCheckoutSession({
  sessionId,
}: VerifyChordlinkCheckoutOptions): Promise<boolean> {
  const configuration = stripeConfiguration()
  if (!sessionId || !checkoutSessionPattern.test(sessionId) || !configuration) {
    return false
  }

  try {
    const stripe = new Stripe(configuration.secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return isCompletedChordlinkCheckoutSession(session, {
      sessionId,
      checkoutReference: chordlinkStripeCheckoutReference,
      amount: siteConfig.chordlink.price.amount,
      currency: siteConfig.chordlink.price.currency,
    })
  } catch {
    return false
  }
}
