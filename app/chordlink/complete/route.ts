import { NextResponse } from "next/server"

import { preferredChordlinkLanguage } from "@/lib/chordlink"
import { siteConfig } from "@/lib/site-config"
import { verifyChordlinkCheckoutSession } from "@/lib/server/stripe-chordlink"

export async function GET(request: Request) {
  const language = preferredChordlinkLanguage(request.headers.get("accept-language"))
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"
  const thanksPath = language === "de" ? "/de/chordlink/thanks" : "/chordlink/thanks"
  const sessionId = new URL(request.url).searchParams.get("session_id")
  const isCompleted = await verifyChordlinkCheckoutSession({
    sessionId,
    restrictedKey: process.env.STRIPE_CHECKOUT_SESSION_READ_KEY,
    paymentLinkId: siteConfig.chordlink.stripePaymentLinkId,
    amount: siteConfig.chordlink.price.amount,
    currency: siteConfig.chordlink.price.currency,
  })
  const destination = isCompleted ? thanksPath : productPath
  return NextResponse.redirect(new URL(destination, request.url), 307)
}
