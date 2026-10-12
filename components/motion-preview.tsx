"use client"

import "@/lib/motion/media-base"

import { Player } from "@remotion/player"

import { CustomVideo, customDuration } from "@/video/src/motion/custom/CustomVideo"
import type { MotionDefinition } from "@/video/src/motion/custom/schema"
import { formats, FPS, type FormatName } from "@/video/src/motion/theme"

type MotionPreviewProps = {
  slug: string
  definition: MotionDefinition
  format: FormatName
}

/**
 * The definition as it will render, played in the page by Remotion's Player. Loaded on the client
 * only (see motion-editor.tsx): the compositions draw with WebGL and load their fonts on import.
 */
export function MotionPreview({ slug, definition, format }: MotionPreviewProps) {
  const { width, height } = formats[format]
  return (
    <Player
      component={CustomVideo}
      inputProps={{ slug: slug || "untitled", definition }}
      durationInFrames={customDuration(definition)}
      fps={FPS}
      compositionWidth={width}
      compositionHeight={height}
      controls
      loop
      autoPlay
      acknowledgeRemotionLicense
      style={{ width: "100%", aspectRatio: `${width} / ${height}` }}
    />
  )
}
