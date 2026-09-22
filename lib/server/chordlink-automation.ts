import "server-only"

import { parseChordlinkAutomationUrl } from "@/lib/chordlink-automation"

const requestTimeoutMilliseconds = 2_000
// The backend serves the same URL with `max-age=300`, so matching it here keeps the two from
// disagreeing about how stale the installer link may be.
const revalidateSeconds = 300

/**
 * Reads the backend's public automation endpoint for the storefront's shared Shortcut.
 *
 * Called without a `publicId`, which is the honest shape of the question: `/chordlink/setup` is
 * reached through a redirect that deliberately drops the unit's serial, and a self-printed
 * chordlink on `/chordlink/diy` has no inventory row to name at all. Both want the default the
 * operator configured, which is exactly what the bare endpoint answers.
 *
 * Returns `null` whenever the answer cannot be trusted — unconfigured, unreachable, slow, or
 * malformed. Callers hide the install button rather than render one that goes nowhere.
 */
export async function fetchChordlinkAutomationUrl(): Promise<string | null> {
  const endpoint = process.env.CHORDLINK_AUTOMATION_URL?.trim()
  if (!endpoint) return null

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
    })
    if (!response.ok) return null
    return parseChordlinkAutomationUrl(await response.json())
  } catch {
    return null
  }
}
