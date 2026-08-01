"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Expand, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type Screenshot = {
  /** Path under /public, e.g. "/press/screenshot-library.png" */
  src: string
  /** Short label shown under the thumbnail and as the lightbox heading. */
  title: string
  /** Longer caption shown in the fullscreen view. */
  description: string
}

export function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isOpen = activeIndex !== null
  const count = screenshots.length

  const close = useCallback(() => setActiveIndex(null), [])

  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null) return current
        return (current + delta + count) % count
      })
    },
    [count],
  )

  // Keyboard controls + scroll lock while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close()
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }

    document.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, close, step])

  if (count === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
        No screenshots yet. Add entries to the screenshots array to populate this gallery.
      </p>
    )
  }

  const active = activeIndex === null ? null : screenshots[activeIndex]

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {screenshots.map((shot, index) => (
          <li key={shot.src} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${shot.title} full screen`}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={shot.src || "/placeholder.svg"}
                alt={shot.title}
                className="aspect-[9/19.5] w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                <Expand className="size-5 text-foreground" aria-hidden="true" />
              </span>
            </button>
            <p className="text-sm font-medium leading-snug">{shot.title}</p>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
            <p className="font-mono text-xs text-muted-foreground">
              {(activeIndex ?? 0) + 1} / {count}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={active.src}
                download
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Download ${active.title}`}
              >
                <Download className="size-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Close full screen view"
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 py-4 sm:gap-6 sm:px-6">
            <NavButton
              direction="prev"
              onClick={() => step(-1)}
              disabled={count < 2}
            />
            <img
              src={active.src || "/placeholder.svg"}
              alt={active.title}
              className="max-h-full min-h-0 w-auto max-w-full rounded-xl border border-border object-contain"
            />
            <NavButton direction="next" onClick={() => step(1)} disabled={count < 2} />
          </div>

          <div className="border-t border-border px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-base font-semibold tracking-tight">{active.title}</p>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next"
  onClick: () => void
  disabled?: boolean
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous screenshot" : "Next screenshot"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-0",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}
