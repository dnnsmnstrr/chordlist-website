// Points the motion compositions' media at the wizard's local media route. Imported for its side
// effect before any composition module, because the fonts start loading the moment theme.ts runs.
import "@/video/src/motion/custom/media"

if (typeof window !== "undefined") window.chordlistMotionMediaBase = "/api/motion/media/"
