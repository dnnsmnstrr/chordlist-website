"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Download, Expand, X } from "lucide-react"

export type Screenshot = {
  src: string
  title: string
  description: string
}

export function ScreenshotGallery({ screenshots }: { screenshots: readonly Screenshot[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const count = screenshots.length
  const active = activeIndex === null ? undefined : screenshots[activeIndex]

  const close = useCallback(() => setActiveIndex(null), [])

  const step = useCallback(
    (delta: number) => {
      if (count < 2) return

      setActiveIndex((current) => {
        if (current === null) return current
        return (current + delta + count) % count
      })
    },
    [count],
  )

  useEffect(() => {
    if (!active) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close()
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [active, close, step])

  useEffect(() => {
    if (active || !triggerRef.current) return

    triggerRef.current.focus()
    triggerRef.current = null
  }, [active])

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {screenshots.map((screenshot, index) => (
          <li key={screenshot.src} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget
                setActiveIndex(index)
              }}
              aria-label={`View ${screenshot.title} full screen`}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src={screenshot.src}
                alt={screenshot.title}
                width={1170}
                height={2532}
                sizes="(max-width: 640px) 45vw, 220px"
                className="h-auto w-full"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="size-5 text-foreground" aria-hidden="true" />
              </span>
            </button>
            <p className="text-sm font-medium leading-snug">{screenshot.title}</p>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="screenshot-dialog-title"
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
                ref={closeButtonRef}
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
            <GalleryNavButton direction="previous" onClick={() => step(-1)} disabled={count < 2} />
            <Image
              src={active.src}
              alt={active.title}
              width={1170}
              height={2532}
              sizes="(max-width: 640px) 75vw, 420px"
              className="max-h-full min-h-0 w-auto max-w-full rounded-xl border border-border object-contain"
            />
            <GalleryNavButton direction="next" onClick={() => step(1)} disabled={count < 2} />
          </div>

          <div className="border-t border-border px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p id="screenshot-dialog-title" className="text-base font-semibold tracking-tight">
                {active.title}
              </p>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{active.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function GalleryNavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "previous" | "next"
  onClick: () => void
  disabled: boolean
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === "previous" ? "Previous" : "Next"} screenshot`}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0"
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}
