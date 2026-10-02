---
title: Finding songs that share a progression
description: See how chordlist compares progressions across keys, what counts as a match, and how to turn the results into a practical setlist.
created: 2026-08-08
published: 2026-09-11
tags:
  - chords
  - workflow
---

When two songs use the same chord movement, your hands already know part of the second song. That
makes shared progressions a useful way to find material for a practice session, a medley, or the next
place to go in a set.

The chord names do not have to match. G–D–Em–C and C–G–Am–F have the same interval pattern in
different keys, so chordlist can place the songs together after normalising their progressions.

## What normalising means

For each comma-separated progression, chordlist shifts the first chord to a common reference note
and moves the remaining chords by the same number of semitones. These two lines therefore produce
the same normalised result:

```
G D Em C  →  C G Am F
C G Am F  →  C G Am F
```

Whitespace does not affect the comparison, and a progression beginning on a minor chord is given a
minor reference instead. Chord order and chord quality still matter:

```
G D Em C   matches C G Am F
G D C Em   does not match G D Em C
G D Em7 C  does not match G D Em C
```

This is an exact comparison after transposition, not a general judgement that two songs sound
similar. It does not infer substitutions, ignore a passing chord, rotate the loop, or decide that
two different sections are close enough.

## Multiple sections must line up

Commas split the `chords` field into separate progressions. A song can record a verse and chorus
like this:

```
---
chords: G D Em C, C G D Em
---
```

Each section is normalised from its own first chord, and the complete sequence is compared. Another
song matches only when it has the same number of sections with the same chord order and qualities
after normalisation.

That strictness keeps the suggestions predictable. It also means two songs can share a verse loop
without appearing as matches if their choruses differ. Record the level of detail that is useful to
you: a single central loop for broad grouping, or several comma-separated sections for narrower
matches.

The [file format guide](/docs#file-format) documents the field. If Roman numerals would make the
relationship easier to see, [compare the three notation systems](/blog/chord-notation-styles).

## Find the suggestions

Once a valid progression is stored, songs with the same normalised value appear as suggestions on
the song detail view. A song without a parseable first chord cannot be normalised, so use ordinary
chord symbols such as `F#m`, `Bb`, or `C/G` rather than prose in the field.

The progression does not need to be in the same key as the song you are viewing. Matching is about
the movement between chords, not the absolute names.

## Build a short set

Use the matches as a harmonic shortlist:

1. Open a song you can already play comfortably.
2. Check the matching-progression suggestions beneath it.
3. Open a candidate and play the final loop of the first song into the opening of the second.
4. Adjust the viewed transposition if the vocal range or transition needs another key.
5. Write down the order once the hand-off works without stopping.

The [playing guide](/docs#playing) covers suggestions, transposition, and moving back through songs
opened during the current session. If you need a progression to practise first,
[I–V–vi–IV is a useful starting point](/blog/how-to-play-almost-any-pop-song).

## Treat a match as a starting point

The same harmony does not guarantee a smooth segue. Tempo, metre, groove, melody, lyrical mood, and
vocal range can all pull two songs apart. A normalised match also says nothing about whether the
original keys are comfortable for the same singer.

That is why the suggestions work best as a filter rather than an automatic setlist. They reduce a
large library to songs worth trying with your instrument in hand. The final decision still belongs
to your ear—and to the room you are trying to keep moving.
