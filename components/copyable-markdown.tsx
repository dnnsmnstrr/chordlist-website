"use client"

import { useEffect, useRef } from "react"

import { BlogMarkdown } from "@/components/blog-markdown"

/**
 * Rendered Markdown where every quoted block and code block gets a Copy button.
 *
 * In docs/launch-copy.md a blockquote is text ready to paste — a tagline, a post, a comment — so
 * copying it whole, without the surrounding notes, is the whole point of the page. The buttons are
 * added to the rendered HTML after mount because the Markdown is a string, not components. Wide
 * tables are wrapped so they scroll on their own rather than widening the page on a phone.
 */
export function CopyableMarkdown({ html, copyLabel, copiedLabel }: { html: string; copyLabel: string; copiedLabel: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = root.current
    if (!container) return

    for (const table of container.querySelectorAll("table")) {
      if (table.parentElement?.dataset.tableScroll) continue
      const wrapper = document.createElement("div")
      wrapper.dataset.tableScroll = "true"
      wrapper.className = "overflow-x-auto"
      table.replaceWith(wrapper)
      wrapper.append(table)
    }

    const cleanups: (() => void)[] = []
    for (const block of container.querySelectorAll<HTMLElement>("blockquote, pre")) {
      if (block.dataset.copyable) continue
      block.dataset.copyable = "true"
      block.classList.add("relative", "pr-20")

      const button = document.createElement("button")
      button.type = "button"
      button.textContent = copyLabel
      button.className =
        "absolute right-3 top-3 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground transition hover:bg-muted"

      let timeout: number | undefined
      const copy = async () => {
        // innerText keeps the paragraph breaks a post needs; the button's own label is not part of it.
        const text = block.innerText.replace(new RegExp(`^${button.textContent}\\s*`), "").trim()
        try {
          await navigator.clipboard.writeText(text)
          button.textContent = copiedLabel
          window.clearTimeout(timeout)
          timeout = window.setTimeout(() => (button.textContent = copyLabel), 1600)
        } catch {
          // Clipboard refused (an insecure context, say): select the text so it can be copied by hand.
          const range = document.createRange()
          range.selectNodeContents(block)
          window.getSelection()?.removeAllRanges()
          window.getSelection()?.addRange(range)
        }
      }
      button.addEventListener("click", copy)
      block.prepend(button)
      cleanups.push(() => {
        window.clearTimeout(timeout)
        button.removeEventListener("click", copy)
        button.remove()
        block.classList.remove("relative", "pr-20")
        delete block.dataset.copyable
      })
    }

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [html, copyLabel, copiedLabel])

  return (
    <div ref={root}>
      <BlogMarkdown html={html} />
    </div>
  )
}
