import { createHash } from "node:crypto"

/**
 * The stamp of approval on a blog post.
 *
 * A post goes public only when its frontmatter carries an `approvedDigest` that matches the words
 * it is about to publish. The digest covers the title, the description, and the body — everything a
 * reader sees — and deliberately not the date, so the plan can move an approved post to another
 * week without withdrawing the approval.
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

export function approvalDigest(post: { title: string; description: string; body: string }) {
  const normalise = (text: string) => text.replace(/\r\n/g, "\n").trim()
  return createHash("sha256")
    .update([post.title, post.description, post.body].map(normalise).join("\n\u0000\n"))
    .digest("hex")
    .slice(0, DIGEST_LENGTH)
}

export function approvalState(
  post: { title: string; description: string; body: string },
  approvedDigest: string | null,
): ApprovalState {
  if (approvedDigest === null) return "none"
  return approvedDigest === approvalDigest(post) ? "approved" : "stale"
}
