import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"

import { SocialPostEditor } from "@/components/social-post-editor"

export const metadata: Metadata = {
  title: "Social post editor",
  description: "Compose, preview, export, and copy chordlist social post configurations.",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ slug?: string }>
}

async function loadConfigForSlug(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "content", "social", `${slug}.md`)
    return await readFile(filePath, "utf8")
  } catch {
    return null
  }
}

export default async function SocialEditorPage({ searchParams }: Props) {
  const { slug } = await searchParams
  const configMarkdown = slug ? await loadConfigForSlug(slug) : null

  return <SocialPostEditor configMarkdown={configMarkdown ?? undefined} />
}
