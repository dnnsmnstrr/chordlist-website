---
title: Three ways to write down a chord progression
description: Compare chord symbols, Roman numerals, and Nashville numbers, then choose the notation that fits playing, analysis, or a movable chart.
created: 2026-08-08
published: 2026-09-04
tags:
  - chords
---

You write `C G Am F`. A friend writes `I V vi IV`. A keys player writes `1 5 6 4` on the back of a
setlist. The three lines describe the same chord roots in one context, but each is useful for a
different job.

The choice is not about which system is correct. It is about what the person reading the chart needs
to know.

![A piano keyboard and open sheet music seen through grain, bloom, and shallow focus.](/blog/chord-notation-styles/piano-with-sheet-music.webp "The chart is one way into the music")

## Chord symbols name the chords

`C G Am F` gives you specific chord names. If you know those shapes or voicings, you can begin
playing without first being told the key.

What it does not tell you is equally important: there is no rhythm, duration, inversion, register,
or capo position in that line. Chord symbols name the harmony, not the complete arrangement.

They are also tied to a concert key. Move the progression and every symbol changes. In chordlist,
this is the notation that belongs in a song's `chords` field:

```
---
chords: C G Am F
---
```

## Roman numerals show relationships

`I V vi IV` numbers each chord by the scale degree on which it is built. In a major key, uppercase
usually marks a major chord and lowercase a minor chord. You need the key before the numbers become
specific notes.

That missing information is also the advantage. `C G Am F` in C major and `G D Em C` in G major are
both I–V–vi–IV. Roman numerals make their shared structure visible without rewriting the analysis
for each key.

Use them when you are comparing songs, teaching harmony, or moving an idea between keys. If the
notation is new to you, [practise one four-chord progression](/blog/how-to-play-almost-any-pop-song)
in two keys and keep the numeral line unchanged.

## Nashville numbers make a movable chart

Nashville numbers also use scale degrees, written as Arabic numerals: `1 5 6 4`. The system grew out
of Nashville studio work and developed into more than a row of chord numbers: a full chart can also
mark rhythm, sections, inversions, holds, and chord qualities. The
[Nashville Number System introduction](https://nashvillenumbersystem.com/introduction/) explains its
session-work origins and notation.

Its practical strength is that a band can change key without rewriting the chart. The musicians
translate the numbers into the chosen key while reading. Conventions for minor and altered chords
can vary, so agree on them when you share a chart outside a group that already uses the system.

## Choose by the job

- **Chord symbols — `C G Am F`:** best for playing in a known key. They assume familiar chord
  shapes and leave harmonic function and timing unspecified.
- **Roman numerals — `I V vi IV`:** best for analysis and teaching. They need a key and shared
  numeral conventions before they become specific notes or voicings.
- **Nashville numbers — `1 5 6 4`:** best for a movable performance chart. They need a key and
  shared chart conventions before the players turn them into specific chords.

These are not competing descriptions. A rehearsal note can contain all three if different readers
need them.

## Keep chord symbols in chordlist

The `chords` field expects chord symbols. chordlist does not interpret Roman numerals or Nashville
numbers there, so store `C G Am F` rather than `I V vi IV` or `1 5 6 4`.

The displayed chord symbols can still be transposed while you play, and chordlist can compare the
shape with songs entered in other keys. The [playing guide](/docs#playing) covers those controls.
If you want a number chart as well, put it in the Markdown body alongside the lyrics:

```
[Verse]   1 5 6 4

C              G
Lyrics go here…
```

The [file format guide](/docs#file-format) explains which frontmatter fields chordlist maintains;
other body text remains part of the song file.

## Try all three

Write G–D–Em–C as I–V–vi–IV and `1 5 6 4`. Then move the song to C major. Only the chord-symbol line
has to become C–G–Am–F.

Number systems can represent borrowed chords, chromatic alterations, and modulations, but those
details require additional symbols and a clearly marked key change. Chord symbols have their own
gaps because they do not describe timing or function. Use the smallest notation that gives the next
musician the information they actually need.
