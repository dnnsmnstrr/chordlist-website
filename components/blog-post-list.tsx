"use client"

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { Eye, EyeOff, Search, X } from "lucide-react"

import { PostCard } from "@/components/post-card"
// Values come from lib/blog-tags; lib/blog imports node:fs and is server-only.
import { isBlogTag, type BlogTag } from "@/lib/blog-tags"
import type { PostMeta, TagCount } from "@/lib/blog"
import { cn } from "@/lib/utils"
import { blogCopy } from "@/locales/en"

type BlogPostListProps = {
  posts: readonly PostMeta[]
  tags: readonly TagCount[]
}

/** Writing the URL on every keystroke would spam history; 250ms is below notice. */
const SEARCH_DEBOUNCE_MS = 250

function buildSearch(query: string, tags: readonly BlogTag[]) {
  const params = new URLSearchParams()
  if (query.trim() !== "") params.set("q", query.trim())
  for (const tag of tags) params.append("tag", tag)
  return params.toString()
}

/*
  The query string as a subscribable store, rather than useSearchParams.

  Filtering happens entirely on the client and navigates with the History API
  (see navigate() below), so useSearchParams would buy nothing — and reading it
  opts the route out of prerendering, which is where /blog's
  BAILOUT_TO_CLIENT_SIDE_RENDERING came from: the static HTML held only the
  Suspense fallback. Reading location ourselves keeps the whole list, controls
  included, in the prerendered markup for the first paint and for crawlers.
*/
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function subscribeToSearch(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  // Back and forward fire popstate. Our own pushState/replaceState calls do not,
  // so navigate() notifies by hand.
  window.addEventListener("popstate", notify)

  return () => {
    listeners.delete(onStoreChange)
    if (listeners.size === 0) window.removeEventListener("popstate", notify)
  }
}

/** A string snapshot compares by value, so re-reading on every render cannot loop. */
function readSearch() {
  return window.location.search
}

/** There is no location while prerendering: the server snapshot is the unfiltered list. */
function readServerSearch() {
  return ""
}

export function BlogPostList({ posts, tags }: BlogPostListProps) {
  const search = useSyncExternalStore(subscribeToSearch, readSearch, readServerSearch)
  const searchParams = useMemo(() => new URLSearchParams(search), [search])

  // Tags come straight from the URL — no mirrored state, so back and forward work
  // by themselves. Toggling one navigates, which re-renders with the new value.
  const selectedTags = useMemo(() => searchParams.getAll("tag").filter(isBlogTag), [searchParams])

  const urlQuery = searchParams.get("q") ?? ""

  // The text input keeps its own state so typing stays responsive, then syncs to
  // the URL on a debounce. When the URL changes underneath it — back, forward, or a
  // shared link — adopt the new value. Adjusting state during render like this is
  // React's documented alternative to a setState-in-effect loop.
  const [query, setQuery] = useState(urlQuery)
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

  const currentSearch = searchParams.toString()

  const navigate = useCallback(
    (nextQuery: string, nextTags: readonly BlogTag[], mode: "push" | "replace") => {
      const search = buildSearch(nextQuery, nextTags)
      if (search === currentSearch) return

      const url = search === "" ? "/blog" : `/blog?${search}`

      // Native history rather than router.push. Filtering happens entirely on the
      // client, so there is nothing for the router to fetch. It also has to be this
      // way: /blog is statically rendered, so the router treats it as the canonical
      // URL and silently ignores a push that only changes the query — which left
      // every filter dead on a page opened from a shared link.
      if (mode === "push") window.history.pushState(null, "", url)
      else window.history.replaceState(null, "", url)

      // Neither call fires popstate, so the store has to be told.
      notify()
    },
    [currentSearch],
  )

  // Typing replaces the current entry, so a search does not fill up history. A tag
  // toggle also re-runs this, but it has already navigated, so navigate() no-ops.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate(query, selectedTags, "replace")
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [query, selectedTags, navigate])

  // Toggling a tag is a deliberate action, so it gets its own history entry.
  const toggleTag = useCallback(
    (tag: BlogTag) => {
      const next = selectedTags.includes(tag)
        ? selectedTags.filter((entry) => entry !== tag)
        : [...selectedTags, tag]

      navigate(query, next, "push")
    },
    [selectedTags, query, navigate],
  )

  // The "All" chip lives inside the tag group, so it clears tags only and leaves
  // the search alone. "Clear filters" below is the one that resets both.
  const clearTags = useCallback(() => {
    navigate(query, [], "push")
  }, [query, navigate])

  const clearAll = useCallback(() => {
    setQuery("")
    navigate("", [], "push")
  }, [navigate])

  // Unreleased posts only reach the client on a preview deployment or the dev
  // server, so this is the whole condition for the toggle existing: in production
  // there is nothing to hide and it never renders.
  const hasUnreleased = posts.some((post) => !post.isPublic)

  // Deliberately local rather than a URL param: ?q= and ?tag= are the shareable
  // public filters, and a staging-only view switch does not belong in that
  // namespace. It also keeps toggling instant, with no history entries.
  const [liveOnly, setLiveOnly] = useState(false)

  const visiblePosts = useMemo(() => {
    // Token-AND, so "obsidian vault" still finds "One folder, Obsidian and chordlist".
    const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)

    return posts.filter((post) => {
      if (liveOnly && !post.isPublic) return false
      if (selectedTags.length > 0 && !post.tags.some((tag) => selectedTags.includes(tag))) return false
      if (tokens.length === 0) return true

      const haystack = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLocaleLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
  }, [posts, query, selectedTags, liveOnly])

  const hasFilters = query.trim() !== "" || selectedTags.length > 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="blog-search" className="sr-only">
            {blogCopy.search.label}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={blogCopy.search.placeholder}
            aria-describedby="blog-result-count"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={blogCopy.filters.label} className="flex flex-wrap items-center gap-2">
            <TagChip label={blogCopy.filters.all} isActive={selectedTags.length === 0} onClick={clearTags} />
            {tags.map(({ tag, count }) => (
              <TagChip
                key={tag}
                label={`${blogCopy.tags[tag]} · ${count}`}
                isActive={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              />
            ))}
          </div>

          {hasUnreleased ? (
            <button
              type="button"
              aria-pressed={liveOnly}
              title={blogCopy.filters.liveOnlyHint}
              onClick={() => setLiveOnly((current) => !current)}
              // Dashed, like the status badge, to read as the same staging-only idea
              // rather than as another tag.
              className={cn(
                "ml-auto flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                liveOnly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {liveOnly ? (
                <EyeOff aria-hidden="true" className="size-3" />
              ) : (
                <Eye aria-hidden="true" className="size-3" />
              )}
              {blogCopy.filters.liveOnly}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <p id="blog-result-count" role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground">
            {blogCopy.filters.resultCount(visiblePosts.length)}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 rounded-md font-mono text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-3" />
              {blogCopy.search.clear}
            </button>
          ) : null}
        </div>
      </div>

      {visiblePosts.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          {blogCopy.filters.empty}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

type TagChipProps = {
  label: string
  isActive: boolean
  onClick: () => void
}

function TagChip({ label, isActive, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-border bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
