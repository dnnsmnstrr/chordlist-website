"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, Copy, Download, FileUp, Sparkles, X } from "lucide-react"

import { InlineMarkup } from "@/components/inline-markup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { readChordPro, renderChordlistMarkdown, type ChordlistOutputMode } from "@/lib/vendor/chordpro"
import { chordProCopy } from "@/locales/en"

/** A song is a few kilobytes; anything past this is not one. */
const maximumFileBytes = 1024 * 1024

type ChordProConverterProps = {
  /** `public/songs/morning-light.pro`, read on the server so the example needs no request. */
  sample: string
  sampleFileName: string
}

/**
 * Converts ChordPro into a chordlist song file as it is typed. The reading is the shared module in
 * `lib/vendor/chordpro.ts` — the same code the backend's importer runs — so the converter and the
 * importer agree on what a ChordPro file means. Nothing leaves the browser.
 */
export function ChordProConverter({ sample, sampleFileName }: ChordProConverterProps) {
  const copy = chordProCopy
  const inputId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState("")
  const [fileName, setFileName] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState<ChordlistOutputMode>("song")
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  // What was last copied, so the confirmation lapses by itself once the output no longer matches.
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null)
  const copyTimeout = useRef<number | undefined>(undefined)

  const result = useMemo(() => {
    if (source.trim().length === 0) return null
    const document = readChordPro(source)
    return { document, output: renderChordlistMarkdown(document, { mode, fileName }) }
  }, [source, mode, fileName])

  useEffect(() => () => window.clearTimeout(copyTimeout.current), [])

  const copyState =
    copied === null || copied.text !== result?.output.markdown ? "idle" : copied.ok ? "copied" : "failed"

  async function openFile(file: File | undefined) {
    if (!file) return
    setFileError(null)
    if (file.size > maximumFileBytes) {
      setFileError(copy.input.tooLarge)
      return
    }
    try {
      setSource(await file.text())
      setFileName(file.name)
    } catch {
      setFileError(copy.input.unreadable)
    }
  }

  async function copyOutput() {
    if (!result) return
    const text = result.output.markdown
    let ok = true
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      ok = false
    }
    setCopied({ text, ok })
    window.clearTimeout(copyTimeout.current)
    copyTimeout.current = window.setTimeout(() => setCopied(null), 1600)
  }

  function downloadOutput() {
    if (!result) return
    const url = URL.createObjectURL(new Blob([result.output.markdown], { type: "text/markdown;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = result.output.fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const output = result?.output
  const sectionCount = result?.document.blocks.filter((block) => block.section !== null).length ?? 0
  const hasChords = (output?.sections.length ?? 0) > 0
  const savePath = output ? [output.artist, output.fileName].filter(Boolean).join("/") : ""

  return (
    <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
      <section aria-labelledby={`${inputId}-label`} className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label id={`${inputId}-label`} htmlFor={inputId} className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {copy.input.label}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
              <FileUp aria-hidden="true" />
              {copy.input.openFile}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSource(sample)
                setFileName(sampleFileName)
                setFileError(null)
              }}
            >
              <Sparkles aria-hidden="true" />
              {copy.input.sample}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={source.length === 0}
              onClick={() => {
                setSource("")
                setFileName(undefined)
                setFileError(null)
              }}
            >
              <X aria-hidden="true" />
              {copy.input.clear}
            </Button>
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".pro,.cho,.chopro,.chordpro,.crd,.txt,text/plain"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            void openFile(event.target.files?.[0])
            event.target.value = ""
          }}
        />
        <textarea
          id={inputId}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void openFile(event.dataTransfer.files[0])
          }}
          placeholder={copy.input.placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-describedby={`${inputId}-hint`}
          className={cn(
            "min-h-[24rem] w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-base leading-relaxed text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 pointer-fine:text-sm lg:min-h-[32rem]",
            dragging && "border-ring bg-muted/40",
          )}
        />
        <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
          {fileError ?? copy.input.dropHint}
        </p>
      </section>

      <section aria-labelledby={`${inputId}-output`} className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${inputId}-output`} className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {copy.output.label}
          </h2>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2">
            <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
              {output ? output.fileName : "song.md"}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" disabled={!output} onClick={() => void copyOutput()}>
                {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copyState === "copied" ? copy.output.copied : copy.output.copy}
              </Button>
              <Button size="sm" variant="outline" disabled={!output} onClick={downloadOutput}>
                <Download aria-hidden="true" />
                {copy.output.download}
              </Button>
            </div>
          </div>
          {output ? (
            <>
              {output.frontmatter ? (
                <pre className="overflow-x-auto border-b border-border bg-muted/40 px-5 py-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {`---\n${output.frontmatter}\n---`}
                </pre>
              ) : null}
              <pre className="max-h-[40rem] min-h-[16rem] overflow-auto bg-background p-5 font-mono text-sm leading-relaxed text-foreground">
                {output.body}
              </pre>
            </>
          ) : (
            <p className="flex min-h-[24rem] items-center justify-center p-6 text-center text-sm text-muted-foreground lg:min-h-[32rem]">
              {copy.output.empty}
            </p>
          )}
        </div>

        <div aria-live="polite" className="flex flex-col gap-1 text-sm text-muted-foreground">
          {copyState === "failed" ? <p>{copy.output.copyFailed}</p> : null}
          {result ? (
            hasChords ? (
              <>
                <p>
                  {[
                    copy.summary.sections(sectionCount),
                    copy.summary.progressions(output?.sections.length ?? 0),
                    result.document.skippedAnnotations > 0
                      ? copy.summary.annotations(result.document.skippedAnnotations)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {output?.artist ? null : (
                  <p>
                    <InlineMarkup text={copy.summary.noArtist} />
                  </p>
                )}
                <p>
                  <InlineMarkup text={copy.output.saveAs(savePath)} />
                </p>
              </>
            ) : (
              <p>
                <InlineMarkup text={copy.summary.noChords} />
              </p>
            )
          ) : null}
        </div>
      </section>
    </div>
  )
}

function ModeToggle({ mode, onChange }: { mode: ChordlistOutputMode; onChange: (mode: ChordlistOutputMode) => void }) {
  const options = [
    { value: "song", label: chordProCopy.mode.song, hint: chordProCopy.mode.songHint },
    { value: "progressions", label: chordProCopy.mode.progressions, hint: chordProCopy.mode.progressionsHint },
  ] as const

  return (
    <div role="radiogroup" aria-label={chordProCopy.mode.label} className="inline-flex rounded-lg border border-border p-0.5">
      {options.map((option) => {
        const selected = option.value === mode
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 rounded-md px-3 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
