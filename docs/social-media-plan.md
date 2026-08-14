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
   in the calendar — four assets now cover it.
2. **Launch week** (9 September). One asset announces availability on the day; the positioning and
   atmosphere pieces follow it rather than competing with it.
3. **After** (mid-September onward). The recurring series carry the account once the launch news is
   spent: a progression a week, a quote per blog post, one screen at a time.

Posting cadence is roughly Sunday, Wednesday, Friday. Blog-linked assets are pinned to the day their
post publishes, because the footnote URL 404s before then.

## Pre-order run-up

- [ ] **Sun 16 Aug** · [beta-is-open](../content/social/beta-is-open.md) — the TestFlight beta, which
  nothing had announced. `card` `post` `story` · [preview](../public/social/beta-is-open/card.png)
- [ ] **Wed 19 Aug** · [out-9-september](../content/social/out-9-september.md) — the release date,
  over a faint stage texture. `card` `post` `story` · [preview](../public/social/out-9-september/card.png)
- [ ] **Thu 20 Aug** · [anatomy-of-a-song-file](../content/social/anatomy-of-a-song-file.md) — a whole
  song as a text file. `card` `post` · [preview](../public/social/anatomy-of-a-song-file/card.png)
- [ ] **Fri 21 Aug** · [chords-by-ear](../content/social/chords-by-ear.md) — pull quote, publishes with
  [Finding the chords in a song](../content/blog/finding-the-chords-in-a-song.md). `card` `post` ·
  [preview](../public/social/chords-by-ear/card.png)
- [ ] **Sun 23 Aug** · [plain-text-lasts](../content/social/plain-text-lasts.md) — pull quote from
  [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md), live
  since 1 August. `card` `post` · [preview](../public/social/plain-text-lasts/card.png)
- [ ] **Wed 26 Aug** · [ten-songs-free](../content/social/ten-songs-free.md) — pricing, and the
  sharpest differentiator in the set. `card` `post` · [preview](../public/social/ten-songs-free/card.png)
- [ ] **Fri 28 Aug** · [four-chords](../content/social/four-chords.md) — publishes with
  [Learn a four-chord pop progression](../content/blog/how-to-play-almost-any-pop-song.md). `card`
  `post` · [preview](../public/social/four-chords/card.png)
- [ ] **Sun 30 Aug** · [no-account-no-upload](../content/social/no-account-no-upload.md) — privacy,
  stated as absence. `card` `post` · [preview](../public/social/no-account-no-upload/card.png)
- [ ] **Wed 2 Sep** · [the-folder-is-the-structure](../content/social/the-folder-is-the-structure.md) —
  folders are artists, files are songs. `card` `post` ·
  [preview](../public/social/the-folder-is-the-structure/card.png)
- [ ] **Fri 4 Sep** · [chord-keyboard](../content/social/chord-keyboard.md) — the most distinctive
  screen in the app, and it had no asset. `card` `post` · [preview](../public/social/chord-keyboard/card.png)
- [ ] **Mon 7 Sep** · [matching-progressions](../content/social/matching-progressions.md) — the feature
  that most needs showing before launch. `card` `post` ·
  [preview](../public/social/matching-progressions/card.png)

## Launch week

- [ ] **Wed 9 Sep** · [out-now](../content/social/out-now.md) — release day. The only asset whose job
  is the announcement. `card` `post` `story` · [preview](../public/social/out-now/card.png)
- [ ] **Fri 11 Sep** · [local-first-songbook](../content/social/local-first-songbook.md) — the tagline,
  as positioning behind the news. `post` `story` ·
  [preview](../public/social/local-first-songbook/post.png)
- [ ] **Mon 14 Sep** · [nothing-to-export](../content/social/nothing-to-export.md) — the argument for
  files, in two sentences. `card` `post` · [preview](../public/social/nothing-to-export/card.png)
- [ ] **Wed 16 Sep** · [caught-in-motion](../content/social/caught-in-motion.md) — the launch
  photograph, once the news has landed. `card` `post` `story` ·
  [preview](../public/social/caught-in-motion/card.png)

## After launch

- [ ] **Fri 18 Sep** · [notes-and-folders](../content/social/notes-and-folders.md) — pull quote,
  publishes with [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md).
  Aimed at the Obsidian audience rather than musicians. `card` `post` ·
  [preview](../public/social/notes-and-folders/card.png)
- [ ] **Mon 21 Sep** · [search-across-everything](../content/social/search-across-everything.md) —
  `card` `post` · [preview](../public/social/search-across-everything/card.png)
- [ ] **Wed 23 Sep** · [doo-wop-changes](../content/social/doo-wop-changes.md) — I–vi–IV–V. `card`
  `post` · [preview](../public/social/doo-wop-changes/card.png)
- [ ] **Sun 27 Sep** · [paper-and-glass](../content/social/paper-and-glass.md) — `card` `post` ·
  [preview](../public/social/paper-and-glass/card.png)
- [ ] **Wed 30 Sep** · [two-five-one](../content/social/two-five-one.md) — ii–V–I. `card` `post` ·
  [preview](../public/social/two-five-one/card.png)
- [ ] **Wed 7 Oct** · [twelve-bar-blues](../content/social/twelve-bar-blues.md) — I–IV–V. `card` `post` ·
  [preview](../public/social/twelve-bar-blues/card.png)

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
and three now have assets. Unwritten:

- [ ] `01-Song-List---4-Chord-Library.png` — the library grouped by artist
- [ ] `05-Tag-Filter---Piano.png` — narrowing by tag
- [ ] `06-Settings---Appearance.png` — accent colour and appearance, a light-hearted one
- [ ] autoscroll and transposition, neither of which has a screenshot yet — they need one from the
  iOS repository's screenshot tests first

**A quote per post.** Each post gets one line lifted verbatim from it, pinned to its publish date.
Two are scheduled. Unwritten:

- [ ] [Three ways to write down a chord progression](../content/blog/chord-notation-styles.md),
  publishes 4 September
- [ ] [Finding songs that share a progression](../content/blog/finding-songs-that-share-a-progression.md),
  publishes 11 September

The rule that makes this campaign work: the line has to be **in** the post. The footnote is a canonical
URL and the asset is self-sourcing, so a paraphrase is a promise the article does not keep.

## Deliberately not scheduled

- **More photography.** `piano-with-sheet-music.png`, `piano-keys-in-motion.png`, and the sampler
  masters are unused, and they should stay that way for now. A `photo` asset is roughly forty times
  the file size of a typographic one, and two are already in the calendar. Reach for one when an asset
  needs atmosphere, not to decorate a week that looks thin.
- **A store link in an image.** `siteConfig.links` is the only thing that can follow availability;
  every asset points at `chordlist.app` instead.
- **Anything on a network that is not X or Instagram.** `siteConfig.social` declares two accounts and
  the format matrix serves exactly those two.
