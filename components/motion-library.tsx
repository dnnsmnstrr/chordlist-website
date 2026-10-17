"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, Copy, Download, LoaderCircle, Search, Share, X } from "lucide-react"

import { SiteSearchResults, useSiteSearch } from "@/components/site-search-results"
import { Button } from "@/components/ui/button"
import type { LibraryFormat, LibraryItem, LibraryOutput } from "@/lib/motion/library"
import { matchesSearchTokens, searchTokens } from "@/lib/text-search"
import { cn } from "@/lib/utils"
import { motionLibraryCopy as copy } from "@/locales/en"

const aspect: Record<LibraryFormat, string> = { story: "9 / 16", post: "4 / 5", wide: "16 / 9", square: "1 / 1" }

// Story first: it is the Reels and Stories size, which is what this page is mostly opened for.
const preference: LibraryFormat[] = ["story", "post", "square", "wide"]

const fileName = (slug: string, format: LibraryFormat) => `chordlist-${slug}-${format}.mp4`

export type MotionLibrarySection = { id: string; title: string; items: LibraryItem[] }

type MotionLibraryProps = { sections: MotionLibrarySection[] }

/**
 * The words a video is found by: what its card shows — title, description, caption, section — plus
 * each format's name, ratio, and where it is posted, so "reels" or "16:9" finds the videos that
 * have that cut.
 */
function searchText(section: MotionLibrarySection, item: LibraryItem) {
  const formats = item.outputs.map(({ format }) => {
    const { label, ratio, use } = copy.formats[format]
    return `${format} ${label} ${ratio} ${use}`
  })
  return [section.title, item.title, item.description, item.slug, item.caption?.text ?? "", ...formats].join(" ")
}

/** Every section of the library, one card per video, narrowed by the search above them. */
export function MotionLibrary({ sections }: MotionLibraryProps) {
  const inputId = useId()
  const countId = useId()
  const [query, setQuery] = useState("")
  const tokens = useMemo(() => searchTokens(query), [query])
  const isSearching = tokens.length > 0
  const site = useSiteSearch("en", query)

  const visible = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesSearchTokens(searchText(section, item), tokens)),
    }))
    .filter((section) => section.items.length > 0)
  const count = visible.reduce((sum, section) => sum + section.items.length, 0)

  return (
    <>
      <div className="relative mt-10 w-full sm:max-w-sm">
        <label htmlFor={inputId} className="sr-only">
          {copy.search.label}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={site.prefetch}
          placeholder={copy.search.placeholder}
          aria-describedby={countId}
          autoComplete="off"
          // appearance-none drops Safari's own clear button, which would sit under ours. 16px text on
          // touch screens, because iOS Safari zooms the page into any focused field set smaller.
          className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-base transition-colors pointer-fine:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {isSearching ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={copy.search.clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Always rendered, so a screen reader hears the count change rather than the live region
          appear; hidden rather than removed while there is no search, so it takes no space. */}
      <p
        id={countId}
        role="status"
        aria-live="polite"
        className={cn("mt-3 font-mono text-xs text-muted-foreground", !isSearching && "sr-only")}
      >
        {isSearching ? copy.search.resultCount(count) : ""}
      </p>

      {visible.map((section) => (
        <section key={section.id} className="mt-12">
          <h2 className="text-balance text-2xl font-semibold tracking-tight">{section.title}</h2>
          <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <MotionCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ))}

      {isSearching && count === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          {copy.search.empty(query.trim())}
        </p>
      ) : null}

      <div className="mt-12">
        <SiteSearchResults language="en" query={query} matches={site.matches} />
      </div>
    </>
  )
}

type ShareState = "idle" | "preparing" | "ready" | "unsupported" | "failed"

function MotionCard({ item }: { item: LibraryItem }) {
  const first = preference.map((format) => item.outputs.find((output) => output.format === format)).find(Boolean)
  const [selected, setSelected] = useState<LibraryOutput | undefined>(first)
  const [share, setShare] = useState<ShareState>("idle")
  const [copied, setCopied] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  // A fetched file is kept, so a second tap after Safari drops the gesture shares at once.
  const files = useRef(new Map<string, File>())

  // Play only while on screen, so a page of videos does not decode all at once on a phone.
  useEffect(() => {
    const element = video.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) element.play().catch(() => {})
      else element.pause()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [selected])

  if (!selected) return null

  const name = fileName(item.slug, selected.format)

  async function shareVideo(output: LibraryOutput) {
    try {
      let file = files.current.get(output.video)
      if (!file) {
        setShare("preparing")
        const response = await fetch(output.video)
        if (!response.ok) throw new Error(response.statusText)
        file = new File([await response.blob()], fileName(item.slug, output.format), { type: "video/mp4" })
        files.current.set(output.video, file)
      }
      if (!navigator.canShare?.({ files: [file] })) {
        // Desktop browsers mostly cannot share files: save it instead, and say why.
        const link = document.createElement("a")
        link.href = output.video
        link.download = file.name
        link.click()
        setShare("unsupported")
        return
      }
      await navigator.share({ files: [file] })
      setShare("idle")
    } catch (error) {
      const reason = error instanceof DOMException ? error.name : ""
      // Cancelling the sheet is not a failure. Safari refuses a share that no longer follows a
      // tap, which happens when the download took a moment: the file is ready for the next tap.
      if (reason === "AbortError") setShare("idle")
      else if (reason === "NotAllowedError") setShare("ready")
      else setShare("failed")
    }
  }

  async function copyCaption(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const shareLabel = share === "preparing" ? copy.preparing : share === "ready" ? copy.shareReady : copy.share
  const notice = share === "unsupported" ? copy.shareUnsupported : share === "failed" ? copy.shareFailed : ""
  const formatCopy = copy.formats[selected.format]

  return (
    <article className="flex flex-col">
      <div className="flex justify-center rounded-xl border border-border bg-muted/40 p-3">
        <video
          ref={video}
          key={selected.video}
          src={selected.video}
          poster={selected.poster}
          muted
          loop
          playsInline
          preload="metadata"
          // No native controls: they cover the frame's footnote. A tap pauses and resumes.
          onClick={(event) => (event.currentTarget.paused ? event.currentTarget.play().catch(() => {}) : event.currentTarget.pause())}
          aria-label={copy.play(item.title)}
          className="max-h-[70vh] w-full rounded-lg bg-background object-contain"
          style={{ aspectRatio: aspect[selected.format] }}
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
      {item.description ? (
        <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}

      <div role="radiogroup" aria-label={copy.formatPicker} className="mt-4 flex flex-wrap gap-2">
        {item.outputs.map((output) => {
          const isSelected = output.format === selected.format
          return (
            <button
              key={output.format}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setSelected(output)
                setShare("idle")
              }}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {copy.formats[output.format].label} {copy.formats[output.format].ratio}
            </button>
          )
        })}
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {[
          formatCopy.use,
          copy.seconds(item.seconds),
          selected.bytes ? copy.megabytes((selected.bytes / 1e6).toFixed(1)) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="lg" onClick={() => shareVideo(selected)} disabled={share === "preparing"}>
          {share === "preparing" ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Share aria-hidden="true" />
          )}
          {shareLabel}
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={
            <a href={selected.video} download={name}>
              <Download aria-hidden="true" />
              {copy.download}
            </a>
          }
        />
        {item.caption ? (
          <Button size="lg" variant="ghost" onClick={() => item.caption && copyCaption(item.caption.text)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? copy.captionCopied : copy.copyCaption}
          </Button>
        ) : null}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {notice}
      </p>
      {item.caption ? (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer font-mono text-xs">{item.caption.source}</summary>
          <p className="mt-2 whitespace-pre-line text-pretty leading-relaxed">{item.caption.text}</p>
        </details>
      ) : null}
    </article>
  )
}
