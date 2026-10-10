---
name: video-content
description: Write hooks, angles and short-form video scripts for chordlist reels, TikToks and YouTube Shorts; add them to docs/video-hooks.md and docs/video-scripts.md; check every claim against the app; and record how posted videos performed so the winning angle gets repeated.
---

# Video content

Short-form video for chordlist: hooks (the first two seconds), the angle each one belongs to, and
scripts in the format `docs/video-scripts.md` already uses. The aim is not volume for its own sake.
It is to find the angle a niche audience relates to, then make that angle many times over.

## Sources of truth

Read these before writing anything:

- `docs/video-hooks.md`: the hook collection, grouped by angle, with each hook's status and results.
  Every new hook goes here.
- `docs/video-scripts.md`: the scripts and storyboards, and the rules every video follows (vertical,
  readable with the sound off, no copyrighted lyrics on screen, one idea per video).
- `docs/launch-copy.md`, the **Facts** table: price, platforms, privacy wording. A video never
  states a fact differently from that table.
- `content/social/`: the still images. A video usually goes out with the card that matches its topic.

## Workflow

1. **Establish the job.** New hooks for an existing angle, a new angle to test, a full script, or
   recording results. Ask only when the answer would change what gets written.
2. **Read the hook collection.** Check the statuses: if an angle is marked `winner`, new work goes
   to that angle unless the user asks otherwise. Do not duplicate a hook that is already listed.
3. **Write hooks in groups of three to five per angle**, each one a line that could open a video on
   its own. Vary the form: a question, a confession, a claim, a number, a before-and-after.
4. **Check every claim** against the list below and, where the app repository is checked out beside
   this one (`../chordlist-app`), against the code. A hook that promises something the app does not
   do goes in **Needs a fix before use** with a corrected version, never into an angle's table.
5. **Pair each hook with a picture**: the first shot that answers it, in the `Pairs with` column. A
   hook with nothing to show is not ready.
6. **For a script**, follow the existing format in `docs/video-scripts.md`: a numbered heading with
   the length and tool, a shot table (`[A]` person, `[S]` screen, `[T]` title card), then a short
   note on what makes or breaks it. Add the hook to the collection with status `scripted`.
7. **Recording results**: when the user reports numbers, fill in saves and shares per 1,000 views and
   the share who watched to the end, set the status to `posted`, and say plainly which angle is ahead.
   Mark an angle's best hook `winner` only when the user decides it is.
8. Run `pnpm test` (the marketing copy page reads `docs/launch-copy.md`) and commit the docs.

## What the app does today

Use this to check hooks quickly; confirm anything not listed in the app repository before promising
it.

- Songs are Markdown files in a folder the user picks; they open in any text editor, iCloud Drive and
  Obsidian. No account; the library is never uploaded.
- The chord progression is stored separately from the lyrics. The song page lists **Matching Songs**
  that share the progression, compared in any key.
- Transpose; autoscroll with adjustable speed; chord bubbles pinned beside each section heading while
  scrolling.
- Tags, search, shuffle, and a **Next Song** button that picks a random song from the library.
- Import from a web link or the iOS share sheet.
- iPhone and iPad, iOS and iPadOS 26 or later. First 10 songs free, then a one-time unlock.

Not true today, so never in a hook:

- Moving on to the next song by itself when autoscroll finishes, or "playing for hours without
  touching your phone". Autoscroll stops at the end of a song.
- "Play any song instantly". It plays what is in the user's library.
- "Musicians everywhere are using it", or any usage number that has not been measured.
- A subscription, sync service, Android version or web app.

## Voice

Hooks can be punchier than the site, since they compete with everything else in a feed, but they
stay honest and specific. Lowercase `chordlist`. No competitor named or shown: describe the problem
("cluttered chord sites with ads everywhere") rather than the brand. Every video ends with a request
for a comment, usually "Comment what feature I should build next".

## Rules from the strategy

- Test angles, not single hooks: one video per angle in the same week, same time of day.
- Judge on saves and shares per view and on watch-through, after two or three days. Not on likes.
- Once an angle wins, repeat it with new songs and new openings before testing a new angle.
- Niche beats broad: write for people who already play from chord charts (guitar, ukulele, piano,
  worship teams, the Obsidian crowd) rather than for everyone.
