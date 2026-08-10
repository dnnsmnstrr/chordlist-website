import type { Metadata } from "next"

import { SocialPostEditor } from "@/components/social-post-editor"

export const metadata: Metadata = {
  title: "Social post editor",
  description: "Compose, preview, export, and copy chordlist social post configurations.",
  robots: { index: false, follow: false },
}

export default function SocialEditorPage() {
  return <SocialPostEditor />
}
