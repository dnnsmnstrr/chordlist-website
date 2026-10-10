# Launch copy

Every piece of text that goes out under chordlist's name outside this site and the App Store: what
was entered on each platform, and the posts ready to paste. When a listing is edited or a post goes
live, change it here in the same sitting so this file stays the record of what is actually out there.

It is also readable, with a copy button on every quoted block, at `/marketing-copy` in the admin
section.

Social images and their captions live in [`content/social/`](../content/social) and are planned in
[Social media plan](social-media-plan.md). This file covers the copy those do not: platform listings,
community posts and threads.

## Before writing anything new

Reuse before rewording. The shared phrases are in the app repository's `VOCABULARY.md` (synced here
as `locales/vocabulary.json`): the tagline, the one-line description and the free-limit sentence.
Quote them rather than paraphrasing them, so a reader who sees the site, the store listing and a post
reads the same product.

Voice follows the [blog guidelines](blog-editorial-guidelines.md): calm, direct, musician-first,
`chordlist` lowercase, *Markdown* capitalised. No exclamation marks, no "ultimate", no "level up".
Let the file and the progressions make the case.

## Facts

Every claim in a post has to match these. Check `lib/site-config.ts` and the app before changing one.

| | |
| --- | --- |
| Platforms | iPhone and iPad, iOS and iPadOS 26 or later. No Android version planned. |
| Released | 10 October 2026 |
| Price | Free for the first 10 songs. Unlimited songs are a one-time purchase: **€6.99 launch price until 31 January 2027, €9.99 from 1 February**. Other currencies follow Apple's price table, so quote euros or say "launch price" rather than a percentage. |
| Privacy | No account. chordlist does not upload or sync the song library. Analytics and chord sharing are opt-in. |
| Format | One Markdown file per song: title, artist, chord progression and tags in frontmatter, lyrics in the body. |
| Features | Matching songs that share a progression, transpose, autoscroll, tags, search, shuffle, importing from the web and the share sheet. |
| Developer | Dennis Muensterer, one person, Mainz. makerer studio. |
| Links | chordlist.app · App Store: https://apps.apple.com/app/id6798344297 · feedback@chordlist.app |

Do not mention chordlink in launch posts. It launches separately, and two announcements on one day
is one announcement at half strength.

## Product Hunt

### As entered

**Tagline** (48 of 60):

> Your lyrics and chords, as files in your pocket!

**Description** (497 of 500):

> Discover chordlist, your ultimate music companion for hobbyist musicians! Organize songs as
> markdown files, each containing lyrics and chords. Shuffle and match chord progressions between
> songs to find new inspiration for your next guitar or piano session. Perfect for those ready to
> level up their musical skills. The special sauce is how the chords are saved separately from the
> lyrics. This makes it possible to identify songs with similar progressions, enabling surprising
> mashup combinations.

### Suggested replacement

Product Hunt allows editing until launch. This keeps the same idea, follows the voice, and adds the
two things a visitor asks first: what it costs and whether it needs an account.

**Tagline** (48 of 60), the `VOCABULARY.md` tagline:

> Your lyrics and chords, as files in your pocket.

**Description** (466 of 500):

> chordlist is a songbook for iPhone and iPad. Every song is a Markdown file in a folder you choose,
> with the lyrics in the body and the chord progression stored on its own. Because the chords are
> kept apart, chordlist can find songs that share a progression: learn one and you already know the
> others, or play two together as a mashup. Transpose, autoscroll, tags and shuffle are built in. No
> account, your library is never uploaded, and your first 10 songs are free.

### Maker comment

Post it as the first comment the moment the launch goes live.

> Hi Product Hunt, I'm Dennis, and I built chordlist because my songs were spread across notes apps,
> PDFs and chord sites, none of which I could take with me when I switched tools.
>
> So chordlist keeps every song as a plain Markdown file in a folder you pick. Open it in any text
> editor, sync it with iCloud or whatever you already use, keep it in your Obsidian vault. The app
> reads and writes those files and never uploads them.
>
> The part I'm proudest of: the chord progression is stored separately from the lyrics. That lets
> chordlist show you which songs in your library share a progression, so learning one song quietly
> teaches you several, and two songs with the same changes make an easy mashup.
>
> Your first 10 songs are free. Unlimited songs are a one-time purchase, no subscription, at a
> €6.99 launch price until 31 January (€9.99 after that).
>
> I'd love to hear what's missing for how you play. I'll be here all day answering.

### Gallery

1270 × 760. Render any social asset at that size with:

```bash
pnpm build:social --only out-now,song-library,matching-progressions,anatomy-of-a-song-file,ten-songs-free --size 1270x760
```

The images land in `out/social/<slug>/1270x760.png`, outside the committed set. Rebuild first if
the app screenshots were synced since the last `pnpm build:social`, or the screenshot cards show
the old captures.

## Hacker News

**Title** (80 of 80), from [Marketing plan](marketing-plan.md):

> Show HN: A songbook app that stores songs as Markdown files in a folder you pick

**Text:**

> chordlist is an iPhone and iPad app for keeping the songs you play: lyrics, chords and tags. Each
> song is one Markdown file, with the metadata and the chord progression in YAML frontmatter and the
> lyrics as the body. The app uses a folder you choose through the Files picker, so the library
> works with iCloud Drive, an Obsidian vault, or a plain text editor. There is no account and no
> server holding your songs.
>
> Keeping the progression out of the lyrics turned out to be the interesting part. With it as its
> own field, the app can normalise progressions across keys and show which songs share one.
>
> It is native SwiftUI, iOS 26+. The first 10 songs are free; unlimited songs are a one-time
> purchase (€6.99 until the end of January). I wrote about why I think songbooks should be plain
> text here: https://chordlist.app/blog/why-plain-text-songbooks-last
>
> Happy to answer questions about the file format, the progression matching, or anything else.

Post in the morning, European time, then stay in the thread.

## Reddit

Post as a person, not a brand: the app named once, the answers in the comments. Read each
subreddit's current self-promotion rules on the day; they change.

### r/apple (App Saturday) and r/iOSapps

**Title:**

> I made chordlist, a songbook for iPhone and iPad that keeps every song as a Markdown file

**Body:**

> Hi all. chordlist is out today. It's a songbook for the songs you play: lyrics, chords and tags,
> one Markdown file per song, in a folder you choose. No account, and your library is never uploaded.
>
> - Finds songs in your library that share a chord progression
> - Transpose, autoscroll, tags, search and shuffle
> - Import from a website or the share sheet
> - iPhone and iPad, iOS 26 or later
>
> Price: your first 10 songs are free, then a one-time unlock, no subscription. It's €6.99 until
> 31 January, €9.99 after.
>
> App Store: https://apps.apple.com/app/id6798344297
>
> Feedback very welcome, I'm the only developer and I read everything.

## X, Bluesky, Threads and Mastodon

Post the [`out-now`](../content/social/out-now.md) image with the first post. The thread works on
every network; each post fits X's 280 characters.

1. (253)

   > chordlist is out on iPhone and iPad.
   >
   > Every song is a Markdown file in a folder you choose: lyrics, chords, tags. No account, and your
   > library is never uploaded.
   >
   > First 10 songs free. Unlimited songs are a one-time €6.99 until 31 January.
   >
   > chordlist.app

2. (181), with the [`matching-progressions`](../content/social/matching-progressions.md) image

   > The chords live apart from the lyrics, so chordlist can tell which songs share a progression.
   >
   > Learn one and you already know the chords to the others. Or play two of them together.

3. (111), with the [`anatomy-of-a-song-file`](../content/social/anatomy-of-a-song-file.md) image

   > It's a plain text file, so it opens in any editor, syncs with whatever syncs your folder, and
   > outlasts the app.

4. (129)

   > Built by one person in Mainz. If something's missing or broken, reply here or write to
   > feedback@chordlist.app. I read everything.

### Hashtags

Each definition in `content/social/` now carries its own `hashtags`, and the editor suggests from
`lib/social-hashtags.ts`. The sets below are the starting points. Instagram allows at most five per
post, so each one has to be specific. Put them at the end of the
caption, not in a comment. Generic tags like #music are too crowded to surface a small account.

| Post | Tags |
| --- | --- |
| Launch announcement | #songbook #guitarchords #musicapp #iosapp #indiedev |
| Progressions and chords | #chordprogression #guitarpractice #pianochords #ukulele #musictheory |
| Plain files and Markdown | #markdown #obsidianmd #plaintext #localfirst #iosapp |
| German posts | #gitarre #akkorde #songbook #musikapp #indiedev |

On Mastodon, hashtags are how posts get found at all: use two or three in the post itself. On X,
one or two at most, if any.

### German (300, so Mastodon and Instagram rather than X)

> chordlist ist da, für iPhone und iPad.
>
> Jeder Song ist eine Markdown-Datei in einem Ordner deiner Wahl: Songtext, Akkorde, Tags. Kein
> Account, und deine Bibliothek wird nie hochgeladen.
>
> Deine ersten 10 Songs sind kostenlos. Unbegrenzte Songs kosten einmalig 6,99 € bis zum 31. Januar.
>
> chordlist.app

## Launch price, until 31 January

The price does not change between these dates, so none of them is a new discount. Each one restates
the launch price and its end date. Never write "30% off": it is only true in euros, and nobody has
paid €9.99 yet.

| When | Angle | Line |
| --- | --- | --- |
| chordlink launch | The second announcement | Lead with chordlink; close with "chordlist is still at its €6.99 launch price until 31 January." |
| Black Friday, 27 Nov | No new deal needed | "No Black Friday sale. chordlist is already at its launch price, €6.99 once, until 31 January." |
| Christmas | A gift for someone who plays | "For the person who keeps their chords in five different apps." |
| Early January | New year, new instrument | "Got a guitar for Christmas? Your first 10 songs are free." |
| 25 to 31 Jan | Last call | "The €6.99 launch price ends on 31 January. From 1 February it's €9.99." |
