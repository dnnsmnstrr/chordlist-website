import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"

import {
  SocialPostGallery,
  type SocialManifestEntry,
} from "@/components/social-post-gallery"
import { requireAdmin } from "@/lib/server/admin-auth"

export const metadata: Metadata = {
  title: "Social posts",
  description: "Browse, share, and download ready-to-publish chordlist social posts.",
  robots: { index: false, follow: false },
}

async function getSocialPosts() {
  const manifestPath = path.join(process.cwd(), "public", "social", "manifest.json")
  const manifest = await readFile(manifestPath, "utf8")
  return JSON.parse(manifest) as SocialManifestEntry[]
}

export default async function SocialPostsPage() {
  await requireAdmin("/social/posts")
  const posts = await getSocialPosts()

  return <SocialPostGallery posts={posts} />
}
