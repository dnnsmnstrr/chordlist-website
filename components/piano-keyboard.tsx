"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Key = {
  note: string
  freq: number
  type: "white" | "black"
  // position offset for black keys, in fractions of a white-key width
  offset?: number
}

// One octave from C4 to B4 plus a little extra for a fuller keyboard
const KEYS: Key[] = [
  { note: "C", freq: 261.63, type: "white" },
  { note: "C#", freq: 277.18, type: "black" },
  { note: "D", freq: 293.66, type: "white" },
  { note: "D#", freq: 311.13, type: "black" },
  { note: "E", freq: 329.63, type: "white" },
  { note: "F", freq: 349.23, type: "white" },
  { note: "F#", freq: 369.99, type: "black" },
  { note: "G", freq: 392.0, type: "white" },
  { note: "G#", freq: 415.3, type: "black" },
  { note: "A", freq: 440.0, type: "white" },
  { note: "A#", freq: 466.16, type: "black" },
  { note: "B", freq: 493.88, type: "white" },
  { note: "C2", freq: 523.25, type: "white" },
  { note: "C#2", freq: 554.37, type: "black" },
  { note: "D2", freq: 587.33, type: "white" },
  { note: "D#2", freq: 622.25, type: "black" },
  { note: "E2", freq: 659.25, type: "white" },
]

// Map computer keyboard keys to notes for play-along
const KEY_MAP: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
}

export function PianoKeyboard() {
  const audioRef = useRef<AudioContext | null>(null)
  const [active, setActive] = useState<Set<number>>(new Set())

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      audioRef.current = new Ctx()
    }
    if (audioRef.current.state === "suspended") {
      void audioRef.current.resume()
    }
    return audioRef.current
  }, [])

  const playNote = useCallback(
    (freq: number) => {
      const ctx = getCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.value = freq
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.5)
    },
    [getCtx],
  )

  const press = useCallback(
    (index: number) => {
      const key = KEYS[index]
      if (!key) return
      playNote(key.freq)
      setActive((prev) => {
        const next = new Set(prev)
        next.add(index)
        return next
      })
      window.setTimeout(() => {
        setActive((prev) => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
      }, 180)
    },
    [playNote],
  )

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const index = KEY_MAP[e.key.toLowerCase()]
      if (index !== undefined) press(index)
    }
    window.addEventListener("keydown", handleDown)
    return () => window.removeEventListener("keydown", handleDown)
  }, [press])

  const whiteKeys = KEYS.map((k, i) => ({ ...k, index: i })).filter((k) => k.type === "white")
  const whiteWidth = 100 / whiteKeys.length

  // Determine the left position for each black key based on the preceding white key
  const blackKeys = KEYS.map((k, i) => ({ ...k, index: i })).filter((k) => k.type === "black")

  function whiteCountBefore(index: number) {
    let count = 0
    for (let i = 0; i < index; i++) {
      if (KEYS[i].type === "white") count++
    }
    return count
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-[3/1] w-full max-w-3xl select-none">
        {/* White keys */}
        <div className="absolute inset-0 flex gap-px">
          {whiteKeys.map((k) => {
            const isActive = active.has(k.index)
            return (
              <button
                key={k.note}
                type="button"
                aria-label={`Play note ${k.note}`}
                onPointerDown={() => press(k.index)}
                className={`relative flex flex-1 items-end justify-center rounded-b-md border border-border pb-3 transition-colors ${
                  isActive ? "bg-muted-foreground/20" : "bg-background hover:bg-muted"
                }`}
              >
                <span className="font-mono text-[10px] text-muted-foreground">{k.note.replace("2", "")}</span>
              </button>
            )
          })}
        </div>

        {/* Black keys */}
        <div className="pointer-events-none absolute inset-0">
          {blackKeys.map((k) => {
            const before = whiteCountBefore(k.index)
            const left = before * whiteWidth - whiteWidth * 0.3
            const isActive = active.has(k.index)
            return (
              <button
                key={k.note}
                type="button"
                aria-label={`Play note ${k.note}`}
                onPointerDown={() => press(k.index)}
                style={{ left: `${left}%`, width: `${whiteWidth * 0.6}%` }}
                className={`pointer-events-auto absolute top-0 z-10 h-[62%] rounded-b-md border border-foreground transition-colors ${
                  isActive ? "bg-muted-foreground" : "bg-foreground hover:bg-foreground/85"
                }`}
              />
            )
          })}
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        Tap the keys or use your keyboard {"(A W S E D F T G Y H U J)"}
      </p>
    </div>
  )
}
