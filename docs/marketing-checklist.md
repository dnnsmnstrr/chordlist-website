# Marketing checklist

The dated tracker for [Marketing plan](marketing-plan.md), which explains why each of these is here.
The social calendar in [Social media plan](social-media-plan.md) is unchanged and is **not** repeated
below — only the days where something is added to it are named.

**Tick a line when it is done.** Nothing in the build reads this file; this file and the person
reading it are the only things keeping it honest.

Launch is **Wednesday 9 September 2026**. Every date is 2026.

## Priorities

| | Meaning |
| --- | --- |
| **P0** | Launch-critical, or decays every day it is not done. Do these before anything else. |
| **P1** | Materially changes the launch outcome. Do these before the ninth. |
| **P2** | Compounds after launch. Starting one before the ninth costs more than it returns. |
| **P3** | A decision to make once there is data, not now. |

## Before launch

### Sat 29 Aug — P0, and already a day late

The 28 August items in [Marketing strategies](marketing-strategies.md) are overdue and roll into
today. Press decays daily and coverage on launch day needs the pitch to land about a week out; this
date does not survive another slip.

- [ ] **P0 — Write the press pitch**, English and German. Three sentences, TestFlight link, no
  attachment. Drafts are in [Marketing plan](marketing-plan.md#1-press-and-app-store-featuring).
- [ ] **P0 — Send it**, English and German in one sitting: MacStories, The Sweet Setup, Six Colors,
  9to5Mac, iFun, Macerkopf, AppGefahren. Personalise the first sentence per outlet. Use each outlet's
  own published tips address.
- [ ] **P0 — Submit the Apple featuring nomination.** *Local-first, no account, plain files, one-time
  purchase.*
- [ ] **P0 — Log a distinct tracking link per outlet** in the table at the bottom of this file, as
  each one goes out. A parameter nobody wrote down measures nothing.
- [ ] **P1 — Decide the copy variant for launch.** Read [`/copy`](https://chordlist.app/copy). The
  recommendation is to ship `files` and hold `progressions` on a preview branch for the video series.
  Deciding after the ninth throws away the only week where the numbers would mean anything.
- [ ] **P1 — Claim the TikTok and YouTube handles.** Whether or not the series starts. The worst
  outcome is finding them taken in October.

### Sun 30 Aug — P1

- [ ] **P1 — Choose an email provider** with German-safe double opt-in and an imprint-compatible
  footer. `siteConfig.businessAddress` is the address that belongs in it.
- [ ] **P1 — Add an email field to the home page closing CTA**, where *Start your songbook today*
  already sits. Two promises: you hear when it ships, you hear when the next chordlink edition is
  printed. Copy goes in `homeCopy.closingCta`, per the rule that no string lives in JSX.
- [ ] **P1 — Add the same field to `/chordlink` as the sold-out state.** The highest-intent visitors
  on the site currently hit a dead end there.
- [ ] **P0 — Keep the list out of the analytics pipeline**, per the existing rule about buyer data and
  Vercel Analytics. Check this before the first address is collected, not after.

### Tue 1 Sep — P1

- [ ] **P1 — Post [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md)
  to Lobsters or r/selfhosted.** Live since 1 August, so the link resolves. **Not** Hacker News — that
  is held for launch day, and a story gets one front page.
- [ ] *Not r/ObsidianMD.* [Marketing strategies](marketing-strategies.md) schedules it here, but the
  Obsidian article carries `published: 2026-09-18` and its URL 404s until then. It has moved to
  18 September.

### Thu 3 Sep — P2

- [ ] **P2 — Shoot the raw footage** in one session: hands on the keys playing I–V–vi–IV, the
  chordlink tap in ten takes, the failed prints from above in daylight, a phone on a music stand.
  Shot list in [Video scripts and storyboards](video-scripts.md#shooting-the-raw-footage).
  **Do not edit any of it this week.**

### Fri 4 Sep — P0

- [ ] **P0 — Second press wave.** One line, not a resend: the release date, and that the build is
  still open. One follow-up only.

### Mon 7 Sep — P0

- [ ] **P0 — Render the launch cut.** `pnpm sync:video`, then `pnpm video:studio` with `copyVariant`
  set to match the shipping site copy, then `pnpm video:render:short`. Commit the render.
- [ ] **P0 — Write the launch-day text and leave it in a file.** Show HN title, the r/apple and
  r/iosapps posts, and the reply to everyone who ever answered a pitch. Writing these on the day is
  how they come out worse.

### Tue 8 Sep — P0

- [ ] **P0 — Verify every CTA in light and dark**, on the home page, `/press`, `/docs` and
  `/chordlink`. `pnpm build && pnpm start` reproduces production exactly, including hiding scheduled
  posts.
- [ ] **P0 — Check the App Store listing end to end**: screenshots, description, price, availability
  date, privacy answers.
- [ ] **P0 — Stage the one-line change**: `links.appStore` in `lib/site-config.ts`. Setting it is what
  flips every CTA from *Pre-order* to *Download*. Do not add a second flag.

### Wed 9 Sep — launch, all P0

- [ ] **P0 — Set `links.appStore` and deploy.** Verify the CTA changed on the live site before
  anything else goes out.
- [ ] **P0 — `out-now`**, as the social calendar already schedules it.
- [ ] **P0 — Show HN**, with [Why your songbook should be plain
  text](../content/blog/why-plain-text-songbooks-last.md): *Show HN: a songbook app that stores songs
  as Markdown files in a folder you pick.* Post in the morning, then stay in the thread all day.
- [ ] **P0 — r/apple and r/iosapps.**
- [ ] **P0 — Reply to everyone who ever answered a pitch**, including the ones who said no.
- [ ] **P1 — Record the pre-order to download conversion** in App Store Connect at end of day. It is
  a one-day number and it is gone tomorrow.

### Thu 10 Sep — P0

- [ ] **P0 — Answer everything.** Nothing new goes out. The day after a launch is worth more spent in
  the threads from the day before than in a new post.

## After launch

### Fri 11 Sep — P2

- [ ] **P2 — `matching-progressions`**, as scheduled, with [Finding songs that share a
  progression](../content/blog/finding-songs-that-share-a-progression.md).
- [ ] **P2 — Publish the first party-trick video**, [*These four songs are the same
  song*](video-scripts.md#11-these-four-songs-are-the-same-song--25-s-capcut). It is the pilot for the
  series and the highest-ceiling idea the product has.
- [ ] **P2 — Point the video at a `progressions` preview URL** if that variant is not the one
  shipping, so the traffic lands on copy that matches the video.

### Fri 18 Sep — P2

- [ ] **P2 — [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md)
  goes live.** Post it to r/ObsidianMD and the Obsidian forum the same afternoon, as *I made my
  songbook a vault*. Check the URL resolves first — `/blog` revalidates hourly.
- [ ] **P2 — Publish [*One folder, two apps*](video-scripts.md#22-one-folder-two-apps--35-s-screen-only)**
  with it. No voiceover; that audience reads.

### Mon 15 – Fri 25 Sep — P2, chordlink

Sequenced after the app launch on purpose. Two announcements on one day is one announcement at half
strength.

- [ ] **P0 within this block — Sign off the legal copy** before anything is sold: seller identity,
  withdrawal, return costs, §19 UStG wording. Nothing below happens until this is done.
- [ ] **P2 — Open the sales switch.** The backend switch stays the only gate.
- [ ] **P2 — Publish `public/model.html` to Printables and MakerWorld.**
- [ ] **P2 — Post to r/functionalprint and r/3Dprinting** as what it is: a one-file browser tool that
  generates a parametric STL.
- [ ] **P2 — Show HN for `model.html` on its own merits**, independent of chordlist. Put the real file
  size in the title; a precise number is the credibility of the whole post.
- [ ] **P2 — Publish [*Twenty of these exist*](video-scripts.md#31-twenty-of-these-exist--30-s-capcut)**
  — but only once the sales switch is open. State the numbers plainly: twenty made, ten for sale,
  printed by one person, ships within Germany.
- [ ] **P2 — German regional and maker press.** A Mainz solo developer shipping an iOS app is a story
  in German that it is not in English.

### From late Sep — P2 and P3

- [ ] **P2 — Earn standing in r/piano, r/guitar, r/WeAreTheMusicMakers** and the worship-tech
  communities before posting anything. Read and answer for a fortnight first. These rooms are stricter
  than the plain-text ones and punish a drive-by.
- [ ] **P2 — Keep the party-trick series weekly**: ii–V–I, I–vi–IV–V, i–VII–VI–V, twelve-bar blues.
  Each already has a matching card in `content/social/`, so the video and the still go out together.
- [ ] **P3 — Review the three numbers** (pre-order conversion, free-to-unlock rate, referrers by
  source) in the first week of October, and only then decide anything below.
- [ ] **P3 — Germany: hold the chordlink-only decision** until that referrer data exists. Finishing
  the locale objects, wiring the switcher and adding German App Store metadata is an October question.
- [ ] **P3 — Decide whether a copy variant won anything.** If nothing moved, ship `files` permanently
  and delete the experiment rather than leaving three wordings to maintain.

## Tracking links

Fill this in as links go out, not afterwards. Site links take
`?utm_source=<outlet>&utm_medium=<press|community|social>&utm_campaign=launch-2026-09`; store links
take an App Store Connect campaign link, which attributes an install rather than a visit.

| Sent | Outlet or community | Link used | Reply |
| --- | --- | --- | --- |
|  |  |  |  |

## Two corrections to the strategy document

Both are in [Marketing strategies](marketing-strategies.md)'s twelve-day table and are carried
correctly above:

- **Its "Wed 3 Sep" is a Thursday** in 2026. The footage session is on Thursday the 3rd.
- **Its "Mon 1 Sep — post the Obsidian article"** cannot happen: the article publishes on
  18 September and 404s until then. The community post moved to the 18th; the plain-text post takes
  1 September instead.
