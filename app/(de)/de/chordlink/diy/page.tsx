import type { Metadata } from "next"

import { ChordlinkDiyPage } from "@/components/chordlink-diy-page"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/de/chordlink/diy",
  title: "Eigenen chordlink bauen",
  description: "Konfiguriere, drucke und programmiere zu Hause deinen persönlichen chordlink NFC-Tag.",
  language: "de",
  extra: { alternates: { languages: { en: "/chordlink/diy", de: "/de/chordlink/diy", "x-default": "/chordlink/diy" } } },
})

export default function Page() {
  return <ChordlinkDiyPage language="de" />
}
