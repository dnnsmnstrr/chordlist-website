"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { defaultLanguage, dictionary, type Language } from "@/locales"

type Key = {
  id: string
  note: string
  midi: number
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
const CHORD_OCTAVE_MIDI = 60
const ACTIVATION_WINDOW_MS = 900
const ACTIVE_KEY_DURATION_MS = 220
const CHORD_ROOTS = new Set(["A", "B", "C", "D", "E", "F", "G"])

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
      keys.push({ id: `${n.note}${octave}`, note: n.note, midi, freq, type: n.type })
    }
  }
  return keys
}

const KEYS = buildKeys()
const KEYS_BY_MIDI = new Map(KEYS.map((key) => [key.midi, key]))

function getRootKey(note: string) {
  const semitone = NOTES.findIndex((candidate) => candidate.note === note)
  return semitone < 0 ? undefined : KEYS_BY_MIDI.get(CHORD_OCTAVE_MIDI + semitone)
}

function getChordKeys(root: string, isMinor: boolean) {
  const rootKey = getRootKey(root)
  if (!rootKey) return []

  const intervals = isMinor ? [0, 3, 7] : [0, 4, 7]
  return intervals
    .map((interval) => KEYS_BY_MIDI.get(rootKey.midi + interval))
    .filter((key): key is Key => key !== undefined)
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
  )
}

export function PianoKeyboard({ language = defaultLanguage }: { language?: Language }) {
  const { piano: pianoCopy } = dictionary(language)
  const audioRef = useRef<AudioContext | null>(null)
  const [active, setActive] = useState<Set<string>>(new Set())
  const [isChordMode, setIsChordMode] = useState(false)
  const draggingRef = useRef(false)
  const activationTimesRef = useRef<number[]>([])
  const activeTimersRef = useRef(new Map<string, number>())

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

  const playFrequencies = useCallback(
    (frequencies: readonly number[]) => {
      const ctx = getCtx()
      if (!ctx || frequencies.length === 0) return

      const gain = ctx.createGain()
      const now = ctx.currentTime
      const peakVolume = frequencies.length > 1 ? 0.11 : 0.24

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(peakVolume, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
      gain.connect(ctx.destination)

      for (const frequency of frequencies) {
        const oscillator = ctx.createOscillator()
        oscillator.type = "triangle"
        oscillator.frequency.value = frequency
        oscillator.connect(gain)
        oscillator.start(now)
        oscillator.stop(now + 1.3)
      }
    },
    [getCtx],
  )

  const pressKeys = useCallback(
    (keys: readonly Key[]) => {
      playFrequencies(keys.map((key) => key.freq))
      setActive((prev) => {
        const next = new Set(prev)
        for (const key of keys) next.add(key.id)
        return next
      })

      for (const key of keys) {
        const existingTimer = activeTimersRef.current.get(key.id)
        if (existingTimer) window.clearTimeout(existingTimer)

        const timer = window.setTimeout(() => {
          activeTimersRef.current.delete(key.id)
          setActive((prev) => {
            const next = new Set(prev)
            next.delete(key.id)
            return next
          })
        }, ACTIVE_KEY_DURATION_MS)

        activeTimersRef.current.set(key.id, timer)
      }
    },
    [playFrequencies],
  )

  const press = useCallback((key: Key) => pressKeys([key]), [pressKeys])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isChordMode) {
        setIsChordMode(false)
        activationTimesRef.current = []
        return
      }

      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return

      const root = event.key.toUpperCase()
      if (!CHORD_ROOTS.has(root)) return

      if (isChordMode) {
        event.preventDefault()
        pressKeys(getChordKeys(root, event.shiftKey))
        return
      }

      const rootKey = getRootKey(root)
      if (rootKey) pressKeys([rootKey])

      const now = performance.now()
      const recentPresses = activationTimesRef.current.filter((time) => now - time <= ACTIVATION_WINDOW_MS)
      recentPresses.push(now)
      activationTimesRef.current = recentPresses

      if (recentPresses.length >= 3) {
        activationTimesRef.current = []
        setIsChordMode(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isChordMode, pressKeys])

  useEffect(() => {
    const timers = activeTimersRef.current

    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer)
      const audioContext = audioRef.current
      if (audioContext) void audioContext.close()
    }
  }, [])

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
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-2 left-1/2 z-20 hidden -translate-x-1/2 items-center rounded-full border px-3 py-1.5 font-mono text-[0.65rem] shadow-sm backdrop-blur-sm md:flex ${
          isChordMode
            ? "border-foreground/20 bg-foreground text-background"
            : "border-border bg-background/90 text-muted-foreground"
        }`}
      >
        {isChordMode ? pianoCopy.chordModeActive : pianoCopy.chordModeHint}
      </div>

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
