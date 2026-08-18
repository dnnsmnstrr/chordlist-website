"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Check, Copy, Download, ExternalLink, Images, Pencil, Share2 } from "lucide-react"

import { SocialPostCalendar } from "@/components/social-post-calendar"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SocialFormat = "card" | "post" | "story"
type SortMode = "created" | "scheduled"

type SocialOutput = {
  format: SocialFormat
  file: string
  width: number
  height: number
}

export type SocialManifestEntry = {
  slug: string
  template: string
  alt: string
  caption: string
  created: string | null
  scheduled: string | null
  outputs: SocialOutput[]
}

type GalleryAsset = SocialManifestEntry &
  SocialOutput & {
    key: string
    src: string
    title: string
  }

const filters: { value: "all" | SocialFormat; label: string }[] = [
  { value: "all", label: "All" },
  { value: "card", label: "Cards" },
  { value: "post", label: "Posts" },
  { value: "story", label: "Stories" },
]

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function imagePath(file: string) {
  return file.replace(/^public/, "")
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}

function dateValue(date: string | null) {
  return date ? new Date(`${date}T00:00:00Z`).getTime() : null
}

function assetsForPost(post: SocialManifestEntry, filter: "all" | SocialFormat) {
  return post.outputs
    .filter((output) => filter === "all" || output.format === filter)
    .map((output) => ({
      ...post,
      ...output,
      key: `${post.slug}-${output.format}`,
      src: imagePath(output.file),
      title: titleFromSlug(post.slug),
    }))
}

function sortPosts(posts: SocialManifestEntry[], mode: SortMode) {
  return [...posts].sort((first, second) => {
    if (mode === "scheduled") {
      const firstScheduled = dateValue(first.scheduled)
      const secondScheduled = dateValue(second.scheduled)

      if (firstScheduled !== null && secondScheduled !== null && firstScheduled !== secondScheduled) {
        return firstScheduled - secondScheduled
      }
      if (firstScheduled !== null) return -1
      if (secondScheduled !== null) return 1
    }

    return (dateValue(second.created) ?? 0) - (dateValue(first.created) ?? 0)
  })
}

function downloadAsset(asset: GalleryAsset) {
  const link = document.createElement("a")
  link.href = asset.src
  link.download = `${asset.slug}-${asset.format}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

type SocialPostCardProps = {
  post: SocialManifestEntry
  assets: GalleryAsset[]
  copied: string | null
  sharing: string | null
  onCopy: (asset: GalleryAsset) => void
  onShare: (asset: GalleryAsset) => void
}

function SocialPostCard({ post, assets, copied, sharing, onCopy, onShare }: SocialPostCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(assets[0]?.format ?? "card")
  const asset = assets.find((candidate) => candidate.format === selectedFormat) ?? assets[0]

  if (!asset) return null

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <a
        href={asset.src}
        target="_blank"
        rel="noreferrer"
        className="group relative block overflow-hidden bg-black"
        aria-label={`Open ${asset.title} ${asset.format} image`}
      >
        <Image
          key={asset.key}
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes="(min-width: 1280px) 395px, (min-width: 768px) 47vw, 100vw"
          className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white opacity-90 backdrop-blur-sm transition group-hover:bg-black/80">
          <ExternalLink className="size-4" />
        </span>
      </a>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold tracking-tight">{asset.title}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {asset.width} × {asset.height}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {assets.length === 1 && (
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {asset.format}
              </span>
            )}
            <Link
              href={`/social/editor?slug=${post.slug}`}
              aria-label={`Edit ${asset.title}`}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil className="size-3.5" />
            </Link>
          </div>
        </div>

        {assets.length > 1 && (
          <div className="mt-4 flex gap-1 rounded-xl border border-border bg-muted/40 p-1" aria-label="Choose image format">
            {assets.map((candidate) => (
              <button
                key={candidate.format}
                type="button"
                onClick={() => setSelectedFormat(candidate.format)}
                aria-pressed={candidate.format === asset.format}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  candidate.format === asset.format
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {candidate.format}
              </button>
            ))}
          </div>
        )}

        <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {asset.caption}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {post.created && <span>Created {formatDate(post.created)}</span>}
          {post.scheduled && <span>Scheduled {formatDate(post.scheduled)}</span>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button size="lg" onClick={() => onShare(asset)} disabled={sharing === asset.key}>
            <Share2 />
            {sharing === asset.key ? "Opening…" : "Share"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onCopy(asset)}>
            {copied === asset.key ? <Check /> : <Copy />}
            {copied === asset.key ? "Copied" : "Caption"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="col-span-2"
            onClick={() => downloadAsset(asset)}
          >
            <Download />
            Download {asset.format} PNG
          </Button>
        </div>
      </div>
    </article>
  )
}

export function SocialPostGallery({ posts }: { posts: SocialManifestEntry[] }) {
  const [filter, setFilter] = useState<"all" | SocialFormat>("all")
  const [sortMode, setSortMode] = useState<SortMode>("created")
  const [copied, setCopied] = useState<string | null>(null)
  const [sharing, setSharing] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])

  const imageCount = useMemo(() => posts.reduce((count, post) => count + post.outputs.length, 0), [posts])
  const visiblePosts = useMemo(
    () =>
      sortPosts(posts, sortMode)
        .map((post) => ({ post, assets: assetsForPost(post, filter) }))
        .filter((item) => item.assets.length > 0),
    [filter, posts, sortMode],
  )

  const copyCaption = async (asset: GalleryAsset) => {
    await navigator.clipboard.writeText(asset.caption)
    setCopied(asset.key)
    window.setTimeout(() => setCopied((current) => (current === asset.key ? null : current)), 1800)
  }

  const shareAsset = async (asset: GalleryAsset) => {
    setSharing(asset.key)

    try {
      const response = await fetch(asset.src)
      if (!response.ok) throw new Error("The image could not be loaded.")

      const blob = await response.blob()
      const file = new File([blob], `${asset.slug}-${asset.format}.png`, { type: "image/png" })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: asset.caption,
          title: asset.title,
        })
      } else {
        downloadAsset(asset)
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        downloadAsset(asset)
      }
    } finally {
      setSharing(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">chordlist / social</p>
            <h1 className="truncate text-base font-semibold tracking-tight">Ready to post</h1>
          </Link>
          <Link href="/social/editor" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <Pencil />
            Editor
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Images className="size-4" />
              {imageCount} images
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                tabIndex={-1}
                aria-hidden="true"
                className="cursor-default outline-none ml-4 hover:opacity-85"
              >
                <Calendar className="size-4" />
              </button>
              {posts.length} posts
              {/*
                The way into the posting calendar, deliberately unannounced: it reads as
                another icon in the count row, keeps the text cursor, and stays out of the
                tab order, so only someone who already knows it is there will click it.
              */}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Pick one. Share it.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              On your phone, tap Share to send the image straight to Instagram or another app. Open an image to save it manually.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Sort by</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="rounded-lg border border-border bg-background px-3 py-2 font-medium text-foreground shadow-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
              >
                <option value="created">Recently created</option>
                <option value="scheduled">Scheduled soonest</option>
              </select>
            </label>

            <div
              className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1"
              aria-label="Filter social posts"
            >
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    filter === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map(({ post, assets }) => (
            <SocialPostCard
              key={`${filter}-${post.slug}`}
              post={post}
              assets={assets}
              copied={copied}
              sharing={sharing}
              onCopy={copyCaption}
              onShare={shareAsset}
            />
          ))}
        </div>
      </main>

      {calendarOpen && (
        <SocialPostCalendar
          posts={posts}
          onClose={closeCalendar}
          title={(post) => titleFromSlug(post.slug)}
          editHref={(post) => `/social/editor?slug=${post.slug}`}
        />
      )}
    </div>
  )
}
