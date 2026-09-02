"use server"

import {
  parseChordlinkWithdrawal,
  type ChordlinkWithdrawalState,
} from "@/lib/chordlink-withdrawal"
import { submitChordlinkWithdrawal } from "@/lib/server/brevo-withdrawal"

export async function sendChordlinkWithdrawal(
  _previousState: ChordlinkWithdrawalState,
  formData: FormData,
): Promise<ChordlinkWithdrawalState> {
  const withdrawal = parseChordlinkWithdrawal(formData)
  if (!withdrawal) return { outcome: "invalid" }
  return { outcome: await submitChordlinkWithdrawal(withdrawal) }
}
