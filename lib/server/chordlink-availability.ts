import "server-only"

import { parseChordlinkAvailability, type ChordlinkAvailability } from "@/lib/chordlink-availability"

const requestTimeoutMilliseconds = 2_000

/**
 * Reads the backend's public availability endpoint. Returns `null` whenever the answer cannot be
 * trusted — unconfigured, unreachable, slow, or malformed — which callers treat as "carry on", see
 * `mayOpenChordlinkCheckout`.
 */
export async function fetchChordlinkAvailability(): Promise<ChordlinkAvailability | null> {
  const endpoint = process.env.CHORDLINK_AVAILABILITY_URL?.trim()
  if (!endpoint) return null

  try {
    const response = await fetch(endpoint, {
      // A checkout must not wait on inventory. The page's own display can be a little stale.
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
      next: { revalidate: 30 },
    })
    if (!response.ok) return null
    return parseChordlinkAvailability(await response.json())
  } catch {
    return null
  }
}
