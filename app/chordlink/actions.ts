"use server"

import type { Route } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { mayOpenChordlinkCheckout } from "@/lib/chordlink-availability"
import { chordlinkCheckoutBaseUrl } from "@/lib/chordlink-checkout"
import { chordlinkCheckoutEnabled, siteConfig } from "@/lib/site-config"
import { fetchChordlinkAvailability } from "@/lib/server/chordlink-availability"
import { createChordlinkCheckoutUrl } from "@/lib/server/stripe-chordlink"
import type { Language } from "@/locales"

export async function startChordlinkCheckout(formData: FormData): Promise<never> {
  const language: Language = formData.get("language") === "de" ? "de" : "en"
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"
  let checkoutUrl: string | null = null

  // Checked before the session is created, because a unit is only allocated after payment: an
  // order taken past the last unit can be refunded, but not fulfilled.
  const availability = await fetchChordlinkAvailability()
  const soldOut = !mayOpenChordlinkCheckout(availability)

  if (chordlinkCheckoutEnabled && !soldOut) {
    try {
      const requestHeaders = await headers()
      const baseUrl = chordlinkCheckoutBaseUrl({
        isDevelopment: process.env.NODE_ENV === "development",
        productionUrl: siteConfig.url,
        requestHost: requestHeaders.get("host"),
      })
      checkoutUrl = await createChordlinkCheckoutUrl(language, baseUrl)
    } catch {
      checkoutUrl = null
    }
  }

  // Being sold out is not the same as the checkout being down, and telling someone to try again
  // later for a unit that will never exist is worse than telling them nothing.
  const notice = soldOut ? "sold-out" : "unavailable"
  redirect((checkoutUrl ?? `${productPath}?checkout=${notice}`) as Route)
}
