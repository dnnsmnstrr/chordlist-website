export type ChordlinkCheckoutSession = {
  id: string
  object: string
  mode: string
  status: string | null
  payment_status: string
  amount_total: number | null
  currency: string | null
  payment_link: string | { id: string } | null
}

export type ChordlinkCheckoutExpectation = {
  sessionId: string
  paymentLinkId: string
  amount: number
  currency: string
}

export function isCompletedChordlinkCheckoutSession(
  session: ChordlinkCheckoutSession,
  expected: ChordlinkCheckoutExpectation,
): boolean {
  const paymentLinkId = typeof session.payment_link === "string"
    ? session.payment_link
    : session.payment_link?.id

  return session.object === "checkout.session"
    && session.id === expected.sessionId
    && session.mode === "payment"
    && session.status === "complete"
    && session.payment_status === "paid"
    && session.amount_total === expected.amount
    && session.currency?.toUpperCase() === expected.currency.toUpperCase()
    && paymentLinkId === expected.paymentLinkId
}
