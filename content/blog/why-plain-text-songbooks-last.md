---
title: Why your songbook should be plain text
description: A folder of readable Markdown files keeps your songbook portable and under your control when apps, subscriptions, and export tools change.
created: 2026-08-01
published: 2026-10-10
tags:
  - markdown
  - obsidian
cover: /blog/why-plain-text-songbooks-last/phone-on-sheet-music.webp
coverAlt: A black phone resting on an open book of sheet music in soft, grainy light.
outline:
  - Your songbook should outlast the app that manages it — subscriptions lapse, apps disappear, exports break
  - File over app (Steph Ango's essay) and how it shaped chordlist's storage
  - "Show one complete song file: chords above the words, optional frontmatter"
  - "The folder is the structure: artist folders, song filenames — rename or move to edit"
  - "Other tools keep working: Finder, Markdown editors, Git"
  - "Honest limits: plain text is portable, not indestructible — backups, iCloud sync conflicts"
  - "Image available: public/blog/why-plain-text-songbooks-last/phone-on-sheet-music.webp"
approved: 2026-10-02
approvedDigest: dbcf58761575
---

Your personal collection of songs should not be bound to a specific service or app. Ask yourself: do you want to keep paying for a subscription just to access a list of songs you painstakingly curated? What happens when the company running the service ceases to exist or loses the rights to certain songs?

Something like this happened to me with an internet-favorite meme song in a popular chord app! I simply wanted to rickroll my friends while playing the piano and was suddenly confronted with this:

![Alert in a chord app with the text "The artist asked us not to show this tab"](/blog/why-plain-text-songbooks-last/ug-rickroll-ban.webp "Songs can just disappear on Ultimate Guitar")

The solution to these problems is taking ownership of your data. A good way to do this is to store it in an open file format on a medium you control, where it can be read without proprietary software. The most basic example is a plain text file. It can be read on a computer from 20 years ago and will most likely still be readable in 100 years or more.

## File over app

Steph Ango, who works on [Obsidian](https://obsidian.md), realized this and coined the concept "File over app" in his [essay of the same name](https://stephango.com/file-over-app). That idea influenced how chordlist stores songs. Because every song is saved as a text file on your own device, there is no lock-in and no way for third parties to remove access to your collection.

## Every song is a file

To save more than just lyrics, chordlist uses [Markdown](https://spec.commonmark.org/), which is still plain text, with a few conventions on top. Metadata like the chords goes into the so-called frontmatter, a short block at the top of the file, so everything about the song is in one place:

```markdown
---
chords: G D Em C
tags:
  - piano
---

[Verse]
G                         D
Coffee on the counter going cold
Em                        C
Radio is humming something old
```

The [file format documentation](/docs#file-format) lists every field chordlist reads. Apps like Obsidian can read and edit these files too, so they are cross-compatible, and they can be synced with cloud services such as iCloud Drive to share one library across multiple devices. See [managing files with other apps](/docs#other-apps) for how that works in practice.
