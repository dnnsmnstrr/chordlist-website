import type { Metadata } from "next"

import { ChordlinkWithdrawalPage } from "@/components/chordlink-withdrawal-page"

export const metadata: Metadata = { title: "Withdraw from contract · chordlink", robots: { index: false, follow: true } }

export default function Page() {
  return <ChordlinkWithdrawalPage language="en" />
}
