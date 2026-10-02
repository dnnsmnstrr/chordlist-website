import "server-only"

import { readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

import { approvalDigest } from "@/lib/blog-approval"
import { getAllPosts } from "@/lib/blog"
import { isBlogTag, type BlogTag } from "@/lib/blog-tags"
import { parseCadence, reflow, todayISO, type Cadence } from "@/lib/editorial-schedule"
import { splitFrontmatter } from "@/lib/frontmatter"

/**
 * Reads and writes the blog plan on the local filesystem: the posts in content/blog and the cadence
 * in content/blog-schedule.json.
 *
 * Like the translation editor this only works on a checkout. A deployed build has no writable copy
 * of the repository, so every write refuses there, and the result reaches production the ordinary
 * way — committed and pushed.
 *
 * The files stay the source of truth. Nothing here keeps state of its own: every call reads the
 * file it is about to change, so a hand edit made between two clicks is never overwritten by a
 * stale copy held in memory.
 */

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog")
const SCHEDULE_PATH = path.join(process.cwd(), "content", "blog-schedule.json")
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Frontmatter is written in this order, then anything the editor does not know about, untouched.
 * A stable order keeps the git diff of an edit down to the lines that actually changed.
 */
const FIELD_ORDER = [
  "title",
  "description",
  "created",
  "published",
  "tags",
  "cover",
  "coverAlt",
  "draft",
  "outline",
  "approved",
  "approvedDigest",
]

export class EditorialError extends Error {}

export function assertEditable() {
  if (process.env.NODE_ENV === "production") {
    throw new EditorialError("The editorial tool only writes on a local checkout. Run `pnpm dev` and use it there.")
  }
}

function postPath(slug: string) {
  if (!SLUG_PATTERN.test(slug)) throw new EditorialError(`"${slug}" is not a valid slug.`)
  return path.join(POSTS_DIRECTORY, `${slug}.md`)
}

export async function readCadence(): Promise<Cadence> {
  return parseCadence(JSON.parse(await readFile(SCHEDULE_PATH, "utf8")))
}

async function writeCadence(cadence: Cadence) {
  await writeFile(SCHEDULE_PATH, `${JSON.stringify(cadence, null, 2)}\n`)
}

type PostFile = { record: Record<string, unknown>; body: string }

async function readPostFile(slug: string): Promise<PostFile> {
  let source: string
  try {
    source = await readFile(postPath(slug), "utf8")
  } catch {
    throw new EditorialError(`content/blog/${slug}.md does not exist.`)
  }

  const { frontmatter, body } = splitFrontmatter(source)
  if (frontmatter === null) throw new EditorialError(`content/blog/${slug}.md has no frontmatter.`)

  const record = parseYaml(frontmatter) as Record<string, unknown>
  return { record, body }
}

async function writePostFile(slug: string, { record, body }: PostFile) {
  const ordered: Record<string, unknown> = {}
  for (const key of FIELD_ORDER) {
    const value = record[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0 && key === "outline") continue
    ordered[key] = value
  }
  for (const [key, value] of Object.entries(record)) {
    if (!FIELD_ORDER.includes(key) && value !== undefined) ordered[key] = value
  }

  const frontmatter = stringifyYaml(ordered, { lineWidth: 0 }).trimEnd()
  const trimmed = body.replace(/\r\n/g, "\n").trim()
  await writeFile(postPath(slug), `---\n${frontmatter}\n---\n${trimmed === "" ? "" : `\n${trimmed}\n`}`)
}

function cleanTags(tags: unknown): BlogTag[] {
  if (!Array.isArray(tags) || tags.length === 0) throw new EditorialError("Pick at least one tag.")
  const valid = tags.filter((tag): tag is BlogTag => typeof tag === "string" && isBlogTag(tag))
  if (valid.length !== tags.length) throw new EditorialError("One of those tags is not in lib/blog-tags.ts.")
  return [...new Set(valid)]
}

function cleanOutline(outline: unknown): string[] {
  if (!Array.isArray(outline)) return []
  return outline.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim() === "") throw new EditorialError(`${label} cannot be empty.`)
  return value.trim()
}

/** Every post, in plan order, with the cadence. What /editorial renders. */
export async function readPlan(now: Date = new Date()) {
  const [posts, cadence] = await Promise.all([getAllPosts(now), readCadence()])
  const ordered = [...posts].sort((a, b) =>
    a.published === b.published ? a.slug.localeCompare(b.slug) : a.published.localeCompare(b.published),
  )
  return { posts: ordered, cadence, today: todayISO(now) }
}

/**
 * Reassigns the not-yet-live posts to the cadence in `order` (slugs), or in their current date
 * order when no order is given. Live posts are never moved.
 */
async function applyOrder(order?: string[]) {
  const { posts, cadence, today } = await readPlan()
  const bySlug = new Map(posts.map((post) => [post.slug, post]))

  const queue = order
    ? [
        ...posts.filter((post) => post.isPublic),
        ...order.flatMap((slug) => {
          const post = bySlug.get(slug)
          return post && !post.isPublic ? [post] : []
        }),
        // Anything the caller left out keeps its relative place at the end rather than vanishing.
        ...posts.filter((post) => !post.isPublic && !order.includes(post.slug)),
      ]
    : posts

  const changes = reflow(
    queue.map((post) => ({ slug: post.slug, published: post.published, live: post.isPublic })),
    cadence,
    today,
  )

  for (const change of changes) {
    const file = await readPostFile(change.slug)
    await writePostFile(change.slug, { ...file, record: { ...file.record, published: change.published } })
  }

  return changes
}

export async function reorder(order: string[]) {
  return applyOrder(order)
}

export async function updateCadence(input: { start: unknown; everyDays: unknown; skip: unknown }) {
  const cadence = parseCadence(input)
  await writeCadence(cadence)
  return applyOrder()
}

export async function createPost(input: {
  slug: unknown
  title: unknown
  description: unknown
  tags: unknown
  outline: unknown
}) {
  const slug = requireText(input.slug, "The slug")
  const file = postPath(slug)

  try {
    await readFile(file)
    throw new EditorialError(`content/blog/${slug}.md already exists. Slugs are permanent URLs — pick another.`)
  } catch (error) {
    if (error instanceof EditorialError) throw error
  }

  const today = todayISO()
  await writePostFile(slug, {
    record: {
      title: requireText(input.title, "The title"),
      description: requireText(input.description, "The promise"),
      created: today,
      // A placeholder until the reflow below gives it the next free slot.
      published: "9999-12-31",
      tags: cleanTags(input.tags),
      outline: cleanOutline(input.outline),
    },
    body: "",
  })

  await applyOrder()
  return slug
}

export async function updatePost(
  slug: string,
  patch: { title?: unknown; description?: unknown; tags?: unknown; outline?: unknown; body?: unknown },
) {
  const file = await readPostFile(slug)
  const record = { ...file.record }

  if (patch.title !== undefined) record.title = requireText(patch.title, "The title")
  if (patch.description !== undefined) record.description = requireText(patch.description, "The promise")
  if (patch.tags !== undefined) record.tags = cleanTags(patch.tags)
  if (patch.outline !== undefined) record.outline = cleanOutline(patch.outline)
  const body = typeof patch.body === "string" ? patch.body : file.body

  await writePostFile(slug, { record, body })
}

/**
 * The stamp. Records today's date and the digest of the words as they are on disk right now —
 * read here, not sent by the browser, so what gets approved is the file, not a tab's idea of it.
 */
export async function approvePost(slug: string) {
  const file = await readPostFile(slug)
  if (file.body.trim() === "") throw new EditorialError("There is nothing to approve yet — the post has no text.")

  const title = requireText(file.record.title, "The title")
  const description = requireText(file.record.description, "The promise")

  await writePostFile(slug, {
    ...file,
    record: {
      ...file.record,
      approved: todayISO(),
      approvedDigest: approvalDigest({ title, description, body: file.body }),
    },
  })
}

export async function revokeApproval(slug: string) {
  const file = await readPostFile(slug)
  const record = { ...file.record }
  delete record.approved
  delete record.approvedDigest
  await writePostFile(slug, { ...file, record })
}

/** Only an idea or a draft can be deleted: a post that has been live owns a URL people link to. */
export async function deletePost(slug: string) {
  const { posts } = await readPlan()
  const post = posts.find((candidate) => candidate.slug === slug)
  if (!post) throw new EditorialError(`content/blog/${slug}.md does not exist.`)
  if (post.isPublic) throw new EditorialError("A live post cannot be deleted from here — its URL is permanent.")

  await rm(postPath(slug))
  await applyOrder()
}
