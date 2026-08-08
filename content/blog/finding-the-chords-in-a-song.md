---
title: Finding the chords in a song
description: How to work out a progression by ear when there is no chart, or the chart you found is wrong.
created: 2026-08-08
published: 2026-08-21
tags:
  - chords
  - workflow
---

Sooner or later you want to play something nobody has written a chart for. Or you find a
chart and it is wrong — transposed oddly, missing the bridge, or confidently listing chords
that are not what you are hearing.

Working out chords by ear sounds like a talent. It is mostly a procedure.

## Find home first

Play the song and hum along until it ends. The note your voice wants to settle on is almost
always the tonic — the I. Find that note on an instrument and you have the key.

If you do not have an instrument nearby, there is a playable keyboard at the bottom of
[the home page](/) you can use to hunt for the note.

Once you know the tonic, you know roughly which chords are available. In the key of G, the
common ones are G, C, D and Em. That is usually enough for a first pass.

## Follow the bass

The bass line is the cheapest clue in the mix. It tends to land on the root of whatever
chord is playing, especially on the first beat of a bar.

Listen for where it moves rather than what it plays. A move up a fourth, a drop to the
relative minor, a return home — you are mapping shape, not transcribing a part. Get the
shape right and the chord names follow.

## Try the obvious progression

Before working note by note, test whether the song is doing what most songs do. Play
I–V–vi–IV over the verse and see if it fits. In G that is G, D, Em, C.

You will be right more often than feels reasonable. If it nearly fits but one chord sounds
sour, you have narrowed the problem to a single chord instead of four.

## Do the sections separately

Verses and choruses often use different progressions, and a chorus usually announces itself
by lifting. Work them out one at a time and write each down before moving on. Bridges are
where songs leave the key, so leave those until last.

## Write it down while you have it

This is the step people skip, and it is the reason the same song gets worked out three
times. When you have the verse, record it before moving to the chorus.

In chordlist a song is a Markdown file with the progression in its frontmatter and the
lyrics below, so writing it down is typing it:

```
---
chords: G D Em C, C G D Em
---

[Verse]

G            D
Coffee on the counter going cold
```

Commas separate sections, so the verse and chorus can each carry their own progression.
[Adding songs](/docs#adding-songs) covers creating one in the app, and
[the file format](/docs#file-format) covers the fields if you would rather type the file in
a text editor.

If a chart does exist online, you can paste its URL and let the app import it — just review
what comes back before saving it, and make sure you have the right to use it.

## Check yourself against your library

Once the progression is in the file, chordlist groups songs that share the same normalised
progression. If a song you just worked out suddenly sits next to three others you already
knew, that is a good sign you heard it correctly. If it matches nothing and the song sounds
ordinary, it is worth a second listen. The [playing section](/docs#playing) explains how
those matches show up.

## It will take longer than you want

Ear training is slow in a way that no method fixes. Relative major and minor share the same
notes and get confused constantly. Extensions — sevenths, sus chords, added ninths — are
easy to miss for months. Guitar songs recorded with a capo will have you hearing shapes that
do not match the sounding key.

None of that matters much at the start. A progression that is roughly right and written down
is worth more than a perfect one you never got around to capturing.
