/**
 * Markdown formatting for writing mode's toolbar, as pure functions over the text and the selection.
 *
 * Each one returns an `Edit`: the range to replace, what to put there, and where the selection
 * should land afterwards. The component applies it through the browser's own text insertion, so
 * a formatting step is a single entry on the native undo stack like any typing.
 *
 * Every action toggles. Applying it to text that already has it takes it off again, so the toolbar
 * can be used to fix formatting as well as to add it.
 */

export type Selection = { start: number; end: number }

export type Edit = {
  from: number
  to: number
  insert: string
  selection: Selection
}

/** Text the toolbar inserts when there is nothing selected, selected so typing replaces it. */
export type Placeholders = {
  bold: string
  italic: string
  code: string
  linkText: string
  linkUrl: string
}

function edit(from: number, to: number, insert: string, start: number, end = start): Edit {
  return { from, to, insert, selection: { start, end } }
}

/** The start of the line holding `at` and the end of the line holding `to`. */
function lineRange(text: string, { start, end }: Selection) {
  // A selection that ends right after a newline (triple-click, or dragging to the next line) means
  // the lines before it, not the empty start of the next.
  const last = end > start && text[end - 1] === "\n" ? end - 1 : end
  const from = text.lastIndexOf("\n", start - 1) + 1
  const next = text.indexOf("\n", last)
  return { from, to: next === -1 ? text.length : next }
}

/** Moves the selection's edges inwards past spaces, so "word " is formatted as "word". */
function trimSelection(text: string, { start, end }: Selection): Selection {
  while (start < end && /\s/.test(text[start] ?? "")) start += 1
  while (end > start && /\s/.test(text[end - 1] ?? "")) end -= 1
  return { start, end }
}

/**
 * Wraps the selection in `marker` — `**`, `_`, or a backtick — or unwraps it when it is already
 * wrapped, whether the markers sit just outside the selection or were selected along with it.
 * A selection over several lines wraps each line, because emphasis does not cross a paragraph.
 */
export function toggleInline(text: string, selection: Selection, marker: string, placeholder: string): Edit {
  const { start, end } = trimSelection(text, selection)
  const size = marker.length
  const selected = text.slice(start, end)

  if (text.slice(start - size, start) === marker && text.slice(end, end + size) === marker) {
    return edit(start - size, end + size, selected, start - size, end - size)
  }
  if (selected.length >= size * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
    const inner = selected.slice(size, -size)
    return edit(start, end, inner, start, start + inner.length)
  }

  if (selected === "") {
    const insert = `${marker}${placeholder}${marker}`
    return edit(start, end, insert, start + size, start + size + placeholder.length)
  }

  if (selected.includes("\n")) {
    const insert = selected
      .split("\n")
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed === "") return line
        const lead = line.slice(0, line.indexOf(trimmed))
        return `${lead}${marker}${trimmed}${marker}`
      })
      .join("\n")
    return edit(start, end, insert, start, start + insert.length)
  }

  return edit(start, end, `${marker}${selected}${marker}`, start + size, end + size)
}

/** The pairs a typed character wraps a selection in, as code editors do, instead of replacing it. */
export const WRAPPING_PAIRS: Record<string, string> = {
  "`": "`",
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "*": "*",
  _: "_",
}

/**
 * Wraps a non-empty selection in the pair `open` starts, keeping the same text selected inside.
 * Null when there is nothing to wrap, so the key types as usual.
 */
export function wrapSelection(text: string, { start, end }: Selection, open: string): Edit | null {
  const close = WRAPPING_PAIRS[open]
  if (close === undefined || start === end) return null
  return edit(start, end, `${open}${text.slice(start, end)}${close}`, start + open.length, end + open.length)
}

const LINK = /^\[([^\]\n]*)\]\(([^)\n]*)\)$/

/**
 * Turns the selection into a link and selects the part still to be written: the URL when words
 * were selected, the words when a URL was. Selecting a whole link takes it off and keeps its words.
 */
export function toggleLink(text: string, selection: Selection, placeholders: Placeholders): Edit {
  const { start, end } = trimSelection(text, selection)
  const selected = text.slice(start, end)

  const existing = LINK.exec(selected)
  if (existing) {
    const words = existing[1] ?? ""
    return edit(start, end, words, start, start + words.length)
  }

  if (/^(https?:\/\/|mailto:|\/)\S*$/.test(selected)) {
    const insert = `[${placeholders.linkText}](${selected})`
    return edit(start, end, insert, start + 1, start + 1 + placeholders.linkText.length)
  }

  const words = selected === "" ? placeholders.linkText : selected
  const insert = `[${words}](${placeholders.linkUrl})`
  if (selected === "") return edit(start, end, insert, start + 1, start + 1 + words.length)
  const urlStart = start + words.length + 3
  return edit(start, end, insert, urlStart, urlStart + placeholders.linkUrl.length)
}

/**
 * Inline code for a selection within one line; a fenced block for one that spans lines, or for an
 * empty line, where a single backtick pair would be no use.
 */
export function toggleCode(text: string, selection: Selection, placeholders: Placeholders): Edit {
  const selected = text.slice(selection.start, selection.end)
  const { from, to } = lineRange(text, selection)
  const onEmptyLine = selected === "" && text.slice(from, to).trim() === ""
  if (selected.trim().includes("\n") || onEmptyLine) return toggleCodeBlock(text, selection)
  return toggleInline(text, selection, "`", placeholders.code)
}

/** Fences the selected lines, or removes the fence when the lines already sit inside one. */
export function toggleCodeBlock(text: string, selection: Selection): Edit {
  const { from, to } = lineRange(text, selection)
  const before = text.lastIndexOf("\n", from - 2) + 1
  const after = text.indexOf("\n", to + 1)
  const lineBefore = from === 0 ? null : text.slice(before, from - 1)
  const lineAfter = to >= text.length ? null : text.slice(to + 1, after === -1 ? text.length : after)

  if (lineBefore?.startsWith("```") && lineAfter?.trim() === "```") {
    const inner = text.slice(from, to)
    const end = after === -1 ? text.length : after
    return edit(before, end, inner, before, before + inner.length)
  }

  const inner = text.slice(from, to)
  // A fence needs a blank line between it and a paragraph, or Markdown reads it as part of one.
  const lead = from === 0 || text.slice(0, from).endsWith("\n\n") ? "" : "\n"
  const tail = to >= text.length || text.slice(to).startsWith("\n\n") ? "" : "\n"
  const insert = `${lead}\`\`\`\n${inner}\n\`\`\`${tail}`
  const innerStart = from + lead.length + 4
  return edit(from, to, insert, innerStart, innerStart + inner.length)
}

type Prefix = { pattern: RegExp; add: string; blankLines: "skip" | "prefix" }

const PREFIXES = {
  quote: { pattern: /^> ?/, add: "> ", blankLines: "prefix" },
  list: { pattern: /^[-*+] /, add: "- ", blankLines: "skip" },
} satisfies Record<string, Prefix>

function mapLines(text: string, selection: Selection, map: (line: string) => string): Edit {
  const { from, to } = lineRange(text, selection)
  const insert = text.slice(from, to).split("\n").map(map).join("\n")
  // A caret stays a caret, moved with its line; a selection grows to cover the lines it touched.
  if (selection.start === selection.end && !text.slice(from, to).includes("\n")) {
    const caret = Math.max(from, selection.start + insert.length - (to - from))
    return edit(from, to, insert, caret)
  }
  return edit(from, to, insert, from, from + insert.length)
}

/** Block quote or bullet list on every selected line, or off again when every line has it. */
export function toggleLinePrefix(text: string, selection: Selection, kind: keyof typeof PREFIXES): Edit {
  const { pattern, add, blankLines } = PREFIXES[kind] as Prefix
  const { from, to } = lineRange(text, selection)
  const lines = text.slice(from, to).split("\n")
  const content = lines.filter((line) => line.trim() !== "")
  const remove = content.length > 0 && content.every((line) => pattern.test(line))

  return mapLines(text, selection, (line) => {
    if (remove) return line.replace(pattern, "")
    if (line.trim() === "") return blankLines === "prefix" && lines.length > 1 ? add.trimEnd() : line
    return `${add}${line}`
  })
}

/**
 * Cycles the selected lines through `##`, `###`, and plain text — the two levels the editorial
 * guidelines use, since the post title is the page's only `#`.
 */
export function cycleHeading(text: string, selection: Selection): Edit {
  const { from, to } = lineRange(text, selection)
  const first = text.slice(from, to).split("\n").find((line) => line.trim() !== "") ?? ""
  const level = /^(#{1,6}) /.exec(first)?.[1]?.length ?? 0
  const next = level === 0 || level === 1 ? "## " : level === 2 ? "### " : ""

  return mapLines(text, selection, (line) => {
    if (line.trim() === "") return line
    return `${next}${line.replace(/^#{1,6} /, "")}`
  })
}
