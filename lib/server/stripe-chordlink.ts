import "server-only"

import Stripe from "stripe"

import {
  chordlinkCheckoutSessionParameters,
  chordlinkStripeCheckoutReference,
  isCompletedChordlinkCheckoutSession,
} from "@/lib/chordlink-checkout"
import { siteConfig } from "@/lib/site-config"
import type { Language } from "@/locales"

const checkoutSessionPattern = /^cs_(?:test_|live_)?[A-Za-z0-9]{8,255}$/

type VerifyChordlinkCheckoutOptions = {
  sessionId: string | null
}

function stripeConfiguration(): { priceId: string; secretKey: string } | null {
  const priceId = process.env.CHORDLINK_STRIPE_PRICE_ID
  const secretKey = process.env.STRIPE_SECRET_KEY
  return priceId && secretKey ? { priceId, secretKey } : null
}

export function isChordlinkStripeConfigured(): boolean {
  return stripeConfiguration() !== null
}

export async function createChordlinkCheckoutUrl(language: Language): Promise<string | null> {
  const configuration = stripeConfiguration()
  if (!configuration) return null

  const stripe = new Stripe(configuration.secretKey)
  const session = await stripe.checkout.sessions.create(
    chordlinkCheckoutSessionParameters({
      baseUrl: siteConfig.url,
      language,
      priceId: configuration.priceId,
    }),
  )
  return session.url
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
