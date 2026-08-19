import type { Metadata } from "next"
import { Rss } from "lucide-react"

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

// The RSS `alternates.types` link is site-wide now, from pageMetadata.
export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title: blogCopy.metadata.title,
  description: blogCopy.metadata.description,
})

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagCounts()])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* A listing, not an article — the post pages use <article>. */}
      <div id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        {/* Full width so the feed link lands on the same right edge as the search
            field below it. The text keeps its own narrower measure. */}
        <header className="flex items-start justify-between gap-6 border-b border-border pb-8">
          <div className="max-w-3xl">
            <p className="font-mono text-sm text-muted-foreground">{siteConfig.name}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{blogCopy.title}</h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">{blogCopy.introduction}</p>
          </div>

          {/* A plain anchor, not <Link>: the feed is a route handler serving XML, so
              the browser should navigate to it rather than attempt a client-side
              transition into a page that does not exist. */}
          <a
            href="/blog/rss.xml"
            aria-label={blogCopy.feed.ariaLabel}
            className="flex shrink-0 items-center gap-1.5 rounded-md font-mono text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Rss aria-hidden="true" className="size-3.5" />
            {blogCopy.feed.label}
          </a>
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
