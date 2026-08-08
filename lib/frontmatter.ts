/**
 * Splits a leading YAML frontmatter block from the body of a Markdown file.
 *
 * Shared by `components/lyric-preview.tsx`, which renders the raw frontmatter as
 * text, and `lib/blog.ts`, which parses it. Neither needs a Markdown parser to
 * find the block, so this stays a plain regex.
 */
export function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const frontmatter = match?.[1]
  const body = match?.[2]

  if (frontmatter === undefined || body === undefined) {
    return { frontmatter: null, body: source.trim() }
  }

  return { frontmatter: frontmatter.trim(), body: body.trim() }
}
