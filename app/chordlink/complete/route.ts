import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { preferredChordlinkLanguage } from "@/lib/chordlink"

export async function GET(request: Request) {
  const requestHeaders = await headers()
  const language = preferredChordlinkLanguage(requestHeaders.get("accept-language"))
  const destination = language === "de" ? "/de/chordlink/thanks" : "/chordlink/thanks"
  return NextResponse.redirect(new URL(destination, request.url), 307)
}
