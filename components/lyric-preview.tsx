import { readFile } from "node:fs/promises"
import path from "node:path"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Single source of truth: the same file visitors download. */
const SAMPLE_SONG_FILE = "morning-light.md"
const SAMPLE_SONG_URL = `/songs/${SAMPLE_SONG_FILE}`

/** Split YAML frontmatter from the song body so each can be styled on its own. */
function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: null, body: source.trim() }
  return { frontmatter: match[1].trim(), body: match[2].trim() }
}

export async function LyricPreview() {
  const source = await readFile(path.join(process.cwd(), "public", "songs", SAMPLE_SONG_FILE), "utf8")
  const { frontmatter, body } = splitFrontmatter(source)

  return (
    <section id="preview" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">One song, one file.</h2>
      <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Chords sit right above the words, so you can read and play at a glance. This is a real file — download it and
        open it anywhere.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-3 shrink-0 rounded-full border border-border" />
            <span className="size-3 shrink-0 rounded-full border border-border" />
            <span className="size-3 shrink-0 rounded-full border border-border" />
            <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{SAMPLE_SONG_FILE}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <a href={SAMPLE_SONG_URL} download={SAMPLE_SONG_FILE} aria-label="Download sample song">
                <Download aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
              </a>
            }
          />
        </div>

        {frontmatter ? (
          <div className="border-b border-border bg-muted/40 px-6 py-4">
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
              {`---\n${frontmatter}\n---`}
            </pre>
          </div>
        ) : null}

        <pre className="overflow-x-auto bg-background p-6 font-mono text-sm leading-relaxed text-foreground">
          {body}
        </pre>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">Plain markdown, yours to keep.</p>
    </section>
  )
}
