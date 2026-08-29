"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { copyReviewCopy } from "@/locales/en"

export type CopyVariantColumn = {
  id: string
  name: string
  role: string
  summary: string
  risk: string
  active: boolean
}

export type CopyVariantCell = {
  variant: string
  text: string
  /** False when this variant repeats the shipping wording, which is most cells. */
  changed: boolean
}

export type CopyVariantRow = {
  label: string
  cells: readonly CopyVariantCell[]
}

export type CopyVariantLanguage = {
  code: string
  name: string
  rows: readonly CopyVariantRow[]
}

/**
 * The three wordings, field by field.
 *
 * Client-side only for the language switch: the whole comparison for every language is rendered on
 * the server and this picks which one is on screen, so the page stays static and a reader with no
 * JavaScript still gets the first language.
 */
export function CopyVariantReview({
  languages,
  variants,
}: {
  languages: readonly CopyVariantLanguage[]
  variants: readonly CopyVariantColumn[]
}) {
  const [code, setCode] = useState(languages[0]?.code ?? "en")
  const shown = languages.find((language) => language.code === code) ?? languages[0]

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={cn(
              "rounded-xl border p-5",
              variant.active ? "border-foreground bg-muted/40" : "border-border",
            )}
          >
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>{variant.id}</span>
              {variant.active ? (
                <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] tracking-normal text-background">
                  {copyReviewCopy.activeLabel}
                </span>
              ) : null}
            </p>
            <h2 className="mt-3 font-medium">{variant.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{variant.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-mono text-xs uppercase tracking-widest">{variant.role}</span> — {variant.risk}
            </p>
          </div>
        ))}
      </div>

      {languages.length > 1 ? (
        <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label={copyReviewCopy.languageLabel}>
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setCode(language.code)}
              aria-pressed={language.code === code}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs",
                language.code === code
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground",
              )}
            >
              {language.name}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-sm text-muted-foreground">{copyReviewCopy.unchangedHint}</p>

      <div className="mt-6 space-y-px overflow-hidden rounded-xl border border-border bg-border">
        {shown?.rows.map((row) => (
          <div key={row.label} className="bg-background p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{row.label}</p>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              {row.cells.map((cell) => (
                <div key={cell.variant}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {cell.variant}
                    {cell.changed ? "" : ` · ${copyReviewCopy.unchangedLabel}`}
                  </p>
                  <p
                    className={cn(
                      "mt-1 whitespace-pre-line text-pretty text-sm leading-relaxed",
                      cell.changed ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {cell.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
