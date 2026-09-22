import { NextResponse } from "next/server"

import { resolveChordlinkAutomationUrl } from "@/lib/server/chordlink-automation"

// A link people can share or type: it lands on the Shortcut itself. The app reads the JSON sibling
// instead, since following this redirect from Safari shows iCloud's page rather than Shortcuts.
export async function GET(request: Request) {
  const publicId = new URL(request.url).searchParams.get("publicId")
  const destination = await resolveChordlinkAutomationUrl(publicId)

  return NextResponse.redirect(destination, {
    status: 307,
    headers: { "x-robots-tag": "noindex, nofollow", "cache-control": "public, max-age=300" },
  })
}
