"use server"

import { headers } from "next/headers"

import { chordlinkInterestReason } from "@/lib/chordlink-availability"
import { chordlinkCheckoutBaseUrl } from "@/lib/chordlink-checkout"
import { normalizeInterestEmail, type ChordlinkInterestFormState } from "@/lib/chordlink-interest"
import { fetchChordlinkAvailability } from "@/lib/server/chordlink-availability"
import { submitChordlinkInterest } from "@/lib/server/brevo-interest"
import { siteConfig } from "@/lib/site-config"
import type { Language } from "@/locales"

export async function submitChordlinkInterestForm(
  _previousState: ChordlinkInterestFormState,
  formData: FormData,
): Promise<ChordlinkInterestFormState> {
  const language: Language = formData.get("language") === "de" ? "de" : "en"

  // A hidden field no person can see and no person fills in. A bot that fills every input gets the
  // same thank-you as everybody else and reaches no further, which is quieter than a rejection it
  // could learn to avoid.
  if (typeof formData.get("website") === "string" && formData.get("website") !== "") {
    return { outcome: "confirm-sent" }
  }

  const email = normalizeInterestEmail(formData.get("email"))
  if (!email) return { outcome: "invalid-email" }

  // Which list this belongs on is decided here from the backend's own answer, never from the form.
  // The reason travels through the browser in the markup, so trusting it back would let anyone put
  // themselves on the restock list while the first edition is still selling.
  const reason = chordlinkInterestReason(await fetchChordlinkAvailability())
  if (reason === null) return { outcome: "unavailable" }

  const requestHeaders = await headers()
  const baseUrl = chordlinkCheckoutBaseUrl({
    isDevelopment: process.env.NODE_ENV === "development",
    productionUrl: siteConfig.url,
    requestHost: requestHeaders.get("host"),
  })

  return { outcome: await submitChordlinkInterest({ baseUrl, email, language, reason }) }
}
