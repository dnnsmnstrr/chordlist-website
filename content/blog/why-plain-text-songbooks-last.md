---
title: Why your songbook should be plain text
description: A folder of readable Markdown files keeps your songbook portable and under your control when apps, subscriptions, and export tools change.
created: 2026-08-01
published: 2026-10-10
tags:
  - markdown
  - obsidian
outline:
  - Your songbook should outlast the app that manages it — subscriptions lapse, apps disappear, exports break
  - File over app (Steph Ango's essay) and how it shaped chordlist's storage
  - "Show one complete song file: chords above the words, optional frontmatter"
  - "The folder is the structure: artist folders, song filenames — rename or move to edit"
  - "Other tools keep working: Finder, Markdown editors, Git"
  - "Honest limits: plain text is portable, not indestructible — backups, iCloud sync conflicts"
  - "Image available: public/blog/why-plain-text-songbooks-last/phone-on-sheet-music.webp"
approved: 2026-10-02
approvedDigest: 955d90d39e8c
---

Your personal collection of songs should not be bound to a specific service or app. Ask yourself: do you want to keep paying for a subscription just to keep accessing a list of songs you painstakingly curated? What happens when the company running the service you use ceases to exist or loses the rights to certain songs?

Something like this happened to me with an internet-favorite meme song in a popular chords app! I simply wanted to rickroll my friends while playing the piano and suddenly got confronted with this:

![Alert in a chords app with the text "The artist asked us not to show this tab"](/blog/why-plain-text-songbooks-last/41db5d6a-a50d-4f12-900b-dbc6fe5f31f1-1-201-a.webp "Songs can just disappear on Ultimate Guitar")

The solution to these problems is taking ownership of the data. A good way to do this is to ensure it is stored in an open file format on a medium you control, where it can be accessed without proprietary software. The most basic example of this is a plain text file. It can be read on a computer from 20 years ago and will most likely still be readable in 100 years or more.

## File over app

Steph Ango, who works on [Obsidian](https://obsidian.md), realized this and coined the concept "File over app" in his [essay of the same name](https://stephango.com/file-over-app). That idea influenced how chordlist stores songs. By saving songs as text files in the local file system, there is no lock-in and no way for third-parties to remove access to your collection. 

## Every song is a file

In order to save more than just lyrics, the Markdown format is used as an extension of the basic `.txt` file. This allows keeping metadata like chords in the so-called "front matter", so all relevant information regarding the song is included in the file. Apps like Obsidian can read and edit these files, so they are cross-compatible and can be synced to cloud services such as iCloud to enable a shared library over multiple devices.
