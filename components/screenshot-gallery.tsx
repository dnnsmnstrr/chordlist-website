"use client"

import { useCallback, useEffect, useRef, useState, type Ref } from "react"
import Image, { getImageProps } from "next/image"
import { ChevronLeft, ChevronRight, Download, Play, X } from "lucide-react"

import { screenshotGalleryCopy } from "@/locales/en"

type MediaBase = {
  title: string
  description: string
  alt?: string
}

export type Screenshot = MediaBase & {
  type?: "image"
  lightSrc: string
  darkSrc: string
  width?: number
  height?: number
}

export type Video = MediaBase & {
  type: "video"
  src: string
  poster: string
}

export type GalleryMedia = Screenshot | Video

type ScreenshotGalleryProps = {
  screenshots: readonly GalleryMedia[]
  variant?: "gallery" | "press" | "showcase"
}

/** Shorter than this is a tap, or a finger that moved while lifting. */
const SWIPE_THRESHOLD_PX = 48

export function ScreenshotGallery({ screenshots, variant = "press" }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const activeVideoRef = useRef<HTMLVideoElement>(null)
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
    if (active.type === "video") {
      const video = activeVideoRef.current
      video?.focus()
      void video?.play().catch(() => {
        // A browser may still block playback despite the click that opened the dialog.
        // Native controls remain visible so playback is always available.
      })
    } else {
      closeButtonRef.current?.focus()
    }

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

  /*
    Swiping between images, which is how anyone holding a phone expects to move
    through a full-screen gallery — the arrow buttons are small and the arrow keys
    are not there. A pinch (more than one finger) cancels the gesture rather than
    counting as a swipe on the way out.
  */
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    swipeOrigin.current = touch && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
  }, [])

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const origin = swipeOrigin.current
      const touch = event.changedTouches[0]
      swipeOrigin.current = null

      if (!origin || !touch) return

      const deltaX = touch.clientX - origin.x
      const deltaY = touch.clientY - origin.y

      // A mostly vertical drag is someone dismissing the keyboard or steadying the
      // phone, not a swipe. Left moves forward, matching the reading direction.
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return

      step(deltaX < 0 ? 1 : -1)
    },
    [step],
  )

  return (
    <>
      <ul
        className={
          isShowcase
            ? // Three phones side by side leave nothing readable on a 375px screen, so
              // below sm this is a snap carousel instead: full-size cards, the next one
              // peeking to advertise the swipe. The negative margin lets it scroll to
              // the viewport edge inside the section's px-6 shell.
              "-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:items-stretch sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0"
            : isGallery
              ? "columns-1 gap-6 sm:columns-2"
              : "grid grid-cols-2 items-start gap-4 sm:grid-cols-3"
        }
      >
        {screenshots.map((screenshot, index) => (
          <li
            key={mediaSource(screenshot)}
            className={
              isShowcase
                ? screenshot.type === "video"
                  ? // The video card is deliberately wider than a screenshot, so matching
                    // widths would leave it taller — 9:16 over 82vw is more height than
                    // 1170:2532 over 62vw. Below sm the card therefore takes the screenshot
                    // card's computed height and the poster crops into it, which is what the
                    // sm-and-up grid row already does.
                    "h-[calc(62vw*2532/1170)] max-h-[calc(17rem*2532/1170)] w-[82vw] max-w-[24rem] shrink-0 snap-center sm:col-span-2 sm:h-auto sm:max-h-none sm:w-auto sm:min-w-0 sm:max-w-none"
                  : "w-[62vw] max-w-[17rem] shrink-0 snap-center sm:w-auto sm:min-w-0 sm:max-w-none"
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
                  ? `block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] border border-border bg-muted shadow-2xl shadow-foreground/5 transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:rounded-[2rem] ${screenshot.type === "video" ? "h-full" : ""}`
                  : "block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              <GalleryMediaView
                media={screenshot}
                sizes={
                  isShowcase
                    ? screenshot.type === "video"
                      ? "(max-width: 640px) 82vw, 380px"
                      : "(max-width: 640px) 62vw, 300px"
                    : isGallery
                      ? "(max-width: 640px) calc(100vw - 3rem), 480px"
                      : "(max-width: 640px) 45vw, 220px"
                }
                className="h-auto w-full"
                preview
                fillPreview={screenshot.type === "video" && isShowcase}
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
                href={mediaSource(active)}
                download
                className={`${active.type === "video" ? "flex" : "system-theme-light flex"} size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                aria-label={screenshotGalleryCopy.download(active.title)}
              >
                <Download className="size-4" aria-hidden="true" />
              </a>
              {active.type === "video" ? null : (
                <a
                  href={active.darkSrc}
                  download
                  className="system-theme-dark size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={screenshotGalleryCopy.download(active.title)}
                >
                  <Download className="size-4" aria-hidden="true" />
                </a>
              )}
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

          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            // Vertical panning and pinch-zoom stay with the browser — zooming into a
            // screenshot is the point of this view — while horizontal movement is
            // claimed for the swipe above.
            className="flex min-h-0 flex-1 touch-pan-y touch-pinch-zoom items-center justify-center gap-2 px-2 py-4 sm:gap-6 sm:px-6"
          >
            <GalleryNavButton
              label={screenshotGalleryCopy.previous}
              direction="previous"
              onClick={() => step(-1)}
              disabled={count < 2}
            />
            <GalleryMediaView
              media={active}
              sizes={isGallery ? "(max-width: 640px) 75vw, 80vw" : "(max-width: 640px) 75vw, 420px"}
              className="max-h-full min-h-0 w-auto max-w-full rounded-xl border border-border object-contain"
              videoRef={activeVideoRef}
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

function GalleryMediaView({
  media,
  sizes,
  className,
  preview = false,
  fillPreview = false,
  videoRef,
}: {
  media: GalleryMedia
  sizes: string
  className: string
  preview?: boolean
  fillPreview?: boolean
  videoRef?: Ref<HTMLVideoElement>
}) {
  if (media.type === "video") {
    if (!preview) {
      return (
        <video
          key={media.src}
          ref={videoRef}
          src={media.src}
          poster={media.poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          tabIndex={0}
          aria-label={media.alt ?? media.title}
          className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          onKeyDown={(event) => {
            if (event.key !== " " && event.code !== "Space") return

            event.preventDefault()
            if (event.currentTarget.paused) {
              void event.currentTarget.play()
            } else {
              event.currentTarget.pause()
            }
          }}
        />
      )
    }

    return (
      <span
        className={
          fillPreview
            ? // The poster is absolutely positioned, so this span needs a definite height or
              // it collapses to nothing. It gets one from the showcase card: the grid row
              // stretches it from sm up, and below sm the card carries an explicit height.
              "relative block h-full min-h-full bg-black"
            : "relative block aspect-[1080/1920] bg-black"
        }
      >
        <Image
          src={media.poster}
          alt={media.alt ?? media.title}
          fill
          sizes={sizes}
          className="object-cover"
        />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-end bg-black/10 p-4 sm:p-5">
          <span className="flex size-14 items-center justify-center rounded-full border border-white/40 bg-black/70 text-white shadow-lg backdrop-blur-sm">
            <Play className="ml-1 size-5 fill-current" aria-hidden="true" />
          </span>
        </span>
      </span>
    )
  }

  const { props: darkImageProps } = getImageProps({
    src: media.darkSrc,
    alt: media.alt ?? media.title,
    width: media.width ?? 1170,
    height: media.height ?? 2532,
    sizes,
  })

  return (
    <picture className="contents">
      <source media="(prefers-color-scheme: dark)" srcSet={darkImageProps.srcSet} sizes={darkImageProps.sizes} />
      <Image
        src={media.lightSrc}
        alt={media.alt ?? media.title}
        width={media.width ?? 1170}
        height={media.height ?? 2532}
        sizes={sizes}
        className={className}
      />
    </picture>
  )
}

function mediaSource(media: GalleryMedia) {
  return media.type === "video" ? media.src : media.lightSrc
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
