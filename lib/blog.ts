import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type { Route } from "next"
import { parse as parseYaml } from "yaml"

import { blogTags, type BlogTag } from "@/lib/blog-tags"
import { splitFrontmatter } from "@/lib/frontmatter"
import { renderMarkdown } from "@/lib/markdown"
import { locale } from "@/locales/en"

export { blogTags, type BlogTag } from "@/lib/blog-tags"

/**
 * Loads blog posts from content/blog/*.md.
 *
 * The filename is the slug and therefore the permanent URL — it is never a
 * frontmatter field, so the two cannot drift apart.
 *
 * Anything malformed throws with the filename in the message. That is deliberate:
 * a typo'd tag or a missing description should fail `pnpm build`, not ship as a
 * broken card.
 */

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog")

export type PostMeta = {
  slug: string
  href: Route
  title: string
  description: string
  created: string
  published: string
  publishedISO: string
  publishedLabel: string
  tags: readonly BlogTag[]
  cover: string | null
  coverAlt: string | null
  draft: boolean
  readingMinutes: number
}

export type Post = PostMeta & { html: string }

export type TagCount = { tag: BlogTag; count: number }

const dateFormatter = new Intl.DateTimeFormat(locale.dateLocale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/** Average adult reading speed, rounded to whole minutes. */
const WORDS_PER_MINUTE = 200

function fail(slug: string, message: string): never {
  throw new Error(`content/blog/${slug}.md: ${message}`)
}

function readString(record: Record<string, unknown>, field: string, slug: string) {
  const value = record[field]
  if (typeof value !== "string" || value.trim() === "") fail(slug, `"${field}" is required and must be a non-empty string`)
  return value.trim()
}

/**
 * Normalises a frontmatter date to YYYY-MM-DD.
 *
 * YAML 1.2's core schema leaves `2026-08-15` as a string, but a quoted value or a
 * parser configured for YAML 1.1 yields a Date. Accept both so the frontmatter can
 * be written the natural way.
 */
function readDate(record: Record<string, unknown>, field: string, slug: string) {
  const value = record[field]
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim()
  return fail(slug, `"${field}" must be a YYYY-MM-DD date`)
}

/**
 * `draft` must be a real boolean.
 *
 * YAML 1.2's core schema only treats `true`/`false` as booleans, so `draft: yes`,
 * `draft: on`, `draft: 1`, and `draft: "true"` all parse as a string or number. Reading
 * those loosely would silently publish a post that its author marked as a draft, which is
 * the one failure this flag exists to prevent — so reject them instead.
 */
function readDraft(record: Record<string, unknown>, slug: string) {
  const value = record.draft
  if (value === undefined || value === null) return false
  if (typeof value === "boolean") return value
  return fail(slug, `"draft" must be true or false, not ${JSON.stringify(value)}`)
}

function readTags(record: Record<string, unknown>, slug: string): readonly BlogTag[] {
  const value = record.tags
  if (!Array.isArray(value) || value.length === 0) fail(slug, `"tags" must list at least one tag`)

  return value.map((tag) => {
    if (typeof tag !== "string" || !blogTags.includes(tag as BlogTag)) {
      fail(slug, `"${String(tag)}" is not a known tag. Known tags: ${blogTags.join(", ")}`)
    }
    return tag as BlogTag
  })
}

function parsePost(slug: string, source: string): { meta: PostMeta; body: string } {
  const { frontmatter, body } = splitFrontmatter(source)
  if (frontmatter === null) fail(slug, "missing YAML frontmatter")

  const parsed: unknown = parseYaml(frontmatter)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(slug, "frontmatter must be a YAML mapping")
  }
  const record = parsed as Record<string, unknown>

  const cover = typeof record.cover === "string" ? record.cover.trim() : null
  const coverAlt = typeof record.coverAlt === "string" ? record.coverAlt.trim() : null
  if (cover !== null && coverAlt === null) fail(slug, `"cover" also requires "coverAlt"`)

  const published = readDate(record, "published", slug)
  const wordCount = body.split(/\s+/).filter(Boolean).length

  return {
    body,
    meta: {
      slug,
      href: `/blog/${slug}` as Route,
      title: readString(record, "title", slug),
      description: readString(record, "description", slug),
      created: readDate(record, "created", slug),
      published,
      publishedISO: `${published}T00:00:00.000Z`,
      publishedLabel: dateFormatter.format(new Date(`${published}T00:00:00Z`)),
      tags: readTags(record, slug),
      cover,
      coverAlt,
      draft: readDraft(record, slug),
      readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    },
  }
}

/**
 * Every post on disk, including drafts and future-dated ones, newest first.
 *
 * Wrapped in React's `cache` so the index page, `generateStaticParams`,
 * `generateMetadata`, the sitemap, and the RSS feed share one directory read.
 */
const readAllPosts = cache(async (): Promise<{ meta: PostMeta; body: string }[]> => {
  const entries = await readdir(POSTS_DIRECTORY, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))

  const posts = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(path.join(POSTS_DIRECTORY, file.name), "utf8")
      return parsePost(file.name.slice(0, -".md".length), source)
    }),
  )

  return posts.sort((a, b) => {
    if (a.meta.published !== b.meta.published) return a.meta.published < b.meta.published ? 1 : -1
    if (a.meta.created !== b.meta.created) return a.meta.created < b.meta.created ? 1 : -1
    return a.meta.slug < b.meta.slug ? -1 : 1
  })
})

/**
 * A post is visible once it is not a draft and its published date has arrived.
 * The blog routes revalidate hourly, so "now" is re-evaluated after each window
 * and a scheduled post goes live without a redeploy.
 */
function isVisible(meta: PostMeta, now: Date) {
  return !meta.draft && Date.parse(meta.publishedISO) <= now.getTime()
}

export async function getPublishedPosts(now: Date = new Date()): Promise<PostMeta[]> {
  const posts = await readAllPosts()
  return posts.map((post) => post.meta).filter((meta) => isVisible(meta, now))
}

export async function getPublishedSlugs(now: Date = new Date()): Promise<string[]> {
  const posts = await getPublishedPosts(now)
  return posts.map((post) => post.slug)
}

export async function getPost(slug: string, now: Date = new Date()): Promise<Post | null> {
  const posts = await readAllPosts()
  const post = posts.find((candidate) => candidate.meta.slug === slug)

  if (post === undefined || !isVisible(post.meta, now)) return null

  return { ...post.meta, html: renderMarkdown(post.body) }
}

export async function getTagCounts(now: Date = new Date()): Promise<TagCount[]> {
  const posts = await getPublishedPosts(now)
  const counts = new Map<BlogTag, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count === a.count ? a.tag.localeCompare(b.tag) : b.count - a.count))
}

/** Other visible posts that share at least one tag, most overlap first. */
export async function getRelatedPosts(post: PostMeta, limit = 3, now: Date = new Date()): Promise<PostMeta[]> {
  const posts = await getPublishedPosts(now)

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (b.score === a.score ? (a.candidate.published < b.candidate.published ? 1 : -1) : b.score - a.score))
    .slice(0, limit)
    .map((entry) => entry.candidate)
}
