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
  /** Omitted when one rendering serves both themes, as the App Store sets do. */
  darkSrc?: string
  width?: number
  height?: number
}

export type Video = MediaBase & {
  type: "video"
  src: string
  poster: string
}

export type GalleryMedia = Screenshot | Video

type GalleryVariant = "gallery" | "press" | "screens" | "showcase"

type ScreenshotGalleryProps = {
  screenshots: readonly GalleryMedia[]
  variant?: GalleryVariant
}

/** Shorter than this is a tap, or a finger that moved while lifting. */
const SWIPE_THRESHOLD_PX = 48

/*
  Dismissing costs more than stepping: a swipe that closes the view by mistake loses the
  place in the set, so it asks for a longer pull than moving between images does.
*/
const SWIPE_CLOSE_THRESHOLD_PX = 96

export function ScreenshotGallery({ screenshots, variant = "press" }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const activeVideoRef = useRef<HTMLVideoElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const count = screenshots.length
  const active = activeIndex === null ? undefined : screenshots[activeIndex]
  const isGallery = variant === "gallery"
  const activeDarkSource = active?.type === "video" ? undefined : active?.darkSrc

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
    Swiping between images, and swiping down to dismiss — which is how anyone holding a
    phone expects to move through and leave a full-screen gallery — the arrow buttons and
    the close button are small, and the arrow and Escape keys are not there. A pinch (more
    than one finger) cancels the gesture rather than counting as a swipe on the way out.
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

      // While the page is pinch-zoomed, a one-finger drag is how you look around the
      // screenshot. Reading it as a swipe would make a zoomed image impossible to pan.
      if ((window.visualViewport?.scale ?? 1) > 1) return

      const deltaX = touch.clientX - origin.x
      const deltaY = touch.clientY - origin.y

      // A mostly vertical drag going down dismisses the view, the way a phone's own
      // full-screen media does; going up is someone steadying the phone, not a gesture.
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY >= SWIPE_CLOSE_THRESHOLD_PX) close()
        return
      }

      // Left moves forward, matching the reading direction.
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return

      step(deltaX < 0 ? 1 : -1)
    },
    [close, step],
  )

  return (
    <>
      <ul className={listClassName(variant)}>
        {screenshots.map((screenshot, index) => (
          <li key={mediaSource(screenshot)} className={itemClassName(variant, screenshot)}>
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget
                setActiveIndex(index)
              }}
              aria-label={screenshotGalleryCopy.viewFullscreen(screenshot.title)}
              className={triggerClassName(variant, screenshot)}
            >
              <GalleryMediaView
                media={screenshot}
                sizes={previewSizes(variant, screenshot)}
                className="h-auto w-full"
                preview
                fillPreview={screenshot.type === "video" && variant === "showcase"}
              />
            </button>
            <ItemCaption variant={variant} media={screenshot} />
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="screenshot-dialog-title"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
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
                className={`${activeDarkSource ? "system-theme-light flex" : "flex"} size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                aria-label={screenshotGalleryCopy.download(active.title)}
              >
                <Download className="size-4" aria-hidden="true" />
              </a>
              {activeDarkSource ? (
                <a
                  href={activeDarkSource}
                  download
                  className="system-theme-dark size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={screenshotGalleryCopy.download(active.title)}
                >
                  <Download className="size-4" aria-hidden="true" />
                </a>
              ) : null}
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

/*
  Three phones side by side leave nothing readable on a 375px screen, so below sm the
  showcase is a snap carousel instead: full-size cards, the next one peeking to advertise
  the swipe. The screens variant stays a carousel at every width — an App Store set reads
  as one horizontal run of five, however wide the window is. The negative margin lets
  either scroll to the viewport edge inside the section's px-6 shell.
*/
const carouselList = "-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4"

function listClassName(variant: GalleryVariant) {
  switch (variant) {
    case "showcase":
      return `${carouselList} sm:mx-0 sm:grid sm:grid-cols-5 sm:items-stretch sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0`
    case "screens":
      return carouselList
    case "gallery":
      return "columns-1 gap-6 sm:columns-2"
    default:
      return "grid grid-cols-2 items-start gap-4 sm:grid-cols-3"
  }
}

function itemClassName(variant: GalleryVariant, media: GalleryMedia) {
  switch (variant) {
    case "showcase":
      return media.type === "video"
        ? // The video card is deliberately wider than a screenshot, so matching widths
          // would leave it taller — 9:16 over 82vw is more height than 1170:2532 over
          // 62vw. Below sm the card therefore takes the screenshot card's computed height
          // and the poster crops into it, which is what the sm-and-up grid row already does.
          "h-[calc(62vw*2532/1170)] max-h-[calc(17rem*2532/1170)] w-[82vw] max-w-[24rem] shrink-0 snap-center sm:col-span-2 sm:h-auto sm:max-h-none sm:w-auto sm:min-w-0 sm:max-w-none"
        : "w-[62vw] max-w-[17rem] shrink-0 snap-center sm:w-auto sm:min-w-0 sm:max-w-none"
    case "screens":
      // 14rem keeps a five-image set inside the page shell on a wide screen, so the row
      // only scrolls once it has to.
      return "flex w-[62vw] max-w-[14rem] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-border bg-card"
    case "gallery":
      return "mb-6 inline-flex w-full break-inside-avoid flex-col gap-3"
    default:
      return "flex flex-col gap-3"
  }
}

const triggerBase =
  "block w-full cursor-zoom-in overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function triggerClassName(variant: GalleryVariant, media: GalleryMedia) {
  switch (variant) {
    case "showcase":
      return `${triggerBase} rounded-[1.25rem] border border-border shadow-2xl shadow-foreground/5 transition-colors hover:border-foreground sm:rounded-[2rem] ${media.type === "video" ? "h-full" : ""}`
    case "screens":
      // The card around it already carries the border, so this only needs its focus ring.
      return `${triggerBase} focus-visible:ring-inset`
    default:
      return `${triggerBase} rounded-xl border border-border transition-colors hover:border-foreground`
  }
}

function previewSizes(variant: GalleryVariant, media: GalleryMedia) {
  switch (variant) {
    case "showcase":
      return media.type === "video" ? "(max-width: 640px) 82vw, 380px" : "(max-width: 640px) 62vw, 300px"
    case "screens":
      return "(max-width: 640px) 62vw, 224px"
    case "gallery":
      return "(max-width: 640px) calc(100vw - 3rem), 480px"
    default:
      return "(max-width: 640px) 45vw, 220px"
  }
}

function ItemCaption({ variant, media }: { variant: GalleryVariant; media: GalleryMedia }) {
  if (variant === "showcase") return null

  if (variant !== "screens") return <p className="text-sm font-medium leading-snug">{media.title}</p>

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <h3 className="text-sm font-medium leading-snug">{media.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{media.description}</p>
      </div>
      <a
        href={mediaSource(media)}
        download
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Download className="size-3.5" aria-hidden="true" />
        {screenshotGalleryCopy.downloadPng}
      </a>
    </div>
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

  const image = (
    <Image
      src={media.lightSrc}
      alt={media.alt ?? media.title}
      width={media.width ?? 1170}
      height={media.height ?? 2532}
      sizes={sizes}
      className={className}
    />
  )

  if (!media.darkSrc) return image

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
      {image}
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
