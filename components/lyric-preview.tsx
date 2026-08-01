import { readFile } from "node:fs/promises"
import path from "node:path"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Single source of truth: the same file visitors download. */
const SAMPLE_SONG_FILE = "morning-light.md"
const SAMPLE_SONG_URL = `/songs/${SAMPLE_SONG_FILE}`

export async function LyricPreview() {
  const source = await readFile(path.join(process.cwd(), "public", "songs", SAMPLE_SONG_FILE), "utf8")

  return (
    <section id="preview" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">One song, one file.</h2>
      <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Chords sit right above the words, so you can read and play at a glance. This is a real file — download it and
        open it anywhere.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
          <span className="size-3 rounded-full border border-border" />
          <span className="size-3 rounded-full border border-border" />
          <span className="size-3 rounded-full border border-border" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">{SAMPLE_SONG_FILE}</span>
        </div>
        <pre className="overflow-x-auto bg-background p-6 font-mono text-sm leading-relaxed text-foreground">
          {source.trimEnd()}
        </pre>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          render={
            <a href={SAMPLE_SONG_URL} download={SAMPLE_SONG_FILE}>
              <Download className="size-4" aria-hidden="true" />
              Download sample song
            </a>
          }
        />
        <span className="text-sm text-muted-foreground">Plain markdown, 1 KB, yours to keep.</span>
      </div>
    </section>
  )
}
