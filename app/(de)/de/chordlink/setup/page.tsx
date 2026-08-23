import type { Metadata } from "next"

import { ChordlinkSetupPage } from "@/components/chordlink-setup-page"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata: Metadata = pageMetadata({
  path: "/de/chordlink/setup",
  title: "chordlink einrichten",
  description: "Installiere chordlist und wähle, was dein chordlink öffnet.",
  language: "de",
  extra: { robots: { index: false, follow: false }, alternates: { languages: { en: "/chordlink/setup", de: "/de/chordlink/setup", "x-default": "/chordlink/setup" } } },
})

export default function Page() {
  return <ChordlinkSetupPage language="de" />
}
