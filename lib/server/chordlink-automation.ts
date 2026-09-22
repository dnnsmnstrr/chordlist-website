import "server-only"

import { automationOverridePublicId, parseChordlinkAutomationUrl } from "@/lib/chordlink-automation"
import { siteConfig } from "@/lib/site-config"

const requestTimeoutMilliseconds = 2_000

function automationEndpoint(): string | null {
  const configured = process.env.CHORDLINK_AUTOMATION_URL?.trim()
  if (configured) return configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "")
  return supabaseUrl ? `${supabaseUrl}/functions/v1/chordlink-automation` : null
}

async function fetchAutomationUrl(endpoint: string, publicId: string | null): Promise<string | null> {
  const url = new URL(endpoint)
  if (publicId) url.searchParams.set("publicId", publicId)
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
    })
    if (!response.ok) return null
    return parseChordlinkAutomationUrl(await response.json())
  } catch {
    return null
  }
}

/**
 * The Shortcut a chordlink should install. Never fails: a unit's own override comes first, then the
 * backend's shared default, then the copy in the site config, so a tag that is not in the inventory
 * or a backend outage still ends somewhere installable.
 */
export async function resolveChordlinkAutomationUrl(publicId: string | null): Promise<string> {
  const endpoint = automationEndpoint()
  if (endpoint) {
    const overridePublicId = automationOverridePublicId(publicId)
    if (overridePublicId) {
      const override = await fetchAutomationUrl(endpoint, overridePublicId)
      if (override) return override
    }
    const shared = await fetchAutomationUrl(endpoint, null)
    if (shared) return shared
  }
  return siteConfig.chordlink.automationShortcut
}
