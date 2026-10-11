/**
 * Scrolls an element into view and marks it with `data-flash` for a moment, so the eye lands on
 * the thing a link pointed at rather than somewhere near it. Style the flash with
 * `data-[flash=true]:…`; it is removed again after `FLASH_MS`.
 *
 * Smooth scrolling is skipped for readers who ask for reduced motion. Focus moves to the element
 * without a second scroll, so keyboard and screen-reader users continue from where they landed.
 */
const FLASH_MS = 1600

const flashTimers = new WeakMap<HTMLElement, number>()

export function revealElement(target: HTMLElement, block: ScrollLogicalPosition = "nearest"): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block })
  settleOn(target, block)

  if (!target.hasAttribute("tabindex") && !isFocusable(target)) target.setAttribute("tabindex", "-1")
  target.focus({ preventScroll: true })

  // Cleared first and set on the next frame, so a second tap on the same marker restarts the flash
  // instead of leaving it switched on.
  window.clearTimeout(flashTimers.get(target))
  target.dataset.flash = "false"
  window.requestAnimationFrame(() => {
    target.dataset.flash = "true"
    flashTimers.set(
      target,
      window.setTimeout(() => {
        delete target.dataset.flash
      }, FLASH_MS),
    )
  })
}

/**
 * Re-aims once the scroll has finished, if the layout moved while it ran. On a phone the docs'
 * "On this page" panel collapses itself on the first scroll, pulling everything below it up by its
 * own height mid-flight, so the first aim overshoots the target by exactly that much.
 */
function settleOn(target: HTMLElement, block: ScrollLogicalPosition): void {
  let settled = false
  let sawScroll = false
  let lastScroll = performance.now()
  const startedAt = lastScroll

  const finish = () => {
    settled = true
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("scrollend", check)
  }

  const onScroll = () => {
    sawScroll = true
    lastScroll = performance.now()
  }

  const check = () => {
    if (settled) return
    finish()

    const rect = target.getBoundingClientRect()
    const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const isOff =
      block === "start"
        ? Math.abs(rect.top - marginTop) > 8
        : rect.bottom < 0 || rect.top > window.innerHeight
    if (isOff) target.scrollIntoView({ behavior: "auto", block })
  }

  window.addEventListener("scroll", onScroll, { passive: true })

  // Held in a variable: as an inline `in` check, TypeScript narrows `window` to never after it.
  const supportsScrollEnd = "onscrollend" in window
  if (supportsScrollEnd) {
    window.addEventListener("scrollend", check)
    // Nothing had to move, so no scrollend is coming; stop listening.
    window.setTimeout(() => {
      if (!sawScroll && !settled) finish()
    }, 2000)
    return
  }

  // Without scrollend, re-aim once a scroll has started and then stopped. Re-aiming before a smooth
  // scroll gets going, or while it runs, does not cancel it: it carries on by its full distance from
  // wherever the page now is, and overshoots.
  const pollUntilStill = () => {
    if (settled) return
    const now = performance.now()
    if (sawScroll && now - lastScroll > 200) check()
    else if (now - startedAt > 4000) finish()
    else window.setTimeout(pollUntilStill, 100)
  }
  window.setTimeout(pollUntilStill, 100)
}

function isFocusable(element: HTMLElement): boolean {
  return element.matches("a[href], button, input, select, textarea, summary, details, [tabindex]")
}
