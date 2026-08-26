import type { Metadata } from "next"

import { ChordlinkPage } from "@/components/chordlink-page"
import { chordlinkCheckoutNotice } from "@/lib/chordlink-availability"
import { fetchChordlinkAvailability } from "@/lib/server/chordlink-availability"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/de/chordlink",
  title: "chordlink — Instrument antippen, chordlist öffnen",
  description: "Ein nummerierter, 3D-gedruckter NFC-Tag, der chordlist auf deinem iPhone öffnet.",
  image: "/og/chordlink.png",
  imageAlt: "NFC-Tag der ersten chordlink-Edition",
  language: "de",
  extra: { alternates: { languages: { en: "/chordlink", de: "/de/chordlink", "x-default": "/chordlink" } } },
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const [{ checkout }, availability] = await Promise.all([
    searchParams,
    fetchChordlinkAvailability(),
  ])

  return (
    <ChordlinkPage
      availability={availability}
      checkoutNotice={chordlinkCheckoutNotice(checkout)}
      language="de"
    />
  )
}
