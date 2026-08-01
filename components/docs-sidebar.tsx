"use client"

import { useEffect, useState } from "react"

type DocsSidebarItem = {
  href: string
  label: string
}

type DocsSidebarProps = {
  title: string
  items: readonly DocsSidebarItem[]
}

export function DocsSidebar({ title, items }: DocsSidebarProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "")

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return

    let animationFrame = 0

    function updateActiveSection() {
      animationFrame = 0

      const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let activeSection = isAtPageEnd ? sections.at(-1) : sections[0]

      if (!isAtPageEnd) {
        const readingLine = Math.min(160, window.innerHeight * 0.25)

        for (const section of sections) {
          if (section.getBoundingClientRect().top > readingLine) break
          activeSection = section
        }
      }

      if (!activeSection) return

      const nextHref = `#${activeSection.id}`
      setActiveHref((currentHref) => (currentHref === nextHref ? currentHref : nextHref))
    }

    function scheduleUpdate() {
      if (animationFrame !== 0) return
      animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [items])

  return (
    <aside className="lg:sticky lg:top-8">
      <nav
        aria-labelledby="docs-contents-title"
        className="rounded-xl border border-border bg-muted/40 p-5 lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:py-1 lg:pr-0 lg:pl-5"
      >
        <h2 id="docs-contents-title" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        <ol className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-1">
          {items.map((item) => {
            const isActive = activeHref === item.href

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActiveHref(item.href)}
                  className={`block rounded-md px-2 py-1.5 leading-snug underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:underline"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}
