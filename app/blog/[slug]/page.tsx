import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AppCTA } from "@/components/app-cta"
import { BlogMarkdown } from "@/components/blog-markdown"
import { PostCard, PostStatusBadge } from "@/components/post-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { BlogPostStructuredData } from "@/components/structured-data"
import { getPost, getPublishedSlugs, getRelatedPosts } from "@/lib/blog"
import { siteAlternateLanguages, siteAlternateTypes } from "@/lib/page-metadata"
import { siteConfig } from "@/lib/site-config"
import { blogCopy, locale, metadataCopy } from "@/locales/en"

export const revalidate = 3600

/**
 * Only published slugs are prerendered. A future-dated URL falls through to an
 * on-demand render (dynamicParams defaults to true), hits the notFound() below,
 * and starts resolving for real once its date passes and the route revalidates.
 */
export const dynamicParams = true

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (post === null) return {}

  const image = post.cover ?? `/blog/og/${post.slug}.png`

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags.map((tag) => blogCopy.tags[tag]),
    authors: [{ name: siteConfig.operator, url: siteConfig.url }],
    alternates: {
      canonical: post.href,
      languages: siteAlternateLanguages(post.href),
      types: siteAlternateTypes,
    },
    // Next merges metadata shallowly: this object replaces the layout's openGraph
    // entirely, so siteName, locale, and type have to be repeated here.
    openGraph: {
      type: "article",
      url: `${siteConfig.url}${post.href}`,
      siteName: siteConfig.name,
      locale: locale.openGraph,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedISO,
      tags: [...post.tags],
      images: [{ url: image, width: 1200, height: 630, alt: post.coverAlt ?? metadataCopy.socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.x.handle,
      creator: siteConfig.social.x.handle,
      title: post.title,
      description: post.description,
      images: [{ url: image, alt: post.coverAlt ?? metadataCopy.socialImageAlt }],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (post === null) notFound()

  const related = await getRelatedPosts(post)

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Drafts and scheduled posts only ever render on a preview deployment,
          which is noindex, so this never advertises a post that is not live. */}
      <BlogPostStructuredData post={post} />
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="flex w-fit items-center gap-1.5 rounded-md font-mono text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {blogCopy.post.back}
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          {post.isPublic ? null : (
            <div className="mb-4">
              <PostStatusBadge post={post} />
            </div>
          )}
          <p className="font-mono text-sm text-muted-foreground">
            <time dateTime={post.publishedISO}>{post.publishedLabel}</time>
            {" · "}
            {blogCopy.card.readingTime(post.readingMinutes)}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{post.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={{ pathname: "/blog", query: { tag } }}
                  className="block rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {blogCopy.tags[tag]}
                </Link>
              </li>
            ))}
          </ul>
        </header>

        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.coverAlt ?? ""}
            width={1200}
            height={630}
            priority
            className="mt-8 w-full rounded-xl border border-border"
          />
        ) : null}

        <BlogMarkdown html={post.html} className="mt-10" />

        {related.length > 0 ? (
          <section aria-labelledby="related-posts" className="mt-16 border-t border-border pt-10">
            <h2 id="related-posts" className="text-balance text-2xl font-semibold tracking-tight">
              {blogCopy.post.related}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((entry) => (
                <PostCard key={entry.slug} post={entry} compact />
              ))}
            </div>
          </section>
        ) : null}

        <aside className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/40 p-8 text-center">
          <h2 className="text-balance text-xl font-semibold tracking-tight">{blogCopy.post.cta.title}</h2>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            {blogCopy.post.cta.description}
          </p>
          <AppCTA large />
        </aside>
      </article>

      <SiteFooter compact />
    </main>
  )
}
