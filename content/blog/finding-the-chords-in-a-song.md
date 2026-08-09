---
title: Finding the chords in a song
description: A practical way to work out a chord progression by ear when there is no chart, or the chart you found does not sound right.
created: 2026-08-08
published: 2026-08-21
tags:
  - chords
  - workflow
---

Sooner or later you want to play something nobody has written a chart for. Or you find a chart that
is transposed oddly, skips a section, or simply does not match the recording.

Working out the chords by ear is not a single flash of recognition. It is a series of small tests:
find a likely home note, follow the bass, try the common chords around it, and revisit the bar that
still sounds wrong.

## Find a candidate for home

Listen for a note that feels settled rather than tense. It often appears at the end of a phrase,
chorus, or final held chord. Hum that note, find it on an instrument, and test it against several
parts of the song.

Treat it as a candidate, not a verdict. A melody can finish on another note of the chord, a recording
can fade before resolving, and some songs deliberately avoid a clear tonic. The playable keyboard
at the bottom of [the home page](/) is enough to hunt for the note if you do not have an instrument
nearby.

Once a key seems likely, start with its I, IV, V, and vi chords. In G major those are G, C, D, and
Em. They are not the only possibilities, but they give you a manageable first pass.

## Follow the bass, then verify it

The bass is often the clearest clue to a chord change. On a strong beat it commonly lands on the
root, so first listen for where the bass moves rather than trying to name every note in the mix.

It can also lead you astray. Bass lines walk between chords, and inversions put a note other than the
root at the bottom. Use the bass to propose a chord, then play the full chord against the melody. If
the bass fits but the chord above it clashes, keep looking.

## Test a familiar loop

If the harmony sounds familiar, try I–V–vi–IV before solving every chord separately. In G that is
G–D–Em–C. If three chords fit and one sounds sour, you have reduced the problem to one change rather
than an entire section.

Do not force the loop onto the song. Try I–IV–V, vi–IV–I–V, or a repeated two-chord movement if that
is what you hear. A common progression is a useful hypothesis, not an answer key.

## Work one section at a time

Loop the verse until you can play through it without guessing, then do the chorus. Count how long
each chord lasts as well as which chord it is; the correct names in the wrong places still make a bad
chart.

Leave an unusual bridge or turnaround until the repeated sections are stable. It may introduce a
borrowed chord or a key change, but it may also rearrange chords you already know. Solving the main
loop first gives you something reliable to compare it with.

## Write down each result

Record the verse before moving to the chorus. Otherwise a partly solved song has a way of becoming
the same puzzle again tomorrow.

In chordlist, the progression can live in the file's frontmatter while the chord sheet stays in the
body:

```
---
chords: G D Em C, C G D Em
---

[Verse]

G            D
Coffee on the counter going cold
```

Commas separate progression sections. [Adding songs](/docs#adding-songs) covers creating one in the
app, while the [file format](/docs#file-format) explains what to type in a Markdown editor. If you
import an existing online chart, review the result against the recording before saving it and make
sure you have the right to use the material.

## Check the awkward bars

Play the rough chart from the beginning and mark every place where you hesitate or where a melody
note rubs unexpectedly. Then test those bars in isolation:

1. Check whether the chord changes on the beat you assumed.
2. Try another diatonic chord from the same key.
3. Listen for an inversion, seventh, suspended chord, or chromatic bass note.
4. Return to the full section and make sure the correction still works in context.

A match with another progression in your library can be a useful comparison, but it does not prove
the transcription is correct. Plenty of songs share a common loop, and an unusual song may match
nothing at all.

## Practise the procedure

Capos, dense arrangements, and ambiguous major or minor centres can all obscure what you hear. The
way through is repetition rather than perfect pitch. Choose a familiar song, loop four bars, write
down only the roots, and refine the qualities afterwards.

A rough progression that survives a full play-through is useful. Save it, play it again tomorrow,
and correct it when your ear catches more detail.
