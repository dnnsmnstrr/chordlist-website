import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { genericChordlinkFallbackPaths, preferredChordlinkLanguage } from "@/lib/chordlink"

export const dynamic = "force-dynamic"

// A bare /link carries no public ID — someone typed the URL off the tag rather than
// tapping it, or the ID was dropped. Send them to the same setup page the numbered
// links land on instead of a 404.
export async function GET(request: Request) {
  const requestHeaders = await headers()
  const language = preferredChordlinkLanguage(requestHeaders.get("accept-language"))

  return NextResponse.redirect(new URL(genericChordlinkFallbackPaths[language], request.url), {
    status: 307,
    headers: { "x-robots-tag": "noindex, nofollow", "cache-control": "private, no-store" },
  })
}
