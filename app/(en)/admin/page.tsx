import type { Metadata, Route } from "next"
import { ArrowUpRight } from "lucide-react"

import { AdminTools, type AdminToolSection } from "@/components/admin-tools"
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
  /// Tools are internal — behind the login — unless marked otherwise. `local` tools write files in
  /// the checkout and 404 on the deployed site; `public` ones are linked from the public site and
  /// need no login.
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
      { id: "motion", href: "/motion", availability: "local" },
      { id: "motionLibrary", href: "/motion/library" },
      { id: "marketingCopy", href: "/marketing-copy" },
      { id: "banner", href: "/banner" },
      { id: "emails", href: "/emails" },
      { id: "gallery", href: "/gallery", availability: "public" },
    ],
  },
]

export default async function AdminPage() {
  await requireAdmin("/admin")

  const toolSections: AdminToolSection[] = sections.map((section) => ({
    id: section.id,
    title: adminCopy.sections[section.id],
    tools: section.tools.map((tool) => ({
      id: tool.id,
      href: tool.href,
      title: adminCopy.tools[tool.id].title,
      description: adminCopy.tools[tool.id].description,
      availability: tool.availability ?? "internal",
    })),
  }))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <article id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-6 py-16">
        <AdminTools
          sections={toolSections}
          heading={
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{adminCopy.eyebrow}</p>
              <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{adminCopy.title}</h1>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{adminCopy.introduction}</p>
            </div>
          }
          backend={
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
          }
        />
      </article>

      <SiteFooter />
    </main>
  )
}
