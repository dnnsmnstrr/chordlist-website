import type { Metadata } from "next"

import { ChordlinkNotifiedPage } from "@/components/chordlink-notified-page"

export const metadata: Metadata = { title: "Du stehst auf der Liste · chordlink", robots: { index: false, follow: false } }

export default function Page() {
  return <ChordlinkNotifiedPage language="de" />
}
