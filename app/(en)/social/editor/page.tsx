import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import type { Metadata } from "next"
import { parse as parseYaml } from "yaml"

import { SocialPostEditor } from "@/components/social-post-editor"
import { normalizeHashtags } from "@/lib/social-hashtags"
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

/** Every hashtag used by a definition in content/social, so a tag added to one post is suggested for the next. */
async function loadUsedHashtags(): Promise<string[]> {
  const directory = path.join(process.cwd(), "content", "social")
  const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".md")).sort()
  const tags: unknown[] = []
  for (const file of files) {
    const source = await readFile(path.join(directory, file), "utf8").catch(() => "")
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
    if (!frontmatter) continue
    try {
      const data = parseYaml(frontmatter) as { hashtags?: unknown } | null
      if (Array.isArray(data?.hashtags)) tags.push(...data.hashtags)
    } catch {
      // A malformed definition fails pnpm build:social loudly; here it only costs its suggestions.
    }
  }
  return normalizeHashtags(tags)
}

export default async function SocialEditorPage({ searchParams }: Props) {
  await requireAdmin("/social/editor")
  const { slug, config } = await searchParams
  const configMarkdown = config
    ? decodeConfigParam(config)
    : slug
      ? await loadConfigForSlug(slug)
      : null

  return <SocialPostEditor configMarkdown={configMarkdown ?? undefined} usedHashtags={await loadUsedHashtags()} />
}
