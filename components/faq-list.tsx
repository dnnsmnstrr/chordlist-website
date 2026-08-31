import type { Route } from "next"
import Link from "next/link"

import { CollapsibleSection } from "@/components/collapsible-section"
import { InlineMarkup } from "@/components/inline-markup"
import type { FaqEntry } from "@/lib/faq"

/**
 * A question-and-answer list, one collapsible section per entry, first one open.
 *
 * Shared by /faq and /support: the two pages ask different questions, but a reader who arrives at
 * either from the App Store should not be able to tell them apart by their behaviour.
 *
 * `allOpen` and `highlight` are for a filtered list — see components/faq-search.tsx.
 */
export function FaqList({
  items,
  allOpen = false,
  highlight,
}: {
  items: readonly FaqEntry[]
  allOpen?: boolean
  /** Tokens of an active search, marked wherever they appear in a question or its answer. */
  highlight?: readonly string[]
}) {
  return (
    <div className="mt-4 flex flex-col">
      {items.map((item, index) => (
        <CollapsibleSection
          key={item.question}
          title={<InlineMarkup text={item.question} highlight={highlight} />}
          defaultOpen={allOpen || index === 0}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            <InlineMarkup text={item.answer} highlight={highlight} />
          </p>
          {item.link ? <AnswerLink href={item.link.href} label={item.link.label} /> : null}
        </CollapsibleSection>
      ))}
    </div>
  )
}

function AnswerLink({ href, label }: { href: string; label: string }) {
  const className =
    "mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"

  // A mailto opens the reader's mail client, not a tab: target="_blank" would leave an empty one
  // behind on the browsers that honour it.
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }

  if (!href.startsWith("/")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    )
  }

  // The href arrives as copy, so typedRoutes never sees the literal and cannot check it. Internal
  // targets here are ordinary site routes — check one by following it after changing the copy.
  return (
    <Link href={href as Route} className={className}>
      {label}
    </Link>
  )
}
