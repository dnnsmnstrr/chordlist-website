# Video scripts and storyboards

The scripts behind the video channel in [Marketing plan](marketing-plan.md). Two production systems,
deliberately not merged:

- **Remotion** — `video/`, documented in [`video/README.md`](../video/README.md). Owns the product
  truth: screens, features, the launch cut. Re-renderable when the UI changes, exact by construction,
  and already carries its own named copy packs in `video/src/copy.ts`.
- **CapCut on the phone** — owns the person: face, hands on the keys, the failed prints, the
  chordlink tap. Nothing here needs a desktop editor or a second take.

**They join at the end.** Render the Remotion short once, keep the file, and drop it into the last
five seconds of every phone edit. Every human video then gets a pixel-exact product ending for free,
and the two systems never have to agree about anything except that final clip.

## Rules that apply to all of them

- **Vertical, 1080 × 1920.** Every surface that matters is vertical; a horizontal master gets cropped
  by someone else's algorithm rather than by you.
- **Readable with the sound off.** The first three seconds carry the whole thing. Captions burned in,
  not auto-generated at upload.
- **No claim the site does not make.** `app/privacy/page.tsx` and `app/faq/page.tsx` are legal copy;
  a video is not the place to soften or embellish them. If a line is not already true somewhere in
  `locales/en.ts` or the [blog](../content/blog), it needs checking before it is filmed.
- **Never show a real person's copyrighted lyrics on screen.** Use `public/songs/morning-light.md` or
  a public-domain song. This is the single easiest way to get a video taken down.
- **The app name is lowercase.** In captions too.
- **One idea per video.** A video that explains two features explains neither.

Shot notation below: `[A]` is a phone-camera shot of a person, `[S]` is a screen recording or a
Remotion render, `[T]` is a title card.

---

## Series 1 — The party trick

The highest-ceiling idea the product has, and the one no competitor can answer: *these four songs are
the same song.* It is the `progressions` copy variant as a video. Aim for one a week once the series
starts, mid-September.

### 1.1 "These four songs are the same song" — 25 s, CapCut

The pilot. If only one video is ever made, make this one.

| Time | Shot | On screen | Said |
| --- | --- | --- | --- |
| 0:00–0:03 | `[A]` Hands land on the keys, play four chords, stop dead | Caption: **These four songs are the same song.** | — |
| 0:03–0:08 | `[A]` Same four chords, then straight into song one's melody over them | Song one title, lower third | "One." |
| 0:08–0:12 | `[A]` Same chords, song two | Song two title | "Two." |
| 0:12–0:16 | `[A]` Same chords, song three | Song three title | "Three." |
| 0:16–0:20 | `[S]` chordlist song detail, scroll to the matching-progressions row, three results appear | Caption: **The app found the other three.** | "I did not look these up." |
| 0:20–0:25 | `[S]` Remotion end card | `chordlist` · out now · App Store | — |

**The hook is the silence at 0:03.** Play, stop, let the caption land. Do not talk over it.

**Song choice is the whole video.** Four genuinely well-known songs on I–V–vi–IV, played as chords
only — no lyrics sung, no melody long enough to be the recording. Chord progressions are not
copyrightable; a recognisable vocal line is a different question, so keep it instrumental and short.
[Learn a four-chord pop progression](../content/blog/how-to-play-almost-any-pop-song.md) is the
written version and the safe list of examples.

**Variations, one per week, same structure:** ii–V–I as the jazz one, I–vi–IV–V as the doo-wop one,
i–VII–VI–V as the Andalusian one, twelve-bar blues as the one everybody can already play. Each has a
matching social card in `content/social/`, so the video and the still go out together.

### 1.2 "I learned one song and got three" — 20 s, CapCut

Same idea from the user's side rather than the demonstrator's.

| Time | Shot | On screen | Said |
| --- | --- | --- | --- |
| 0:00–0:04 | `[A]` Close on a phone showing one song in the library | Caption: **I know one song.** | "I know exactly one song." |
| 0:04–0:10 | `[S]` Open it, scroll to matching progressions, three appear | Caption: **Same four chords.** | "These three use the same four chords." |
| 0:10–0:16 | `[A]` Play the first bar of each of the three, badly, cheerfully | — | "So, technically…" |
| 0:16–0:20 | `[S]` Remotion end card | `chordlist` | — |

Play them badly on purpose. The point of the video is that the bar is low.

---

## Series 2 — The file

For the plain-text and Obsidian audiences. Lower ceiling, much higher conversion, and it is the
positioning the site actually ships.

### 2.1 "Your songbook is a folder" — 30 s, Remotion + one live shot

| Time | Shot | On screen | Said |
| --- | --- | --- | --- |
| 0:00–0:04 | `[S]` Files app, a folder of `.md` files, scrolling | Caption: **This is the whole app's database.** | — |
| 0:04–0:10 | `[S]` Open one in a plain text editor: frontmatter, then chords over words | Caption: **Chords above the words. That is the format.** | — |
| 0:10–0:16 | `[S]` Same file open in chordlist, rendered | Caption: **Same file.** | — |
| 0:16–0:22 | `[S]` Edit a line in the text editor, return to chordlist, the change is there | Caption: **No import. No sync. No account.** | — |
| 0:22–0:26 | `[S]` AirDrop the file to a laptop | Caption: **It goes where you go.** | — |
| 0:26–0:30 | `[T]` End card | `chordlist` · your lyrics and chords, as files in your pocket | — |

Use `public/songs/morning-light.md` — it is a real file, it is already the one rendered by
`components/lyric-preview.tsx`, and it is offered as a download from the home page, so a viewer can
follow along with the exact file they just watched.

The written version is [Why your songbook should be plain
text](../content/blog/why-plain-text-songbooks-last.md).

### 2.2 "One folder, two apps" — 35 s, screen only

For r/ObsidianMD, and it goes out with the post on 18 September, not before.

| Time | Shot | On screen |
| --- | --- | --- |
| 0:00–0:05 | `[S]` An Obsidian vault, a `Songs` folder inside it | Caption: **My Obsidian vault.** |
| 0:05–0:12 | `[S]` A song note in Obsidian: frontmatter, chords, wiki links to other notes | Caption: **Ordinary notes.** |
| 0:12–0:20 | `[S]` chordlist pointed at the same folder; the same songs appear, rendered as charts | Caption: **Same folder. No copy.** |
| 0:20–0:28 | `[S]` Edit in Obsidian, switch to chordlist, the change is there | Caption: **One source of truth.** |
| 0:28–0:35 | `[T]` End card | `chordlist` |

No voiceover. This audience reads.

---

## Series 3 — The maker story

Runs from mid-September, after the app launch, alongside publishing `public/model.html` to Printables
and MakerWorld. This is the chordlink channel, and it sells the object by giving away the file.

### 3.1 "Twenty of these exist" — 30 s, CapCut

| Time | Shot | On screen | Said |
| --- | --- | --- | --- |
| 0:00–0:04 | `[A]` A finished chordlink tag turning in the hand, hard light | — | "Twenty of these exist." |
| 0:04–0:10 | `[A]` The failed prints, laid out in a row, worst first | Caption: **Eleven of them did not.** | "It took a while." |
| 0:10–0:16 | `[A]` The tag stuck to a piano, a guitar, a music stand | — | "It goes on the instrument." |
| 0:16–0:24 | `[A]` Phone tapped against it, chordlist opens on that instrument's songs | Caption: **Tap. That is the whole interaction.** | — |
| 0:24–0:30 | `[T]` End card | `chordlink` · ten for sale · printed in Mainz | — |

The failed prints are the video. Nobody needs another clean product shot; the row of rejects is the
only thing here a stranger cannot get somewhere else.

**Do not film this before the sales switch is open.** Sending people to a closed storefront wastes
the one post that would have converted.

### 3.2 "One HTML file that makes an STL" — 25 s, screen only

Aimed at r/functionalprint, r/3Dprinting and Hacker News, and it stands on its own without chordlist.

| Time | Shot | On screen |
| --- | --- | --- |
| 0:00–0:05 | `[S]` `model.html` opening from a local folder, Wi-Fi visibly off | Caption: **One file. Opened offline.** |
| 0:05–0:15 | `[S]` Dragging the configurator's sliders, the model updating live | Caption: **Configure it.** |
| 0:15–0:20 | `[S]` Export, an `.stl` lands in the downloads folder | Caption: **Export an STL. No server, no account.** |
| 0:20–0:25 | `[A]` A two-second cut of the printed result | Caption: **Then print it.** |

Check the file size on the day and put the real number in the caption. A precise number is the
credibility of this entire post.

---

## Series 4 — The launch cut

### 4.1 Launch day — 15 s, Remotion only

`ChordlistPromoShort` already renders this. It is the one video that must be exact, so nothing is
filmed for it and nothing is improvised.

Before 9 September:

1. `pnpm sync:video` to pull current clips from the app repository.
2. `pnpm video:studio`, set `copyVariant` to match whichever site copy variant is shipping — the
   video and the home page disagreeing on the pitch is the failure this switch exists to prevent.
3. `pnpm video:render:short` for the light cut, and the dark one if the post needs both.
4. Commit the render. `public/video/` is served by Next and embeds from the site.

The end card is also the clip every phone edit ends with, so render it once and keep the file
somewhere the phone can reach it.

---

## Shooting the raw footage

One session, before the ninth, edited later. The point is to have material, not videos.

- Hands on the keys playing I–V–vi–IV, slow and clean, three angles, sixty seconds each.
- The same four chords on guitar if a guitar is to hand.
- The chordlink tap, ten takes, phone and tag both in frame, no hands crossing the lens.
- The failed prints, laid out and shot from directly above, in daylight.
- A phone on a music stand, played past by a person, focus on the stand.
- Thirty seconds of a face talking about nothing, to find out what the light does.

Shoot vertical. Lock exposure. Do not edit any of it the same week.

## Where they go

Handles do not exist yet and `siteConfig.social` declares only X and Instagram. **Claim TikTok and
YouTube now**, whether or not the series starts — the worst outcome is finding them taken in October.
Add them to `siteConfig.social` once claimed; the footer and the structured data read from there, so
that is the only edit needed.

Posting order per video: the vertical surfaces first, then the still from `content/social/` that
carries the same idea, on the day the social calendar already schedules it.
