import type { Metadata } from "next"

import { ChordlinkTermsPage } from "@/components/chordlink-terms-page"

export const metadata: Metadata = { title: "Bedingungen · chordlink", robots: { index: false, follow: true } }

export default function Page() {
  return <ChordlinkTermsPage language="de" />
}
