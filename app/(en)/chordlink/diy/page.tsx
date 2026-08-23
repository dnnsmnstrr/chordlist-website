import type { Metadata } from "next"

import { ChordlinkDiyPage } from "@/components/chordlink-diy-page"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/chordlink/diy",
  title: "Make your own chordlink",
  description: "Configure, 3D-print, and program a personal chordlink NFC tag at home.",
  image: "/og/chordlink.png",
  imageAlt: "chordlink — tap your instrument, open chordlist",
  extra: { alternates: { languages: { en: "/chordlink/diy", de: "/de/chordlink/diy", "x-default": "/chordlink/diy" } } },
})

export default function Page() {
  return <ChordlinkDiyPage language="en" />
}
