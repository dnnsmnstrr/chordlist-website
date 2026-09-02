import "server-only"

import type { ChordlinkWithdrawal, ChordlinkWithdrawalOutcome } from "@/lib/chordlink-withdrawal"
import { siteConfig } from "@/lib/site-config"

const endpoint = "https://api.brevo.com/v3/smtp/email"
const requestTimeoutMilliseconds = 8_000

export function isChordlinkWithdrawalConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim())
}

export async function submitChordlinkWithdrawal(
  withdrawal: ChordlinkWithdrawal,
): Promise<ChordlinkWithdrawalOutcome> {
  const key = process.env.BREVO_API_KEY?.trim()
  if (!key) return "unavailable"

  const received = new Intl.DateTimeFormat(withdrawal.language === "de" ? "de-DE" : "en-GB", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Europe/Berlin",
  }).format(new Date(withdrawal.receivedAt))
  const seller = `${siteConfig.legalName}, ${siteConfig.operator}, ${siteConfig.businessAddress.street}, ${siteConfig.businessAddress.postalCode} ${siteConfig.businessAddress.city}`
  const customerText = withdrawal.language === "de"
    ? `Wir bestätigen den Eingang deines Widerrufs.\n\nName: ${withdrawal.name}\nBestellung: ${withdrawal.orderReference}\nEingang: ${received}\n\nDeine Erklärung: Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf eines chordlink.\n\nVerkäufer: ${seller}\nKontakt: ${siteConfig.contact.support}`
    : `We confirm receipt of your withdrawal.\n\nName: ${withdrawal.name}\nOrder: ${withdrawal.orderReference}\nReceived: ${received}\n\nYour declaration: I hereby withdraw from the contract I concluded for the purchase of one chordlink.\n\nSeller: ${seller}\nContact: ${siteConfig.contact.support}`
  const sellerText = `Online-Widerruf eingegangen\n\nName: ${withdrawal.name}\nE-Mail: ${withdrawal.email}\nBestellung: ${withdrawal.orderReference}\nEingang: ${received}\n\nErklärung: Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf eines chordlink.`
  const common = {
    sender: { email: siteConfig.contact.support, name: `${siteConfig.operator} · chordlink` },
    headers: { "X-Mailin-custom": "chordlink-withdrawal" },
  }

  try {
    const [customer, sellerResponse] = await Promise.all([
      send(key, {
        ...common,
        subject: withdrawal.language === "de" ? "Eingangsbestätigung deines chordlink-Widerrufs" : "Confirmation of your chordlink withdrawal",
        textContent: customerText,
        to: [{ email: withdrawal.email, name: withdrawal.name }],
      }),
      send(key, {
        ...common,
        replyTo: { email: withdrawal.email, name: withdrawal.name },
        subject: "Online-Widerruf · chordlink",
        textContent: sellerText,
        to: [{ email: siteConfig.contact.support, name: siteConfig.legalName }],
      }),
    ])
    return customer.ok && sellerResponse.ok ? "sent" : "unavailable"
  } catch {
    return "unavailable"
  }
}

function send(key: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMilliseconds),
  })
}
