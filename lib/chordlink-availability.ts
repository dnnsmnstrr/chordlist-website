/**
 * How many first-edition chordlinks the backend still has for sale.
 *
 * The count is deliberately public — it is shown on the product page — but its real job is to keep
 * the buy form from opening a checkout for a unit that no longer exists. The backend allocates a
 * unit only after payment, so without this the last order of the batch is taken, charged, and then
 * refunded by hand.
 */
export type ChordlinkAvailability = {
  editionKey: string
  available: number
  soldOut: boolean
  salesEnabled: boolean
}

export function parseChordlinkAvailability(value: unknown): ChordlinkAvailability | null {
  if (typeof value !== "object" || value === null) return null
  const body = value as Record<string, unknown>
  const editionKey = body.editionKey
  const available = body.available
  const salesEnabled = body.salesEnabled
  if (typeof editionKey !== "string" || !editionKey) return null
  if (typeof available !== "number" || !Number.isInteger(available) || available < 0) return null
  if (typeof salesEnabled !== "boolean") return null
  return { editionKey, available, soldOut: available === 0, salesEnabled }
}

/**
 * Fails closed because the backend switch is authoritative. Missing or malformed configuration
 * must never be interpreted as permission to sell.
 */
export function mayOpenChordlinkCheckout(availability: ChordlinkAvailability | null): boolean {
  return availability !== null && availability.salesEnabled && !availability.soldOut
}

/** What the product page tells a buyer who was just turned away, and why. */
export type ChordlinkCheckoutNotice = "unavailable" | "sold-out" | null

export function chordlinkCheckoutNotice(value: string | undefined): ChordlinkCheckoutNotice {
  return value === "sold-out" || value === "unavailable" ? value : null
}

/**
 * The visible numbering of the sale run, derived rather than written down, so the line under the
 * buy button cannot drift from the batch the backend actually seeded.
 */
export function chordlinkNumberingRange(saleQuantity: number, width = 3): string {
  if (!Number.isInteger(saleQuantity) || saleQuantity < 1) return ""
  return `${"1".padStart(width, "0")}\u2013${String(saleQuantity).padStart(width, "0")}`
}

/**
 * Why a visitor who wants a chordlink cannot have one right now.
 *
 * `prelaunch` and `sold-out` are the two states worth measuring separately, and later worth
 * mailing separately: the first group is waiting for the switch to open, the second is waiting for
 * a batch that does not exist yet.
 */
export type ChordlinkInterestReason = "prelaunch" | "sold-out"

/**
 * Which interest signal, if any, the product page should collect.
 *
 * `null` when there is nothing to collect: either checkout is open, or — the case worth spelling
 * out — the availability response could not be read at all. That state is an outage, not a state
 * of the product, and sales may well be open behind it. Counting it as pre-launch interest would
 * inflate the signal with people a failure turned away, and would offer to notify them about a
 * launch that has already happened.
 */
export function chordlinkInterestReason(
  availability: ChordlinkAvailability | null,
): ChordlinkInterestReason | null {
  if (availability === null) return null
  if (availability.soldOut) return "sold-out"
  return availability.salesEnabled ? null : "prelaunch"
}
