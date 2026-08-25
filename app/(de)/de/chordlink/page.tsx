import type { Metadata } from "next"

import { ChordlinkPage } from "@/components/chordlink-page"
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
  return <ChordlinkPage checkoutUnavailable={(await searchParams).checkout === "unavailable"} language="de" />
}
