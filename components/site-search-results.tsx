"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Route } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { InlineMarkup } from "@/components/inline-markup"
import { searchSite, type SiteSearchEntry, type SiteSearchPage } from "@/lib/site-search"
import { searchSnippet, searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { dictionary, type Language } from "@/locales"

/** One request per language per visit, shared by every field on the page. */
const indexes = new Map<Language, Promise<SiteSearchEntry[]>>()

function loadIndex(language: Language): Promise<SiteSearchEntry[]> {
  let index = indexes.get(language)
  if (!index) {
    index = fetch(`/api/search/${language}`)
      .then((response) => (response.ok ? (response.json() as Promise<SiteSearchEntry[]>) : []))
      .catch(() => [])
    // A failed load is not cached, so the next search tries again.
    index.then((entries) => {
      if (entries.length === 0) indexes.delete(language)
    })
    indexes.set(language, index)
  }
  return index
}

/**
 * The matches from every page but this one, for a query typed into this page's own search.
 *
 * The index loads the first time there is something to look for — or earlier, on `prefetch`, which a
 * field calls on focus so the results are there by the time the first word is.
 */
export function useSiteSearch(language: Language, query: string, exclude?: SiteSearchPage) {
  const [entries, setEntries] = useState<readonly SiteSearchEntry[]>([])
  const isSearching = searchTokens(query).length > 0

  const prefetch = useCallback(() => {
    void loadIndex(language).then(setEntries)
  }, [language])

  useEffect(() => {
    if (!isSearching) return
    let current = true
    void loadIndex(language).then((loaded) => {
      if (current) setEntries(loaded)
    })
    return () => {
      current = false
    }
  }, [language, isSearching])

  const matches = useMemo(() => searchSite(entries, query, { exclude }), [entries, query, exclude])
  return { matches, prefetch }
}

type SiteSearchResultsProps = {
  language: Language
  query: string
  matches: readonly SiteSearchEntry[]
  /** `section` sits under a page's results; `panel` is the tighter list inside the docs dropdown. */
  variant?: "section" | "panel"
  onNavigate?: () => void
}

/** The results from elsewhere on the site, labeled with the page each one is on. */
export function SiteSearchResults({ language, query, matches, variant = "section", onNavigate }: SiteSearchResultsProps) {
  const { common } = dictionary(language)
  const tokens = searchTokens(query)
  if (tokens.length === 0 || matches.length === 0) return null

  const pageLabels: Record<SiteSearchPage, string> = {
    docs: common.navigation.docs,
    faq: common.navigation.faq,
    support: common.navigation.support,
    blog: common.navigation.blog,
  }
  const isPanel = variant === "panel"

  return (
    <section aria-label={common.siteSearch.title} className={cn(!isPanel && "flex flex-col gap-3")}>
      <h2
        className={cn(
          "font-mono text-xs uppercase tracking-widest text-muted-foreground",
          isPanel && "border-y border-border bg-muted/40 px-4 py-2 text-[0.7rem]",
        )}
      >
        {common.siteSearch.title}
      </h2>
      <ol className={cn(!isPanel && "flex flex-col overflow-hidden rounded-xl border border-border")}>
        {matches.map((entry) => (
          <li key={entry.href} className="border-b border-border last:border-b-0">
            <Link
              href={entry.href as Route}
              onClick={onNavigate}
              className={cn(
                "group flex items-start justify-between gap-4 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
                isPanel ? "px-4 py-3" : "px-5 py-4",
              )}
            >
              <span className="min-w-0">
                <span className="block font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  {pageLabels[entry.page]}
                  {language !== "en" && (entry.page === "docs" || entry.page === "blog")
                    ? ` · ${common.siteSearch.inEnglish}`
                    : null}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">
                  <InlineMarkup text={entry.title} highlight={tokens} />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  <InlineMarkup text={searchSnippet(entry.text, tokens)} highlight={tokens} />
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
