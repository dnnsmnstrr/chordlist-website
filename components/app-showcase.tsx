import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"
import { homeCopy } from "@/locales/en"

const screenshots: readonly Screenshot[] = [
  {
    src: "/app-screenshots/light/01-Song-List---4-Chord-Library.png",
    ...homeCopy.showcase.screenshots[0],
  },
  {
    src: "/app-screenshots/light/02-Song-Detail---Matching-Suggestions.png",
    ...homeCopy.showcase.screenshots[1],
  },
  {
    src: "/app-screenshots/light/03-Creation-Flow---New-Song.png",
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
        <ScreenshotGallery screenshots={screenshots} variant="showcase" />
      </div>
    </section>
  )
}
