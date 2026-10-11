"use client"

import { useEffect } from "react"

import { revealElement } from "@/lib/reveal-element"

/**
 * Opens and reveals the element the URL's fragment names, on arrival and whenever it changes.
 *
 * A browser scrolls to `#id` by itself, but leaves a closed `<details>` closed — so a link from the
 * site-wide search to one answer would land on a bare question. Pages whose answers are collapsible
 * call this once; anything that is not an element id, like a sign-in token, finds nothing and is
 * left alone.
 */
export function useRevealHashTarget(): void {
  useEffect(() => {
    function reveal() {
      let id: string
      try {
        id = decodeURIComponent(window.location.hash.slice(1))
      } catch {
        return
      }
      const target = id === "" ? null : document.getElementById(id)
      if (!target) return

      if (target instanceof HTMLDetailsElement) target.open = true
      // After layout, so the scroll accounts for the answer that just opened.
      window.requestAnimationFrame(() => revealElement(target, "start"))
    }

    reveal()
    window.addEventListener("hashchange", reveal)
    return () => window.removeEventListener("hashchange", reveal)
  }, [])
}
