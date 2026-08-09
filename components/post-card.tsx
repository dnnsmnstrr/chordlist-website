import Image from "next/image"
import Link from "next/link"

import type { PostMeta } from "@/lib/blog"
import { blogCopy } from "@/locales/en"

/**
 * Marks a post that the public cannot see yet. Rendered only where unreleased
 * posts are shown at all — a preview deployment or the dev server — so a preview
 * is never mistaken for the live site.
 */
export function PostStatusBadge({ post }: { post: PostMeta }) {
  return (
    <span className="w-fit rounded-full border border-dashed border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
      {post.draft ? blogCopy.status.draft : blogCopy.status.scheduled(post.publishedLabel)}
    </span>
  )
}

type PostCardProps = {
  post: PostMeta
  /** Drops the cover image, for the denser related-posts grid. */
  compact?: boolean
}

export function PostCard({ post, compact = false }: PostCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border border-border p-5 transition-colors hover:bg-muted/40">
      {post.cover && !compact ? (
        <Image
          src={post.cover}
          alt={post.coverAlt ?? ""}
          width={1200}
          height={630}
          sizes="(min-width: 640px) 45vw, 100vw"
          className="w-full rounded-lg border border-border object-cover"
        />
      ) : null}

      {post.isPublic ? null : <PostStatusBadge post={post} />}

      <p className="font-mono text-xs text-muted-foreground">
        <time dateTime={post.publishedISO}>{post.publishedLabel}</time>
        {" · "}
        {blogCopy.card.readingTime(post.readingMinutes)}
      </p>

      <h3 className="text-balance text-lg font-semibold tracking-tight">
        {/* Stretched link: the whole card is one target, so nothing else inside is interactive. */}
        <Link
          href={post.href}
          className="rounded-md after:absolute after:inset-0 focus-visible:outline-none group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2 group-focus-within:ring-offset-background"
        >
          {post.title}
        </Link>
      </h3>

      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{post.description}</p>

      <ul className="mt-1 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {blogCopy.tags[tag]}
          </li>
        ))}
      </ul>
    </article>
  )
}
