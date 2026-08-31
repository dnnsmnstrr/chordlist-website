"use client"

import { useId, useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { FaqList } from "@/components/faq-list"
import { matchingFaqEntries, type FaqEntry } from "@/lib/faq"
import { searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { dictionary, type Language } from "@/locales"

type FaqSearchProps = {
  items: readonly FaqEntry[]
  language: Language
  /** Rendered beside the field. Omitted on a page whose whole heading is already the questions. */
  title?: string
  /** A sentence under the empty state, where a page has somewhere better to send a reader. */
  emptyHint?: string
}

/**
 * The question list with a search field, beside its heading where the page has one.
 *
 * Searching covers the answers and each question's aliases, not just the questions themselves:
 * someone arriving with "unlock", "money back", or a filename in mind is describing what they read
 * on screen, or what they call it, rather than how the question was worded. See `lib/faq.ts`.
 *
 * Filtering is local state rather than a `?q=` parameter — the blog syncs to the URL because a
 * filtered reading list is worth sharing, while a support search is something a reader does once,
 * on the way to one answer.
 *
 * Copy is read here from the dictionary rather than handed down as a prop, which is the house
 * pattern for a client component and is also the only thing that works: `resultCount` is a
 * function, and a function cannot cross the server-to-client boundary as a prop. It comes from
 * `commonCopy` because this is chrome — the same widget and the same words on /faq and /support —
 * while the per-page sentences that differ arrive as plain string props.
 */
export function FaqSearch({ items, language, title, emptyHint }: FaqSearchProps) {
  const copy = dictionary(language).common.faqSearch
  const inputId = useId()
  const countId = useId()
  const [query, setQuery] = useState("")

  const matches = useMemo(() => matchingFaqEntries(items, query), [items, query])

  const isSearching = searchTokens(query).length > 0

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}

        {/* Beside a heading the field is a control on a section; without one it is the whole row,
            and a full-width field reads as the way into the list rather than as an afterthought. */}
        <div className={cn("relative", title ? "sm:w-64" : "w-full")}>
          <label htmlFor={inputId} className="sr-only">
            {copy.label}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            aria-describedby={countId}
            // appearance-none drops Safari's own clear button, which would sit under ours.
            className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {isSearching ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={copy.clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Always rendered, so a screen reader hears the count change rather than the live region
          appear; hidden rather than removed while there is no search, so it takes no space. */}
      <p
        id={countId}
        role="status"
        aria-live="polite"
        className={cn("font-mono text-xs text-muted-foreground", !isSearching && "sr-only")}
      >
        {isSearching ? copy.resultCount(matches.length) : ""}
      </p>

      {matches.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          {copy.empty}
          {emptyHint ? <> {emptyHint}</> : null}
        </p>
      ) : (
        // Keyed by the query so a new set of matches mounts fresh: while searching every match
        // opens, because the words that matched are usually in the answer rather than the question.
        <FaqList key={query} items={matches} allOpen={isSearching} />
      )}
    </div>
  )
}
