import type { Metadata } from "next"

import { ChordlinkTermsPage } from "@/components/chordlink-terms-page"

export const metadata: Metadata = { title: "Physical-product terms · chordlink", robots: { index: false, follow: true } }

export default function Page() {
  return <ChordlinkTermsPage language="en" />
}
