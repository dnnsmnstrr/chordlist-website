import { createHash } from "node:crypto"

/**
 * The stamp of approval on a blog post.
 *
 * A post goes public only when its frontmatter carries an `approvedDigest` that matches the words
 * it is about to publish. The digest covers the title, the description, the body, and the key visual
 * above it (`cover` and its alt text) — everything a reader sees — and deliberately not the date, so
 * the plan can move an approved post to another week without withdrawing the approval.
 *
 * The key visual joins the digest only when a post has one, so a post without a cover hashes
 * exactly as it did before covers were part of the stamp and keeps its approval.
 *
 * Any edit after approval, by hand or by a refining pass, changes the digest and takes the post
 * back out of public view until it is approved again. That is the point: an approval is for the
 * exact text that was read, not for whatever the file says later.
 *
 * Shared by `lib/blog.ts`, which enforces it, and `/editorial`, which is the only thing that writes
 * it.
 */

export type ApprovalState = "none" | "approved" | "stale"

/** Twelve hex characters: plenty to notice an edit, short enough to read in a diff. */
const DIGEST_LENGTH = 12

export type ApprovedContent = {
  title: string
  description: string
  body: string
  cover?: string | null
  coverAlt?: string | null
}

export function approvalDigest(post: ApprovedContent) {
  const normalise = (text: string) => text.replace(/\r\n/g, "\n").trim()
  const parts = [post.title, post.description, post.body]
  if (post.cover) parts.push(post.cover, post.coverAlt ?? "")
  return createHash("sha256")
    .update(parts.map(normalise).join("\n\u0000\n"))
    .digest("hex")
    .slice(0, DIGEST_LENGTH)
}

export function approvalState(
  post: ApprovedContent,
  approvedDigest: string | null,
): ApprovalState {
  if (approvedDigest === null) return "none"
  return approvedDigest === approvalDigest(post) ? "approved" : "stale"
}
