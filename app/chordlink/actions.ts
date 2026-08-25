"use server"

import type { Route } from "next"
import { redirect } from "next/navigation"

import { chordlinkCheckoutEnabled } from "@/lib/site-config"
import { createChordlinkCheckoutUrl } from "@/lib/server/stripe-chordlink"
import type { Language } from "@/locales"

export async function startChordlinkCheckout(formData: FormData): Promise<never> {
  const language: Language = formData.get("language") === "de" ? "de" : "en"
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"
  let checkoutUrl: string | null = null

  if (chordlinkCheckoutEnabled) {
    try {
      checkoutUrl = await createChordlinkCheckoutUrl(language)
    } catch {
      checkoutUrl = null
    }
  }

  redirect((checkoutUrl ?? `${productPath}?checkout=unavailable`) as Route)
}
