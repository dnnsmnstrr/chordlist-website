"use client"

import type { KeyboardEvent, RefObject } from "react"
import { Bold, Code, Heading, Italic, Link2, List, SquareCode, TextQuote } from "lucide-react"

import { secondaryButton } from "@/components/editorial-planner"
import {
  cycleHeading,
  toggleCode,
  toggleCodeBlock,
  toggleInline,
  toggleLinePrefix,
  toggleLink,
  wrapSelection,
  type Edit,
  type Selection,
} from "@/lib/markdown-format"
import { cn } from "@/lib/utils"
import { editorialCopy } from "@/locales/en"

const copy = editorialCopy.writing.format
const { placeholders } = copy

type Action = (text: string, selection: Selection) => Edit

const actions = {
  heading: cycleHeading,
  bold: (text, selection) => toggleInline(text, selection, "**", placeholders.bold),
  italic: (text, selection) => toggleInline(text, selection, "_", placeholders.italic),
  link: (text, selection) => toggleLink(text, selection, placeholders),
  code: (text, selection) => toggleCode(text, selection, placeholders),
  codeBlock: toggleCodeBlock,
  quote: (text, selection) => toggleLinePrefix(text, selection, "quote"),
  list: (text, selection) => toggleLinePrefix(text, selection, "list"),
} satisfies Record<string, Action>

type ActionName = keyof typeof actions

const buttons: { name: ActionName; icon: typeof Bold }[] = [
  { name: "heading", icon: Heading },
  { name: "bold", icon: Bold },
  { name: "italic", icon: Italic },
  { name: "link", icon: Link2 },
  { name: "code", icon: Code },
  { name: "codeBlock", icon: SquareCode },
  { name: "quote", icon: TextQuote },
  { name: "list", icon: List },
]

const shortcuts: Record<string, ActionName> = { b: "bold", i: "italic", k: "link", e: "code" }

/**
 * Applies a formatting action to the textarea's current selection.
 *
 * The text goes in through the browser's own insertion rather than by setting the value, so the
 * change fires the textarea's ordinary input event — autosave sees it like typing — and ⌘Z undoes
 * it in one step. Where that is unavailable, `onFallback` receives the whole new text instead.
 */
function applyAction(textarea: HTMLTextAreaElement, action: Action, onFallback: (value: string) => void) {
  const text = textarea.value
  const result = action(text, { start: textarea.selectionStart, end: textarea.selectionEnd })

  textarea.focus()
  textarea.setSelectionRange(result.from, result.to)
  const inserted =
    result.insert === ""
      ? result.from === result.to || document.execCommand("delete")
      : document.execCommand("insertText", false, result.insert)
  if (!inserted) onFallback(text.slice(0, result.from) + result.insert + text.slice(result.to))

  const { start, end } = result.selection
  textarea.setSelectionRange(start, end)
  // A fallback re-renders the controlled value, which would put the caret at the end.
  requestAnimationFrame(() => textarea.setSelectionRange(start, end))
}

/**
 * The textarea's formatting keys: ⌘B, ⌘I, ⌘K, and ⌘E, plus a backtick, bracket, or quote typed
 * over a selection, which wraps it rather than replacing it. Returns whether the key was handled.
 */
export function handleFormatKey(event: KeyboardEvent<HTMLTextAreaElement>, onFallback: (value: string) => void): boolean {
  // Mid-composition (a dead key, an input method) the key belongs to the composition.
  if (event.nativeEvent.isComposing) return false

  if (event.metaKey || event.ctrlKey) {
    if (event.altKey || event.shiftKey) return false
    const name = shortcuts[event.key.toLowerCase()]
    if (!name) return false
    event.preventDefault()
    applyAction(event.currentTarget, actions[name], onFallback)
    return true
  }

  const textarea = event.currentTarget
  const wrap = (text: string, selection: Selection) => wrapSelection(text, selection, event.key)
  if (event.altKey || !wrap(textarea.value, { start: textarea.selectionStart, end: textarea.selectionEnd })) return false
  event.preventDefault()
  applyAction(textarea, (text, selection) => wrap(text, selection) as Edit, onFallback)
  return true
}

type FormatToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onFallback: (value: string) => void
}

/** A row of Markdown formatting buttons, pinned to the bottom of the page while writing. */
export function FormatToolbar({ textareaRef, onFallback }: FormatToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={copy.label}
      className="sticky bottom-0 -mx-2 flex flex-wrap gap-1 border-t border-border bg-background/95 px-2 py-2 backdrop-blur-sm"
    >
      {buttons.map(({ name, icon: Icon }) => (
        <button
          key={name}
          type="button"
          aria-label={copy[name]}
          title={copy[name]}
          // Keeps the textarea focused and its selection intact when the button is clicked.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => textareaRef.current && applyAction(textareaRef.current, actions[name], onFallback)}
          className={cn(secondaryButton, "border-transparent px-2")}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
