# Motion suite

Short animated graphics for marketing chordlist, built with Remotion in `video/src/motion/` beside the
[demo editor](../video/README.md). Where the demo editor cuts the press recording into a campaign
video, the motion suite is a set of **one-idea loops and stings**: each piece makes a single point,
reads with the sound off, and comes in the formats the channels in [Marketing plan](marketing-plan.md)
actually use.

Rendered files live in `public/video/motion/<piece>-<format>.mp4`, each with a poster
`<piece>-<format>.jpg` of its final frame, so they are served by the site at `/video/motion/…`.

## Pieces

| Piece | Idea | Formats | Default theme | Suggested use |
| --- | --- | --- | --- | --- |
| `logo-sting` | The mark assembles itself — keys drop, strings draw, the wordmark types out — then the tagline | square, story, wide | `ink` | Opener or closer for any video; YouTube/press intro; profile video |
| `plain-text` | `morning-light.md` types out as Markdown, then the app's render of the same song slides in | square, story, wide | `paper` | The ownership/portability argument; blog header for file-format posts |
| `transpose` | Morning Light's verse shifts +2, then +5, then home; chords roll in place and keep their columns, words never move | square, story, wide | `ink` | Feature post for transpose |
| `same-chords` | Seven library songs in seven keys fold into Roman numerals and all read I – V – vi – IV | square, story, wide | `blueprint` | The "party trick" series (Video scripts §1) — the product's most shareable idea |
| `chord-keys` | Morning Light played on the chord keyboard, chord name landing on each change, progression filling in | square, story, wide | `ink` | Songwriting angle; chord-keyboard feature post |
| `hands-free` | The hands-free autoscroll shot from the press demo, with a running clock beside "0 touches" | story, square, wide | `warm-stage` | Reels/TikTok/Shorts; performance angle |
| `theme-spectrum` | The colour-scroll master with the app's seven tints as swatches, the current one ringed and named | story, square, wide | `ink` | Customisation angle; App Store In-App Event support |
| `feature-reel` | A 31-second tour in six scenes cut from the real recording: library, chord keyboard, search, matching songs, transpose, autoscroll | wide, story | `ink` | Website hero video, YouTube, launch thread |
| `screen-wall` | Every screen drifting past in alternating columns, the tagline on a solid panel in the middle | wide, square, story | `ink` | Website/press backdrop, event screens, Product Hunt gallery |
| `manifesto` | Kinetic type on the beat: *Your lyrics. Your chords. Your files. Your songbook.* then the tagline | story, square, wide | `ink` | Brand statement, ad bumper, story slide |
| `launch-card` | "Now on the App Store", the free-limit line, and three screens rising | square, story, wide | `ink` | Launch-day posts; pinned post |

Formats: `story` 1080 × 1920, `square` 1080 × 1080, `wide` 1920 × 1080 (`portrait` 1080 × 1350 is
supported by every layout and can be registered in `MotionRoot.tsx` when a channel needs it).

## Rules the suite keeps

- **Named campaign themes only.** Every piece takes a `campaign` prop (`ink`, `paper`, `blueprint`,
  `warm-stage`) and an `appearance` prop for which captures to show. Switch them in Studio's Props
  panel; nothing else in the layout changes.
- **Product pixels are untouched.** Screenshots and recordings sit in a flat bezel of the theme's panel
  colour: translated and scaled, never tilted, blurred, tinted, or overlaid (DESIGN.md §7). The screen
  wall puts its copy on a solid panel for this reason.
- **The canonical logo.** `logo-sting` animates the shapes from `design/mark.json` and settles on the
  exact standard tile; every other piece signs with the shared lockup.
- **Copy is not invented.** Words live in `video/src/motion/copy.ts`. The tagline and the free-limit
  line are read from `locales/vocabulary.json` (VOCABULARY.md in the app repository); every other line
  restates something the site already says. The launch card states no price.
- **No one else's lyrics.** The only lyrics on screen are Morning Light's, chordlist's own demo song.
  Other songs appear by title and artist only. The press recording's imported-draft and next-song
  chapters show third-party lyrics, so `recording.ts` leaves the first out and no cut runs into the
  second.
- **Fonts are vendored.** Geist and Geist Mono are in `video/public/fonts/`, so a render never fetches
  from the network (the demo editor now loads them the same way).

## Render

```bash
pnpm video:render:motion                         # everything
pnpm video:render:motion Transpose SameChords    # by piece
pnpm video:render:motion HandsFree-story         # one format
```

`sync:motion` runs first: it copies the screenshots from `public/app-screenshots/` and the press
recordings from the app repository (`CHORDLIST_APP_REPO`, `../chordlist-app`, or `../chordlist`) into
the ignored `video/public/generated/motion/`. Without the app repository the screenshot-based pieces
still render; `hands-free` and `feature-reel` need the recordings.

In a container that ships its own Chromium, set `REMOTION_BROWSER_EXECUTABLE` to it.

To preview and edit, `pnpm video:studio` and open the **Motion** folder.

## Adding a piece

1. Write `video/src/motion/<Piece>.tsx` taking `MotionProps`, using `useLayout()` for format-aware
   geometry and `CopyBlock`/`Caption`/`Footer` from `scaffold.tsx` for the shared typographic frame.
2. Add its words to `copy.ts`.
3. Register it in `motionPieces` in `MotionRoot.tsx` with its formats and default theme.
4. Render it and add a row to the table above.
