"use client"

import { useId, useMemo, useState, type KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { hashtagLimit, normalizeHashtag, normalizeHashtags } from "@/lib/social-hashtags"

/// How many suggestions show before anything is typed. Typing filters the whole list.
const idleSuggestionCount = 18

/**
 * A post's hashtags: chips for the chosen tags, an input that suggests as you type, and any new tag
 * accepted as typed. Enter, comma, space or Tab adds; Backspace on an empty input removes the last;
 * the arrow keys move through the suggestions.
 */
export function HashtagField({
  value,
  onChange,
  suggestions,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
}) {
  const inputId = useId()
  const listId = useId()
  const [draft, setDraft] = useState("")
  const [highlighted, setHighlighted] = useState(-1)

  const chosen = useMemo(() => new Set(value.map((tag) => tag.toLowerCase())), [value])
  const query = normalizeHashtag(draft).toLowerCase()

  const matches = useMemo(() => {
    const unused = suggestions.filter((tag) => !chosen.has(tag.toLowerCase()))
    if (!query) return unused.slice(0, idleSuggestionCount)
    // Tags that start with what was typed first, then ones that merely contain it.
    const starts = unused.filter((tag) => tag.toLowerCase().startsWith(query))
    const contains = unused.filter((tag) => !tag.toLowerCase().startsWith(query) && tag.toLowerCase().includes(query))
    return [...starts, ...contains]
  }, [chosen, query, suggestions])

  const draftTag = normalizeHashtag(draft)
  const draftIsNew =
    draftTag !== "" &&
    !chosen.has(draftTag.toLowerCase()) &&
    !suggestions.some((tag) => tag.toLowerCase() === draftTag.toLowerCase())

  const add = (tag: string) => {
    const next = normalizeHashtags([...value, tag])
    if (next.length !== value.length) onChange(next)
    setDraft("")
    setHighlighted(-1)
  }

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag))

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault()
      setHighlighted((index) => (index + 1) % matches.length)
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault()
      setHighlighted((index) => (index <= 0 ? matches.length - 1 : index - 1))
    } else if (event.key === "Enter" || event.key === "," || event.key === " " || (event.key === "Tab" && draftTag)) {
      const pick = highlighted >= 0 ? matches[highlighted] : draftTag
      if (!pick) return
      event.preventDefault()
      add(pick)
    } else if (event.key === "Backspace" && draft === "" && value.length) {
      remove(value.at(-1) ?? "")
    } else if (event.key === "Escape") {
      setHighlighted(-1)
    }
  }

  const overLimit = value.length > hashtagLimit

  return (
    <div className="text-sm font-medium">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={inputId}>Hashtags</label>
        <span className={cn("font-normal", overLimit ? "text-destructive" : "text-muted-foreground")}>
          {value.length} of {hashtagLimit} for Instagram
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 shadow-sm focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-ring/30">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-muted py-0.5 pl-2 pr-1 font-mono text-xs">
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label={`Remove #${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 font-mono text-sm font-normal outline-none"
          value={draft}
          placeholder={value.length ? "" : "Type a tag"}
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            setHighlighted(-1)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => draftTag && add(draftTag)}
        />
      </div>

      <div id={listId} role="listbox" aria-label="Suggested hashtags" className="mt-2 flex flex-wrap gap-1.5">
        {draftIsNew ? (
          <button
            type="button"
            // mousedown, so the input's blur does not add the draft first and the click land twice.
            onMouseDown={(event) => {
              event.preventDefault()
              add(draftTag)
            }}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-foreground/40 px-2 py-0.5 font-mono text-xs font-normal hover:bg-muted"
          >
            <Plus className="size-3" />
            Add #{draftTag}
          </button>
        ) : null}
        {matches.map((tag, index) => (
          <button
            key={tag}
            id={`${listId}-${index}`}
            type="button"
            role="option"
            aria-selected={index === highlighted}
            onMouseDown={(event) => {
              event.preventDefault()
              add(tag)
            }}
            className={cn(
              "rounded-md border border-border px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground transition hover:border-foreground/30 hover:text-foreground",
              index === highlighted && "border-foreground/40 bg-muted text-foreground",
            )}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  )
}
