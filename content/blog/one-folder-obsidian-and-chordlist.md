---
title: One folder, Obsidian and chordlist
description: An Obsidian vault is a folder of Markdown files. So is a chordlist library. They can be the same folder.
created: 2026-08-04
published: 2026-08-04
tags:
  - obsidian
  - workflow
  - markdown
---

If you already keep notes in Obsidian, you have the infrastructure for a songbook: a folder of
Markdown files that syncs to your phone. chordlist reads that same folder, so you do not have to
choose between writing about music in one app and playing from it in another.

## Why this works at all

An Obsidian vault is not a special format. It is a directory with Markdown files in it and a hidden
`.obsidian` folder holding the app's own settings. chordlist ignores that hidden folder and reads
everything one level down, treating each subfolder as an artist and each `.md` file as a song.

Neither app owns the files. Both are readers of the same directory.

## Setting it up

The order matters on iPhone and iPad, because Obsidian requires iCloud vaults to live in a specific
place:

1. On the device, create an Obsidian vault with **Store in iCloud** enabled. Obsidian puts it under
   `iCloud Drive/Obsidian/[Vault Name]`.
2. In chordlist, open **Settings → Songs Folder** and select that vault folder.
3. Inside the vault, make one folder per artist and keep each song as `Artist/Song Title.md`.
4. Edit in either app. If a change made elsewhere has not appeared yet, pull down on the chordlist
   library to rescan.

On macOS it is easier — Obsidian can open an existing chordlist folder directly as a vault. The
[Obsidian section of the docs](/docs#obsidian) has the full walkthrough and Obsidian's own iCloud
setup guide.

## Frontmatter that survives both apps

This is the part people worry about, and it is worth being precise. chordlist maintains a few YAML
frontmatter fields — `chords`, `tags`, and the `playCount` and `lastPlay` values it updates when you
mark a song as played. Other frontmatter is preserved when chordlist edits a file.

So Obsidian properties, Dataview fields, and anything else you have added at the top of a note stay
where they are. A song can be a note in your vault and a playable chord sheet at the same time,
without either app clobbering the other's metadata.

## Before a gig without signal

An iCloud Drive folder can appear in Files while its contents live only in the cloud, which is a bad
surprise on stage. Touch and hold the vault folder in Files and choose **Keep Downloaded** before you
go. Do it on every device that needs it — the setting is per-device.

The [offline section](/docs#offline) covers this properly, including why Keep Downloaded is not a
substitute for a backup.

## The honest limitation

Two apps writing to one file is still two apps writing to one file. Close or leave the chordlist song
editor before you edit the same song in Obsidian, and avoid editing the same song on two offline
devices at once — the file provider may create a conflict copy, and resolving that is between you and
iCloud.

In practice this is a small price. Your songs sit in the same place as the rest of your notes, in the
same format, readable by both.
