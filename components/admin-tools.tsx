"use client"

import { useId, useState, type ReactNode } from "react"
import type { Route } from "next"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"

import { SiteSearchResults, useSiteSearch } from "@/components/site-search-results"
import { matchesSearchTokens, searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { adminCopy } from "@/locales/en"

export type AdminToolAvailability = "internal" | "local" | "public"

export type AdminTool = {
  id: string
  href: Route
  title: string
  description: string
  availability: AdminToolAvailability
}

export type AdminToolSection = {
  id: string
  title: string
  tools: readonly AdminTool[]
}

type AdminToolsProps = {
  /** The eyebrow, title, and introduction, rendered on the server. */
  heading: ReactNode
  /** The admin backend card, between the header and the tools. Hidden while searching, so the results sit
   * right under the field. */
  backend: ReactNode
  sections: readonly AdminToolSection[]
}

/** The chips a tool carries. Local only tools are internal too, so they show both. */
function badgesFor(availability: AdminToolAvailability): string[] {
  if (availability === "public") return [adminCopy.badges.public]
  if (availability === "local") return [adminCopy.badges.internal, adminCopy.badges.localOnly]
  return [adminCopy.badges.internal]
}

/**
 * The body of `/admin`: its header with a search beside the sign-out link, and every tool, narrowed
 * as you type.
 *
 * The page passes its heading and the backend card in as rendered nodes, so only the search and the
 * list it filters run in the browser. The search reads the same words the cards show — title,
 * description, path, section, and chips — so typing "local" or "public" finds tools by where they run.
 */
export function AdminTools({ heading, backend, sections }: AdminToolsProps) {
  const inputId = useId()
  const [query, setQuery] = useState("")
  const tokens = searchTokens(query)
  const site = useSiteSearch("en", query)

  const visible = sections
    .map((section) => ({
      ...section,
      tools: section.tools.filter((tool) =>
        matchesSearchTokens(
          [section.title, tool.title, tool.description, tool.href, ...badgesFor(tool.availability)].join(" "),
          tokens,
        ),
      ),
    }))
    .filter((section) => section.tools.length > 0)

  return (
    <>
      <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        {heading}
        <div className="flex shrink-0 items-center gap-4">
          <div className="relative w-full sm:w-56">
            <label htmlFor={inputId} className="sr-only">
              {adminCopy.search.label}
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={site.prefetch}
              placeholder={adminCopy.search.placeholder}
              autoComplete="off"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-fine:text-sm"
            />
          </div>
          <Link
            href="/logout"
            className="shrink-0 text-sm font-medium text-destructive underline-offset-4 hover:underline"
          >
            {adminCopy.signOut}
          </Link>
        </div>
      </header>

      {tokens.length === 0 ? backend : null}

      <div className={cn("flex flex-col gap-12", tokens.length === 0 ? "mt-12" : "mt-8")}>
        {visible.map((section) => (
          <section key={section.id}>
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{section.title}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {section.tools.map((tool) => (
                <li key={tool.id}>
                  <ToolCard tool={tool} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {visible.length === 0 ? (
          <p role="status" className="text-pretty text-sm text-muted-foreground">
            {adminCopy.search.empty(query.trim())}
          </p>
        ) : null}
        <SiteSearchResults language="en" query={query} matches={site.matches} />
      </div>
    </>
  )
}

function ToolCard({ tool }: { tool: AdminTool }) {
  return (
    <Link
      href={tool.href}
      className="group flex h-full items-start justify-between gap-4 rounded-xl border border-border p-5 transition-colors hover:bg-muted/60"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{tool.title}</h3>
          {badgesFor(tool.availability).map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{tool.href}</p>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
