import { NextResponse } from "next/server"

import { resolveChordlinkAutomationUrl } from "@/lib/server/chordlink-automation"

export async function GET(request: Request) {
  const publicId = new URL(request.url).searchParams.get("publicId")
  const url = await resolveChordlinkAutomationUrl(publicId)

  return NextResponse.json(
    { url },
    { headers: { "x-robots-tag": "noindex, nofollow", "cache-control": "public, max-age=300" } },
  )
}
