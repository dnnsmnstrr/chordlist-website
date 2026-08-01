import { ScreenshotGallery, type Screenshot } from "@/components/screenshot-gallery"

const screenshots: readonly Screenshot[] = [
  {
    src: "/app-screenshots/light/01-Song-List---4-Chord-Library.png",
    title: "Song library",
    description: "Browse a song library grouped by artist, with chord progressions and tags visible at a glance.",
  },
  {
    src: "/app-screenshots/light/02-Song-Detail---Matching-Suggestions.png",
    title: "Song detail",
    description: "Read lyrics and chords, transpose while playing, and find suggestions with matching progressions.",
  },
  {
    src: "/app-screenshots/light/03-Creation-Flow---New-Song.png",
    title: "Song editor",
    description: "Create a portable song file with title, artist, chord progression, tags, and lyrics.",
  },
]

export function AppShowcase() {
  return (
    <section aria-labelledby="showcase-title" className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Made for the set list</p>
        <h2 id="showcase-title" className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Find a song, play it, keep moving.
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Search and filter your library, transpose as you play, and keep related songs close without giving up the
          simplicity of ordinary files.
        </p>
      </div>

      <div className="mt-10">
        <ScreenshotGallery screenshots={screenshots} variant="showcase" />
      </div>
    </section>
  )
}
