import type { Metadata } from "next"

import { ChordlinkNotifiedPage } from "@/components/chordlink-notified-page"

export const metadata: Metadata = { title: "You are on the list · chordlink", robots: { index: false, follow: false } }

export default function Page() {
  return <ChordlinkNotifiedPage language="en" />
}
