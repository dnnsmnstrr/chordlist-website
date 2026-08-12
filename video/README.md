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
- the Appearance settings still followed by the frame-aligned light theme-colour scroll imported
  directly from the app press kit.

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
the current values, and the save button can write edited default props back to
`src/ChordlistRoot.tsx`.

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
continue to come from the capture pipeline. The sync also copies the Appearance settings screenshot
into Remotion's generated feature assets, then copies the finished light colour-scroll master to
`public/video/` for the website and into the same feature asset directory.

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
- `copyVariant` — switches the complete campaign copy between `open-tabs`, `play-more`,
  `ownership`, `customization`, `songwriting`, `shuffle`, and `chord-matching` with one dropdown
  while `copyMode` is `preset`;
- `copyMode` — use `preset` for a named copy pack or `custom` to render the editable text under
  `customCopy`;
- `customCopy` — edits the opening hook, every scene eyebrow/headline/explanation, and both lines
  on the end card. Switch `copyMode` to `custom` to put these values on screen;
- `accentColor` — controls headings, progress marks, and the end-card button; the website-matched
  default is off-white;
- `paperSeed` — chooses a different paper pattern while keeping that pattern frozen for the entire
  video, avoiding frame-to-frame texture jumps;
- `mediaPadding` — one consistent inset around every video;
- `showShotLabels` — useful while choosing clips, normally off for the public render;
- `scenes` — switches scenes on or off and edits clip order and maximum clip length;
- `sceneDurationSeconds` inside each scene — caps that scene's total screen time;
- `freezeFrame` inside each scene — treats the configured clips as one continuous source, selects
  the frame at `startOffsetSeconds`, and holds it for the full `sceneDurationSeconds`;
- `maxSecondsPerClip` inside each scene — caps every individual source clip in that scene, including
  documentary mode;
- `startOffsetSeconds` inside each scene — skips the opening portion of its source sequence;
- `musicFile` and `voiceoverFile` — optional filenames from `public/audio/`;
- `manualClipFile` — the optional Files/Markdown MP4 from `public/manual/`.

The opening hook, intro footer, and end line are editable under `customCopy`. The opening hook and
end line support both pasted line breaks and `\n` sequences, making it possible to control their
wrapping directly from the Props panel instead of relying on automatic line wrapping. Each copy
preset supplies its own intro footer when `copyMode` is set to `preset`.

Audio and manual footage are ignored by Git so licensed or work-in-progress media is not committed
accidentally. App captures remain silent; mix levels are controlled with `musicVolume` and
`voiceoverVolume`. During normal playback, every clip starts at its scene's
`startOffsetSeconds` value. In freeze mode, the offset runs across all available clips in their
configured order; an offset beyond the combined footage clamps to the final available frame.

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

Studio renders are written to `public/video/<composition>.<codec>` by `remotion.config.ts`. The
config specifies the `public/video` directory and Remotion appends the selected composition ID and
codec. The repeatable commands use descriptive filenames in the same directory, such as
`public/video/chordlist-promo-short-light.mp4`. Next.js serves these files at `/video/<filename>`,
and deployed videos are embeddable once their generated files are committed. `pnpm
video:render:both` produces both appearances. The preset JSON files only override `appearance`, so
the rest of the defaults stay shared.

## Files and responsibilities

- `src/ChordlistRoot.tsx` — editable defaults and canonical five-scene grouping
- `src/timeline.ts` — shared short, standard, and documentary timing profiles
- `src/copy.ts` — complete named copy packs selected by the single `copyVariant` prop
- `src/ChordlistDemo.tsx` — layout and animation system
- `src/video-schema.ts` — controls shown in the Props panel
- `../scripts/sync-video-assets.mjs` — joins app-generated chapter clips to the template by title
- `src/generated/asset-manifest.json` — generated clip metadata, refreshed by `sync:video`
- `render-props/` — repeatable command-line render variants
- `public/generated/` — disposable, ignored editor input generated from the app captures
- `../public/video/` — rendered, website-hosted MP4 output

Remotion is free for individuals and teams of up to three under its current license. Recheck the
[official license and pricing](https://www.remotion.dev/license) if the team or use case changes.

## Keynote fallback

The hand-maintained Keynote fallback remains in
`chordlist-app/press-kit/video/editor/chordlist-video-editor.pptx`. Use it when handing the project
to someone who does not want a local Remotion setup; do not try to keep the two timelines
synchronized frame by frame.
