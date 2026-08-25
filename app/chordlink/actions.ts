"use server"

import type { Route } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { chordlinkCheckoutBaseUrl } from "@/lib/chordlink-checkout"
import { chordlinkCheckoutEnabled, siteConfig } from "@/lib/site-config"
import { createChordlinkCheckoutUrl } from "@/lib/server/stripe-chordlink"
import type { Language } from "@/locales"

export async function startChordlinkCheckout(formData: FormData): Promise<never> {
  const language: Language = formData.get("language") === "de" ? "de" : "en"
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"
  let checkoutUrl: string | null = null

  if (chordlinkCheckoutEnabled) {
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

  redirect((checkoutUrl ?? `${productPath}?checkout=unavailable`) as Route)
}
