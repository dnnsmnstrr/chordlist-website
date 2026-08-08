import { cn } from "@/lib/utils"

type BlogMarkdownProps = {
  html: string
  className?: string
}

/**
 * Renders the HTML produced by lib/markdown.ts.
 *
 * The input is trusted: it comes from Markdown files committed to this repository.
 * See the note in lib/markdown.ts before using this with anything else.
 */
export function BlogMarkdown({ html, className }: BlogMarkdownProps) {
  return <div className={cn("post-body", className)} dangerouslySetInnerHTML={{ __html: html }} />
}
