---
title: Why a songbook should be plain text
description: Apps close down and export tools break. A folder of Markdown files outlives both.
created: 2026-08-01
published: 2026-08-01
tags:
  - markdown
  - workflow
---

You have probably lost a songbook before. An app shut down, a subscription lapsed, or a sync service
quietly stopped supporting the format you had spent two years filling. The songs were still yours in
principle. Getting them out was somebody else's decision.

That is the problem chordlist starts from. Every song is a Markdown file in a folder you pick, and
nothing about that arrangement depends on the app continuing to exist.

## A song is a file

Here is a complete song file. There is no database, no proprietary container, and no export step:

```
---
chords: G D Em C
tags:
  - ballad
---

[Verse]

G            D
Coffee on the counter going cold
Em               C
Radio is humming something old
```

The chords sit on the line above the words, which is how chord sheets have been written by hand for
as long as people have been passing them around. The block at the top is YAML frontmatter — optional
metadata the app reads for chord progressions and tags. Everything else is the song.

You can read that file in a text editor, print it, email it, or open it on a laptop in twenty years.
The [sample song on the home page](/#preview) is a real file you can download and try that with.

## The folder is the structure

chordlist reads Markdown files one level below the folder you choose. The artist comes from the
folder name and the title comes from the filename:

```
Songs/
├── The Beatles/
│   └── Let It Be.md
└── Tracy Chapman/
    └── Fast Car.md
```

That is the entire schema. Renaming a file renames the song; dragging it to another folder changes
the artist. The [file and folder format](/docs#file-format) page covers the details, including which
frontmatter fields the app maintains for you.

## Other tools still work

Because the library is just folders and text, chordlist is not the only way to work with it. You can
tidy filenames in Finder, edit lyrics in any Markdown editor, or keep the whole folder in Git and get
a version history of every change you have ever made to a chord sheet.

The [managing files with other apps](/docs#other-apps) section goes through the practical cases,
including the one rule worth remembering: leave the song editor before you change the same file
somewhere else, then pull down on the library to refresh.

## What you give up

Honesty matters more than a clean pitch here. Plain files mean no server-side search across devices,
and no automatic conflict resolution — if you edit the same song on two offline devices, whichever
file provider you use will resolve that its own way. Storing your library in iCloud Drive means
Apple's sync rules apply, not ours.

What you get in exchange is that nothing in this arrangement can be taken away from you. The files
are on your device, in a folder you named, in a format you can read without us.
