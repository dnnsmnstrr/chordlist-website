"use client"

import { revealElement } from "@/lib/reveal-element"

type DocsMarkerLinkProps = {
  /** The id of the element this marker pairs with — a callout in the list, or a marker on a screenshot. */
  targetId: string
  label: string
  className?: string
  children: React.ReactNode
}

/**
 * One end of a screenshot marker and its explanation, linked both ways.
 *
 * On a phone the list sits below the screenshot, so a number on the image is far from the words
 * about it; tapping either end brings the other into view and flashes it. A plain fragment link
 * underneath means it still works before hydration, and "nearest" scrolling leaves the page alone
 * on a wide screen where both are already visible.
 */
export function DocsMarkerLink({ targetId, label, className, children }: DocsMarkerLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      aria-label={label}
      className={className}
      onClick={(event) => {
        const target = document.getElementById(targetId)
        if (!target) return
        event.preventDefault()
        revealElement(target)
      }}
    >
      {children}
    </a>
  )
}
