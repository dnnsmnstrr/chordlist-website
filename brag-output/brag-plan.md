# chordlist — brag plan

**What it is:** a local-first songbook for iPhone and iPad where every song is a plain Markdown file in a folder you choose.
**Who it's for:** musicians who want their charts offline, portable, and not locked inside an app.
**What sets it apart:** the song *is* the file. No account, no cloud sync, no export step.
**Most impressive claim:** tap once and the whole chart changes key, with chords keeping their columns over the words.
**Visual hook:** a bare `.md` file typing itself, captioned deadpan "This is a song."
**Real UI shown:** the app's own dark-mode screen recordings (library → Morning Light, transpose +1, hands-free autoscroll, Matching Songs → Let It Be).
**Tone:** `default`, leaning polished. Warm, calm, musician-first; the joke stays small: a text file called a song.
**Share caption:** "This is a song. So is this." — chordlist, the songbook made of Markdown files.

## Angle

"This is a song." over a text file → "So is this." over the app. The same file, two views. Then three things the file
can do once chordlist opens it. The soundtrack is Morning Light's own progression (G D Em C), and when the chart is
transposed on screen the music goes up a semitone with it.

## Visual identity

- `warm-stage` campaign from DESIGN.md: #161411 paper-textured canvas, #FAFAF8 text, #A6A29A muted, #565149 rules.
- Geist Sans 700 headlines with tight tracking; Geist Mono for the file, eyebrows and the wordmark.
- Canonical logo tile (the repo's `AssemblingTile`), phone bezel from `video/src/motion/primitives.tsx`.
- Screen recordings are never filtered, tilted or recolored. Grid: headline column left, illustration middle, phone right.

## Storyboard (30 fps, 100 bpm → 1 bar = 72 frames)

| # | Frames | Scene | On screen | Sound |
|---|---|---|---|---|
| 1 | 0–72 (2.4s) | Hook | `morning-light.md` types itself (frontmatter muted). Headline: **This is a song.** | Lone plucked guitar on G, D; soft key ticks |
| 2 | 72–216 (4.8s) | Reveal | Phone slides in beside the file: library, tap on Morning Light, the chart opens. Headline **So is this.** + "Every song is a plain Markdown file in a folder you choose." Lockup appears top-left. | Kick, shaker, bass enter; soft whoosh; tap |
| 3 | 216–324 (3.6s) | Transpose | File exits. Real transpose stepper; "+" tap at 246, chart flips at 252. Middle: pills G D Em C roll to G# D# Fm C#. Headline **Change key with one tap.** | Music modulates up a semitone on the flip |
| 4 | 324–432 (3.6s) | Autoscroll | Hands-free autoscroll recording. Headline **Press play. Hands stay on the strings.** | Groove continues |
| 5 | 432–540 (3.6s) | Matching | Matching Songs list, tap on Let It Be, it opens on the same C G Am F. Middle: three songs in three keys collapse to **I V vi IV**. Headline **See what else you can already play.** | Groove, tap |
| 6 | 540–672 (4.4s) | Outro | Logo tile assembles, wordmark, tagline **Your lyrics and chords, as files in your pocket.**, App Store badge, "Free download for iPhone and iPad." · chordlist.app | Final G# strum rings out at 576 |

Total: 672 frames = 22.4s.

## Content rules followed

- Only Morning Light's words appear (chordlist's own fixture song). The cut avoids the recordings' imported-draft and
  next-song shots, which carry other people's lyrics; other songs appear by title only.
- Claims come from `locales/en.ts` and `lib/site-config.ts` (free download, iPhone and iPad, Markdown files in a folder you choose).
- No personal data or secrets in frame.

## Alternate soundtrack: piano

`brag-piano.mp4` is the same picture, rendered with `--props={"soundtrack":"piano"}` so the autoscroll line reads "Hands stay on the keys.", with a felt-piano score (`node work/audio.mjs piano`). It follows the same
grid and the same key change at 8.4 s:
- the hook is soft rolled chords
- from the reveal on, the left hand plays root octaves and fifths under a rolling right-hand figure (root, fifth, octave, third)
- a top voice joins after the key change
- the kick and shaker are lighter than in the guitar mix
- it ends on a G# chord rolled up from the bass

## Vertical cut (9:16)

`brag-vertical.mp4` (guitar) and `brag-vertical-piano.mp4` are the `BragVertical` composition at 1080 × 1920. It has
the same timeline, copy and soundtracks as the wide cut; only the `story` layout in `work/src/brag.tsx` differs:
- the headline is anchored at the top, under the lockup, and the phone sits beneath it
- the file, the transpose pills and the matching rows take the column to the phone's left
- in the autoscroll scene the phone glides to center
- the phone waits for the hook's file to shrink before it slides in
- everything stays inside the story safe areas (top 190, bottom 240), as `formats.story` in `video/src/motion/theme.ts` defines them
- the poster (`brag-vertical.jpg`) is frame 160, "So is this." with the file beside the app
