# Motion suite

Short animated graphics for marketing chordlist, built with Remotion in `video/src/motion/` beside the
[demo editor](../video/README.md). The site already has two production systems for video
([Video scripts](video-scripts.md)): the Remotion promo, which owns product truth, and CapCut on the
phone, which owns the person. The motion suite is the Remotion side's third product: **the social
stills, in motion.** Each piece makes one point, reads with the sound off, and is built on the
same frame, words and formats as the `content/social/` assets it goes out with.

Rendered files live in `public/video/motion/<piece>-<format>.mp4`, each with a poster
`<piece>-<format>.jpg` of its final frame, so they are served by the site at `/video/motion/…`.

## How it fits the existing systems

- **The social frame.** Every piece is drawn inside the frame from
  `scripts/lib/social-templates.mjs`: the lockup with its lowercase label top left, the footnote URL
  bottom left, 80px padding, Geist 700 headlines with authored line breaks, and the social build's
  type scale (`scale` 1.34 for story, 1.16 for post). Stories keep the 190px / 240px safe areas, and
  a screenshot runs off the right edge in the portrait formats exactly as the `screenshot` template
  does.
- **The same words as the still.** A piece with a twin in `content/social/` reads its eyebrow,
  headline and footnote from that definition: `pnpm sync:motion` writes them to
  `video/src/motion/generated/social-copy.json`. Change the definition and both the PNG and the MP4
  follow on their next build. The feature reel's scenes quote the stills they summarize.
- **The social formats.** `story` (1080 × 1920) and `post` (1080 × 1350), as in the social matrix,
  plus a `wide` 1920 × 1080 master for YouTube and the site. `square` is laid out as well, for the
  Mastodon/Bluesky/Threads size, and can be switched on per piece in `MotionRoot.tsx`.
- **The promo's ending.** `end-card` is the promo's end card on its own — lockup, the launch cut's
  end line, the accent pill — on the promo's paper-textured warm-stage canvas. It is the clip
  [Video scripts](video-scripts.md) asks every phone edit to end on, and the feature reel ends on it.
- **The promo's canvas.** In the `warm-stage` theme every piece uses the promo's paper texture
  (`PaperBackground` from `ChordlistDemo.tsx`), so a motion piece cut next to the promo sits on the
  same ground. The other themes stay flat, like the stills.

## Pieces

| Piece | Idea | Social twin | Theme | Use |
| --- | --- | --- | --- | --- |
| `logo-sting` | The logo builds itself: keys drop, strings draw, the wordmark types out, then the tagline | — | `ink` | Opener for any video; profile video |
| `logo-reveal` | The logo assembles itself larger and centered; the name fades in beneath it | — | `ink` | Profile video, opener, splash |
| `logo-reveal-badge` | The same, with Apple's official App Store badge below the name (vendored unmodified in `video/public/badges/`) | — | `ink` | Ad end slate, launch posts |
| `plain-text` | `morning-light.md` types out as the `file` template, then the app's view of the same song slides in | (own copy, `file` frame) | `paper` | Series 2, *The file* |
| `transpose` | Morning Light's verse moves +2, then +5, then home; chords roll in place and keep their columns | — | `ink` | Feature post for transpose |
| `same-chords` | Seven library songs in seven keys fold into Roman numerals, all read I – V – vi – IV, then merge into that one progression, centered, and flip to C – G – Am – F, the key the app compares them in | `matching-progressions` (eyebrow and footnote; its own, simpler headline) | `blueprint` | Series 1, *The party trick* |
| `chord-keys` | Morning Light played on a keyboard drawn like the mark, one chord at a time | `chord-keyboard` | `ink` | Songwriting angle |
| `hands-free` | The hands-free autoscroll shot, with a running clock beside "0 touches" | — | `warm-stage` | Reels/TikTok/Shorts |
| `theme-spectrum` | The color-scroll master centered, with the app's seven tints as unlabeled swatches beneath it | — | `ink` | Customization angle |
| `feature-reel` | A 31-second tour of six scenes from the real recording, ending on the end card | quotes `song-library`, `chord-keyboard`, `search-across-everything`, `matching-progressions` | `ink` | Website, YouTube, launch thread |
| `screen-wall` | Every screen drifting past in columns, the tagline on a solid panel | `local-first-songbook` | `ink` | Hero backdrop, Product Hunt gallery |
| `manifesto` | *Your lyrics. Your chords. Your files. Your songbook.* on the beat, closing on the logo, the name and the address, centered | `local-first-songbook` (footnote) | `ink` | Brand statement, story slide |
| `launch-card` | "Out now on iPhone and iPad", the free-limit line, three screens rising | `out-now` | `ink` | Launch-day posts; pinned post |
| `end-card` | The promo's end card on its own | — | `warm-stage` | The last seconds of every phone edit |
| `chordlink-print` | The chordlink tag 3D-printed layer by layer: the round pocket opens, the print pauses while the NFC tag drops in, the lid seals it, and the filament changes to graphite for the logo | — | `ink` | chordlink launch, how-it's-made post |
| `chordlink-tap` | A locked phone touched to the tag: the NFC ripple, the unlock, and the app shuffling straight into a song (the real song screen) | — | `ink` | chordlink launch, explainer, ads |
| `chordlink-spin` | The finished chordlink model (`public/models/chordlink.glb`) on a slow turntable, with what one tap does | — | `ink` | chordlink page, product posts |

### chordlink in 3D

Both chordlink pieces render with `@remotion/three` (react-three-fiber inside a Remotion canvas),
so every frame is deterministic and renders headless like the rest of the suite.

- `chordlink-spin` loads the same GLB the `/chordlink` page shows, copied into
  `video/public/generated/motion/models/` by `pnpm sync:motion`.
- `chordlink-print` cannot use that file: the print needs what the finished model hides — the
  floor under the pocket, the pocket, and the lid — as separate bodies. `video/src/motion/chordlink/geometry.ts`
  rebuilds the tag from the configurator in `public/model.html` (its `build` function) at the
  first edition's defaults: a 32 mm squircle, a 1.2 mm plate, a 28 mm pocket from 0.4 to 0.8 mm
  for the 27 mm tag, and the logo's keys raised 0.4 mm in graphite. Change the tag there and in
  `model.html` together.
- `chordlink-tap` is 2D on purpose: the phone and its screen are the real screenshot, and the tag
  is the mark in the print's bone and graphite. The lock screen is a plain time and padlock rather
  than a copy of Apple's. iOS runs an NFC automation only once the phone is unlocked, so the piece
  shows that step instead of opening the song over the lock screen; the action is *Shuffle*, one
  of the three a chordlink can be set to.
- Layers are drawn 0.1 mm thick and the whole print is stretched ×2.5 in height (`EXAGGERATION`
  in `PrintScene.tsx`), because a 1.6 mm object is otherwise a sheet of paper on camera. The
  proportions in plan are true.

## Rules the suite keeps

- **Named campaign themes only.** Every piece takes a `campaign` prop (`ink`, `paper`, `blueprint`,
  `warm-stage`) and an `appearance` prop for which captures to show. Switch them in Studio's Props
  panel; nothing else in the layout changes. Ink pieces default to dark captures, as the stills do.
- **Product pixels are untouched.** Screenshots and recordings sit in a flat bezel: moved and scaled,
  never tilted, blurred, tinted, or overlaid (DESIGN.md §7). The screen wall puts its copy on a solid
  panel for this reason.
- **The canonical logo.** `logo-sting` animates the shapes from `design/mark.json` and settles on the
  standard tile; every other piece signs with the social lockup.
- **Copy is not invented.** Words come from `content/social/`, from `locales/vocabulary.json`
  (VOCABULARY.md in the app repository), or from `video/src/motion/copy.ts`, whose own lines restate
  what the site already says. Nothing states a price or prints a store URL.
- **No one else's lyrics.** The only lyrics on screen are Morning Light's, chordlist's own demo song.
  Other songs appear by title and artist only. The press recording's imported-draft and next-song
  chapters show third-party lyrics, so `recording.ts` leaves the first out and no cut runs into the
  second.
- **Fonts are vendored.** Geist and Geist Mono are in `video/public/fonts/`, so a render never fetches
  from the network (the demo editor loads them the same way).

## The editor: your own videos

`/motion` (local only, behind the admin login, listed on `/admin`) is a five-step wizard for making
new videos in the same frame without writing code:

1. **Start** — name the video, then pick a template, start from any `content/social/` still (its
   words, template and screenshot or photograph come with it), or reopen a saved video.
2. **Words** — the lowercase label, the headline line by line, an optional second line, the
   footnote, the caption, and the template's own fields (chords and numerals, or a file excerpt).
3. **Media** — for `screen`: an app screenshot, a clip of the press recording chosen by chapter and
   start point, the color scroll, or a file you upload; for `photo`: a photography master or an
   upload.
4. **Look** — theme, light or dark captures, formats, length, and whether to end on the end card.
5. **Render** — save, then render on this machine with a progress bar and the finished files.

The preview beside every step is Remotion's Player running the real composition, so what it shows
is what renders.

| Template | Is | Media |
| --- | --- | --- |
| `statement` | One claim, set large, with an optional second line | — |
| `screen` | The `screenshot` still: copy beside a phone that runs off the edge | screenshot, recording clip, color scroll, upload |
| `progression` | A chord row over its numerals, the headline a step below | — |
| `file` | A song as it sits on disk, typed out with its spacing kept | — |
| `photo` | A photograph full bleed, drifting slowly under the photo scrim | photography master, upload |
| `chordlink-print` | The `chordlink-print` scene, paced to the chosen duration (10 s or more reads best), with the headline above | — |
| `chordlink-model` | The finished chordlink on a turntable, with the headline and an optional subline | — |
| `chordlink-tap` | The `chordlink-tap` scene, paced to the chosen duration and shown in the chosen appearance, with the headline | — |

### Snippets

Wording that recurs — the labels, the footnote addresses, a headline used in several cuts — can be
kept as a snippet instead of being retyped. Beside each text field the wizard offers:

- **Use a snippet** — links the field to a snippet. The definition then stores a reference such as
  `eyebrow: {snippet: feature}` rather than the words, and the words are looked up when the video
  is previewed or rendered. Change the snippet and every video linked to it changes on its next
  render (`pnpm build:motion`); the field shows how many saved videos use it.
- **Edit snippet** — changes one of the wizard's own snippets in place, for every video using it.
- **Unlink** — turns the field back into plain text for this video only.
- **Save as snippet** — names the text in the field and links it.

The catalog has three sources, and only the first is edited here:

| Source | Ids | Changed in |
| --- | --- | --- |
| `content/motion/snippets.yml` | `feature`, `docs-playing` | the wizard, or the file itself (comments and order are kept) |
| VOCABULARY.md, via `locales/vocabulary.json` | `vocabulary/tagline`, `vocabulary/free-limit` | the app repository |
| `content/social/*.md` | `social/out-now` | the still's definition — the still and the video change together |

Starting from a social still links the eyebrow, headline and footnote to that still this way, so a
video made from a still keeps saying what the still says. Captions are the exception: a caption is
usually assembled from pieces, so a caption snippet is inserted as text rather than linked.

A reference to a snippet that does not exist is refused when the definition is saved, and fails
`pnpm build:motion` with the definition's name, so a renamed snippet cannot silently drop words
from a video.

What it writes, and where:

- **The definition**, `content/motion/<slug>.md` — YAML frontmatter that builds the video, a body
  that is its caption, in the shape of a `content/social/` definition. Its words may be snippet
  references, resolved at preview and render time. It is validated by the zod
  schema in `video/src/motion/custom/schema.ts`, which the wizard, its API, the composition and the
  render script all share.
- **Uploads**, `assets/motion/<slug>/` — images resized and re-encoded as WebP, videos kept as they
  arrived up to 80 MB. They are committed with the definition, so a render is reproducible from the
  repository alone; `sync:motion` copies them into Remotion's public folder.
- **The renders**, `public/motion/<slug>/<format>.mp4` with a final-frame poster beside each, and
  `public/motion/manifest.json` listing every definition. Served at `/motion/<slug>/<format>.mp4`.

`pnpm build:motion` renders every definition (`--only <slug>` for one); the wizard's Render button
runs the same script for the video in front of it. A definition deleted from `content/motion` has its
renders pruned on the next build, as `build:social` does for stills. The script runs under `tsx`
rather than as plain `.mjs` because it shares the schema with everything else.

The same rules as the rest of the suite hold, and the editor enforces the ones it can: the press
recording's chapters with third-party lyrics are not offered, a clip stops at the end of its
chapter rather than running into the next shot, and the paywall screenshot is left out because it
prints a price.

## Library: share to Instagram from your phone

`/motion/library` (behind the admin login, and on the deployed site too) lists every rendered
piece and every video made in the editor. Pick a format — story for Reels and Stories, post for the
feed — and **Share** hands the video file itself to the phone's share sheet, where Instagram takes
it as a Reel, Story or post. **Download** saves the file. A piece with a social twin offers that
still's caption to copy, since a shared file carries no text.

On iPhone, Safari only opens the share sheet straight after a tap. When the video takes a moment
to download, the button turns into *Tap again to share* with the file already in hand. A browser
that cannot share files at all, like most desktop ones, downloads the video instead and says so.

## Render

```bash
pnpm video:render:motion                         # everything
pnpm video:render:motion Transpose SameChords    # by piece
pnpm video:render:motion HandsFree-story         # one format
pnpm video:render:motion EndCard                 # the clip phone edits end on
```

`sync:motion` runs first: it refreshes the social copy from `content/social/`, copies the
screenshots from `public/app-screenshots/`, and copies the press recordings from the app repository (`CHORDLIST_APP_REPO`, `../chordlist-app`, or `../chordlist`) into
the ignored `video/public/generated/motion/`. Without the app repository the screenshot-based pieces
still render; `hands-free` and `feature-reel` need the recordings.

In a container that ships its own Chromium, set `REMOTION_BROWSER_EXECUTABLE` to it.

To preview and edit, `pnpm video:studio` and open the **Motion** folder.

## Adding a piece

1. Write `video/src/motion/<Piece>.tsx` taking `MotionProps`. Use `useLayout()` for the frame's
   metrics and content box, `SocialFrame` and `Headline` from `scaffold.tsx`, and `phoneBeside()`
   when the subject is a screen.
2. If a still says the same thing, add its slug to `socialSlugs` in `scripts/sync-motion-assets.mjs`
   and read it in `copy.ts`; otherwise write the words there in the same shape.
3. Register it in `motionPieces` in `MotionRoot.tsx` with its formats and default theme.
4. Render it and add a row to the table above.
