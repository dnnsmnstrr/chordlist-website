import { ScreenshotGallery, type GalleryMedia } from "@/components/screenshot-gallery"
import { homeCopy } from "@/locales/en"

const media: readonly GalleryMedia[] = [
  {
    type: "video",
    src: "/video/ChordlistPromoShort.mp4",
    poster: "/video/ChordlistPromoShort-poster.jpg",
    ...homeCopy.showcase.video,
  },
  {
    lightSrc: "/app-screenshots/light/01-Song-List.png",
    darkSrc: "/app-screenshots/dark/01-Song-List.png",
    ...homeCopy.showcase.screenshots[0],
  },
  {
    lightSrc: "/app-screenshots/light/02-Song-Detail.png",
    darkSrc: "/app-screenshots/dark/02-Song-Detail.png",
    ...homeCopy.showcase.screenshots[1],
  },
  {
    lightSrc: "/app-screenshots/light/03-Creation-Flow.png",
    darkSrc: "/app-screenshots/dark/03-Creation-Flow.png",
    ...homeCopy.showcase.screenshots[2],
  },
]

export function AppShowcase() {
  return (
    <section aria-labelledby="showcase-title" className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {homeCopy.showcase.eyebrow}
        </p>
        <h2 id="showcase-title" className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {homeCopy.showcase.title}
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {homeCopy.showcase.description}
        </p>
      </div>

      <div className="mt-10">
        <ScreenshotGallery screenshots={media} variant="showcase" />
      </div>
    </section>
  )
}
