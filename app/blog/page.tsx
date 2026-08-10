import type { Metadata } from "next"

import { BlogPostList } from "@/components/blog-post-list"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getPublishedPosts, getTagCounts } from "@/lib/blog"
import { pageMetadata } from "@/lib/page-metadata"
import { siteConfig } from "@/lib/site-config"
import { blogCopy } from "@/locales/en"

/**
 * Hourly revalidation is what makes scheduled posts work: a post whose `published`
 * date has passed appears here within an hour, with no redeploy.
 */
export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title: blogCopy.metadata.title,
  description: blogCopy.metadata.description,
  extra: { alternates: { types: { "application/rss+xml": "/blog/rss.xml" } } },
})

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagCounts()])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* A listing, not an article — the post pages use <article>. */}
      <div id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="max-w-3xl border-b border-border pb-8">
          <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{blogCopy.title}</h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">{blogCopy.introduction}</p>
        </header>

        <div className="mt-10">
          {posts.length === 0 ? (
            // Before the first post goes live there is nothing to search or filter,
            // so the whole control row would be furniture above an empty list.
            <p className="rounded-xl border border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              {blogCopy.noPosts}
            </p>
          ) : (
            // Prerenders in full — list, controls, and all: BlogPostList reads the URL
            // through its own history subscription rather than useSearchParams, so this
            // route never bails out to client-side rendering. See the component.
            <BlogPostList posts={posts} tags={tags} />
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
