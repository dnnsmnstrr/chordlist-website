import "server-only"

import Stripe from "stripe"

import { isCompletedChordlinkCheckoutSession } from "@/lib/chordlink-checkout"

const checkoutSessionPattern = /^cs_(?:test_|live_)?[A-Za-z0-9]{8,255}$/

type VerifyChordlinkCheckoutOptions = {
  sessionId: string | null
  restrictedKey: string | undefined
  paymentLinkId: string | null
  amount: number
  currency: string
}

export async function verifyChordlinkCheckoutSession({
  sessionId,
  restrictedKey,
  paymentLinkId,
  amount,
  currency,
}: VerifyChordlinkCheckoutOptions): Promise<boolean> {
  if (!sessionId || !checkoutSessionPattern.test(sessionId) || !restrictedKey || !paymentLinkId) {
    return false
  }

  try {
    const stripe = new Stripe(restrictedKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return isCompletedChordlinkCheckoutSession(session, {
      sessionId,
      paymentLinkId,
      amount,
      currency,
    })
  } catch {
    return false
  }
}
