import Image, { getImageProps } from "next/image"

import { InlineMarkup } from "@/components/inline-markup"
import { cn } from "@/lib/utils"

/** The iPhone captures `pnpm sync:assets` copies in, all at the same size. */
const SCREENSHOT_WIDTH = 1242
const SCREENSHOT_HEIGHT = 2688
const SIZES = "(min-width: 1024px) 15rem, (min-width: 640px) 14rem, 45vw"

export type DocsScreenshotName =
  | "01-Song-List"
  | "02-Song-Detail"
  | "03-Creation-Flow"
  | "04-Search"
  | "05-Tag-Filter"
  | "06-Settings"
  | "07-Song-Suggestions"
  | "08-Paywall"

/** A point on a screenshot, in percent of its width and height, that a numbered marker sits on. */
export type ScreenshotMarker = { x: number; y: number }

type DocsScreenshotProps = {
  name: DocsScreenshotName
  alt: string
  /** Numbered markers drawn over the capture, counting up from `firstMarker`. */
  markers?: readonly ScreenshotMarker[]
  firstMarker?: number
  className?: string
}

/**
 * One app screenshot in a phone-shaped frame, swapping to the dark capture with the system theme
 * the same way the screenshot gallery does.
 *
 * Markers are decoration: the numbered list beside the figure carries the meaning, and the `alt`
 * text names what each number points at, so the circles themselves stay hidden from assistive tech.
 */
export function DocsScreenshot({ name, alt, markers = [], firstMarker = 1, className }: DocsScreenshotProps) {
  const lightSrc = `/app-screenshots/light/${name}.png`
  const { props: darkImageProps } = getImageProps({
    src: `/app-screenshots/dark/${name}.png`,
    alt,
    width: SCREENSHOT_WIDTH,
    height: SCREENSHOT_HEIGHT,
    sizes: SIZES,
  })

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.75rem] border border-border bg-muted shadow-sm",
        className,
      )}
    >
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={darkImageProps.srcSet} sizes={darkImageProps.sizes} />
        <Image
          src={lightSrc}
          alt={alt}
          width={SCREENSHOT_WIDTH}
          height={SCREENSHOT_HEIGHT}
          sizes={SIZES}
          className="block h-auto w-full"
        />
      </picture>

      {markers.map((marker, index) => (
        <span
          key={`${marker.x}-${marker.y}`}
          aria-hidden="true"
          className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground font-mono text-xs font-semibold text-background shadow-md ring-2 ring-background"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
        >
          {firstMarker + index}
        </span>
      ))}
    </div>
  )
}

type CalloutListProps = {
  items: readonly { title: string; body: string }[]
  className?: string
}

/** The numbered key to a `DocsScreenshot`'s markers, in the same order. */
export function CalloutList({ items, className }: CalloutListProps) {
  return (
    <ol className={cn("flex flex-col gap-4", className)}>
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-semibold text-background"
          >
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed">
              <InlineMarkup text={item.body} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
