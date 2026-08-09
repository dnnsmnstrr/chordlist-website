---
title: Why a songbook should be plain text
description: A folder of readable Markdown files keeps your songbook portable and under your control when apps, subscriptions, and export tools change.
created: 2026-08-01
published: 2026-08-01
tags:
  - markdown
---

Your songbook should outlast the app you use to manage it. If the songs live only inside a service,
an expired subscription, a discontinued app, or a broken export can turn years of work into a
migration problem.

chordlist starts from the file instead. Every song is a Markdown file in a folder you choose, so the
library remains useful without depending on the app continuing to exist.

## File over app

Steph Ango, who helps make Obsidian, calls this idea
[File over app](https://stephango.com/file-over-app): if you want a digital artefact to last, keep it
as a file you control in a format that remains easy to retrieve and read. The software is temporary;
the file is the part you keep.

That essay influenced how chordlist stores songs. A private database with an export button would
have been a familiar design, but the export is then a second version of your data that has to keep
working. When the songs are ordinary files from the beginning, there is no proprietary format to
convert before another tool can read them.

## Every song is a file

Here is a complete song file:

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

The chords sit above the words, as they do on an ordinary chord sheet. The block at the top is YAML
frontmatter: optional metadata that chordlist reads for details such as the progression and tags. It
can also hold the play history the app records when you mark a song as played.

Nothing there requires chordlist to decode it. You can open the file in a text editor, print it, send
it to someone, or move it into another Markdown app. The [sample song on the home page](/#preview) is
a real file you can download and inspect yourself.

## The folder is the structure

In the usual layout, each artist is a folder and each song title is a filename:

```
Songs/
├── The Beatles/
│   └── Let It Be.md
└── Tracy Chapman/
    └── Fast Car.md
```

Renaming a file renames the song. Moving it to another artist folder changes the artist. The
[file and folder format](/docs#file-format) documents the fields chordlist maintains and how files
at the root of the library are handled.

## Other tools still work

Because the library is folders and text, chordlist does not have to be the only way you work with
it. You can tidy filenames in Finder, edit lyrics in a Markdown editor, or keep the folder in Git to
record a history of your changes.

Try that with the sample song: download it, open it in a text editor, change a line, and open it
again. You do not need an export command or a conversion tool at any point. The
[guide to working with other apps](/docs#other-apps) covers the practical details.

## Files still need care

Plain text improves portability; it does not prevent deletion or resolve sync conflicts. If the
folder is in iCloud Drive, Apple decides when it syncs and how conflicting edits are handled.
chordlist does not add a separate account or server-side copy behind it.

Keep a backup of any library you would be upset to lose, and avoid editing the same song in two apps
or on two offline devices at once. The useful promise is not that a file is indestructible. It is
that you can read, copy, and move your songbook without asking chordlist for permission.
