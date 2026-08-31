import { Fragment } from "react"

import { parseInlineMarkup } from "@/lib/inline-markup"

/**
 * A copy string rendered with the inline markers `lib/inline-markup.ts` describes.
 *
 * Renders into the surrounding paragraph — it adds no wrapper of its own, so a `<p>` keeps its own
 * type and colour and only the marked spans differ.
 */
export function InlineMarkup({ text }: { text: string }) {
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
                {token.value}
              </code>
            )
          case "strong":
            return (
              <strong key={index} className="font-medium text-foreground">
                {token.value}
              </strong>
            )
          case "em":
            return <em key={index}>{token.value}</em>
          default:
            return <Fragment key={index}>{token.value}</Fragment>
        }
      })}
    </>
  )
}
