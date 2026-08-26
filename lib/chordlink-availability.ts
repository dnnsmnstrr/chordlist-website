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
}

export function parseChordlinkAvailability(value: unknown): ChordlinkAvailability | null {
  if (typeof value !== "object" || value === null) return null
  const body = value as Record<string, unknown>
  const editionKey = body.editionKey
  const available = body.available
  if (typeof editionKey !== "string" || !editionKey) return null
  if (typeof available !== "number" || !Number.isInteger(available) || available < 0) return null
  return { editionKey, available, soldOut: available === 0 }
}

/**
 * Fails open on purpose. A missing or unreachable availability endpoint must not close the shop:
 * the webhook now answers a sold-out allocation with `sold_out` rather than an endless retry, so
 * the worst case of an optimistic checkout is one visible refund, while the worst case of a
 * pessimistic one is every sale lost for as long as the blip lasts.
 */
export function mayOpenChordlinkCheckout(availability: ChordlinkAvailability | null): boolean {
  return availability === null || !availability.soldOut
}
