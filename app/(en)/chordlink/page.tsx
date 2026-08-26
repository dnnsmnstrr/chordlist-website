import type { Metadata } from "next"

import { ChordlinkPage } from "@/components/chordlink-page"
import { chordlinkCheckoutNotice } from "@/lib/chordlink-availability"
import { fetchChordlinkAvailability } from "@/lib/server/chordlink-availability"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/chordlink",
  title: "chordlink — tap your instrument, open chordlist",
  description: "A numbered 3D-printed NFC tag that opens chordlist on your iPhone.",
  image: "/og/chordlink.png",
  imageAlt: "chordlink first edition NFC tag",
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
      language="en"
    />
  )
}
