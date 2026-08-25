import { NextResponse } from "next/server"

import { preferredChordlinkLanguage } from "@/lib/chordlink"
import { verifyChordlinkCheckoutSession } from "@/lib/server/stripe-chordlink"

export async function GET(request: Request) {
  const requestedLanguage = new URL(request.url).searchParams.get("language")
  const language = requestedLanguage === "de" || requestedLanguage === "en"
    ? requestedLanguage
    : preferredChordlinkLanguage(request.headers.get("accept-language"))
  const productPath = language === "de" ? "/de/chordlink" : "/chordlink"
  const thanksPath = language === "de" ? "/de/chordlink/thanks" : "/chordlink/thanks"
  const sessionId = new URL(request.url).searchParams.get("session_id")
  const isCompleted = await verifyChordlinkCheckoutSession({
    sessionId,
  })
  const destination = isCompleted ? thanksPath : productPath
  return NextResponse.redirect(new URL(destination, request.url), 307)
}
