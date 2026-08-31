import { Fragment, type ReactNode } from "react"

import { parseInlineMarkup } from "@/lib/inline-markup"
import { findSearchMatches } from "@/lib/text-search"

/**
 * A copy string rendered with the inline markers `lib/inline-markup.ts` describes.
 *
 * Renders into the surrounding paragraph — it adds no wrapper of its own, so a `<p>` keeps its own
 * type and colour and only the marked spans differ.
 *
 * `highlight` carries the tokens of an active search, and marks them wherever they appear —
 * including inside a `<code>` span, which is where a menu path someone searched for usually is.
 */
export function InlineMarkup({ text, highlight }: { text: string; highlight?: readonly string[] }) {
  const render = (value: string): ReactNode =>
    highlight && highlight.length > 0 ? <Highlighted text={value} tokens={highlight} /> : value

  return (
    <>
      {parseInlineMarkup(text).map((token, index) => {
        switch (token.kind) {
          case "code":
            return (
              <code
                key={index}
                // box-decoration-clone keeps the border and padding on both halves when a long menu path
                // wraps mid-span, instead of leaving one fragment with three sides of a box.
                className="rounded border border-border bg-muted box-decoration-clone px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
              >
                {render(token.value)}
              </code>
            )
          case "strong":
            return (
              <strong key={index} className="font-medium text-foreground">
                {render(token.value)}
              </strong>
            )
          case "em":
            return <em key={index}>{render(token.value)}</em>
          default:
            return <Fragment key={index}>{render(token.value)}</Fragment>
        }
      })}
    </>
  )
}

/**
 * One string with every search match wrapped in a `<mark>`.
 *
 * Neutral rather than the browser's yellow: the highlight has to sit inside body copy, inside a
 * code span, and in both themes, so it is the foreground colour at low opacity rather than a
 * colour of its own.
 */
function Highlighted({ text, tokens }: { text: string; tokens: readonly string[] }) {
  const ranges = findSearchMatches(text, tokens)
  if (ranges.length === 0) return <>{text}</>

  const pieces: ReactNode[] = []
  let index = 0

  for (const range of ranges) {
    if (range.start > index) pieces.push(<Fragment key={`text-${index}`}>{text.slice(index, range.start)}</Fragment>)
    pieces.push(
      <mark key={`mark-${range.start}`} className="rounded-sm bg-foreground/15 px-0.5 text-foreground">
        {text.slice(range.start, range.end)}
      </mark>,
    )
    index = range.end
  }

  if (index < text.length) pieces.push(<Fragment key={`text-${index}`}>{text.slice(index)}</Fragment>)

  return <>{pieces}</>
}
