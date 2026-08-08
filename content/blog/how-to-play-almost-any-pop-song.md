---
title: Learn how to play (almost) any pop song
description: Four chords, in one order, carry a startling share of popular music. Here is the shape and how to practise it.
created: 2026-08-08
published: 2026-08-28
tags:
  - chords
  - workflow
---

You probably know more songs than you can play. Not because the songs are hard, but because
nobody told you how few chords most of them use.

If you can hold down G, D, Em and C, you can get through a large part of sixty years of
popular music. Change which chord you start on and you get a good part of the rest.

## The four chords

Roman numerals number the chords built on each degree of the major scale. Uppercase is
major, lowercase is minor. The progression is **I–V–vi–IV**, and in the key of G it looks
like this:

```
I    V    vi   IV
G    D    Em   C
```

The useful part is that the shape moves. Pick the key that suits your voice and the four
chords come with you:

```
Key    I     V     vi    IV
G      G     D     Em    C
C      C     G     Am    F
D      D     A     Bm    G
A      A     E     F#m   D
E      E     B     C#m   A
```

The sample song on this site is built on exactly this. Its frontmatter starts
`chords: G D Em C`, and you can [download the file](/songs/morning-light.md) or
[see it rendered](/#preview) with the chords sitting above the words.

## Why it keeps working

The I is home. The V pulls hard back towards it. The vi is the relative minor, so it
darkens the mood without leaving the key. The IV lifts and sets up the return.

That is a complete emotional round trip using only chords from one scale, which is why it
survives being played at any tempo, in any style, with any melody on top. Start the same
four chords on the vi instead and you get the moodier vi–IV–I–V that a lot of ballads use.
Same chords, different centre of gravity.

## Practise it in a key you can sing

Most people learn a progression in one key and then avoid every song written in another
one. Do the opposite. Take a song you know, move it a couple of semitones, and play it
where your voice is comfortable.

In chordlist you can tap the chord progression to shift it up or down while you play. The
transposition changes what you are looking at and resets when you leave the song — it does
not rewrite the file, so you can experiment without damaging anything you have written
down. The [playing section of the docs](/docs#playing) covers that along with autoscroll.

## Find the ones you already have

Once a progression is written into a song's `chords` field, chordlist groups songs that
share the same normalised progression. So after you learn these four chords, the app can
show you which songs in your own library you can already play.

That turns practice into a list instead of a memory exercise. Learn the shape once, then
work through everything that matches. The [file format docs](/docs#file-format) show where
the `chords` field lives if you want to add it to songs you already have.

## Where it stops

"Almost any" is doing real work in that title. Plenty of songs move outside these four
chords, and the interesting ones usually do: a borrowed chord in the bridge, a key change
for the last chorus, a minor iv that makes the whole thing ache. Blues, jazz and most folk
traditions are built on other foundations entirely.

Four chords will not make you a complete musician. It will get you playing whole songs in
an afternoon instead of practising fragments for a month, and that is usually the thing
that keeps people going long enough to learn the rest.
