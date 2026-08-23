import type { Metadata } from "next"

import { ChordlinkPage } from "@/components/chordlink-page"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/chordlink",
  title: "chordlink — tap your instrument, open chordlist",
  description: "A numbered 3D-printed NFC tag that opens chordlist on your iPhone.",
  image: "/og/chordlink.png",
  imageAlt: "chordlink first edition NFC tag",
  extra: { alternates: { languages: { en: "/chordlink", de: "/de/chordlink", "x-default": "/chordlink" } } },
})

export default function Page() {
  return <ChordlinkPage language="en" />
}
