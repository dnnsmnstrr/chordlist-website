---
title: Finding songs that share a progression
description: Four chords cover a startling amount of the songbook. chordlist groups the songs that match.
created: 2026-08-08
published: 2026-09-11
tags:
  - chords
  - workflow
---

Play G–D–Em–C for long enough and you will start hearing it everywhere, because it genuinely is
everywhere. That overlap is useful: if two songs share a progression, you can move between them
without stopping to work anything out.

chordlist normalises the chord progression on each song and groups the ones that match, so the
songs you can segue into are listed on the song you are already playing.

## What normalising means here

A progression written `G D Em C` and one written `G  D  Em  C` are the same four chords. So, for the
purpose of matching, is the same shape starting somewhere else on the neck. Normalising strips the
formatting differences so the comparison is about the harmony rather than the typing.

The result shows up as suggestions on the song detail view — other songs in your library built on
the same progression.

## Where the progression comes from

The `chords` field in a song's frontmatter:

```
---
chords: G D Em C, C G D Em
---
```

Commas separate sections, so a verse and a chorus can each have their own progression. You can type
this when creating a song, or add it later by editing the file in any Markdown editor. The
[file and folder format](/docs#file-format) section documents the field.

## Using it while you play

Tap the progression to transpose up or down by semitones. That changes what you are looking at for
as long as you are on the song — it does not rewrite the file, and it resets when you leave. So you
can pull up a song, drop it a tone to suit your voice, and the file on disk is untouched.

The [playing section](/docs#playing) covers transposition, autoscroll, and moving back through the
songs you have opened in the current session.

## A practical use

Build a short set by starting from one song, checking its matching progressions, and picking the
next one from that list. You are not looking for songs in the same genre or the same key — you are
looking for songs your hands already know how to play, which is a different and more useful filter
when you are trying to keep a room moving.
