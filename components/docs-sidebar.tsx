"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

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
  const mobileDetailsRef = useRef<HTMLDetailsElement>(null)
  const activeItem = items.find((item) => item.href === activeHref) ?? items[0]

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

  function selectItem(href: string, collapseMobile = false) {
    setActiveHref(href)

    if (collapseMobile && mobileDetailsRef.current) {
      mobileDetailsRef.current.open = false
    }
  }

  return (
    <aside className="sticky top-2 z-30 self-start lg:top-8">
      <details
        ref={mobileDetailsRef}
        className="group overflow-hidden rounded-xl border border-border bg-background/95 shadow-sm backdrop-blur-sm lg:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
              {title}
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium text-foreground">{activeItem?.label}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>
        <nav aria-label={title} className="max-h-[min(70vh,32rem)] overflow-y-auto border-t border-border p-2">
          <DocsSidebarLinks
            items={items}
            activeHref={activeHref}
            onSelect={(href) => selectItem(href, true)}
          />
        </nav>
      </details>

      <nav
        aria-labelledby="docs-contents-title"
        className="hidden border-l border-border py-1 pl-5 lg:block"
      >
        <h2 id="docs-contents-title" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        <DocsSidebarLinks items={items} activeHref={activeHref} onSelect={selectItem} className="mt-4" />
      </nav>
    </aside>
  )
}

function DocsSidebarLinks({
  items,
  activeHref,
  onSelect,
  className = "",
}: {
  items: readonly DocsSidebarItem[]
  activeHref: string
  onSelect: (href: string) => void
  className?: string
}) {
  return (
    <ol className={`${className} grid gap-1 text-sm`}>
      {items.map((item) => {
        const isActive = activeHref === item.href

        return (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={isActive ? "location" : undefined}
              onClick={() => onSelect(item.href)}
              className={`block rounded-md px-2 py-1.5 leading-snug underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-muted font-medium text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:underline"
              }`}
            >
              {item.label}
            </a>
          </li>
        )
      })}
    </ol>
  )
}
