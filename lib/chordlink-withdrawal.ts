import type { Language } from "@/locales"

export type ChordlinkWithdrawal = {
  email: string
  language: Language
  name: string
  orderReference: string
  receivedAt: string
}

export type ChordlinkWithdrawalOutcome = "sent" | "invalid" | "unavailable"
export type ChordlinkWithdrawalState = { outcome: ChordlinkWithdrawalOutcome | null }

export const emptyChordlinkWithdrawalState: ChordlinkWithdrawalState = { outcome: null }

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export function parseChordlinkWithdrawal(formData: FormData, receivedAt = new Date()): ChordlinkWithdrawal | null {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const name = String(formData.get("name") ?? "").trim()
  const orderReference = String(formData.get("orderReference") ?? "").trim()
  const language: Language = formData.get("language") === "de" ? "de" : "en"

  if (!emailPattern.test(email) || email.length > 254) return null
  if (name.length < 2 || name.length > 160) return null
  if (orderReference.length < 2 || orderReference.length > 300) return null

  return { email, language, name, orderReference, receivedAt: receivedAt.toISOString() }
}
