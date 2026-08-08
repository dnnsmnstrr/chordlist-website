/**
 * The closed tag vocabulary for blog posts.
 *
 * This lives apart from lib/blog.ts on purpose: the loader there imports
 * node:fs, so anything a client component needs has to come from here instead.
 * `components/blog-post-list.tsx` and `locales/en.ts` both import from this file.
 *
 * Adding a tag means adding it here *and* adding its label to `blogCopy.tags` in
 * locales/en.ts — that map is typed against this list, so a missing label is a
 * typecheck error.
 */
export const blogTags = ["markdown", "workflow", "ios", "obsidian", "offline", "chords", "release"] as const

export type BlogTag = (typeof blogTags)[number]

export function isBlogTag(value: string): value is BlogTag {
  return blogTags.includes(value as BlogTag)
}
