import type { Metadata } from "next"

import { ChordlinkThanksPage } from "@/components/chordlink-thanks-page"

export const metadata: Metadata = { title: "Thank you · chordlink", robots: { index: false, follow: false } }

export default function Page() {
  return <ChordlinkThanksPage language="en" />
}
