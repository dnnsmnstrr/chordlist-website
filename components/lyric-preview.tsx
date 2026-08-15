import { readFile } from "node:fs/promises"
import path from "node:path"
import { Download, Import } from "lucide-react"
import { HelpHint } from "@/components/help-hint"
import { Button } from "@/components/ui/button"
import { splitFrontmatter } from "@/lib/frontmatter"
import { siteConfig } from "@/lib/site-config"
import { homeCopy } from "@/locales/en"

/** Single source of truth: the same file visitors download. */
const SAMPLE_SONG_FILE = "morning-light.md"
const SAMPLE_SONG_URL = `/songs/${SAMPLE_SONG_FILE}`
/**
 * The app fetches the file itself, so the import link has to carry an absolute
 * URL — a relative one means nothing once the scheme hands off to the app.
 */
const SAMPLE_SONG_IMPORT_URL = `chordlist://import?url=${encodeURIComponent(`${siteConfig.url}${SAMPLE_SONG_URL}`)}`

export async function LyricPreview() {
  const source = await readFile(path.join(process.cwd(), "public", "songs", SAMPLE_SONG_FILE), "utf8")
  const { frontmatter, body } = splitFrontmatter(source)

  return (
    <section id="preview" className="mx-auto w-full max-w-5xl px-6 py-20">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        {homeCopy.lyricPreview.title}
      </h2>
      <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {homeCopy.lyricPreview.description}
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
              <a
                href={SAMPLE_SONG_URL}
                download={SAMPLE_SONG_FILE}
                aria-label={homeCopy.lyricPreview.downloadLabel}
              >
                <Download aria-hidden="true" />
                <span className="hidden sm:inline">{homeCopy.lyricPreview.download}</span>
              </a>
            }
          />
        </div>

        {frontmatter ? (
          <div className="border-b border-border bg-muted/40 px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
                {frontmatter}
              </pre>
              <HelpHint
                label={homeCopy.lyricPreview.frontmatterHelpLabel}
                text={homeCopy.lyricPreview.frontmatterHelp}
                className="-mt-1 -mr-1"
              />
            </div>
          </div>
        ) : null}

        <pre className="overflow-x-auto bg-background p-6 font-mono text-sm leading-relaxed text-foreground">
          {body}
        </pre>
      </div>

      {/* Phones only: the scheme is what the app registers, so a desktop visitor has nothing to hand it to. */}
      <div className="mt-5 flex justify-center sm:hidden">
        <a
          href={SAMPLE_SONG_IMPORT_URL}
          className="inline-flex items-center gap-2 text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          <Import aria-hidden="true" className="size-4" />
          {homeCopy.lyricPreview.openInApp}
        </a>
      </div>
    </section>
  )
}
