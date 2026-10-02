---
title: Use one folder for Obsidian and chordlist
description: Set up one iCloud-backed folder as both an Obsidian vault and a chordlist library without duplicating songs or metadata.
created: 2026-08-04
published: 2026-09-18
tags:
  - obsidian
  - workflow
---

If you already keep music notes in an iCloud-backed Obsidian vault, you do not need a second copy of
the same songs for chordlist. Both apps can work with one folder of Markdown files: write and
organise in Obsidian, then open the same files in chordlist when you play.

The setup matters on iPhone and iPad because Obsidian expects an iCloud vault to live in its own
folder. Create the vault there first, then select it from chordlist.

## Why the same folder works

An Obsidian vault is a directory of ordinary files plus a hidden `.obsidian` folder for the app's
configuration. chordlist ignores hidden items. With the usual chordlist layout, each visible
subfolder is an artist and each Markdown file inside it is a song:

```
My Songbook/
├── .obsidian/
├── Nina Simone/
│   └── Feeling Good.md
└── Radiohead/
    └── Creep.md
```

Obsidian sees notes and folders. chordlist sees artists and songs. Neither app needs a converted or
exported copy. That is the practical benefit of keeping a
[plain-text songbook](/blog/why-plain-text-songbooks-last).

## Set it up on iPhone or iPad

1. In Obsidian, create a vault with **Store in iCloud** enabled.
2. Confirm in Files that it lives at `iCloud Drive/Obsidian/[Vault Name]`.
3. In chordlist, open **Settings → Songs Folder** and select the vault folder.
4. Inside the vault, create one folder per artist and keep each song as
   `Artist/Song Title.md`.
5. Edit a song in either app. If an external change has not appeared in chordlist, pull down on the
   library to rescan it.

The location is important: [Obsidian's iCloud instructions](https://obsidian.md/help/sync-notes#iCloud)
say that mobile vaults should sit inside the `Obsidian` folder in iCloud Drive. On macOS, you can
instead open an existing chordlist folder directly as a vault. The
[chordlist Obsidian guide](/docs#obsidian) covers both routes.

## Keep both kinds of metadata

At the top of a song, YAML frontmatter can hold properties for both apps:

```
---
chords: G D Em C
tags:
  - rehearsal
status: learning
source: personal chart
---
```

chordlist recognises its own fields, including `title`, `artist`, `chords`, `tags`, `playCount`, and
`lastPlay`, and may rewrite those when you edit or mark a song as played. Other frontmatter lines are
preserved when chordlist saves the file, so properties such as `status` and `source` can remain for
Obsidian or Dataview.

Avoid giving one property two different jobs. In particular, `tags` is an app-maintained field in
chordlist, so use another property name for Obsidian-only classifications that should not appear as
song tags.

## Prepare the vault for offline use

Seeing a folder in Files does not guarantee that every file is stored on the device. Before a
rehearsal or gig without reliable signal, find the vault in Files, touch and hold it, and choose
**Keep Downloaded**. Repeat this on every device that needs an offline copy.

[Apple's Files guide](https://support.apple.com/guide/iphone/transfer-files-iphone-a-storage-device-server-iphe9aff429a/ios)
documents the command and notes that a missing **Keep Downloaded** option can mean the item is
already stored locally. The [offline guide](/docs#offline) also explains why a downloaded copy is
not the same as a backup.

## Avoid editing the same file twice

Two apps can share a file, but they should not edit it at the same moment. Leave the chordlist song
editor before changing that song in Obsidian, and allow iCloud to finish syncing before editing the
same file on another device. Concurrent offline changes may produce a conflict copy that you have
to reconcile manually.

For a quick check, edit one harmless line in Obsidian, return to chordlist, pull down to refresh, and
confirm the change before moving the rest of your songbook. Once that round trip works, the vault can
remain one library: one set of files, two useful views, and no export step between them.
