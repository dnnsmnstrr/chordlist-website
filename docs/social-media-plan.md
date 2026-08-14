# Social media plan

The running calendar for [`content/social/`](../content/social). Every line is an asset that already
exists in the repository with its copy reviewed and its PNGs built, so posting is a matter of opening
[`public/social/manifest.json`](../public/social/manifest.json), taking the caption that ships with
the image, and posting it.

**Tick a line when the post is live.** The `scheduled` date in each definition is the same date as the
one here — the build does not act on it, so this file and that field are the only things keeping the
calendar honest. If a date moves, move both.

The system that produces these is documented in [Social media system](social-media-system.md); the
workflow for writing a new one is [`.agents/skills/social-asset/SKILL.md`](../.agents/skills/social-asset/SKILL.md).

## The shape of the next eight weeks

Three phases, and the calendar below is built around them:

1. **Pre-order run-up** (now → 8 September). The app is on the App Store to pre-order and the public
   TestFlight beta is open. Nothing in the set said either of those things, which was the largest gap
   in the calendar. It opens with the announcement on **Sunday 16 August** and works through the
   product's four best arguments — the file, the library, the pricing, the privacy — while the beta
   is still worth joining.
2. **Launch week** (9 September). One asset announces availability on the day; the positioning and
   atmosphere pieces follow it rather than competing with it.
3. **After** (mid-September onward). The recurring series carry the account once the launch news is
   spent: a progression a week, a quote per blog post, one screen at a time.

## Friday is blog day

Every post in [`content/blog`](../content/blog) publishes on a Friday, so the calendar is built on
that: **Friday belongs to whichever asset goes with that day's post**, and everything else fills the
Sunday and Wednesday slots around it.

No asset goes out before the post it depends on. That is a hard rule for the obvious reason — a
footnote URL 404s until its post is live — but the softer version matters more: an asset that
explains a feature should not arrive days before the article that explains it properly. That is why
`matching-progressions` sits on 11 September rather than the 7th, where it would have pre-empted
[Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md) by
four days.

| Blog post | Publishes | Asset that goes with it |
| --- | --- | --- |
| [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md) | 1 Aug | `plain-text-lasts`, 23 Aug — post long live, so the date is free |
| [Finding the chords in a song](../content/blog/finding-the-chords-in-a-song.md) | Fri 21 Aug | `chords-by-ear`, same day |
| [Learn a four-chord pop progression](../content/blog/how-to-play-almost-any-pop-song.md) | Fri 28 Aug | `four-chords`, same day |
| [Three ways to write down a chord progression](../content/blog/chord-notation-styles.md) | Fri 4 Sep | `doo-wop-changes`, same day — chords over numerals is what the post compares |
| [Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md) | Fri 11 Sep | `matching-progressions`, same day |
| [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md) | Fri 18 Sep | `notes-and-folders`, same day |

Two of those pairings are thematic rather than quoted — `doo-wop-changes` and `matching-progressions`
carry their own footnote and name the post in the caption instead. A pulled quote would tie them
tighter; both are in the backlog below if that is worth writing.

**Post in the afternoon on a shared day.** `/blog` and `/blog/[slug]` revalidate hourly, so a
scheduled post goes live within about an hour of its date rather than exactly at midnight. Posting
the social asset later the same day means the link is certain to resolve.

After 18 September the blog has nothing scheduled, so Fridays are free again.

## Pre-order run-up

- [ ] **Sun 16 Aug — the announcement.** Two assets, posted together:
  [out-9-september](../content/social/out-9-september.md) then
  [anatomy-of-a-song-file](../content/social/anatomy-of-a-song-file.md) — the news, then the thing
  itself, because most of the people who see this post have never heard of it.
  `card` `post` `story` · [preview](../public/social/out-9-september/card.png) ·
  [preview](../public/social/anatomy-of-a-song-file/post.png)
  - On Instagram it is one carousel in that order, at `post` size. On X the card carries it, with the
    file image attached second.
  - The caption on `out-9-september` is the one to post: it says the pre-order is live and invites a
    message for a TestFlight link. It is written to fit X; on Instagram there is room to add that
    pre-ordering installs the app for you on release day, and that the link is in the bio.
  - Check that X direct messages are open to people who do not follow you before posting, or the
    invitation goes nowhere. `feedback@chordlist.app` is the fallback for anyone who would rather
    email. The public TestFlight link is also on the site, so this is an invitation to talk rather
    than the only way in.
- [ ] **Wed 19 Aug** · [song-library](../content/social/song-library.md) — the first look at the app
  itself. Nothing else in the pre-order window shows a screen, and this one makes the case on its own:
  every song in the list carries its chord progression. `card` `post` ·
  [preview](../public/social/song-library/card.png)
- [ ] **Fri 21 Aug** · [chords-by-ear](../content/social/chords-by-ear.md) — 📝 pull quote, with
  [Finding the chords in a song](../content/blog/finding-the-chords-in-a-song.md). `card` `post` ·
  [preview](../public/social/chords-by-ear/card.png)
- [ ] **Sun 23 Aug** · [plain-text-lasts](../content/social/plain-text-lasts.md) — pull quote from
  [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md), live
  since 1 August. `card` `post` · [preview](../public/social/plain-text-lasts/card.png)
- [ ] **Wed 26 Aug** · [beta-is-open](../content/social/beta-is-open.md) — last call for testers,
  exactly two weeks out from release and the last moment their feedback can still change anything.
  `card` `post` `story` · [preview](../public/social/beta-is-open/card.png)
- [ ] **Fri 28 Aug** · [four-chords](../content/social/four-chords.md) — 📝 with
  [Learn a four-chord pop progression](../content/blog/how-to-play-almost-any-pop-song.md). `card`
  `post` · [preview](../public/social/four-chords/card.png)
- [ ] **Sun 30 Aug** · [ten-songs-free](../content/social/ten-songs-free.md) — pricing, and the
  sharpest differentiator in the set. `card` `post` · [preview](../public/social/ten-songs-free/card.png)
- [ ] **Wed 2 Sep** · [no-account-no-upload](../content/social/no-account-no-upload.md) — privacy,
  stated as absence. `card` `post` · [preview](../public/social/no-account-no-upload/card.png)
- [ ] **Fri 4 Sep** · [doo-wop-changes](../content/social/doo-wop-changes.md) — 📝 I–vi–IV–V, with
  [Three ways to write down a chord progression](../content/blog/chord-notation-styles.md): the asset
  sets chord symbols over Roman numerals, which is what the post compares. `card` `post` ·
  [preview](../public/social/doo-wop-changes/card.png)
- [ ] **Sun 6 Sep** · [the-folder-is-the-structure](../content/social/the-folder-is-the-structure.md) —
  folders are artists, files are songs. `card` `post` ·
  [preview](../public/social/the-folder-is-the-structure/card.png)

## Launch week

- [ ] **Wed 9 Sep** · [out-now](../content/social/out-now.md) — release day. The only asset whose job
  is the announcement. `card` `post` `story` · [preview](../public/social/out-now/card.png)
- [ ] **Fri 11 Sep** · [matching-progressions](../content/social/matching-progressions.md) — 📝 with
  [Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md).
  Two days after launch, the first feature shown in depth. `card` `post` ·
  [preview](../public/social/matching-progressions/card.png)
- [ ] **Sun 13 Sep** · [local-first-songbook](../content/social/local-first-songbook.md) — the tagline,
  as positioning behind the news. `post` `story` ·
  [preview](../public/social/local-first-songbook/post.png)
- [ ] **Wed 16 Sep** · [caught-in-motion](../content/social/caught-in-motion.md) — the launch
  photograph, once the news has landed. `card` `post` `story` ·
  [preview](../public/social/caught-in-motion/card.png)

## After launch

- [ ] **Fri 18 Sep** · [notes-and-folders](../content/social/notes-and-folders.md) — 📝 pull quote, with
  [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md).
  Aimed at the Obsidian audience rather than musicians. `card` `post` ·
  [preview](../public/social/notes-and-folders/card.png)
- [ ] **Sun 20 Sep** · [chord-keyboard](../content/social/chord-keyboard.md) — the most distinctive
  screen in the app, and it had no asset. `card` `post` · [preview](../public/social/chord-keyboard/card.png)
- [ ] **Wed 23 Sep** · [nothing-to-export](../content/social/nothing-to-export.md) — the argument for
  files, in two sentences. `card` `post` · [preview](../public/social/nothing-to-export/card.png)
- [ ] **Fri 25 Sep** · [search-across-everything](../content/social/search-across-everything.md) —
  `card` `post` · [preview](../public/social/search-across-everything/card.png)
- [ ] **Sun 27 Sep** · [paper-and-glass](../content/social/paper-and-glass.md) — `card` `post` ·
  [preview](../public/social/paper-and-glass/card.png)
- [ ] **Wed 30 Sep** · [two-five-one](../content/social/two-five-one.md) — ii–V–I. `card` `post` ·
  [preview](../public/social/two-five-one/card.png)
- [ ] **Wed 7 Oct** · [twelve-bar-blues](../content/social/twelve-bar-blues.md) — I–IV–V. `card` `post` ·
  [preview](../public/social/twelve-bar-blues/card.png)

📝 marks an asset tied to that day's blog post.

Posted already: [coming-soon](../content/social/coming-soon.md), 10 August. Left exactly as it went
out — its copy carries an exclamation mark and a "finally ready to be shared" the
[voice guidelines](blog-editorial-guidelines.md) would not pass today, but rewriting a definition
after its image is public only puts the repository out of step with the timeline. The lesson belongs
in the next asset, not in that one.

## The campaigns behind the calendar

Five recurring lines, so a gap in the calendar has an obvious thing to fill it with rather than
needing a new idea each time.

**Pre-order run-up.** Finite and nearly spent: the release date, the beta, the pricing. It ends on
9 September and does not come back.

**Progression of the week.** The cheapest asset in the system to author and the most recognisably
chordlist — a chord row, its numerals, one line. Four exist. Unwritten:

- [ ] vi–IV–I–V, the same four chords rotated — pairs with `four-chords` as a follow-up
- [ ] i–VII–VI–V, the Andalusian cadence
- [ ] I–V–vi–iii–IV–I–IV–V, the canon progression, if it fits the frame
- [ ] a progression pulled from whatever the [blog](../content/blog) publishes next

**What it doesn't do.** Claims stated as absence, which is the voice this product already has. Two
exist (`no-account-no-upload`, `nothing-to-export`) and `ten-songs-free` belongs to the family.
Unwritten:

- [ ] no sync conflicts to resolve — check the current behaviour before claiming it
- [ ] nothing to migrate when you leave

**One screen at a time.** Seven screenshots sit in [`public/app-screenshots/dark/`](../public/app-screenshots/dark)
and four now have assets. Unwritten:

- [ ] `05-Tag-Filter---Piano.png` — narrowing by tag
- [ ] `06-Settings---Appearance.png` — accent colour and appearance, a light-hearted one
- [ ] autoscroll and transposition, neither of which has a screenshot yet — they need one from the
  iOS repository's screenshot tests first

**A quote per post.** Each post gets one line lifted verbatim from it, pinned to its publish date.
Three are scheduled (`chords-by-ear`, `plain-text-lasts`, `notes-and-folders`). The two remaining
Fridays are covered thematically rather than quoted, so these would be an upgrade rather than a gap:

- [ ] a line from [Three ways to write down a chord progression](../content/blog/chord-notation-styles.md)
  — 4 September currently carries `doo-wop-changes`, which illustrates the post rather than quoting it
- [ ] a line from [Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md)
  — 11 September currently carries `matching-progressions`, same trade

Writing either one means deciding what moves: the Friday is taken, so the quote either replaces the
asset there or pushes it to the following Sunday.

The rule that makes this campaign work: the line has to be **in** the post. The footnote is a canonical
URL and the asset is self-sourcing, so a paraphrase is a promise the article does not keep.

## Images to generate

Nothing here is blocking — every scheduled asset builds today. These are the images that would make
the set better than it is, roughly in the order they would earn their place.

### Why the shapes matter

Every master in [`assets/visual-references/analog-photography/`](../assets/visual-references/analog-photography)
is 3:2 landscape, 2:3 portrait, or 4:5. None of them is the shape of the two formats we post most, so
the build crops into them:

| Master shape | `card` 1.91:1 | `post` 4:5 | `story` 9:16 |
| --- | --- | --- | --- |
| 3:2 landscape (four masters) | 21% lost | **47% lost** | **63% lost** |
| 2:3 portrait (three masters) | **65% lost** | 17% lost | 16% lost |
| 4:5 portrait (`phone-on-sheet-music`) | **58% lost** | 0% | 30% lost |
| *9:16, none yet* | 70% lost | 30% lost | **0%** |
| *1.91:1, none yet* | **0%** | 58% lost | 70% lost |

Bold is where the build prints a crop warning. Two shapes would end most of it: a **9:16** master
serves a story natively *and* survives a post, and a **1.91:1** master serves a card natively. So the
briefs below ask for one of each per subject rather than another 3:2.

Generate from the reusable prompt in [Visual language](visual-language.md) — the placeholders are
filled in for you. Keep the lossless file at the given filename, and add its row to that document's
reference table. Never ask for typography in the image; the template sets the type.

### Photography

- [ ] **`guitarist-in-motion-vertical.png` · 9:16.** The one that fixes a live problem:
  [caught-in-motion](../content/social/caught-in-motion.md) is a launch asset shipping a 3:2 master at
  63% loss in its story and 47% in its post. Same subject as the existing guitarist master, composed
  tall — and one file fixes both formats.
  `[SUBJECT]` a guitarist changing chords during a small live performance.
  `[SUBJECT DETAILS]` A tall, close crop of the fretting hand and the upper neck of an electric guitar
  mid change, the player's body falling away into shadow below. One harsh stage light blooms at the top
  of the frame. Movement smears vertically. No face is clearly visible.
- [ ] **`phone-on-sheet-music-wide.png` · 1.91:1.** The card counterpart, and the other live warning:
  [paper-and-glass](../content/social/paper-and-glass.md) and
  [coming-soon](../content/social/coming-soon.md) both cut 58% off a 4:5 master to make a card.
  `[SUBJECT]` a phone resting on an open book of sheet music.
  `[SUBJECT DETAILS]` A wide, low, letterbox view across an open page, the phone lying face down at one
  side and deep negative space running off to the other. Lamplight blooms from the far edge. The
  notation is suggestive rather than readable, and no screen content is visible.
- [ ] **`chord-charts-and-guitar.png` · 4:5.** A subject the library does not have and the product is
  actually about: the songbook itself, on paper. Would carry the format and file-anatomy campaign the
  way `caught-in-motion` carries performance.
  `[SUBJECT]` handwritten chord charts scattered beside an acoustic guitar.
  `[SUBJECT DETAILS]` Loose paper covered in hand-drawn chord boxes, curling at the edges, half
  overlapping the body of an acoustic guitar on a dark floor. Late lamplight rakes across the page.
  Handwriting dissolves into strokes and is nowhere legible.
- [ ] **`phone-on-a-music-stand.png` · 9:16.** Playing *from* the phone, which nothing in the library
  shows — the existing phone master is a still life. This is the picture behind "play more, file less"
  and anything about autoscroll.
  `[SUBJECT]` a phone clipped to a music stand while someone plays.
  `[SUBJECT DETAILS]` A tall frame looking past a music stand at chest height, the phone propped on it
  and a player's hands moving out of focus behind. Practice-room light comes from one side and blooms
  around the stand. The screen is a bright shapeless glow with no interface visible.
- [ ] **`rehearsal-room-in-motion.png` · 1.91:1.** Every master is one instrument alone. A room with
  more than one player in it would give the setlist and launch-week cards somewhere to go.
  `[SUBJECT]` two musicians rehearsing in a small room.
  `[SUBJECT DETAILS]` A wide, unstable view across a cramped practice space, one figure blurred in the
  foreground and another suggested behind an amp. A single overhead bulb blows out at the top of the
  frame. Faces are lost to movement.
- [ ] **`piano-keys-vertical.png` · 9:16.** Only if the story format starts carrying more than launch
  assets: the piano masters are both 3:2, so any keyboard story loses 63% today.
  `[SUBJECT]` hands moving across a worn piano keyboard.
  `[SUBJECT DETAILS]` A tall crop looking down the length of the keys with the hands smeared across
  them, the far end of the keyboard dissolving into darkness. Light falls from directly above and
  blooms on the white keys.

### App screenshots

These come from the iOS repository's automated screenshot tests rather than an image generator —
`pnpm sync:assets` copies them in, and adding one means adding its filename to `screenshotNames` in
`scripts/sync-app-assets.mjs` as well.

- [ ] **Autoscroll running**, with the speed control visible. The most-asked-about feature on a stage,
  and there is no asset for it because there is no screenshot of it.
- [ ] **Transposition**, mid-change, showing the progression shifted. Same problem: a real
  differentiator with nothing to show for it.
- [ ] **Now Playing**, matching an Apple Music track to a song in the library. Optional, and the only
  one of the three that needs a connected service to capture.

## Deliberately not scheduled

- **More photo assets.** `piano-with-sheet-music.png`, `piano-keys-in-motion.png`, and the sampler
  masters are unused, and they should stay that way for now. A `photo` asset is roughly forty times
  the file size of a typographic one, and two are already in the calendar. Reach for one when an asset
  needs atmosphere, not to decorate a week that looks thin. This is about how often the template is
  *used*; the briefs above are about the shapes the library is missing when it is.
- **A store link in an image.** `siteConfig.links` is the only thing that can follow availability;
  every asset points at `chordlist.app` instead.
- **Anything on a network that is not X or Instagram.** `siteConfig.social` declares two accounts and
  the format matrix serves exactly those two.
