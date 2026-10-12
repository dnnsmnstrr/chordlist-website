import { ChevronDown } from "lucide-react"

type CollapsibleSectionProps = {
  /** A node rather than a string, so a filtered list can hand it a highlighted question. */
  title: React.ReactNode
  meta?: string
  defaultOpen?: boolean
  /** Lets a link or a search result open this answer directly. */
  id?: string
  children: React.ReactNode
}

export function CollapsibleSection({ title, meta, defaultOpen = false, id, children }: CollapsibleSectionProps) {
  return (
    <details
      id={id}
      className="group scroll-mt-24 border-b border-border outline-none transition-colors duration-500 data-[flash=true]:bg-muted/60 data-[flash=true]:duration-150 motion-reduce:transition-none"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 transition-colors marker:content-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight">{title}</span>
          {meta ? <span className="font-mono text-xs text-muted-foreground">{meta}</span> : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-8">{children}</div>
    </details>
  )
}

