import "server-only"

import { parseChordlinkAvailability, type ChordlinkAvailability } from "@/lib/chordlink-availability"

const requestTimeoutMilliseconds = 2_000

/**
 * Reads the backend's public availability endpoint. Returns `null` whenever the answer cannot be
 * trusted — unconfigured, unreachable, slow, or malformed — which callers treat as "closed", see
 * `mayOpenChordlinkCheckout`.
 */
export async function fetchChordlinkAvailability(): Promise<ChordlinkAvailability | null> {
  const endpoint = process.env.CHORDLINK_AVAILABILITY_URL?.trim()
  if (!endpoint) return null

  try {
    const response = await fetch(endpoint, {
      // The operator switch is authoritative, so neither pages nor checkout actions reuse a stale
      // enabled response after sales have been closed.
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
    })
    if (!response.ok) return null
    return parseChordlinkAvailability(await response.json())
  } catch {
    return null
  }
}
