import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { WritingMode } from "@/components/writing-mode"
import { listImages } from "@/lib/editorial/images"
import { readPlan } from "@/lib/editorial/store"
import { blogTags } from "@/lib/blog-tags"
import { requireAdmin } from "@/lib/server/admin-auth"
import { editorialCopy } from "@/locales/en"

/// Writing mode for one post: the outline beside an empty page, autosaved to content/blog.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: editorialCopy.metadata.title,
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditorialPostPage({ params }: Props) {
  const { slug } = await params
  await requireAdmin(`/editorial/${slug}`)
  if (process.env.NODE_ENV === "production") notFound()

  const { posts } = await readPlan()
  const post = posts.find((candidate) => candidate.slug === slug)
  if (!post) notFound()

  return (
    <WritingMode
      tags={[...blogTags]}
      images={await listImages(post.slug)}
      post={{
        slug: post.slug,
        href: post.href,
        title: post.title,
        description: post.description,
        tags: [...post.tags],
        outline: post.outline,
        body: post.body,
        cover: post.cover,
        coverAlt: post.coverAlt,
        publishedLabel: post.publishedLabel,
        isPublic: post.isPublic,
        approval: post.approval,
      }}
    />
  )
}
