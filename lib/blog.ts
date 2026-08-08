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
  /** False for a draft or a post whose published date has not arrived. */
  isPublic: boolean
}

/** Everything parsePost can know without being told what "now" is. */
type ParsedMeta = Omit<PostMeta, "isPublic">

/**
 * Whether this deployment shows posts the public should not see yet — drafts and
 * future-dated posts.
 *
 * Vercel sets VERCEL_ENV on every deployment ("production" | "preview" |
 * "development"), so a branch preview shows unreleased posts and production does
 * not. Off Vercel, the dev server shows them while a production build does not,
 * which keeps `pnpm build && pnpm start` an honest rehearsal of production.
 *
 * The default is strict on purpose: anything that is not clearly a preview hides
 * unreleased posts, so a host that does not set VERCEL_ENV fails closed.
 */
export function showsUnreleasedPosts() {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv !== undefined && vercelEnv !== "") return vercelEnv !== "production"
  return process.env.NODE_ENV !== "production"
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
  const text =
    value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === "string" ? value.trim() : null

  if (text === null || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return fail(slug, `"${field}" must be a YYYY-MM-DD date`)
  }

  // The shape being right does not make the date real: 2026-02-29 and 2026-04-31
  // both roll forward silently, which would publish and label the post a day late.
  // Requiring the value to survive a round trip rejects them.
  const parsed = new Date(`${text}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    return fail(slug, `"${field}" is not a real calendar date: ${text}`)
  }

  return text
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

  const tags = value.map((tag) => {
    if (typeof tag !== "string" || !blogTags.includes(tag as BlogTag)) {
      fail(slug, `"${String(tag)}" is not a known tag. Known tags: ${blogTags.join(", ")}`)
    }
    return tag as BlogTag
  })

  // A repeated tag would count twice in the filter chips, inflate related-post
  // scoring, and render two chips sharing a React key.
  const duplicate = tags.find((tag, index) => tags.indexOf(tag) !== index)
  if (duplicate !== undefined) fail(slug, `"tags" lists "${duplicate}" twice`)

  return tags
}

/**
 * `cover` and `coverAlt` are set together or not at all.
 *
 * Reading them loosely lets two bad states through: alt text with no image, which
 * then describes the generated card instead of a cover, and `cover: ""`, which is
 * a string so it passes a null check but survives `post.cover ?? fallback` to
 * become an empty og:image URL.
 */
function readCover(record: Record<string, unknown>, slug: string) {
  const hasCover = record.cover !== undefined && record.cover !== null
  const hasAlt = record.coverAlt !== undefined && record.coverAlt !== null

  if (!hasCover && !hasAlt) return { cover: null, coverAlt: null }
  if (!hasCover || !hasAlt) fail(slug, `"cover" and "coverAlt" must be set together`)

  const cover = typeof record.cover === "string" ? record.cover.trim() : ""
  const coverAlt = typeof record.coverAlt === "string" ? record.coverAlt.trim() : ""

  if (cover === "") fail(slug, `"cover" must be a non-empty path`)
  if (coverAlt === "") fail(slug, `"coverAlt" must be a non-empty description`)

  return { cover, coverAlt }
}

function parsePost(slug: string, source: string): { meta: ParsedMeta; body: string } {
  const { frontmatter, body } = splitFrontmatter(source)
  if (frontmatter === null) fail(slug, "missing YAML frontmatter")

  const parsed: unknown = parseYaml(frontmatter)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(slug, "frontmatter must be a YAML mapping")
  }
  const record = parsed as Record<string, unknown>

  const { cover, coverAlt } = readCover(record, slug)
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
const readAllPosts = cache(async (): Promise<{ meta: ParsedMeta; body: string }[]> => {
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
 * A post is public once it is not a draft and its published date has arrived.
 * The blog routes revalidate hourly, so "now" is re-evaluated after each window
 * and a scheduled post goes live without a redeploy.
 */
function isPublic(meta: ParsedMeta, now: Date) {
  return !meta.draft && Date.parse(meta.publishedISO) <= now.getTime()
}

/** Public posts, plus unreleased ones when this deployment shows them. */
function selectVisible(posts: readonly { meta: ParsedMeta }[], now: Date): PostMeta[] {
  const showUnreleased = showsUnreleasedPosts()

  return posts
    .map((post) => ({ ...post.meta, isPublic: isPublic(post.meta, now) }))
    .filter((meta) => meta.isPublic || showUnreleased)
}

export async function getPublishedPosts(now: Date = new Date()): Promise<PostMeta[]> {
  const posts = await readAllPosts()
  return selectVisible(posts, now)
}

export async function getPublishedSlugs(now: Date = new Date()): Promise<string[]> {
  const posts = await getPublishedPosts(now)
  return posts.map((post) => post.slug)
}

export async function getPost(slug: string, now: Date = new Date()): Promise<Post | null> {
  const posts = await readAllPosts()
  const post = posts.find((candidate) => candidate.meta.slug === slug)

  if (post === undefined) return null

  const meta = { ...post.meta, isPublic: isPublic(post.meta, now) }
  if (!meta.isPublic && !showsUnreleasedPosts()) return null

  return { ...meta, html: renderMarkdown(post.body) }
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
