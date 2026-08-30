import "server-only"

import type { ChordlinkInterestReason } from "@/lib/chordlink-availability"
import {
  chordlinkInterestOutcome,
  chordlinkInterestRequestBody,
  type ChordlinkInterestOutcome,
} from "@/lib/chordlink-interest"
import type { Language } from "@/locales"

const doubleOptInEndpoint = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation"
// Longer than the availability read, because this call sends mail rather than answering a question.
const requestTimeoutMilliseconds = 8_000

function listIdForReason(reason: ChordlinkInterestReason): number | null {
  // Two lists rather than one with a tag, because the question actually asked later is "who do I
  // mail now" — the launch mail goes to one of them and the restock mail to the other, and a list
  // cannot be mailed by mistake the way a mis-typed filter can.
  const raw = reason === "sold-out" ? process.env.BREVO_WAITLIST_LIST_ID : process.env.BREVO_INTEREST_LIST_ID
  const listId = Number(raw?.trim())
  return Number.isInteger(listId) && listId > 0 ? listId : null
}

function templateId(): number | null {
  const parsed = Number(process.env.BREVO_INTEREST_DOI_TEMPLATE_ID?.trim())
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function apiKey(): string | null {
  return process.env.BREVO_API_KEY?.trim() || null
}

/**
 * Whether the form can be shown for this state at all.
 *
 * Fails closed like the checkout gate: a form that cannot reach Brevo would take an address, say
 * thank you, and drop it — which is worse than not offering to notify anybody, because the visitor
 * leaves believing they will hear from us.
 */
export function isChordlinkInterestConfigured(reason: ChordlinkInterestReason): boolean {
  return apiKey() !== null && templateId() !== null && listIdForReason(reason) !== null
}

/**
 * Hands the address to Brevo, which sends the confirmation mail and records the consent.
 *
 * Nothing about the address is logged here on the way through, and the address is never written to
 * the chordlink inventory: the list and the stock are deliberately separate systems.
 */
export async function submitChordlinkInterest({
  baseUrl,
  email,
  language,
  reason,
}: {
  baseUrl: string
  email: string
  language: Language
  reason: ChordlinkInterestReason
}): Promise<ChordlinkInterestOutcome> {
  const key = apiKey()
  const template = templateId()
  const listId = listIdForReason(reason)
  if (!key || !template || !listId) return "unavailable"

  try {
    const response = await fetch(doubleOptInEndpoint, {
      method: "POST",
      cache: "no-store",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(
        chordlinkInterestRequestBody({ baseUrl, email, language, listId, reason, templateId: template }),
      ),
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
    })
    if (response.ok) return chordlinkInterestOutcome(response.status)

    // Brevo reports an address that is already a contact as a 400 with a code, which
    // `chordlinkInterestOutcome` deliberately reads as success rather than leaking membership.
    const body: unknown = await response.json().catch(() => null)
    const code = typeof body === "object" && body !== null ? (body as { code?: unknown }).code : undefined
    return chordlinkInterestOutcome(response.status, typeof code === "string" ? code : undefined)
  } catch {
    return "unavailable"
  }
}
