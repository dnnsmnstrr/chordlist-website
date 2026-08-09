import { Suspense } from "react"
import type { Metadata } from "next"

import { BlogPostList } from "@/components/blog-post-list"
import { PostCard } from "@/components/post-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getPublishedPosts, getTagCounts } from "@/lib/blog"
import { siteConfig } from "@/lib/site-config"
import { blogCopy, locale, metadataCopy } from "@/locales/en"

/**
 * Hourly revalidation is what makes scheduled posts work: a post whose `published`
 * date has passed appears here within an hour, with no redeploy.
 */
export const revalidate = 3600

export const metadata: Metadata = {
  title: blogCopy.metadata.title,
  description: blogCopy.metadata.description,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  // Page metadata replaces the layout's shallowly rather than merging, so without
  // these a share of /blog would carry the home page's title, description, and URL.
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    locale: locale.openGraph,
    title: blogCopy.metadata.title,
    description: blogCopy.metadata.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: metadataCopy.socialImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.x.handle,
    creator: siteConfig.social.x.handle,
    title: blogCopy.metadata.title,
    description: blogCopy.metadata.description,
    images: ["/og.png"],
  },
}

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagCounts()])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* A listing, not an article — the post pages use <article>. */}
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
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
            /*
              BlogPostList reads the URL with useSearchParams, which requires a Suspense
              boundary in a prerendered route. The fallback is the unfiltered grid, so the
              page is useful before hydration and nothing shifts when it arrives.
            */
            <Suspense
              fallback={
                <div className="grid gap-5 sm:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              }
            >
              <BlogPostList posts={posts} tags={tags} />
            </Suspense>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
