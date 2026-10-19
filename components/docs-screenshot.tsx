import Image, { getImageProps } from "next/image"

import { DocsMarkerLink } from "@/components/docs-marker-link"
import { InlineMarkup } from "@/components/inline-markup"
import { screenshotCalloutId, screenshotMarkerId } from "@/lib/docs-search"
import { cn } from "@/lib/utils"
import { docsCopy } from "@/locales/en"

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
  /**
   * Pairs the markers with a `CalloutList` of the same `figureId`, turning each into a link to its
   * explanation. `titles` are the callout titles, indexed from marker 1, for the links' labels.
   */
  annotations?: { figureId: string; titles: readonly string[] }
  /** `"eager"` for a capture above the fold, which would otherwise wait for the lazy-load observer. */
  loading?: "eager" | "lazy"
  className?: string
}

const markerClassName =
  "flex size-6 items-center justify-center rounded-full bg-foreground font-mono text-xs font-semibold text-background"

/** Grows the tap target past the visible circle without growing the circle over the screenshot. */
const markerHitArea = "relative after:absolute after:-inset-2.5 after:content-['']"

/**
 * One app screenshot in a phone-shaped frame, swapping to the dark capture with the system theme
 * the same way the screenshot gallery does.
 *
 * With `annotations`, each numbered marker links to its explanation in the matching `CalloutList`,
 * and each number in the list links back. Without them the markers are decoration, hidden from
 * assistive tech, because the `alt` text names what each number points at.
 */
export function DocsScreenshot({
  name,
  alt,
  markers = [],
  firstMarker = 1,
  annotations,
  loading,
  className,
}: DocsScreenshotProps) {
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
          loading={loading}
          className="block h-auto w-full"
        />
      </picture>

      {markers.map((marker, index) => {
        const number = firstMarker + index
        const position = { left: `${marker.x}%`, top: `${marker.y}%` }
        const title = annotations?.titles[number - 1]

        if (!annotations || title === undefined) {
          return (
            <span
              key={number}
              aria-hidden="true"
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 shadow-md ring-2 ring-background", markerClassName)}
              style={position}
            >
              {number}
            </span>
          )
        }

        return (
          <span
            key={number}
            id={screenshotMarkerId(annotations.figureId, number)}
            className="absolute -translate-x-1/2 -translate-y-1/2 scroll-mb-6 scroll-mt-24 rounded-full outline-none transition-transform duration-300 data-[flash=true]:scale-150 motion-reduce:transition-none"
            style={position}
          >
            <DocsMarkerLink
              targetId={screenshotCalloutId(annotations.figureId, number)}
              label={docsCopy.markers.toCallout(number, title)}
              className={cn(
                markerClassName,
                markerHitArea,
                "shadow-md ring-2 ring-background transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-ring",
              )}
            >
              {number}
            </DocsMarkerLink>
          </span>
        )
      })}
    </div>
  )
}

type CalloutListProps = {
  items: readonly { title: string; body: string }[]
  /** Links each number to its marker on the screenshot rendered with the same `figureId`. */
  figureId?: string
  className?: string
}

/** The numbered key to a `DocsScreenshot`'s markers, in the same order. */
export function CalloutList({ items, figureId, className }: CalloutListProps) {
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        const number = index + 1

        return (
          <li
            key={item.title}
            id={figureId ? screenshotCalloutId(figureId, number) : undefined}
            className="-mx-2 flex scroll-mb-6 scroll-mt-24 gap-3 rounded-lg px-2 py-1 outline-none transition-colors duration-500 data-[flash=true]:bg-muted data-[flash=true]:duration-150 motion-reduce:transition-none"
          >
            {figureId ? (
              <DocsMarkerLink
                targetId={screenshotMarkerId(figureId, number)}
                label={docsCopy.markers.toMarker(number)}
                className={cn(
                  markerClassName,
                  markerHitArea,
                  "mt-0.5 shrink-0 transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {number}
              </DocsMarkerLink>
            ) : (
              <span aria-hidden="true" className={cn(markerClassName, "mt-0.5 shrink-0")}>
                {number}
              </span>
            )}
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed">
                <InlineMarkup text={item.body} />
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
