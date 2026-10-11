"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Search, X } from "lucide-react"

import { InlineMarkup } from "@/components/inline-markup"
import { docsSearchEntries, docsSnippet, searchDocs, type DocsSearchEntry } from "@/lib/docs-search"
import { revealElement } from "@/lib/reveal-element"
import { searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { docsCopy } from "@/locales/en"

/** How many results are listed before the reader is asked to narrow the search. */
const MAX_RESULTS = 8

/**
 * The search field at the top of /docs, and the passages it finds.
 *
 * Results quote the sentence that matched, with the words highlighted, and choosing one scrolls to
 * its section — or, for a question, opens that question's answer, because the words that matched
 * are usually inside it. The index is the page's own copy (`lib/docs-search.ts`), so a new
 * paragraph is searchable the moment it is written.
 *
 * `/` focuses the field from anywhere on the page, as on most documentation sites.
 */
export function DocsSearch() {
  const copy = docsCopy.search
  const inputId = useId()
  const statusId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")

  const entries = useMemo(() => docsSearchEntries(), [])
  const tokens = useMemo(() => searchTokens(query), [query])
  const matches = useMemo(() => searchDocs(entries, query), [entries, query])
  const isSearching = tokens.length > 0
  const shown = matches.slice(0, MAX_RESULTS)

  useEffect(() => {
    function focusOnSlash(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      const active = document.activeElement
      if (active instanceof HTMLElement && (active.isContentEditable || active.closest("input, textarea, select"))) return

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener("keydown", focusOnSlash)
    return () => window.removeEventListener("keydown", focusOnSlash)
  }, [])

  function open(entry: DocsSearchEntry, event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(entry.targetId)
    if (!target) return
    event.preventDefault()

    if (target instanceof HTMLDetailsElement) target.open = true
    revealElement(target, "start")
    window.history.replaceState(null, "", `#${entry.targetId}`)
  }

  return (
    <search className="mt-8 max-w-2xl">
      <label htmlFor={inputId} className="sr-only">
        {copy.label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("")
          }}
          placeholder={copy.placeholder}
          aria-describedby={statusId}
          autoComplete="off"
          // appearance-none drops Safari's own clear button, which would sit under ours.
          className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {isSearching ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            aria-label={copy.clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-xs text-muted-foreground lg:block"
          >
            /
          </kbd>
        )}
      </div>

      {/* Always rendered, so a screen reader hears the count change rather than the region appear. */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn("mt-3 font-mono text-xs text-muted-foreground", !isSearching && "sr-only")}
      >
        {isSearching ? copy.resultCount(matches.length) : copy.shortcutHint}
      </p>

      {isSearching ? (
        matches.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            {copy.empty}
          </p>
        ) : (
          <>
            <ol className="mt-3 overflow-hidden rounded-xl border border-border">
              {shown.map((entry) => (
                <li key={`${entry.targetId}-${entry.title}-${entry.text}`} className="border-b border-border last:border-b-0">
                  <a
                    href={`#${entry.targetId}`}
                    onClick={(event) => open(entry, event)}
                    className="block px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <span className="block font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                      {entry.section}
                    </span>
                    {/* A loose paragraph's title is its section's, already on the line above. */}
                    {entry.title !== entry.section ? (
                      <span className="mt-0.5 block text-sm font-medium text-foreground">
                        <InlineMarkup text={entry.title} highlight={tokens} />
                      </span>
                    ) : null}
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      <InlineMarkup text={docsSnippet(entry.text, tokens)} highlight={tokens} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            {matches.length > shown.length ? (
              <p className="mt-2 text-xs text-muted-foreground">{copy.showingFirst(shown.length, matches.length)}</p>
            ) : null}
          </>
        )
      ) : null}
    </search>
  )
}
