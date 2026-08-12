# Interactive Remotion video editor

This is the primary editor for the chordlist demo. It turns the chapter clips prepared by the
existing capture workflow into an animated 1080 × 1920 video. Remotion Studio supplies the live
preview, timeline, editable Props panel, and render dialog; no Keynote recording is required.

The template provides:

- short (~15 seconds), standard (~30 seconds), and documentary (~45 seconds) compositions from
  one shared timeline system;
- the five canonical storyboard scenes, grouped by chapter title rather than fixed timestamps;
- automatic light/dark clip selection;
- the website's near-black ambient-gradient canvas, Geist typography, monochrome controls, and
  chordlist glyph;
- animated hook, scene headings, subtle dissolves, progress marks, and an end card;
- centered recordings, a side-slide entrance for the first shot, and a longer blend into search;
- one shared `mediaPadding` setting around every app clip, defaulting to 28 pixels;
- optional voiceover, music, shot labels, and a separately recorded Files/Markdown reveal;
- scene switches and copy that can be edited from Remotion Studio's Props panel;
- the frame-aligned light theme-colour scroll imported directly from the app press kit.

## Open the editor

Install the website dependencies once, from the website repository root:

```bash
pnpm install
```

Then open it whenever you want to edit:

```bash
pnpm video:studio
```

Select **ChordlistPromoShort**, **ChordlistDemo**, or **ChordlistPromoDocumentary**. Open the right sidebar with the button in the top-right corner or
Command-J, then choose **Props**. Changes update the preview immediately. The render button uses
the current values, and the save button can write edited default props back to `src/Root.tsx`.

The existing masters contain the previous nine-shot flow. The editor skips unavailable chapter
titles, so they still produce a usable preview. After the next automated capture, the import,
chord-keyboard, shuffle, matching-song, and next-song footage appears automatically.

## Refresh the footage

The app repository owns recording and chapter extraction. From its root:

```bash
scripts/capture-video.sh --no-open
scripts/prepare-video-editor-assets.sh
```

Then, from the website repository root, sync the prepared clips:

```bash
pnpm sync:video
```

`pnpm video:studio` and every video render run this sync automatically. It copies the disposable
clips from the sibling `chordlist-app` checkout into Remotion's local media folder and rebuilds its
manifest from each take's WebVTT file. Set `CHORDLIST_APP_REPO` to an absolute path when the app
repository is not the default sibling. Titles, descriptions, and take-specific durations therefore
continue to come from the capture pipeline. The sync also copies the finished light colour-scroll
master to `public/video/` for the website and into Remotion's generated feature assets.

For a complete website-side refresh, including screenshots, the press archive, and video clips:

```bash
pnpm sync:all
```

## Make ordinary edits without code

The Props panel exposes:

- `cut` — switches between the short, standard, and documentary timing profiles; the named
  compositions set the matching value by default;
- `appearance` — switches every scene between the light and dark take while the surrounding
  website-branded canvas stays dark;
- `copyVariant` — switches the complete campaign copy between `open-tabs`, `play-more`, and
  `ownership` with one dropdown;
- `accentColor` — controls headings, progress marks, and the end-card button; the website-matched
  default is off-white;
- `mediaPadding` — one consistent inset around every video;
- `showShotLabels` — useful while choosing clips, normally off for the public render;
- `scenes` — switches scenes on or off and edits headings, clip order, and maximum clip length;
- `startOffsetSeconds` inside each scene — skips the opening portion of its source clips;
- `musicFile` and `voiceoverFile` — optional filenames from `public/audio/`;
- `manualClipFile` — the optional Files/Markdown MP4 from `public/manual/`.

Audio and manual footage are ignored by Git so licensed or work-in-progress media is not committed
accidentally. App captures remain silent; mix levels are controlled with `musicVolume` and
`voiceoverVolume`. The editor drops up to the first half-second of each generated chapter and, when
a chapter is longer than its scene limit, uses its ending portion. That skips the UI automation
delay at the start and favors the action after it has visibly landed.

## Render repeatable masters

Use the Studio render button for the values currently visible in the Props panel. For the checked-in
light and dark presets:

```bash
pnpm video:render:light
pnpm video:render:dark
```

For the three light campaign lengths:

```bash
pnpm video:render:short
pnpm video:render:standard
pnpm video:render:documentary

# Render all three
pnpm video:render:campaign
```

The MP4 files are written to `video/out/`. `pnpm video:render:both` produces both appearances. The preset
JSON files only override `appearance`, so the rest of the defaults stay shared.

## Files and responsibilities

- `src/Root.tsx` — editable defaults and canonical five-scene grouping
- `src/timeline.ts` — shared short, standard, and documentary timing profiles
- `src/copy.ts` — complete named copy packs selected by the single `copyVariant` prop
- `src/ChordlistDemo.tsx` — layout and animation system
- `src/video-schema.ts` — controls shown in the Props panel
- `../scripts/sync-video-assets.mjs` — joins app-generated chapter clips to the template by title
- `src/generated/asset-manifest.json` — generated clip metadata, refreshed by `sync:video`
- `render-props/` — repeatable command-line render variants
- `public/generated/` and `out/` — disposable, ignored output

Remotion is free for individuals and teams of up to three under its current license. Recheck the
[official license and pricing](https://www.remotion.dev/license) if the team or use case changes.

## Keynote fallback

The hand-maintained Keynote fallback remains in
`chordlist-app/press-kit/video/editor/chordlist-video-editor.pptx`. Use it when handing the project
to someone who does not want a local Remotion setup; do not try to keep the two timelines
synchronized frame by frame.
