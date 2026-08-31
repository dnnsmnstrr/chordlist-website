"use client"

import { useId, useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { FaqList, type FaqEntry } from "@/components/faq-list"
import { plainInlineText } from "@/lib/inline-markup"
import { matchesSearchTokens, searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { dictionary, type Language } from "@/locales"

type FaqSearchProps = {
  title: string
  items: readonly FaqEntry[]
  language: Language
}

/**
 * The question list with a search field beside its heading.
 *
 * Searching covers the answers, not just the questions: someone arriving with "unlock" or a
 * filename in mind is describing what they read on screen, not how the question was worded. The
 * answer text is stripped of its inline markup first, so a `<code>` tag can never sit between a
 * query and its match.
 *
 * Filtering is local state rather than a `?q=` parameter — the blog syncs to the URL because a
 * filtered reading list is worth sharing, while a support search is something a reader does once,
 * on the way to one answer.
 *
 * Copy is read here from the dictionary rather than handed down as a prop, which is the house
 * pattern for a client component and is also the only thing that works: `resultCount` is a
 * function, and a function cannot cross the server-to-client boundary as a prop.
 */
export function FaqSearch({ title, items, language }: FaqSearchProps) {
  const copy = dictionary(language).support.search
  const inputId = useId()
  const countId = useId()
  const [query, setQuery] = useState("")

  const matches = useMemo(() => {
    const tokens = searchTokens(query)
    if (tokens.length === 0) return items

    return items.filter((item) => {
      const haystack = plainInlineText(`${item.question} ${item.answer} ${item.link?.label ?? ""}`)
      return matchesSearchTokens(haystack, tokens)
    })
  }, [items, query])

  const isSearching = searchTokens(query).length > 0

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

        <div className="relative sm:w-64">
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
        </p>
      ) : (
        // Keyed by the query so a new set of matches mounts fresh: while searching every match
        // opens, because the words that matched are usually in the answer rather than the question.
        <FaqList key={query} items={matches} allOpen={isSearching} />
      )}
    </div>
  )
}
