"use client"

import { useEffect, useRef } from "react"

const textures = [
  "/textures/stage-microphone.webp",
  "/textures/studio-microphone.webp",
  "/textures/sampler-and-keyboard.webp",
  "/textures/sampler-pads.webp",
] as const

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
    let pointerX = 0
    let pointerY = 0
    let scrollY = 0

    const renderMovement = () => {
      animationFrame = 0
      layer.style.setProperty("--ambient-pointer-x", `${pointerX.toFixed(2)}px`)
      layer.style.setProperty("--ambient-pointer-y", `${pointerY.toFixed(2)}px`)
      layer.style.setProperty("--ambient-scroll-y", `${scrollY.toFixed(2)}px`)
      layer.style.setProperty("--ambient-counter-x", `${(-pointerX * 0.65).toFixed(2)}px`)
      layer.style.setProperty("--ambient-counter-y", `${(-(pointerY + scrollY) * 0.55).toFixed(2)}px`)
    }

    const queueMovement = () => {
      if (animationFrame === 0) animationFrame = window.requestAnimationFrame(renderMovement)
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 4
      pointerY = (event.clientY / window.innerHeight - 0.5) * 3
      queueMovement()
    }

    const handleScroll = () => {
      const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      scrollY = (window.scrollY / scrollRange - 0.5) * 56
      queueMovement()
    }

    handleScroll()
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("scroll", handleScroll)
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <div ref={layerRef} aria-hidden="true" className="ambient-background" />
}
