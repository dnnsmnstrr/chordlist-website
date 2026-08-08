---
title: Three ways to write down a chord progression
description: Chord symbols, Roman numerals, and Nashville numbers describe the same music. Knowing which to reach for saves a lot of transposing.
created: 2026-08-08
published: 2026-09-01
tags:
  - chords
  - markdown
---

You write `C G Am F`. A friend writes `I V vi IV`. The person depping on keys writes
`1 5 6 4` on the back of a setlist. All three describe the same four chords, and the
difference between them is what they choose to leave out.

## Chord symbols say what to play

`C G Am F` is absolute. Each symbol names a specific chord, and you can play it without
knowing anything else about the song.

That is the notation almost every chart uses, and it is what chordlist stores in a song's
`chords` field:

```
---
chords: C G Am F
---
```

The cost of being absolute is that the notation is tied to one key. Move the song and every
symbol has to change.

## Roman numerals say what it means

`I V vi IV` numbers each chord by its position in the scale, uppercase for major and
lowercase for minor. It tells you nothing about which notes to press until you know the key,
and everything about what the progression is doing.

This is what makes two songs recognisably the same underneath. `C G Am F` and `G D Em C`
look unrelated as symbols. As numerals they are both I–V–vi–IV, which is why they feel the
same to play.

Numerals are the right tool when you are analysing, teaching, or trying to work out why a
song reminds you of another one.

## Nashville numbers say it fast

Nashville numbers do the same job with Arabic numerals: `1 5 6 4`. The system came out of
session work, where the key might be decided in the room and a chart needs to survive being
transposed a minor third with no rewriting.

It is the same idea as Roman numerals, optimised for reading at speed under stage lighting
rather than for analysis on paper. Minor chords are usually marked with a dash or a small
`m` rather than by case, because case is hard to read quickly.

## What chordlist stores, and what it does not

The `chords` field takes chord symbols — the absolute kind. The app does not interpret
Roman numerals or Nashville numbers in that field, so keep it as symbols.

Two things soften the cost of that. Tapping the progression transposes it up or down while
you play, so you get the practical benefit of a relative system without maintaining one; the
change is to the view only and resets when you leave the song. And songs are grouped by
their normalised progression, so the app can already tell that `C G Am F` and `G D Em C` are
the same shape, which is most of what numerals were going to tell you. The
[playing section](/docs#playing) covers both.

If you want numerals anyway, the body of the file is ordinary text. Nothing stops you
keeping a number chart alongside the lyrics:

```
[Verse]   1 5 6 4

C              G
Lyrics go here…
```

Because the songs are plain Markdown files, that habit costs nothing and no feature has to
support it. The [file format docs](/docs#file-format) describe which fields the app
maintains and confirms that other content is left alone.

## Pick by what you are doing

Use chord symbols to play tonight. Use numerals to understand why a song works or to move it
between keys. Use Nashville numbers if you play with people who already do.

The honest limitation of both number systems is that they need a key to mean anything, and
they get awkward exactly where songs get interesting. A modulation, a borrowed chord from
the parallel minor, a modal progression with no strong tonic — all of these need footnotes
that a plain chord symbol would have expressed directly. That is the trade: numerals tell
you what a progression means, symbols tell you what to play, and neither is a complete
description on its own.
