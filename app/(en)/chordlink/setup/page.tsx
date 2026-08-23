import type { Metadata } from "next"

import { ChordlinkSetupPage } from "@/components/chordlink-setup-page"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/chordlink/setup",
  title: "Set up chordlink",
  description: "Install chordlist and choose what your chordlink opens.",
  extra: { robots: { index: false, follow: false }, alternates: { languages: { en: "/chordlink/setup", de: "/de/chordlink/setup", "x-default": "/chordlink/setup" } } },
})

export default function Page() {
  return <ChordlinkSetupPage language="en" />
}
