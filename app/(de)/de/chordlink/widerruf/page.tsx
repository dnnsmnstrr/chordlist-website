import type { Metadata } from "next"

import { ChordlinkWithdrawalPage } from "@/components/chordlink-withdrawal-page"

export const metadata: Metadata = { title: "Vertrag widerrufen · chordlink", robots: { index: false, follow: true } }

export default function Page() {
  return <ChordlinkWithdrawalPage language="de" />
}
