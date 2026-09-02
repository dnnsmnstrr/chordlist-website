import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ChordlinkCheckoutPage } from "@/components/chordlink-checkout-page"
import { mayOpenChordlinkCheckout } from "@/lib/chordlink-availability"
import { chordlinkCheckoutBaseUrl } from "@/lib/chordlink-checkout"
import { siteConfig } from "@/lib/site-config"
import { fetchChordlinkAvailability } from "@/lib/server/chordlink-availability"
import { createChordlinkCheckoutSession } from "@/lib/server/stripe-chordlink"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Checkout · chordlink", robots: { index: false, follow: false } }

export default async function Page() {
  const availability = await fetchChordlinkAvailability()
  if (!mayOpenChordlinkCheckout(availability)) redirect("/chordlink?checkout=unavailable")

  const requestHeaders = await headers()
  const baseUrl = chordlinkCheckoutBaseUrl({
    isDevelopment: process.env.NODE_ENV === "development",
    productionUrl: siteConfig.url,
    requestHost: requestHeaders.get("host"),
  })
  const session = await createChordlinkCheckoutSession("en", baseUrl)
  if (!session) redirect("/chordlink?checkout=unavailable")

  return <ChordlinkCheckoutPage clientSecret={session.clientSecret} language="en" publishableKey={session.publishableKey} />
}
