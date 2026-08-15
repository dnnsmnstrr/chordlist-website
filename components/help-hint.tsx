"use client"

import { Popover } from "@base-ui/react/popover"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type HelpHintProps = {
  /** Accessible name for the trigger — the tooltip text itself is not announced until it opens. */
  label: string
  text: string
  className?: string
}

/**
 * A question-mark hint that opens on hover *and* on tap. A bare `title` attribute
 * never appears on touch devices, which is where most of this page is read.
 */
export function HelpHint({ label, text, className }: HelpHintProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={100}
        aria-label={label}
        className={cn(
          "inline-flex size-6 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:text-foreground",
          className,
        )}
      >
        <HelpCircle className="size-4" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" align="end" sideOffset={8} collisionPadding={16} className="z-50">
          <Popover.Popup className="max-w-72 text-pretty rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md">
            {text}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
