/**
 * The tiny slice of markup that copy in `locales/` is allowed to use.
 *
 * Copy is plain strings by design, but a support answer that says "Settings → Songs Folder" is
 * quoting a control the reader has to find on screen, and running prose is the wrong voice for
 * that. Three tags cover it, and nothing else is recognized:
 *
 *   <code>    an exact thing to find or type — a menu path, a filename, a button label
 *   <strong>  emphasis
 *   <em>      a lighter emphasis
 *
 * **Tags rather than Markdown**, because most copy strings are template literals interpolating
 * `siteConfig`: a Markdown backtick inside one would end the string, and a marker that is only
 * safe in half of the strings in a file is a trap. Tags read the same in both.
 *
 * Deliberately not an HTML parser, and not `lib/markdown.ts` either — that one returns an HTML
 * string for `dangerouslySetInnerHTML`, which is far too much authority for one sentence of UI
 * copy. This returns tokens that a component turns into React elements, so a string can only ever
 * produce the three elements above; anything else in it is text, and React escapes it.
 *
 * There is no escape syntax. An unknown tag, or one that is never closed, is left alone and
 * renders as itself — a mistake the reader can see and report, rather than a swallowed sentence.
 */

export type InlineToken = {
  kind: "text" | "code" | "strong" | "em"
  value: string
}

const tagPattern = /<(code|strong|em)>([\s\S]*?)<\/\1>/g

/** One string as its tokens, in order. Plain text is a single `text` token. */
export function parseInlineMarkup(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let index = 0

  for (const match of text.matchAll(tagPattern)) {
    const start = match.index
    if (start > index) tokens.push({ kind: "text", value: text.slice(index, start) })

    const [, tag, value] = match
    // The pattern only matches the three tags above, so this is a narrowing rather than a check.
    tokens.push({ kind: tag as Exclude<InlineToken["kind"], "text">, value: value ?? "" })

    index = start + match[0].length
  }

  if (index < text.length) tokens.push({ kind: "text", value: text.slice(index) })
  return tokens
}

/**
 * The same string with its tags removed.
 *
 * For the places that take words rather than elements — JSON-LD, `<title>`, an Open Graph
 * description, an `aria-label`. A stray tag reaching a rich result would misquote the page.
 */
export function plainInlineText(text: string): string {
  return parseInlineMarkup(text)
    .map((token) => token.value)
    .join("")
}
