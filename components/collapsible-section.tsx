"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type CollapsibleSectionProps = {
  title: string
  /** Optional short hint shown next to the title, e.g. a count. */
  meta?: string
  /** Open on first render. */
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({ title, meta, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <section className="border-b border-border">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight">{title}</span>
            {meta ? <span className="font-mono text-xs text-muted-foreground">{meta}</span> : null}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
      </h2>

      <div id={panelId} hidden={!open} className="pb-8">
        {children}
      </div>
    </section>
  )
}
