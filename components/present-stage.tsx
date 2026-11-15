"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, Maximize, Minimize, Smartphone } from "lucide-react"

import { AMBIENT_SHUFFLE_EVENT } from "@/components/ambient-background"
import { ChordlistIcon } from "@/components/chordlist-icon"
import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { PRESENT_NOTE_PARAM } from "@/lib/present-params"
import { siteConfig } from "@/lib/site-config"
import { commonCopy, presentCopy } from "@/locales/en"

/** What the QR code opens, and the line under the tile that says so. */
export type PresentTarget = { url: string; hint: string }

type PresentStageProps = {
  /** The QR code as a single path on a `size` × `size` grid of modules. */
  code: { size: number; path: string }
  target: PresentTarget
  /** The note as the URL had it when the page was rendered. */
  initialNote: string
  screenshots: readonly Screenshot[]
}

/** Blank modules around the code. Scanners need four; the spec calls it the quiet zone. */
const QUIET_ZONE = 4

/** How long one background composition stays up before the next is dealt. */
const BACKGROUND_SHUFFLE_MILLISECONDS = 30_000

const controlClassName =
  "flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function PresentStage({ code, target, initialNote, screenshots }: PresentStageProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showsScreens, setShowsScreens] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    // Someone who asked for less motion gets the one composition the page loaded with.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const interval = window.setInterval(
      () => window.dispatchEvent(new Event(AMBIENT_SHUFFLE_EVENT)),
      BACKGROUND_SHUFFLE_MILLISECONDS,
    )
    return () => window.clearInterval(interval)
  }, [])

  /*
    Held in state rather than read back from the field, because the field unmounts while the screens
    are showing. Every edit is written to the URL with `replaceState`, which keeps the other parameters
    (`qr`, `code`), adds no history entry per keystroke, and does not re-render the server page — so a
    reload, a bookmark, or a link sent to another screen comes back with the same note.
  */
  const [note, setNote] = useState(initialNote)

  const updateNote = useCallback((value: string) => {
    setNote(value)
    const url = new URL(window.location.href)
    if (value) url.searchParams.set(PRESENT_NOTE_PARAM, value)
    else url.searchParams.delete(PRESENT_NOTE_PARAM)
    window.history.replaceState(window.history.state, "", url)
  }, [])

  const toggleFullscreen = useCallback(() => {
    // iPhone Safari has no Fullscreen API for a page, so the call is absent there rather than
    // failing — the button then does nothing, and Add to Home Screen is the way to lose the chrome.
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }, [])

  const viewBoxSize = code.size + QUIET_ZONE * 2

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
        {showsScreens ? (
          <section aria-labelledby="present-screens-title" className="w-full max-w-[110rem]">
            <h1 id="present-screens-title" className="sr-only">
              {presentCopy.screensTitle}
            </h1>
            <ScreenshotGallery screenshots={screenshots} variant="present" />
          </section>
        ) : (
          <>
            {/* Empty, it shows nothing until hovered or focused, so an unused note never reads as
                a stray placeholder on the big screen. Never below 16px, or iOS zooms on focus. */}
            <input
              value={note}
              type="text"
              aria-label={presentCopy.noteLabel}
              placeholder={presentCopy.notePlaceholder}
              onChange={(event) => updateNote(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur()
              }}
              autoComplete="off"
              spellCheck={false}
              className="w-full max-w-4xl rounded-md bg-transparent px-3 py-2 text-center font-mono text-[clamp(1.25rem,3vw,2.5rem)] font-medium tracking-tight text-foreground outline-none transition-colors placeholder:text-transparent hover:bg-muted/60 hover:placeholder:text-muted-foreground focus:bg-muted/60 focus:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />

            <button
              type="button"
              onClick={() => setIsFlipped((flipped) => !flipped)}
              aria-pressed={isFlipped}
              aria-label={isFlipped ? presentCopy.flipToLogo : presentCopy.flipToCode}
              className="group size-[min(52vw,44vh)] cursor-pointer rounded-[22%] [perspective:1600px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
            >
              <span
                className={`relative block size-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[22%] bg-logo-tile text-logo-glyph shadow-logo [backface-visibility:hidden]">
                  <ChordlistIcon className="size-full" />
                </span>
                {/* Dark on white in both themes: a scanner reads contrast, and an inverted code is
                    the one a good share of phone cameras refuse. */}
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[22%] bg-white text-black shadow-logo [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <svg
                    viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${viewBoxSize} ${viewBoxSize}`}
                    role="img"
                    aria-label={presentCopy.codeAlt(target.url)}
                    shapeRendering="crispEdges"
                    className="size-[86%]"
                  >
                    <path d={code.path} fill="currentColor" />
                  </svg>
                </span>
              </span>
            </button>

            <div className="text-center">
              <h1 className="font-mono text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-none tracking-tight">
                {siteConfig.name}
              </h1>
              <p className="mt-5 text-balance text-[clamp(1rem,2.2vw,1.75rem)] text-muted-foreground">
                {isFlipped ? target.hint : commonCopy.tagline}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 px-6 pb-6">
        <button type="button" onClick={() => setShowsScreens((shows) => !shows)} className={controlClassName}>
          {showsScreens ? (
            <ArrowLeft className="size-4" aria-hidden="true" />
          ) : (
            <Smartphone className="size-4" aria-hidden="true" />
          )}
          {showsScreens ? presentCopy.hideScreens : presentCopy.showScreens}
        </button>
        <button type="button" onClick={toggleFullscreen} className={controlClassName}>
          {isFullscreen ? (
            <Minimize className="size-4" aria-hidden="true" />
          ) : (
            <Maximize className="size-4" aria-hidden="true" />
          )}
          {isFullscreen ? presentCopy.exitFullscreen : presentCopy.enterFullscreen}
        </button>
      </div>
    </div>
  )
}
