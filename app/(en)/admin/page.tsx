import type { Metadata, Route } from "next"
import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/page-metadata"
import { requireAdmin } from "@/lib/server/admin-auth"
import { siteConfig } from "@/lib/site-config"
import { adminCopy } from "@/locales/en"

export const metadata: Metadata = pageMetadata({
  path: "/admin",
  title: adminCopy.metadata.title,
  description: adminCopy.metadata.description,
  // Unlisted, so it gets no generated card of its own.
  image: "/og.png",
  extra: { robots: { index: false, follow: false } },
})

type ToolId = keyof typeof adminCopy.tools

type Tool = {
  id: ToolId
  href: Route
  /// `local` tools write files in the checkout and 404 on the deployed site; `public` ones are
  /// linked from the public site and need no login.
  availability?: "local" | "public"
}

/**
 * Every internal page, grouped by what it is for. The routes live here rather than in the copy:
 * `typedRoutes` checks them, so a tool that moves or disappears fails the build instead of leaving a
 * dead link on the one page meant to find it.
 */
const sections: readonly { id: keyof typeof adminCopy.sections; tools: readonly Tool[] }[] = [
  {
    id: "content",
    tools: [
      { id: "editorial", href: "/editorial", availability: "local" },
      { id: "translations", href: "/translations", availability: "local" },
      { id: "copy", href: "/copy" },
    ],
  },
  {
    id: "marketing",
    tools: [
      { id: "screens", href: "/screens", availability: "public" },
      { id: "socialPosts", href: "/social/posts" },
      { id: "socialEditor", href: "/social/editor" },
      { id: "marketingCopy", href: "/marketing-copy" },
      { id: "emails", href: "/emails" },
      { id: "gallery", href: "/gallery" },
    ],
  },
]

export default async function AdminPage() {
  await requireAdmin("/admin")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{adminCopy.eyebrow}</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{adminCopy.title}</h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{adminCopy.introduction}</p>
          </div>
          <Link
            href="/logout"
            className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {adminCopy.signOut}
          </Link>
        </header>

        <section className="mt-10 flex flex-col justify-between gap-6 rounded-xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{adminCopy.backend.title}</h2>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {adminCopy.backend.description}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{adminCopy.backend.host}</p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            render={
              <a href={siteConfig.adminBackendUrl} target="_blank" rel="noopener noreferrer">
                {adminCopy.backend.label}
                <ArrowUpRight aria-hidden="true" />
              </a>
            }
          />
        </section>

        <div className="mt-12 flex flex-col gap-12">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {adminCopy.sections[section.id]}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {section.tools.map((tool) => (
                  <li key={tool.id}>
                    <ToolCard tool={tool} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  const copy = adminCopy.tools[tool.id]

  return (
    <Link
      href={tool.href}
      className="group flex h-full items-start justify-between gap-4 rounded-xl border border-border p-5 transition-colors hover:bg-muted/60"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{copy.title}</h3>
          {tool.availability ? (
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {tool.availability === "local" ? adminCopy.badges.localOnly : adminCopy.badges.public}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{tool.href}</p>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
