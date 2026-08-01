import Image from "next/image"

const screenshots = [
  {
    src: "/app-screenshots/light/01-Song-List---4-Chord-Library.png",
    alt: "Song library in chordlist, grouped by artist with chord and tag filters",
  },
  {
    src: "/app-screenshots/light/02-Song-Detail---Matching-Suggestions.png",
    alt: "Song detail in chordlist with lyrics, chords, and matching song suggestions",
  },
  {
    src: "/app-screenshots/light/03-Creation-Flow---New-Song.png",
    alt: "New song editor in chordlist with title, artist, chord progression, tags, and lyrics fields",
  },
] as const

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

      <div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-8">
        {screenshots.map((screenshot, index) => (
          <div
            key={screenshot.src}
            className={`overflow-hidden rounded-[1.25rem] border border-border bg-muted shadow-2xl shadow-foreground/5 sm:rounded-[2rem] ${
              index === 1 ? "-translate-y-4" : ""
            }`}
          >
            <Image
              src={screenshot.src}
              alt={screenshot.alt}
              width={1170}
              height={2532}
              sizes="(max-width: 640px) 30vw, 300px"
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

