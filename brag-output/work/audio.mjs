// Soundtrack for the chordlist brag video: Morning Light's own progression (G D Em C) at 100 bpm,
// which moves up a semitone at 8.4 s — the frame the chart is transposed on screen. Effects share
// the key and the reverb. Writes a 48 kHz stereo 16-bit WAV.
//
//   node audio.mjs           plucked guitar → soundtrack.wav
//   node audio.mjs piano     felt piano     → soundtrack-piano.wav
import {writeFileSync} from "node:fs"

const STYLE = process.argv[2] === "piano" ? "piano" : "guitar"
const SR = 48000
const FPS = 30
const DURATION = 672 / FPS
const N = Math.ceil(DURATION * SR)
const BEAT = 0.6
const HALF = BEAT * 2 // one chord per half bar
const MOD_AT = 252 / FPS // transpose flip
const FINAL_AT = 576 / FPS
const OUTRO_AT = 540 / FPS

// Two buses: dry and reverb send.
const dry = [new Float32Array(N), new Float32Array(N)]
const send = [new Float32Array(N), new Float32Array(N)]

let seed = 7
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1
const midiHz = (m) => 440 * 2 ** ((m - 69) / 12)

function add(buffer, start, l, r, wet) {
  const offset = Math.round(start * SR)
  for (let i = 0; i < l.length; i++) {
    const j = offset + i
    if (j < 0 || j >= N) continue
    dry[0][j] += l[i]
    dry[1][j] += r[i]
    send[0][j] += l[i] * wet
    send[1][j] += r[i] * wet
  }
}

// Karplus-Strong string with a lowpassed noise burst, so a soft pluck is also a darker one.
function pluck(midi, velocity, length) {
  const f = midiHz(midi)
  const period = Math.max(2, Math.round(SR / f))
  const ring = new Float32Array(period)
  let lp = 0
  const tone = 0.2 + 0.42 * velocity
  for (let i = 0; i < period; i++) {
    lp += tone * (rand() - lp)
    ring[i] = lp
  }
  const out = new Float32Array(Math.round(length * SR))
  const decay = 0.996 + Math.min(0.0035, (f / 2000) * 0.001)
  let index = 0
  let previous = 0
  for (let i = 0; i < out.length; i++) {
    const current = ring[index]
    const next = 0.5 * (current + ring[(index + 1) % period]) * decay
    ring[index] = next
    index = (index + 1) % period
    // Gentle body: one-pole lowpass on the output.
    previous += 0.55 * (current - previous)
    const release = Math.min(1, (out.length - i) / (0.06 * SR))
    out[i] = previous * velocity * release
  }
  return out
}

// Open-position voicings, low string first.
const shapes = {
  G: [43, 47, 50, 55, 59, 67],
  D: [50, 57, 62, 66],
  Em: [40, 47, 52, 55, 59, 64],
  C: [48, 52, 55, 60, 64],
}
const roots = {G: 31, D: 38, Em: 28, C: 36}
const order = ["G", "D", "Em", "C"]

function strum(time, chord, shift, {velocity = 0.7, up = false, strings = 6, length = 1.5, spread = 0.011} = {}) {
  let notes = shapes[chord].map((n) => n + shift)
  if (up) notes = notes.slice(-Math.min(strings, notes.length)).reverse()
  notes.forEach((note, i) => {
    const v = velocity * (up ? 0.55 : 1) * (1 - i * 0.03) * (0.92 + 0.08 * rand())
    const tone = pluck(note, v, length)
    const pan = (i / Math.max(1, notes.length - 1) - 0.5) * 0.5 * (up ? -1 : 1)
    const l = tone.map((x) => x * (1 - pan) * 0.5)
    const r = tone.map((x) => x * (1 + pan) * 0.5)
    add(null, time + i * spread, l, r, 0.32)
  })
}

function bass(time, midi, length, velocity = 0.5) {
  const f = midiHz(midi)
  const out = new Float32Array(Math.round(length * SR))
  for (let i = 0; i < out.length; i++) {
    const t = i / SR
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 2.2) * Math.min(1, (out.length - i) / (0.04 * SR))
    out[i] = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * velocity
  }
  add(null, time, out, out, 0.04)
}

function kick(time, velocity = 0.55) {
  const out = new Float32Array(Math.round(0.35 * SR))
  let phase = 0
  for (let i = 0; i < out.length; i++) {
    const t = i / SR
    phase += (2 * Math.PI * (46 + 70 * Math.exp(-t * 40))) / SR
    out[i] = Math.sin(phase) * Math.exp(-t * 9) * velocity
  }
  add(null, time, out, out, 0.03)
}

function noiseHit(time, {length, decay, hp = 0.8, velocity, pan = 0, wet = 0.2}) {
  const out = new Float32Array(Math.round(length * SR))
  let low = 0
  for (let i = 0; i < out.length; i++) {
    const t = i / SR
    const n = rand()
    low += (1 - hp) * (n - low)
    out[i] = (n - low) * Math.exp(-t * decay) * velocity
  }
  add(
    null,
    time,
    out.map((x) => x * (1 - pan)),
    out.map((x) => x * (1 + pan)),
    wet,
  )
}

function bell(time, midi, velocity, length = 1.6) {
  const f = midiHz(midi)
  const out = new Float32Array(Math.round(length * SR))
  for (let i = 0; i < out.length; i++) {
    const t = i / SR
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.2)
    out[i] = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6)) * env * velocity
  }
  add(null, time, out, out, 0.5)
}

function tap(time, velocity = 0.12) {
  const out = new Float32Array(Math.round(0.05 * SR))
  for (let i = 0; i < out.length; i++) {
    const t = i / SR
    out[i] = (Math.sin(2 * Math.PI * 1500 * t) * 0.7 + rand() * 0.3) * Math.exp(-t * 120) * velocity
  }
  add(null, time, out, out, 0.25)
}

function whoosh(peak, length, velocity, direction = 1) {
  const out = [new Float32Array(Math.round(length * SR)), new Float32Array(Math.round(length * SR))]
  let band = 0
  let low = 0
  for (let i = 0; i < out[0].length; i++) {
    const p = i / out[0].length
    const env = Math.sin(Math.PI * p) ** 2
    const cutoff = 0.02 + 0.12 * p
    const n = rand()
    low += cutoff * (n - low)
    band += 0.5 * (low - band)
    const pan = (p - 0.5) * 0.8 * direction
    out[0][i] = (low - band * 0.5) * env * velocity * (1 - pan)
    out[1][i] = (low - band * 0.5) * env * velocity * (1 + pan)
  }
  add(null, peak - length / 2, out[0], out[1], 0.45)
}

// A piano note: inharmonic partials with a two-stage decay, two slightly detuned strings per note
// (the beating that makes it sound like a piano rather than an organ), a felt hammer thump, and a
// damper release at `length`. Softer notes are darker, as on the real instrument.
function pianoNote(time, midi, velocity, length) {
  const f = midiHz(midi)
  const samples = Math.round(Math.min(length + 0.25, DURATION - time + 0.1) * SR)
  if (samples <= 0) return
  const out = new Float32Array(samples)
  const inharmonicity = 0.00025 + 0.0004 * Math.max(0, (midi - 40) / 50)
  const partials = Math.max(4, Math.min(14, Math.floor(9000 / f)))
  // Low notes ring longer; high ones die quickly.
  const sustain = 1.2 + 4.5 * Math.exp(-(midi - 36) / 18)
  for (let n = 1; n <= partials; n++) {
    const fn = n * f * Math.sqrt(1 + inharmonicity * n * n)
    const amplitude = (1 / n ** 1.15) * Math.exp(-(n - 1) * (0.55 - 0.35 * velocity))
    const fast = 3 + n * 1.4
    const slow = (0.5 + n * 0.22) / sustain
    for (const detune of [1, 1.0007]) {
      const step = (2 * Math.PI * fn * detune) / SR
      let phase = rand() * Math.PI
      for (let i = 0; i < samples; i++) {
        const t = i / SR
        const env = 0.6 * Math.exp(-t * fast) + 0.4 * Math.exp(-t * slow)
        out[i] += Math.sin(phase) * amplitude * env * 0.5
        phase += step
      }
    }
  }
  // Felt hammer: a short, dark thump under the attack.
  let low = 0
  for (let i = 0; i < Math.min(samples, 0.03 * SR); i++) {
    low += 0.08 * (rand() - low)
    out[i] += low * Math.exp(-(i / SR) * 160) * 0.6
  }
  const releaseStart = Math.round(length * SR)
  for (let i = 0; i < samples; i++) {
    const attack = Math.min(1, i / (0.002 * SR))
    const release = i < releaseStart ? 1 : Math.exp(-((i - releaseStart) / SR) * 18)
    out[i] *= attack * release * velocity * 0.32
  }
  // Seen from the bench: bass to the left, treble to the right.
  const pan = Math.max(-0.3, Math.min(0.3, (midi - 60) / 80))
  add(
    null,
    time,
    out.map((x) => x * (1 - pan) * 0.5),
    out.map((x) => x * (1 + pan) * 0.5),
    0.34,
  )
}

// Right-hand roots around middle C and left-hand roots two octaves down.
const pianoRoots = {G: 55, D: 50, Em: 52, C: 48}
const triad = (chord) => (chord === "Em" ? [0, 3, 7, 12] : [0, 4, 7, 12])

function pianoArrangement() {
  const eighth = BEAT / 2
  const halves = Math.round(FINAL_AT / HALF)
  for (let k = 0; k < halves; k++) {
    const t = k * HALF
    const chord = order[k % 4]
    const shift = t >= MOD_AT - 0.01 ? 1 : 0
    const outro = t >= OUTRO_AT - 0.01
    const right = pianoRoots[chord] + 12 + shift
    const left = pianoRoots[chord] - 12 + shift
    const tones = triad(chord).map((interval) => right + interval)

    if (k < 2) {
      // The hook: one soft, slightly rolled chord per change, held on the pedal.
      pianoNote(t, left, 0.6, 1.25)
      tones.slice(0, 3).forEach((note, i) => pianoNote(t + 0.02 + i * 0.025, note, 0.52, 1.2))
      continue
    }

    // Left hand: root octave on the change, fifth on the second beat.
    pianoNote(t, left, outro ? 0.42 : 0.55, HALF * 0.95)
    pianoNote(t, left + 12, outro ? 0.3 : 0.4, HALF * 0.95)
    if (!outro) pianoNote(t + BEAT, left + 7, 0.38, BEAT * 0.9)

    // Right hand: a rolling eighth-note figure — root, fifth, octave, third — on the pedal.
    const figure = outro ? [0, 2] : [0, 2, 3, 1]
    figure.forEach((index, i) => {
      const accent = i === 0 ? 1 : 0.78
      const note = tones[index]
      pianoNote(t + i * eighth * (outro ? 2 : 1), note, (outro ? 0.38 : 0.5) * accent, HALF - i * eighth + 0.1)
    })

    // After the key change a top voice joins, an octave up, for the lift.
    if (shift && !outro) pianoNote(t + 0.01, tones[k % 2 === 0 ? 3 : 1] + 12, 0.36, HALF)

    if (!outro) {
      kick(t, 0.22)
      if (k >= 4) {
        for (let e = 0; e < 4; e++) {
          const accent = e % 2 === 1 ? 1 : 0.6
          noiseHit(t + e * eighth, {length: 0.05, decay: 80, hp: 0.93, velocity: 0.014 * accent, pan: 0.3, wet: 0.1})
        }
      }
    }
  }

  // The final chord in the new key, rolled from the bass up and left on the pedal.
  const root = pianoRoots.G + 1
  ;[root - 24, root - 12, root, root + 7, root + 12, root + 16, root + 19, root + 24].forEach((note, i) =>
    pianoNote(FINAL_AT + i * 0.035, note, 0.62 - i * 0.025, DURATION - FINAL_AT),
  )
}

// ---- Arrangement --------------------------------------------------------------------------------

if (STYLE === "piano") pianoArrangement()
else guitarArrangement()

function guitarArrangement() {
  const halves = Math.round(FINAL_AT / HALF) // 16 chord slots before the final hit
  for (let k = 0; k < halves; k++) {
    const t = k * HALF
    const chord = order[k % 4]
    const shift = t >= MOD_AT - 0.01 ? 1 : 0
    const outro = t >= OUTRO_AT - 0.01
    if (k < 2) {
      // The hook: one quiet strum per chord, nothing else.
      strum(t, chord, shift, {velocity: 0.85, length: 1.3, spread: 0.018})
      continue
    }
    const v = outro ? 0.5 : 0.68
    strum(t, chord, shift, {velocity: v, length: 0.62})
    strum(t + BEAT * 0.5, chord, shift, {velocity: v * 0.8, up: true, strings: 3, length: 0.32})
    strum(t + BEAT, chord, shift, {velocity: v * 0.85, length: 0.33})
    strum(t + BEAT * 1.5, chord, shift, {velocity: v * 0.75, up: true, strings: 3, length: 0.6})

    if (!outro) {
      const root = roots[chord] + shift
      bass(t, root, BEAT * 0.95, 0.34)
      bass(t + BEAT, root + 7, BEAT * 0.9, 0.24)
      kick(t, 0.36)
      if (k >= 4) noiseHit(t + BEAT, {length: 0.18, decay: 30, hp: 0.55, velocity: 0.07, wet: 0.35})
      for (let e = 0; e < 4; e++) {
        const accent = e % 2 === 1 ? 1 : 0.6
        noiseHit(t + e * BEAT * 0.5, {length: 0.06, decay: 70, hp: 0.92, velocity: 0.022 * accent, pan: 0.3, wet: 0.1})
      }
    }
  }

  // The final chord, in the new key, left to ring out under the end card.
  strum(FINAL_AT, "G", 1, {velocity: 0.75, length: DURATION - FINAL_AT, spread: 0.022})
  bass(FINAL_AT, roots.G + 1, 2.4, 0.35)
  bell(FINAL_AT + 0.02, 68 + 12, 0.035, 3)
}

// ---- Effects, in key and in the same room ----------------------------------------------------------

// Typing: soft key ticks while the file writes itself (frames 4–60).
for (let t = 4 / FPS; t < 60 / FPS; t += 0.045 + 0.02 * Math.abs(rand())) {
  noiseHit(t, {length: 0.012, decay: 400, hp: 0.7, velocity: 0.05 + 0.015 * rand(), pan: 0.25 * rand(), wet: 0.08})
}
whoosh(72 / FPS + 0.18, 0.7, 0.05, -1) // phone slides in
tap(108 / FPS) // Morning Light row
tap(247 / FPS) // transpose +
// G#5: the new key arriving.
if (STYLE === "piano") pianoNote(MOD_AT, 80, 0.4, 1.6)
else bell(MOD_AT, 68 + 12, 0.05)
tap(493 / FPS) // Let It Be row
whoosh(OUTRO_AT + 0.25, 0.7, 0.04, 1) // phone leaves
// The logo's keys drop onto the tile: two soft wooden knocks on the new tonic and fifth.
bell(564 / FPS, 68, 0.03, 0.4)
bell(570 / FPS, 75, 0.025, 0.4)

// ---- Reverb (Schroeder: four combs, two allpasses, per channel) ------------------------------------

function reverb(input, offset) {
  const out = new Float32Array(N)
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d + offset) * (SR / 44100)))
  for (const delay of combs) {
    const buffer = new Float32Array(delay)
    let index = 0
    let damp = 0
    for (let i = 0; i < N; i++) {
      const y = buffer[index]
      damp += 0.35 * (y - damp)
      buffer[index] = input[i] + damp * 0.82
      index = (index + 1) % delay
      out[i] += y * 0.25
    }
  }
  for (const delay of [556, 441].map((d) => Math.round((d + offset) * (SR / 44100)))) {
    const buffer = new Float32Array(delay)
    let index = 0
    for (let i = 0; i < N; i++) {
      const b = buffer[index]
      const y = -out[i] + b
      buffer[index] = out[i] + b * 0.5
      index = (index + 1) % delay
      out[i] = y
    }
  }
  return out
}

const wet = [reverb(send[0], 0), reverb(send[1], 23)]
const mix = [new Float32Array(N), new Float32Array(N)]
let peak = 0
for (let c = 0; c < 2; c++) {
  for (let i = 0; i < N; i++) {
    const t = i / SR
    const fadeIn = Math.min(1, t / 0.01)
    const fadeOut = Math.min(1, (DURATION - t) / 1.2)
    const x = (dry[c][i] + wet[c][i] * 0.55) * fadeIn * fadeOut
    mix[c][i] = Math.tanh(x * 1.6) / 1.6
    peak = Math.max(peak, Math.abs(mix[c][i]))
  }
}

const gain = 0.89 / peak
const data = Buffer.alloc(44 + N * 4)
data.write("RIFF", 0)
data.writeUInt32LE(36 + N * 4, 4)
data.write("WAVEfmt ", 8)
data.writeUInt32LE(16, 16)
data.writeUInt16LE(1, 20)
data.writeUInt16LE(2, 22)
data.writeUInt32LE(SR, 24)
data.writeUInt32LE(SR * 4, 28)
data.writeUInt16LE(4, 32)
data.writeUInt16LE(16, 34)
data.write("data", 36)
data.writeUInt32LE(N * 4, 40)
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(mix[0][i] * gain * 32767), 44 + i * 4)
  data.writeInt16LE(Math.round(mix[1][i] * gain * 32767), 46 + i * 4)
}
const outputName = STYLE === "piano" ? "soundtrack-piano.wav" : "soundtrack.wav"
writeFileSync(new URL(`./${outputName}`, import.meta.url), data)
console.log(`wrote ${outputName}, ${DURATION.toFixed(2)} s, peak before gain ${peak.toFixed(3)}`)
