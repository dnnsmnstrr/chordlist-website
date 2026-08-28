# Marketing strategies and channels

A companion to [Social media plan](social-media-plan.md). That document is the running calendar for
`content/social/`; this one covers the channels it deliberately scopes out — press, communities,
video, an owned list, the German market, and the maker distribution of chordlink — and how they sit
against the 9 September launch.

Nothing here replaces the social calendar. Everything scheduled there stays as it is.

## Where the site and the campaign disagree

Two coherent positionings exist, and the site picked one of them.

The homepage leads with *Local-first songbook for iOS* and a feature block titled *Built around
files you own*: plain Markdown, works offline, your files stay yours, no lock-in. Four true
statements, and all four answer objections a stranger has not raised yet. They win the person who
has already been burned by a subscription songbook — a real audience, well served by the blog and
the Obsidian post.

Shuffle and matching progressions live only in `docsCopy`. They are the two features that answer the
question a stranger actually has — *I do not know what to play* — and matching progressions is the
only thing in the product no competitor has.

**The smallest change worth making:** in `homeCopy.features`, replace *No lock-in* (which *Your
files stay yours* already covers) with matching progressions, written as a player benefit rather
than a mechanism:

> Finish a song and see what else you can already play. Songs sharing a chord progression sit
> together — the raw material of a medley.

Second, smaller: `showcase.title` is *Find a song, play it, keep moving.* That is the strongest line
on the site and it is currently a header for a screenshot carousel.

Do not swap the positionings. The file story is what makes the product credible to the audience most
likely to write about it, and it is the reason the Obsidian post exists. This is an addition.

## The channels, in the order they are worth doing

### Press and App Store featuring — do first, decays daily

Everything a reviewer needs is built: `/press` with a downloadable kit, reproducible screenshots
from the app's automated tests, per-language App Store sets at `/screens`, a live pre-order listing,
a public TestFlight build, and `marketing@chordlist.app`. None of it has been sent to anyone.

Coverage on launch day needs the pitch to land roughly a week before launch day.

- English Apple press: MacStories, 9to5Mac, The Sweet Setup, Six Colors.
- German Apple press: iFun, Macerkopf, AppGefahren. The more reachable audience for a Mainz solo
  developer, and chronically short of good local indie stories.
- Apple's own featuring nomination form. *Local-first, no account, plain files, one-time purchase*
  is close to the App Store editorial team's stated taste.
- r/apple and Hacker News belong on the launch-day list, not the pitch list.

Pitch in three sentences, not a press release: what it is, the one unusual thing about it, and a
TestFlight link so they can hold it before they write. Attach nothing; link the kit.

### The local-first and plain-text crowd — do now, best audience fit

Six blog posts already argue this product's case to an audience that gets genuinely enthusiastic
about a folder of Markdown files with no account and no sync. They are published where nobody is
looking.

- [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md)
  → r/ObsidianMD and the Obsidian forum, posted as *I made my songbook a vault*.
- [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md) → Hacker
  News and Lobsters on its own merits. *Show HN: a songbook app that stores songs as Markdown files
  in a folder you pick* is an honest framing.
- Secondary: r/selfhosted, r/DataHoarder, r/iosapps.

No new asset is needed. This audience converts on architecture rather than features, and a one-time
unlock against a subscription competitor is their entire worldview.

### An owned list — do now, cheapest fix

There is no email capture anywhere on the site. RSS on the blog is the whole owned surface, and
launch day is the largest amount of attention this project will get in one go.

One email field in the homepage closing CTA, where *Start your songbook today* already sits. Two
promises: you hear when it ships, and you hear when the next chordlink edition is printed. Add the
same field to `/chordlink` as the sold-out state — the people who arrive at a closed storefront are
the highest-intent visitors on the site and currently hit a dead end.

Keep the list out of the analytics pipeline, per the existing rule about buyer data and Vercel
Analytics.

### Video — two systems, not one

`video/` renders three linked compositions in light and dark. There is no plan for where any of them
go, and `siteConfig.social` declares only X and Instagram.

- **Remotion owns the product truth**: screens, features, the launch cut, anything that must look
  exact and be re-renderable when the UI changes.
- **CapCut owns the person**: face, hands on the keys, the failed prints, the chordlink tap.

They join at the end: the Remotion short is the payoff clip of a human video. Render it once, keep
the file, drop it into the last five seconds of the phone edit. Every human video then gets a
pixel-exact product ending for free.

The blocker is that there is no video account. Claim the handles now whether or not the series
starts — the worst outcome is finding them taken in October. Realistically the series starts after
the ninth; shoot raw footage before then and edit later.

### chordlink — give away the file, sell the object

Ten units at €9.99 is roughly a hundred euros. It is not a revenue line; it is a reason for a maker
community to look at a songbook app. `public/model.html` — a self-contained 310 KB configurator and
STL exporter that runs offline and travels as one file — is the better distribution asset.

- Publish the model on Printables and MakerWorld.
- r/functionalprint and r/3Dprinting, framed as the thing it is: a one-file browser tool that
  generates a parametric STL.
- *A single HTML file that configures and exports an STL* is a legitimate Hacker News post
  independent of chordlist.

Sequence this after the app launch. The sales switch is still closed pending seller identity,
withdrawal, return-cost and §19 UStG wording, and a hardware story competing with launch day halves
both. Mid-to-late September.

State the numbers plainly: twenty made, ten for sale, printed by one person, ships within Germany.
Scarcity you actually have beats scarcity you manufacture.

### Germany — a decision, not a task

The repository ships five German chordlink routes, a German tagline in the shared vocabulary, and a
typed partial `de.ts`. Locale routing and a switcher are not wired up. chordlink ships to Germany and
nowhere else.

Two coherent choices; drifting between them is the bad one.

1. **German is a chordlink-only surface.** The app markets in English, the hardware markets in
   German, and the partial translation is fine because German visitors only ever arrive at
   `/de/chordlink` from a German-language post.
2. **German is a real second market.** Finish the locale objects, wire the switcher, add German App
   Store metadata.

Take the first for now. It is already almost true, costs nothing, and lets the German Apple blogs
send readers to a page that reads properly in their language. Revisit once there is referrer data.

A Mainz-based solo developer shipping an iOS app is also a story for German regional and maker press
in a way it is not for anyone in English.

### Musicians, via the party trick — after launch

The *progression of the week* line in the social plan is the right ammunition loaded as static
cards. *These four songs are the same song* has a much higher ceiling as video, and needs the
homepage change above to be true first.

r/piano, r/guitar, r/WeAreTheMusicMakers and worship-tech communities are the right rooms, but they
are stricter than the plain-text communities and slower to convert. Earn standing before posting.

## The twelve days

Everything the social calendar already schedules stays as it is. This is only what to add.

| When | Add |
| --- | --- |
| Fri 28 Aug | Claim the video handles. Write the press pitch. Ship the `homeCopy.features` edit. |
| Sat 29 Aug | Send the press pitches, English and German in one sitting. Submit the Apple featuring nomination. |
| Sun 30 Aug | Add the email field to the homepage closing CTA. |
| Mon 1 Sep | Post the Obsidian article to r/ObsidianMD and the Obsidian forum. |
| Wed 3 Sep | Shoot raw footage: chordlink tap, hands on keys, failed prints. Do not edit it. |
| Thu 4 Sep | Second press wave — one line, not a resend. |
| Sun 7 Sep | Render the Remotion short. Write the launch-day text and leave it in a file. |
| Tue 8 Sep | Verify every CTA and the App Store listing in light and dark, ready for `links.appStore`. |
| Wed 9 Sep | `out-now`, plus Show HN with the plain-text post, r/apple, r/iosapps, and a note to everyone who ever replied. |
| Fri 11 Sep | `matching-progressions` as scheduled, and the first video of the series it belongs to. |
| Mid-Sep | chordlink: legal copy signed off, sales switch opened, model posted to the maker communities. |

## Measurement

Vercel Analytics is on the site and TelemetryDeck is in the app; neither appears in any plan
document. Three numbers are enough through launch week:

- pre-order to download conversion on the ninth;
- the free-to-unlock rate once there are users;
- referrers by source.

Use a distinct link per community and per press outlet. It is the only way to tell afterwards which
channel did the work.

## Deliberately not doing

- **Rewriting the site's positioning.** The file-ownership story is well made and consistently
  voiced. The change above is one line.
- **Starting a video series before the ninth.** Building a template, finding a rhythm and launching
  an app in the same week and a half damages the launch, which is the part that cannot be repeated.
- **Letting chordlink share launch day.** Two announcements on one day is one announcement at half
  strength.
- **Adding a second launch flag.** The backend switch is the only gate, and a launch-week rush is
  exactly what breaks that.
