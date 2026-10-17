import launchManifest from "@/public/video/launch/manifest.json"
import customManifest from "@/public/motion/manifest.json"
import socialManifest from "@/public/social/manifest.json"
import suiteManifest from "@/public/video/motion/manifest.json"
import { motionLibraryCopy } from "@/locales/en"

// What /motion/library lists: the launch videos from public/video/launch/manifest.json (written by
// `node brag-output/work/publish.mjs`), the motion suite from public/video/motion/manifest.json
// (written by `pnpm video:render:motion`), and the editor's videos from public/motion/manifest.json
// (written by `pnpm build:motion`). All three are generated from the files actually rendered, so the
// page never offers a download that is not there.

export type LibraryFormat = "story" | "post" | "wide" | "square"

export type LibraryOutput = {
  format: LibraryFormat
  video: string
  poster: string
  /** Absent for the editor's videos, whose manifest does not record it. */
  bytes?: number
}

export type LibraryItem = {
  slug: string
  title: string
  description: string
  seconds: number
  outputs: LibraryOutput[]
  /** The words to post with it, when a still or a definition already has them. */
  caption?: { text: string; source: string }
}

type PieceSlug = keyof typeof motionLibraryCopy.pieces
type LaunchSlug = keyof typeof motionLibraryCopy.launch

// A piece that says what a still says posts with that still's caption, so the reviewed wording is
// reused rather than rewritten. The pairs are the twins listed in docs/motion-suite.md.
const twins: Partial<Record<PieceSlug, string>> = {
  "same-chords": "matching-progressions",
  "chord-keys": "chord-keyboard",
  "screen-wall": "local-first-songbook",
  manifesto: "local-first-songbook",
  "launch-card": "out-now",
  "feature-reel": "song-library",
}

const isPiece = (slug: string): slug is PieceSlug => slug in motionLibraryCopy.pieces
const isLaunch = (slug: string): slug is LaunchSlug => slug in motionLibraryCopy.launch

function socialCaption(slug: string | undefined) {
  const still = slug ? socialManifest.find((entry) => entry.slug === slug) : undefined
  return still?.caption ? { text: still.caption, source: motionLibraryCopy.captionFrom(still.slug) } : undefined
}

/** The launch videos, one per soundtrack, posted with the launch share copy. */
export function launchItems(): LibraryItem[] {
  return launchManifest.flatMap((piece) => {
    // Left out until it has copy, like a suite piece; tests/motion-library.test.ts fails meanwhile.
    if (!isLaunch(piece.slug)) return []
    const copy = motionLibraryCopy.launch[piece.slug]
    return [
      {
        slug: piece.slug,
        title: copy.title,
        description: copy.description,
        seconds: piece.seconds,
        outputs: piece.formats.map(({ format, video, poster, bytes }) => ({
          format: format as LibraryFormat,
          video,
          poster,
          bytes,
        })),
        caption: piece.caption ? { text: piece.caption, source: motionLibraryCopy.launchCaption } : undefined,
      },
    ]
  })
}

/** The motion suite, in the order MotionRoot registers it. */
export function suiteItems(): LibraryItem[] {
  return suiteManifest.flatMap((piece) => {
    // A piece rendered before its copy was written is left out rather than shown untitled;
    // tests/motion-library.test.ts fails until it has copy.
    if (!isPiece(piece.slug)) return []
    const copy = motionLibraryCopy.pieces[piece.slug]
    return [
      {
        slug: piece.slug,
        title: copy.title,
        description: copy.description,
        seconds: piece.seconds,
        outputs: piece.formats.map(({ format, video, poster, bytes }) => ({
          format: format as LibraryFormat,
          video,
          poster,
          bytes,
        })),
        caption: socialCaption(twins[piece.slug]),
      },
    ]
  })
}

/** Videos made with the /motion editor, titled by their headline and posted with their caption. */
export function customItems(): LibraryItem[] {
  return customManifest
    .filter((entry) => entry.outputs.length > 0)
    .map((entry) => ({
      slug: entry.slug,
      title: entry.headline.join(" "),
      description: "",
      seconds: entry.seconds,
      outputs: entry.outputs.map(({ format, video, poster }) => ({ format: format as LibraryFormat, video, poster })),
      caption: entry.caption ? { text: entry.caption, source: entry.slug } : undefined,
    }))
}
