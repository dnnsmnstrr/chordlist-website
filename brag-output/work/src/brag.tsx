import type {CSSProperties, ReactNode} from "react"
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion"
import {PaperBackground} from "../../../video/src/ChordlistDemo"
import {AssemblingTile} from "../../../video/src/motion/mark"
import {ChordPill, Lockup, Phone, RiseText, SCREEN_ASPECT, progressAt} from "../../../video/src/motion/primitives"
import {morningLightFile, romanNumerals} from "../../../video/src/motion/song"
import {easeInOut, mono, paletteFor, sans} from "../../../video/src/motion/theme"

// 100 bpm at 30 fps: one beat is 18 frames, one bar 72. Every scene boundary sits on the grid, so
// the soundtrack (work/audio.mjs) shares these numbers.
export const S = {
  hook: {from: 0, len: 72},
  reveal: {from: 72, len: 144},
  transpose: {from: 216, len: 108},
  scroll: {from: 324, len: 108},
  matching: {from: 432, len: 108},
  outro: {from: 540, len: 132},
} as const
export const TOTAL = S.outro.from + S.outro.len

const palette = paletteFor("warm-stage")

const phoneWidth = (height: number) =>
  Math.round((height - 2 * Math.round(height * 0.012)) * SCREEN_ASPECT) + 2 * Math.round(height * 0.012)

type Place = {x: number; y: number; scale: number}
type Lines = string[]

/**
 * Everything that moves between the 16:9 master and the 9:16 story cut. The wide layout is a
 * headline column, an illustration column, and the phone on the right; the story stacks the
 * headline over the phone and keeps Instagram's profile row (top 190) and reply bar (bottom 240)
 * clear, as `formats.story` in video/src/motion/theme.ts does.
 */
type Layout = {
  W: number
  H: number
  left: number
  /** Headline box: vertically centered in the frame (wide) or anchored at `top` (story). */
  headlineTop: number | null
  lockupTop: number
  phone: {height: number; x: number; y: number; centerX: number; arriveDelay: number}
  file: {from: Place; to: Place}
  sub: {left: number; top: number; width: number; size: number}
  transposeArt: {x: number; y: number}
  matchingArt: {x: number; y: number}
  headlines: Record<"hook" | "reveal" | "transpose" | "scroll" | "matching", {lines: Lines; size: number}>
  outro: {tile: number; word: number; tagline: Lines; taglineSize: number; badge: number; note: number; stackNote: boolean}
}

const WIDE_PHONE = 940
const wide: Layout = {
  W: 1920,
  H: 1080,
  left: 120,
  headlineTop: null,
  lockupTop: 72,
  phone: {
    height: WIDE_PHONE,
    x: 1920 - 120 - phoneWidth(WIDE_PHONE),
    y: (1080 - WIDE_PHONE) / 2,
    centerX: (760 + 1920 - 120) / 2 - phoneWidth(WIDE_PHONE) / 2,
    arriveDelay: 0,
  },
  file: {from: {x: 1010, y: 140, scale: 1}, to: {x: 740, y: 140, scale: 1}},
  sub: {left: 120, top: 1080 / 2 + 76, width: 560, size: 34},
  transposeArt: {x: 780, y: 470},
  matchingArt: {x: 700, y: 330},
  headlines: {
    hook: {lines: ["This is", "a song."], size: 104},
    reveal: {lines: ["So is this."], size: 104},
    transpose: {lines: ["Change key", "with one tap."], size: 84},
    scroll: {lines: ["Press play.", "Hands stay on", "the strings."], size: 84},
    matching: {lines: ["See what", "else you can", "already play."], size: 72},
  },
  outro: {
    tile: 170,
    word: 64,
    tagline: ["Your lyrics and chords, as files in your pocket."],
    taglineSize: 60,
    badge: 80,
    note: 28,
    stackNote: false,
  },
}

const STORY_PHONE = 1000
const story: Layout = {
  W: 1080,
  H: 1920,
  left: 80,
  headlineTop: 320,
  lockupTop: 200,
    // The phone waits for the file to shrink out of its way, which takes the full width here.
  phone: {
    height: STORY_PHONE,
    x: 1080 - 80 - phoneWidth(STORY_PHONE),
    y: 680,
    centerX: (1080 - phoneWidth(STORY_PHONE)) / 2,
    arriveDelay: 10,
  },
  file: {from: {x: 220, y: 660, scale: 1.2}, to: {x: 80, y: 868, scale: 0.78}},
  sub: {left: 80, top: 480, width: 700, size: 38},
  transposeArt: {x: 80, y: 1100},
  matchingArt: {x: 80, y: 950},
  headlines: {
    hook: {lines: ["This is", "a song."], size: 128},
    reveal: {lines: ["So is this."], size: 120},
    transpose: {lines: ["Change key", "with one tap."], size: 96},
    scroll: {lines: ["Press play.", "Hands stay on", "the strings."], size: 96},
    matching: {lines: ["See what", "else you can", "already play."], size: 96},
  },
  outro: {
    tile: 200,
    word: 72,
    tagline: ["Your lyrics and chords,", "as files in your pocket."],
    taglineSize: 68,
    badge: 88,
    note: 30,
    stackNote: true,
  },
}

function useLayout() {
  const {width, height} = useVideoConfig()
  return height > width ? story : wide
}

// Only Morning Light's words appear: chordlist's own fixture song. The excerpt runs through verse 1.
const excerpt = morningLightFile.slice(0, morningLightFile.indexOf("Morning came around a little soon") + 1)
const frontmatterEnd = excerpt.indexOf("---", 1)
const lineStarts = excerpt.map((_, index) => excerpt.slice(0, index).reduce((sum, line) => sum + line.length + 1, 0))
const totalChars = excerpt.reduce((sum, line) => sum + line.length + 1, 0)

function clip(name: string) {
  return staticFile(`generated/dark/${name}.mp4`)
}

function Headline({scene, exitAt, start = 4, lines: override}: {scene: keyof Layout["headlines"]; exitAt?: number; start?: number; lines?: Lines}) {
  const layout = useLayout()
  const {lines: authored, size} = layout.headlines[scene]
  const lines = override ?? authored
  const box: CSSProperties =
    layout.headlineTop === null
      ? {top: 0, height: layout.H, display: "flex", alignItems: "center"}
      : {top: layout.headlineTop}
  return (
    <div style={{position: "absolute", left: layout.left, ...box}}>
      <RiseText text={lines} start={start} palette={palette} size={size} stagger={2} exitAt={exitAt} lineHeight={1.08} />
    </div>
  )
}

function Sub({children, start, exitAt}: {children: ReactNode; start: number; exitAt: number}) {
  const frame = useCurrentFrame()
  const {sub} = useLayout()
  const enter = progressAt(frame, start, 20)
  const exit = progressAt(frame, exitAt, 12)
  return (
    <div
      style={{
        position: "absolute",
        left: sub.left,
        top: sub.top,
        width: sub.width,
        fontFamily: sans,
        fontSize: sub.size,
        lineHeight: 1.4,
        color: palette.muted,
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 16}px)`,
      }}
    >
      {children}
    </div>
  )
}

/** The Markdown file typing itself, set like the repo's `file` social template. */
function FileExcerpt({typed}: {typed: number}) {
  const frame = useCurrentFrame()
  const caretOn = Math.floor(frame / 8) % 2 === 0
  const caretLine = excerpt.findIndex((line, index) => typed <= (lineStarts[index] ?? 0) + line.length)
  return (
    <div style={{fontFamily: mono, fontSize: 24, lineHeight: 1.45, whiteSpace: "pre", color: palette.text}}>
      <div style={{color: palette.muted, paddingBottom: 12, marginBottom: 18, borderBottom: `1px solid ${palette.rule}`}}>
        morning-light.md
      </div>
      {excerpt.map((line, index) => {
        const shown = line.slice(0, Math.max(0, Math.min(line.length, typed - (lineStarts[index] ?? 0))))
        const isCurrent = index === caretLine
        return (
          <div key={index} style={{height: 35, color: index <= frontmatterEnd ? palette.muted : palette.text}}>
            {shown}
            {isCurrent ? (
              <span
                style={{
                  display: "inline-block",
                  width: 13,
                  height: 26,
                  verticalAlign: "middle",
                  backgroundColor: palette.text,
                  opacity: caretOn ? 0.75 : 0,
                }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/** A simulated touch on the recording, in the capture's own 1242 × 2688 pixel space. */
function Tap({x, y, at}: {x: number; y: number; at: number}) {
  const frame = useCurrentFrame()
  const press = progressAt(frame, at, 4)
  const release = progressAt(frame, at + 4, 9)
  if (frame < at || release >= 1) return null
  const size = interpolate(release, [0, 1], [70, 130])
  return (
    <div
      style={{
        position: "absolute",
        left: `${(x / 1242) * 100}%`,
        top: `${(y / 2688) * 100}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: 999,
        backgroundColor: "rgba(250,250,248,0.32)",
        border: "2px solid rgba(250,250,248,0.6)",
        opacity: press * (1 - release),
      }}
    />
  )
}

function ClipSequence({from, len, name, trim, children}: {from: number; len: number; name: string; trim: number; children?: ReactNode}) {
  return (
    <Sequence from={from} durationInFrames={len} layout="absolute-fill">
      <OffthreadVideo src={clip(name)} muted trimBefore={trim} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      {children}
    </Sequence>
  )
}

/** The one phone that carries every recording from the reveal to the outro. */
function PhoneTrack() {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()
  const {W, phone} = useLayout()
  const arrive = spring({frame: frame - S.reveal.from - phone.arriveDelay, fps, config: {damping: 20, stiffness: 90}})
  const toCenter = progressAt(frame, S.scroll.from - 4, 22, easeInOut)
  const back = progressAt(frame, S.matching.from - 4, 22, easeInOut)
  const leave = progressAt(frame, S.outro.from, 18, easeInOut)
  const x =
    phone.x +
    interpolate(arrive, [0, 1], [W * 0.55, 0]) +
    (phone.centerX - phone.x) * (toCenter - back) +
    leave * (W - phone.x + 40)
  if (frame < S.reveal.from) return null
  return (
    <div style={{position: "absolute", left: x, top: phone.y}}>
      <Phone palette={palette} height={phone.height}>
        <ClipSequence from={S.reveal.from} len={S.reveal.len} name="10-song-opens" trim={42}>
          <Tap x={400} y={1785} at={29} />
        </ClipSequence>
        <ClipSequence from={S.transpose.from} len={S.transpose.len} name="11-transpose-control" trim={42}>
          <Tap x={380} y={2330} at={29} />
        </ClipSequence>
        <ClipSequence from={S.scroll.from} len={S.scroll.len} name="16-hands-free-autoscroll" trim={90} />
        <ClipSequence from={S.matching.from} len={S.matching.len + 20} name="07-matching-songs" trim={148}>
          <Tap x={400} y={2048} at={53} />
        </ClipSequence>
      </Phone>
    </div>
  )
}

/** A chord capsule whose label rolls up to a new one at `at`. */
function RollingPill({from, to, at, size = 34, width, style}: {from: string; to: string; at: number; size?: number; width?: number; style?: CSSProperties}) {
  const frame = useCurrentFrame()
  const roll = progressAt(frame, at, 14)
  const longest = from.length > to.length ? from : to
  return (
    <ChordPill palette={palette} size={size} style={{overflow: "hidden", justifyContent: "center", boxSizing: "border-box", width, ...style}}>
      <span style={{position: "relative", display: "inline-block", height: size * 1.1, lineHeight: `${size * 1.1}px`}}>
        <span style={{visibility: "hidden"}}>{longest}</span>
        <span style={{position: "absolute", left: 0, right: 0, textAlign: "center", transform: `translateY(${-roll * 120}%)`, opacity: 1 - roll}}>
          {from}
        </span>
        <span style={{position: "absolute", left: 0, right: 0, textAlign: "center", transform: `translateY(${(1 - roll) * 120}%)`, opacity: roll}}>
          {to}
        </span>
      </span>
    </ChordPill>
  )
}

function MonoLabel({children, style}: {children: ReactNode; style?: CSSProperties}) {
  return <div style={{fontFamily: mono, fontSize: 22, color: palette.muted, letterSpacing: "0.02em", ...style}}>{children}</div>
}

function HookScene() {
  const frame = useCurrentFrame()
  const {file} = useLayout()
  const typed = interpolate(frame, [4, 60], [0, totalChars], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})
  const fileIn = progressAt(frame, 0, 10)
  // The file glides left to make room for the phone, then leaves as the transpose scene starts.
  const slide = progressAt(frame, S.reveal.from, 26, easeInOut)
  const out = progressAt(frame, S.transpose.from - 6, 14, easeInOut)
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: interpolate(slide, [0, 1], [file.from.x, file.to.x]) - out * 60,
          top: interpolate(slide, [0, 1], [file.from.y, file.to.y]),
          opacity: fileIn * (1 - out),
          transform: `scale(${interpolate(slide, [0, 1], [file.from.scale, file.to.scale])})`,
          transformOrigin: "top left",
        }}
      >
        <FileExcerpt typed={typed} />
      </div>
    </>
  )
}

function TransposeArt() {
  const flip = 36
  const before = ["G", "D", "Em", "C"]
  const after = ["G#", "D#", "Fm", "C#"]
  const frame = useCurrentFrame()
  const {transposeArt} = useLayout()
  const enter = progressAt(frame, 6, 20)
  return (
    <div style={{position: "absolute", left: transposeArt.x, top: transposeArt.y, opacity: enter * (1 - progressAt(frame, 96, 12))}}>
      <MonoLabel style={{marginBottom: 22}}>
        transpose {frame >= flip ? "+1" : "+0"}
      </MonoLabel>
      <div style={{display: "flex", gap: 14}}>
        {before.map((chord, index) => (
          <RollingPill key={chord} from={chord} to={after[index] ?? chord} at={flip + index * 2} />
        ))}
      </div>
    </div>
  )
}

const matchingRows = [
  {title: "Morning Light", artist: "chordlist", chords: ["G", "D", "Em", "C"]},
  {title: "Someone Like You", artist: "Adele", chords: ["A", "E", "F#m", "D"]},
  {title: "Let It Be", artist: "The Beatles", chords: ["C", "G", "Am", "F"]},
]

function MatchingArt() {
  const frame = useCurrentFrame()
  const collapse = 50
  const {matchingArt} = useLayout()
  return (
    <div style={{position: "absolute", left: matchingArt.x, top: matchingArt.y, opacity: 1 - progressAt(frame, 96, 12)}}>
      <MonoLabel style={{marginBottom: 26, opacity: progressAt(frame, collapse, 12)}}>same progression</MonoLabel>
      {matchingRows.map((row, rowIndex) => {
        const enter = progressAt(frame, 8 + rowIndex * 5, 20)
        return (
          <div key={row.title} style={{marginBottom: 34, opacity: enter, transform: `translateY(${(1 - enter) * 20}px)`}}>
            <div style={{fontFamily: sans, fontSize: 26, fontWeight: 600, color: palette.text, marginBottom: 12}}>
              {row.title}
              <span style={{fontWeight: 400, color: palette.muted}}> · {row.artist}</span>
            </div>
            <div style={{display: "flex", gap: 10}}>
              {row.chords.map((chord, index) => (
                <RollingPill
                  key={chord}
                  from={chord}
                  to={romanNumerals[index] ?? chord}
                  at={collapse + rowIndex * 3 + index}
                  size={26}
                  width={92}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Outro() {
  const frame = useCurrentFrame()
  const word = progressAt(frame, 26, 18)
  const badge = progressAt(frame, 52, 20)
  const {outro} = useLayout()
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
      <Sequence from={8} layout="none">
        <AssemblingTile size={outro.tile} />
      </Sequence>
      <div
        style={{
          marginTop: 30,
          fontFamily: mono,
          fontSize: outro.word,
          letterSpacing: "-0.03em",
          color: palette.text,
          opacity: word,
          transform: `translateY(${(1 - word) * 14}px)`,
        }}
      >
        chordlist
      </div>
      <div style={{marginTop: 34}}>
        <RiseText
          text={outro.tagline}
          start={34}
          palette={palette}
          size={outro.taglineSize}
          stagger={2}
          align="center"
        />
      </div>
      <div
        style={{
          marginTop: 48,
          display: "flex",
          flexDirection: outro.stackNote ? "column" : "row",
          alignItems: "center",
          gap: outro.stackNote ? 24 : 28,
          opacity: badge,
          transform: `translateY(${(1 - badge) * 16}px)`,
        }}
      >
        <Img src={staticFile("badges/app-store-black.svg")} style={{height: outro.badge}} />
        <div style={{fontFamily: mono, fontSize: outro.note, color: palette.muted, textAlign: "center"}}>
          {outro.stackNote ? (
            <>
              Free download for iPhone and iPad
              <br />
              chordlist.app
            </>
          ) : (
            "Free download for iPhone and iPad · chordlist.app"
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function TopLockup() {
  const frame = useCurrentFrame()
  const enter = progressAt(frame, S.reveal.from + 10, 16)
  const exit = progressAt(frame, S.outro.from, 12)
  const {left, lockupTop} = useLayout()
  return (
    <div style={{position: "absolute", left, top: lockupTop, opacity: enter * (1 - exit)}}>
      <Lockup palette={palette} size={44} />
    </div>
  )
}

export type BragProps = {soundtrack: "guitar" | "piano"}

// The autoscroll line names the instrument the soundtrack is played on.
const scrollEnding = {guitar: "the strings.", piano: "the keys."} as const

export function Brag({soundtrack}: BragProps) {
  return (
    <AbsoluteFill style={{backgroundColor: palette.background, overflow: "hidden"}}>
      <PaperBackground seed={185} />
      <HookScene />
      <TopLockup />

      <Sequence from={S.hook.from} durationInFrames={S.hook.len} layout="none">
        <Headline scene="hook" start={0} exitAt={S.hook.len - 12} />
      </Sequence>

      <Sequence from={S.reveal.from} durationInFrames={S.reveal.len} layout="none">
        <Headline scene="reveal" start={4} exitAt={S.reveal.len - 12} />
        <Sub start={14} exitAt={S.reveal.len - 12}>
          Every song is a plain Markdown file in a folder you choose.
        </Sub>
      </Sequence>

      <Sequence from={S.transpose.from} durationInFrames={S.transpose.len} layout="none">
        <Headline scene="transpose" exitAt={S.transpose.len - 12} />
        <TransposeArt />
      </Sequence>

      <Sequence from={S.scroll.from} durationInFrames={S.scroll.len} layout="none">
        <Headline scene="scroll" exitAt={S.scroll.len - 12} lines={["Press play.", "Hands stay on", scrollEnding[soundtrack]]} />
      </Sequence>

      <Sequence from={S.matching.from} durationInFrames={S.matching.len} layout="none">
        <Headline scene="matching" exitAt={S.matching.len - 12} />
        <MatchingArt />
      </Sequence>

      <PhoneTrack />

      <Sequence from={S.outro.from + 6} durationInFrames={S.outro.len - 6} layout="none">
        <Outro />
      </Sequence>
    </AbsoluteFill>
  )
}
