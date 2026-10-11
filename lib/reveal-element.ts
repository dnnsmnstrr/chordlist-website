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

function isFocusable(element: HTMLElement): boolean {
  return element.matches("a[href], button, input, select, textarea, summary, details, [tabindex]")
}
