import { readFile } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"

import { SocialPostEditor } from "@/components/social-post-editor"
import { requireAdmin } from "@/lib/server/admin-auth"

export const metadata: Metadata = {
  title: "Social post editor",
  description: "Compose, preview, export, and copy chordlist social post configurations.",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ slug?: string; config?: string }>
}

function decodeConfigParam(encoded: string): string | null {
  try {
    const base64Decoded = Buffer.from(encoded, "base64").toString("utf-8")
    return decodeURIComponent(base64Decoded)
  } catch {
    return null
  }
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
  await requireAdmin("/social/editor")
  const { slug, config } = await searchParams
  const configMarkdown = config
    ? decodeConfigParam(config)
    : slug
      ? await loadConfigForSlug(slug)
      : null

  return <SocialPostEditor configMarkdown={configMarkdown ?? undefined} />
}
