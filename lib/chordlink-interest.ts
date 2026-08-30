import type { ChordlinkInterestReason } from "@/lib/chordlink-availability"
import type { Language } from "@/locales"

/**
 * Collecting an address for the launch mail, before there is anything to sell.
 *
 * The list itself lives at Brevo rather than in the chordlink inventory: its double opt-in sends
 * the confirmation, records the consent that German law expects to be produced on demand, and owns
 * unsubscribing. What lives here is the part that must not be guessed at — what counts as an
 * address, which list a signup belongs on, and what the visitor is allowed to learn from the
 * answer.
 */

/** What the form is allowed to say back. */
export type ChordlinkInterestOutcome = "confirm-sent" | "invalid-email" | "unavailable"

// Deliberately permissive: a local part, an @, and a dotted domain. Anything stricter starts
// rejecting real addresses, and the confirmation mail is the real test of whether an address
// exists — an unconfirmed row is never mailed again.
const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const maximumEmailLength = 254

/**
 * The address as it will be stored, or `null` if it is not one.
 *
 * Lowercased so the same person typing `Ada@Example.com` today and `ada@example.com` next week is
 * one contact rather than two, which also means one unsubscribe covers both.
 */
export function normalizeInterestEmail(value: unknown): string | null {
  if (typeof value !== "string") return null
  const candidate = value.trim().toLowerCase()
  if (candidate.length === 0 || candidate.length > maximumEmailLength) return null
  return emailPattern.test(candidate) ? candidate : null
}

/**
 * Where the confirmation link in the email lands, in the language the form was filled in.
 */
export function chordlinkInterestConfirmedPath(language: Language): string {
  return language === "de" ? "/de/chordlink/notified" : "/chordlink/notified"
}

export type ChordlinkInterestRequestBody = {
  email: string
  includeListIds: number[]
  templateId: number
  redirectionUrl: string
  attributes: { LANGUAGE: string; SIGNUP_REASON: ChordlinkInterestReason }
}

/**
 * The double opt-in request, with the two facts a later campaign needs to segment on: which
 * language to write in, and whether this person is waiting for the first batch or for the next one.
 */
export function chordlinkInterestRequestBody({
  baseUrl,
  email,
  language,
  listId,
  reason,
  templateId,
}: {
  baseUrl: string
  email: string
  language: Language
  listId: number
  reason: ChordlinkInterestReason
  templateId: number
}): ChordlinkInterestRequestBody {
  return {
    email,
    includeListIds: [listId],
    templateId,
    redirectionUrl: `${baseUrl}${chordlinkInterestConfirmedPath(language)}`,
    attributes: { LANGUAGE: language.toUpperCase(), SIGNUP_REASON: reason },
  }
}

/**
 * What a Brevo reply means to the visitor.
 *
 * An address already on the list is reported as a fresh success on purpose. Saying "you are already
 * signed up" would turn the form into a membership oracle: anyone could type someone else's address
 * and learn whether that person is on the list. Brevo does not re-send a confirmation to a contact
 * that has already confirmed, so the honest-looking answer also costs nothing.
 */
export function chordlinkInterestOutcome(status: number, errorCode?: string): ChordlinkInterestOutcome {
  if (status >= 200 && status < 300) return "confirm-sent"
  if (status === 400 && errorCode === "duplicate_parameter") return "confirm-sent"
  return "unavailable"
}

/**
 * What the form knows between submissions.
 *
 * It lives here rather than beside the action because a `"use server"` module may only export async
 * functions — an exported constant there is a build error, not a style preference.
 */
export type ChordlinkInterestFormState = { outcome: ChordlinkInterestOutcome | null }

export const emptyChordlinkInterestFormState: ChordlinkInterestFormState = { outcome: null }
