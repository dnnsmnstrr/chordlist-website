# Social media plan

The running calendar for [`content/social/`](../content/social) and the videos that now lead it. Every
still is an asset that already exists in the repository with its copy reviewed and its PNGs built, so
posting one is a matter of opening [`public/social/manifest.json`](../public/social/manifest.json),
taking the caption that ships with the image, and posting it. The videos are scripted in
[Video scripts and storyboards](video-scripts.md).

**Tick a line when the post is live.** The `scheduled` date in each definition is the same date as the
one here, and `/social/posts` draws its calendar from that field — the build does not act on it, so this
file and that field are the only things keeping the calendar honest. If a date moves, move both. An
asset in the backlog has no `scheduled` date at all, so it shows as unscheduled rather than as a date
that has already gone by.

The system that produces these is documented in [Social media system](social-media-system.md); the
workflow for writing a new one is [`.agents/skills/social-asset/SKILL.md`](../.agents/skills/social-asset/SKILL.md).

## Where things stand on 5 October

The release moved from 9 September to **Saturday 10 October**, and the September calendar went out
with it. Two things have been posted: [coming-soon](../content/social/coming-soon.md) on 10 August,
and the pre-order announcement on 16 August — which said *Out 9 September*. Nothing since, so the
people who saw that post last heard a date that has passed.

That shapes the plan more than anything else:

1. **The date is the first thing to fix.** One still on Thursday says the new date out loud, before
   anything asks for attention on Saturday.
2. **The launch is a person, not a card.** The founder video — *I've been wanting to play more piano,
   so I did the obvious thing and started developing an app* — is the release announcement. `out-now` goes out beside it as the still that
   carries the link, not instead of it.
3. **The public-piano videos are the series.** Filmed while travelling, the app's shuffle choosing what
   gets played. They show the feature the [strategy](marketing-strategies.md) says answers a stranger's
   real question — *I do not know what to play* — and nobody else can film them. A montage of them
   opens the run on 14 October, then one a week, every Wednesday, for as long as the footage lasts.
   There is less than a week of it, but several takes of each piano: the best take of each goes
   everywhere, and the rest become extra TikToks.
4. **The stills fill in around them,** on the blog's Saturdays and on Sundays.

## Saturday is blog day

The blog was reset in October: every post is being rewritten in the author's own words, and
[`content/blog-schedule.json`](../content/blog-schedule.json) now releases one every seven days from
10 October — so **Saturday belongs to the blog**, and the asset that goes with that day's post goes out
the same afternoon.

No asset goes out before the post it depends on, and that rule now bites. Only the first post is
written and approved; the rest are outlines. So every blog Saturday below is **conditional**: post the
paired asset if the article is live that day, and the fallback if it is not. A post goes live only once
it is approved, so check the live `/blog`, not the file.

The second rule matters as much: **a quote asset must quote the post as published.** The three quote
assets were lifted from the machine-drafted versions now in `content/blog-archive/`, and the rewritten
posts will not contain those lines. Before posting one, find its line in the live article; if it is not
there, rewrite the headline from a line that is, or skip it.

| Blog post | Publishes | Asset that goes with it | Fallback |
| --- | --- | --- | --- |
| [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md) | Sat 10 Oct | `plain-text-lasts` — **backlog**: its line is not in the rewritten post, and launch day is the founder video's | — |
| [Learn a four-chord pop progression](../content/blog/how-to-play-almost-any-pop-song.md) | Sat 17 Oct | `four-chords` — its footnote links the post | `two-five-one` |
| [Finding the chords in a song](../content/blog/finding-the-chords-in-a-song.md) | Sat 24 Oct | `chords-by-ear` — quote, verify the line | `twelve-bar-blues` |
| [Three ways to write down a chord progression](../content/blog/chord-notation-styles.md) | Sat 31 Oct | `doo-wop-changes` — thematic, links the docs | — |
| [Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md) | Sat 7 Nov | `matching-progressions` — thematic, links the docs | — |
| [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md) | Sat 14 Nov | `notes-and-folders` — quote, verify the line | `nothing-to-export` |

`doo-wop-changes` and `matching-progressions` link the docs rather than the post, so they can go out on
their Saturday whether or not the article made it.

**Post in the afternoon on a shared day.** `/blog` and `/blog/[slug]` revalidate hourly, so a scheduled
post goes live within about an hour of its date rather than exactly at midnight.

## Launch week

- [ ] **Mon 5 – Wed 7 Oct · record the founder video.** Script:
  [0.1 "The obvious thing"](video-scripts.md#01-the-obvious-thing--29-s-capcut).
  Pick the public-piano clips for the series at the same time, and render the Remotion end card if it
  is not already on the phone.
- [ ] **Thu 8 Oct** · [out-10-october](../content/social/out-10-october.md) — the new date. The card
  already reads *Out 10 October.*, and its caption opens with *New date* rather than pretending the
  last one never happened. `card` `post` `story` · [preview](../public/social/out-10-october/card.png)
  - The August post said 9 September and stays as it is; this one corrects it in public.
- [ ] **Sat 10 Oct · release.** Wait until the listing shows as available, then:
  - **The founder video**, as a Reel on Instagram and native video on X — the announcement. Its post
    caption is the question from the script, *What's a song you always mean to learn and never do?*,
    then *out today on iPhone and iPad* and the link.
  - [out-now](../content/social/out-now.md) beside it: an Instagram story with the link sticker, and the
    `card` as the reply under the X video so the link sits one tap away. `card` `post` `story` ·
    [preview](../public/social/out-now/card.png)
  - Nothing else that day. Answer every reply.
- [ ] **Sun 11 Oct** — nothing new. Reshare anything that mentions the app to the story.

## The six weeks after

| Date | What | Notes |
| --- | --- | --- |
| Wed 14 Oct | 🎬 [I let the app pick for a week](video-scripts.md#02-i-let-the-app-pick-for-a-week--30-s-capcut) | The montage of the travel clips — introduces the series. |
| Sat 17 Oct | 📝 [four-chords](../content/social/four-chords.md) | Fallback [two-five-one](../content/social/two-five-one.md). |
| Sun 18 Oct | [caught-in-motion](../content/social/caught-in-motion.md) | Its caption says *hit shuffle* — the still that rhymes with the series. |
| Wed 21 Oct | 🎹 Public piano #1 | The strongest single clip; the full take of a montage cut is fine. |
| Sat 24 Oct | 📝 [chords-by-ear](../content/social/chords-by-ear.md) | Quote: verify. Fallback [twelve-bar-blues](../content/social/twelve-bar-blues.md). |
| Sun 25 Oct | [song-library](../content/social/song-library.md) | The first screen; every song carries its progression. |
| Wed 28 Oct | 🎹 Public piano #2 | |
| Sat 31 Oct | 📝 [doo-wop-changes](../content/social/doo-wop-changes.md) | I–vi–IV–V; chords over numerals is what the post compares. |
| Sun 1 Nov | [ten-songs-free](../content/social/ten-songs-free.md) | Pricing, once people can actually download it. |
| Wed 4 Nov | 🎹 Public piano #3 | |
| Sat 7 Nov | 📝 [matching-progressions](../content/social/matching-progressions.md) | |
| Sun 8 Nov | [no-account-no-upload](../content/social/no-account-no-upload.md) | Privacy, stated as absence. |
| Wed 11 Nov | 🎹 Public piano #4 | |
| Sat 14 Nov | 📝 [notes-and-folders](../content/social/notes-and-folders.md) | Quote: verify. Fallback [nothing-to-export](../content/social/nothing-to-export.md). For the Obsidian audience. |
| Sun 15 Nov | [the-folder-is-the-structure](../content/social/the-folder-is-the-structure.md) | Folders are artists, files are songs. |

🎹 is a video from [Series 5](video-scripts.md#series-5--shuffle-at-a-public-piano); write the city and
the song into the row when it is posted. 📝 is conditional on that day's post being live, per above.
One row per piano, using its best take — there are fewer pianos than the five Wednesdays, so the
rows after the last one go to the backlog below or to a Series 1 party-trick video. The other takes
are TikTok's.

## TikTok

The public-piano takes give TikTok more than the other two accounts get, which suits it: it rewards
posting often, and a different take of the same piano is a different video there.

- **Everything above that is a video goes to TikTok too**, the same day: the founder video on 10 October,
  the montage on 14 October, and each Wednesday's piano.
- **The alternate takes go to TikTok only**, on the days between — Monday and Friday from 12 October —
  until they run out. Each take is its own shuffle, so its caption names its song and city, and none
  repeats the Wednesday post's file.
- **No stills.** The cards are 1.91:1 and 4:5; TikTok is a video feed, and a card there is an ad.

| Date | TikTok |
| --- | --- |
| Sat 10 Oct | 0.1 *The obvious thing* |
| Mon 12 Oct | Alternate take |
| Wed 14 Oct | 0.2 the montage |
| Fri 16 Oct | Alternate take |
| Mon 19 Oct | Alternate take |
| Wed 21 Oct | Public piano #1 |
| Fri 23 Oct | Alternate take — and so on, Mondays and Fridays, until the takes are used up |

Add the handle to `siteConfig.social` once it exists, so the footer and structured data link it.

Three posts a week on Instagram and X, plus the TikTok extras, is the ceiling for one person who is
also answering support mail in launch week. If a week slips, drop the Sunday still and the TikTok
extra, never the Wednesday video.

## Backlog

Built and reviewed, with no date. Pull from here when a slot opens:

- [anatomy-of-a-song-file](../content/social/anatomy-of-a-song-file.md) — planned as the second half of
  the August announcement. If it did not go out then, it is the best Sunday still in the set.
- [chord-keyboard](../content/social/chord-keyboard.md) — the most distinctive screen in the app.
- [local-first-songbook](../content/social/local-first-songbook.md) — the tagline.
- [search-across-everything](../content/social/search-across-everything.md)
- [paper-and-glass](../content/social/paper-and-glass.md) — the second photo asset; keep it apart from
  `caught-in-motion`.
- [nothing-to-export](../content/social/nothing-to-export.md), [two-five-one](../content/social/two-five-one.md),
  [twelve-bar-blues](../content/social/twelve-bar-blues.md) — also the Saturday fallbacks.
- [plain-text-lasts](../content/social/plain-text-lasts.md) — **needs a new headline first.** It quotes
  *Your songbook should outlast the app you use to manage it*, which is in the post's outline but not
  in its text. *Your personal collection of songs should not be bound to a specific service or app.* is
  in the text, and is the obvious replacement.

Retired: [beta-is-open](../content/social/beta-is-open.md), a last call for testers two weeks before a
release that has now happened. [coming-soon](../content/social/coming-soon.md) is posted and stays as it
went out — its copy carries an exclamation mark the [voice guidelines](blog-editorial-guidelines.md)
would not pass today, but rewriting a definition after its image is public only puts the repository
out of step with the timeline. `out-10-october` is the deliberate exception: the slug and image now say
10 October, and the August post that said 9 September lives only on the networks.

## The campaigns behind the calendar

Five recurring lines, so a gap in the calendar has an obvious thing to fill it with rather than
needing a new idea each time.

**Shuffle at a public piano.** The new lead line, and the only one that is video. A public piano, the
phone on the music stand, shuffle, and whatever comes up gets played — well or not. It does in fifteen
seconds what the stills cannot: shows the app being used by the person who made it, somewhere a
viewer recognises. Scripts and the rules for filming strangers and other people's songs are in
[Series 5](video-scripts.md#series-5--shuffle-at-a-public-piano).

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

- [ ] `05-Tag-Filter.png` — narrowing by tag
- [ ] `06-Settings.png` — accent colour and appearance, a light-hearted one
- [ ] autoscroll and transposition, neither of which has a screenshot yet — they need one from the
  iOS repository's screenshot tests first

**A quote per post.** Each post gets one line lifted verbatim from it, pinned to its publish date. With
the blog rewritten, the three that exist (`chords-by-ear`, `plain-text-lasts`, `notes-and-folders`)
each need checking against the published text, and the rest are written only once their post is live.

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
- **Stills on a network that is not X or Instagram.** The format matrix serves exactly those two.
  TikTok carries video only — see [TikTok](#tiktok).
