"use client"

import { useEffect, useRef } from "react"

const textures = [
  "/textures/stage-microphone.webp",
  "/textures/studio-microphone.webp",
  "/textures/sampler-and-keyboard.webp",
  "/textures/sampler-pads.webp",
] as const

/*
 * The layers chase their targets in one animation loop rather than through a CSS
 * transition. A transition whose target moves every frame keeps re-easing from a
 * standstill, and a wheel scroll — which arrives as a burst of large discrete
 * jumps — turns that into visible stutter. These are per-second decay rates fed
 * through an exponential, so the motion is identical on a 60Hz and a 144Hz display.
 */
const pointerFollow = 9
const scrollFollow = 5

// Below this, the remaining distance is far under a device pixel: snap and stop the loop.
const settleThreshold = 0.02

/*
 * A backgrounded tab resumes with a frame delta of seconds; clamp it so the layers
 * ease back in rather than lurching. Kept well above a slow frame so a machine that
 * is genuinely dropping to 15fps still eases at the same wall-clock rate as a fast one.
 */
const maximumFrameSeconds = 1 / 10

const pointerTravelX = 4
const pointerTravelY = 3
const scrollTravel = 56

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum)
}

export function AmbientBackground() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (layer === null) return

    const firstIndex = Math.floor(Math.random() * textures.length)
    const secondIndex = (firstIndex + 1 + Math.floor(Math.random() * (textures.length - 1))) % textures.length

    layer.style.setProperty("--ambient-texture-one", `url("${textures[firstIndex]}")`)
    layer.style.setProperty("--ambient-texture-two", `url("${textures[secondIndex]}")`)
    layer.style.setProperty("--ambient-texture-one-x", `${randomBetween(18, 82).toFixed(1)}%`)
    layer.style.setProperty("--ambient-texture-one-y", `${randomBetween(12, 68).toFixed(1)}%`)
    layer.style.setProperty("--ambient-texture-two-x", `${randomBetween(18, 82).toFixed(1)}%`)
    layer.style.setProperty("--ambient-texture-two-y", `${randomBetween(32, 88).toFixed(1)}%`)
    layer.style.setProperty("--ambient-texture-one-scale", randomBetween(1.06, 1.2).toFixed(3))
    layer.style.setProperty("--ambient-texture-two-scale", randomBetween(1.08, 1.24).toFixed(3))
    layer.style.setProperty("--ambient-texture-one-rotation", `${randomBetween(-4, 4).toFixed(2)}deg`)
    layer.style.setProperty("--ambient-texture-two-rotation", `${randomBetween(-5, 5).toFixed(2)}deg`)
    layer.style.setProperty("--ambient-gradient-one-x", `${randomBetween(12, 88).toFixed(1)}%`)
    layer.style.setProperty("--ambient-gradient-one-y", `${randomBetween(8, 52).toFixed(1)}%`)
    layer.style.setProperty("--ambient-gradient-two-x", `${randomBetween(8, 92).toFixed(1)}%`)
    layer.style.setProperty("--ambient-gradient-two-y", `${randomBetween(48, 92).toFixed(1)}%`)
    layer.style.setProperty("--ambient-gradient-angle", `${randomBetween(118, 242).toFixed(1)}deg`)
    layer.dataset.ready = "true"

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotion.matches) return

    let animationFrame = 0
    let lastTimestamp = 0
    let scrollSpan = 1
    let targetPointerX = 0
    let targetPointerY = 0
    let targetScrollY = 0
    let pointerX = 0
    let pointerY = 0
    let scrollY = 0

    /*
     * scrollHeight forces a layout flush, so it is measured on resize instead of
     * inside the scroll listener, where it used to run once per scroll event.
     */
    const measureScrollSpan = () => {
      scrollSpan = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    }

    const readScrollTarget = () => (window.scrollY / scrollSpan - 0.5) * scrollTravel

    const write = () => {
      const shiftY = pointerY + scrollY
      layer.style.setProperty("--ambient-shift-x", `${pointerX.toFixed(2)}px`)
      layer.style.setProperty("--ambient-shift-y", `${shiftY.toFixed(2)}px`)
      layer.style.setProperty("--ambient-counter-x", `${(-pointerX * 0.65).toFixed(2)}px`)
      layer.style.setProperty("--ambient-counter-y", `${(-shiftY * 0.55).toFixed(2)}px`)
    }

    const step = (timestamp: number) => {
      const elapsed =
        lastTimestamp === 0 ? 1 / 60 : Math.min((timestamp - lastTimestamp) / 1000, maximumFrameSeconds)
      lastTimestamp = timestamp

      // Sampled per painted frame rather than per scroll event: one read, and always
      // the position this frame is actually going to show.
      targetScrollY = readScrollTarget()

      const pointerEase = 1 - Math.exp(-pointerFollow * elapsed)
      const scrollEase = 1 - Math.exp(-scrollFollow * elapsed)
      pointerX += (targetPointerX - pointerX) * pointerEase
      pointerY += (targetPointerY - pointerY) * pointerEase
      scrollY += (targetScrollY - scrollY) * scrollEase

      const settled =
        Math.abs(targetPointerX - pointerX) < settleThreshold &&
        Math.abs(targetPointerY - pointerY) < settleThreshold &&
        Math.abs(targetScrollY - scrollY) < settleThreshold

      if (settled) {
        pointerX = targetPointerX
        pointerY = targetPointerY
        scrollY = targetScrollY
        animationFrame = 0
        lastTimestamp = 0
      } else {
        animationFrame = window.requestAnimationFrame(step)
      }

      write()
    }

    const startMovement = () => {
      if (animationFrame !== 0) return
      lastTimestamp = 0
      animationFrame = window.requestAnimationFrame(step)
    }

    const handlePointerMove = (event: PointerEvent) => {
      targetPointerX = (event.clientX / window.innerWidth - 0.5) * pointerTravelX
      targetPointerY = (event.clientY / window.innerHeight - 0.5) * pointerTravelY
      startMovement()
    }

    const handleResize = () => {
      measureScrollSpan()
      startMovement()
    }

    measureScrollSpan()
    targetScrollY = readScrollTarget()
    scrollY = targetScrollY
    write()

    // The document grows as images and fonts land, which moves the scroll span.
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(document.documentElement)

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("scroll", startMovement, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("scroll", startMovement)
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <div ref={layerRef} aria-hidden="true" className="ambient-background" />
}
