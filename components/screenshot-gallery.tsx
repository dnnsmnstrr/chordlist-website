"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image, { getImageProps } from "next/image"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"

import { screenshotGalleryCopy } from "@/locales/en"

export type Screenshot = {
  lightSrc: string
  darkSrc: string
  title: string
  description: string
  alt?: string
  width?: number
  height?: number
}

type ScreenshotGalleryProps = {
  screenshots: readonly Screenshot[]
  variant?: "gallery" | "press" | "showcase"
}

export function ScreenshotGallery({ screenshots, variant = "press" }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const count = screenshots.length
  const active = activeIndex === null ? undefined : screenshots[activeIndex]
  const isShowcase = variant === "showcase"
  const isGallery = variant === "gallery"

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
      <ul
        className={
          isShowcase
            ? "grid grid-cols-3 items-end gap-3 sm:gap-8"
            : isGallery
              ? "columns-1 gap-6 sm:columns-2"
              : "grid grid-cols-2 items-start gap-4 sm:grid-cols-3"
        }
      >
        {screenshots.map((screenshot, index) => (
          <li
            key={screenshot.lightSrc}
            className={
              isShowcase
                ? "min-w-0"
                : isGallery
                  ? "mb-6 inline-flex w-full break-inside-avoid flex-col gap-3"
                  : "flex flex-col gap-3"
            }
          >
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget
                setActiveIndex(index)
              }}
              aria-label={screenshotGalleryCopy.viewFullscreen(screenshot.title)}
              className={
                isShowcase
                  ? "block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] border border-border bg-muted shadow-2xl shadow-foreground/5 transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:rounded-[2rem]"
                  : "block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              <ThemeScreenshot
                screenshot={screenshot}
                sizes={
                  isShowcase
                    ? "(max-width: 640px) 30vw, 300px"
                    : isGallery
                      ? "(max-width: 640px) calc(100vw - 3rem), 480px"
                      : "(max-width: 640px) 45vw, 220px"
                }
                className="h-auto w-full"
              />
            </button>
            {isShowcase ? null : <p className="text-sm font-medium leading-snug">{screenshot.title}</p>}
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
                href={active.lightSrc}
                download
                className="system-theme-light flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={screenshotGalleryCopy.download(active.title)}
              >
                <Download className="size-4" aria-hidden="true" />
              </a>
              <a
                href={active.darkSrc}
                download
                className="system-theme-dark size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={screenshotGalleryCopy.download(active.title)}
              >
                <Download className="size-4" aria-hidden="true" />
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={screenshotGalleryCopy.close}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 py-4 sm:gap-6 sm:px-6">
            <GalleryNavButton
              label={screenshotGalleryCopy.previous}
              direction="previous"
              onClick={() => step(-1)}
              disabled={count < 2}
            />
            <ThemeScreenshot
              screenshot={active}
              sizes={isGallery ? "(max-width: 640px) 75vw, 80vw" : "(max-width: 640px) 75vw, 420px"}
              className="max-h-full min-h-0 w-auto max-w-full rounded-xl border border-border object-contain"
            />
            <GalleryNavButton
              label={screenshotGalleryCopy.next}
              direction="next"
              onClick={() => step(1)}
              disabled={count < 2}
            />
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

function ThemeScreenshot({
  screenshot,
  sizes,
  className,
}: {
  screenshot: Screenshot
  sizes: string
  className: string
}) {
  const { props: darkImageProps } = getImageProps({
    src: screenshot.darkSrc,
    alt: screenshot.alt ?? screenshot.title,
    width: screenshot.width ?? 1170,
    height: screenshot.height ?? 2532,
    sizes,
  })

  return (
    <picture className="contents">
      <source media="(prefers-color-scheme: dark)" srcSet={darkImageProps.srcSet} sizes={darkImageProps.sizes} />
      <Image
        src={screenshot.lightSrc}
        alt={screenshot.alt ?? screenshot.title}
        width={screenshot.width ?? 1170}
        height={screenshot.height ?? 2532}
        sizes={sizes}
        className={className}
      />
    </picture>
  )
}

function GalleryNavButton({
  direction,
  label,
  onClick,
  disabled,
}: {
  direction: "previous" | "next"
  label: string
  onClick: () => void
  disabled: boolean
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0"
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}
