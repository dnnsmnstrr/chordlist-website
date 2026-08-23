import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { chordlinkFallbackPath, preferredChordlinkLanguage } from "@/lib/chordlink"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params
  const requestHeaders = await headers()
  const language = preferredChordlinkLanguage(requestHeaders.get("accept-language"))
  const destination = chordlinkFallbackPath(publicId, language)

  if (!destination) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" },
    })
  }

  // Do not carry the public ID to the destination. Page analytics therefore see
  // only a shared setup URL, never a unit's serial.
  return NextResponse.redirect(new URL(destination, request.url), {
    status: 307,
    headers: { "x-robots-tag": "noindex, nofollow", "cache-control": "private, no-store" },
  })
}
