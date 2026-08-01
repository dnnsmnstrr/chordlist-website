"use client"

import { useCallback, useRef, useState } from "react"

import { pianoCopy } from "@/locales/en"

type Key = {
  id: string
  note: string
  freq: number
  type: "white" | "black"
}

// Generate a multi-octave keyboard programmatically.
const NOTES: { note: string; type: "white" | "black" }[] = [
  { note: "C", type: "white" },
  { note: "C#", type: "black" },
  { note: "D", type: "white" },
  { note: "D#", type: "black" },
  { note: "E", type: "white" },
  { note: "F", type: "white" },
  { note: "F#", type: "black" },
  { note: "G", type: "white" },
  { note: "G#", type: "black" },
  { note: "A", type: "white" },
  { note: "A#", type: "black" },
  { note: "B", type: "white" },
]

const START_OCTAVE = 2
const OCTAVE_COUNT = 5

function buildKeys(): Key[] {
  const keys: Key[] = []
  for (let o = 0; o < OCTAVE_COUNT; o++) {
    const octave = START_OCTAVE + o
    for (const n of NOTES) {
      // A4 = 440Hz. Compute semitone distance from A4.
      const semitoneIndex = NOTES.findIndex((x) => x.note === n.note)
      // MIDI-style: C0 = 12. note number = (octave + 1) * 12 + semitoneIndex
      const midi = (octave + 1) * 12 + semitoneIndex
      const freq = 440 * Math.pow(2, (midi - 69) / 12)
      keys.push({ id: `${n.note}${octave}`, note: n.note, freq, type: n.type })
    }
  }
  return keys
}

const KEYS = buildKeys()

export function PianoKeyboard() {
  const audioRef = useRef<AudioContext | null>(null)
  const [active, setActive] = useState<Set<string>>(new Set())
  const draggingRef = useRef(false)

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!audioRef.current) {
      const audioContextConstructor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!audioContextConstructor) return null
      audioRef.current = new audioContextConstructor()
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
      gain.gain.exponentialRampToValueAtTime(0.24, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.3)
    },
    [getCtx],
  )

  const press = useCallback(
    (key: Key) => {
      playNote(key.freq)
      setActive((prev) => {
        const next = new Set(prev)
        next.add(key.id)
        return next
      })
      window.setTimeout(() => {
        setActive((prev) => {
          const next = new Set(prev)
          next.delete(key.id)
          return next
        })
      }, 160)
    },
    [playNote],
  )

  const whiteKeys = KEYS.filter((k) => k.type === "white")
  const whiteWidth = 100 / whiteKeys.length

  function whiteCountBefore(target: Key) {
    let count = 0
    for (const k of KEYS) {
      if (k === target) break
      if (k.type === "white") count++
    }
    return count
  }

  const blackKeys = KEYS.filter((k) => k.type === "black")

  return (
    <div
      className="relative h-24 w-full select-none overflow-hidden sm:h-32"
      onPointerDown={() => {
        draggingRef.current = true
      }}
      onPointerUp={() => {
        draggingRef.current = false
      }}
      onPointerLeave={() => {
        draggingRef.current = false
      }}
    >
      {/* White keys */}
      <div className="absolute inset-0 flex">
        {whiteKeys.map((k) => {
          const isActive = active.has(k.id)
          return (
            <button
              key={k.id}
              type="button"
              aria-label={pianoCopy.playNote(k.note)}
              tabIndex={-1}
              onPointerDown={() => press(k)}
              onPointerEnter={() => {
                if (draggingRef.current) press(k)
              }}
              className={`h-full flex-1 border-r border-border transition-colors duration-100 ${
                isActive ? "bg-muted-foreground/25" : "bg-background hover:bg-muted"
              }`}
            />
          )
        })}
      </div>

      {/* Black keys */}
      <div className="pointer-events-none absolute inset-0">
        {blackKeys.map((k) => {
          const before = whiteCountBefore(k)
          const left = before * whiteWidth - whiteWidth * 0.3
          const isActive = active.has(k.id)
          return (
            <button
              key={k.id}
              type="button"
              aria-label={pianoCopy.playNote(k.note)}
              tabIndex={-1}
              onPointerDown={() => press(k)}
              onPointerEnter={() => {
                if (draggingRef.current) press(k)
              }}
              style={{ left: `${left}%`, width: `${whiteWidth * 0.6}%` }}
              className={`pointer-events-auto absolute top-0 z-10 h-[60%] transition-colors duration-100 ${
                isActive ? "bg-muted-foreground" : "bg-foreground hover:bg-foreground/85"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
