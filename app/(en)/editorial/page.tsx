import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EditorialPlanner } from "@/components/editorial-planner"
import { readPlan } from "@/lib/editorial/store"
import { blogTags } from "@/lib/blog-tags"
import { requireAdmin } from "@/lib/server/admin-auth"
import { editorialCopy } from "@/locales/en"

/// The blog plan: cadence, order, and the stamp of approval.
///
/// A local authoring tool like /translations — it writes content/blog — so production 404s it
/// rather than rendering buttons that could never save. Read on the server on every request; the
/// client owns nothing but the action it is about to send.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: editorialCopy.metadata.title,
  description: editorialCopy.metadata.description,
  robots: { index: false, follow: false },
}

export default async function EditorialPage() {
  await requireAdmin("/editorial")
  if (process.env.NODE_ENV === "production") notFound()

  const { posts, cadence, today } = await readPlan()

  return (
    <EditorialPlanner
      today={today}
      cadence={cadence}
      tags={[...blogTags]}
      posts={posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        published: post.published,
        publishedLabel: post.publishedLabel,
        isPublic: post.isPublic,
        draft: post.draft,
        approval: post.approval,
        approvedOn: post.approvedOn,
        wordCount: post.wordCount,
        outlineCount: post.outline.length,
      }))}
    />
  )
}
