# Marketing plan

The execution layer under [Marketing strategies](marketing-strategies.md). That document decides
*which channels are worth doing and why*; this one says what gets sent, to whom, in what words, and
how the result is measured. The dated tracker is [Marketing checklist](marketing-checklist.md), and
the video work it schedules is scripted in [Video scripts and storyboards](video-scripts.md).

Three documents already own their own ground and nothing here overrides them:

| Document | Owns |
| --- | --- |
| [Social media plan](social-media-plan.md) | The posting calendar for `content/social/`. Unchanged. |
| [Blog editorial guidelines](blog-editorial-guidelines.md) | Voice, structure, accuracy, review. |
| [Marketing strategies](marketing-strategies.md) | The channel decisions this plan carries out. |

**Launch is Wednesday 9 September 2026** (`siteConfig.launchDate`). Every date below is 2026.

## What is actually being sold

One sentence, and everything else is a variation on it: *a songbook that keeps every song as a
Markdown file in a folder you choose, and shows you which of those songs share a chord progression.*

The first half is what makes it credible. The second half is what makes it interesting. The site
currently leads with the first half only, which is the gap [Marketing
strategies](marketing-strategies.md) opens with.

### Three audiences, in the order they convert

1. **The plain-text and local-first crowd.** Converts on architecture, not features. Already served
   by six blog posts and by the ownership positioning the site ships. Reachable today, free, and the
   most likely to write something that other people read.
2. **Apple press and the App Store editorial team.** Converts on a story: a solo developer in Mainz,
   no account, no subscription, files you can read in a text editor. Everything they need already
   exists in the repository; none of it has been sent.
3. **Musicians.** The largest audience and the slowest. Converts on the party trick — *these four
   songs are the same song* — which needs the matching-progressions feature to be visible on the home
   page first. It now is.

Order matters because 1 and 2 produce the links and the coverage that make 3 cheap later.

## Positioning: the copy experiment

`homeCopy.features` already leads its fourth card with matching progressions, so the smallest change
the strategy document asked for has shipped. The larger question it raises — whether the hero should
keep answering objections or start answering *I do not know what to play* — is now a switch rather
than an argument.

Three wordings live in [`locales/copy-variants.ts`](../locales/copy-variants.ts) and are readable
side by side at **[`/copy`](https://chordlist.app/copy)** (unlisted, `noindex`):

| Variant | Leads with | Best for |
| --- | --- | --- |
| `files` *(shipping)* | Ownership: plain Markdown, offline, your files stay yours | Press, Hacker News, the Obsidian and self-hosting audiences |
| `progressions` | *Finish a song and see what else you can already play* | Musicians, r/piano and r/guitar, the video series |
| `setlist` | *Find a song, play it, keep moving* | Performing players, App Store screenshots, paid traffic |

A variant replaces whole sections of `homeCopy` rather than single lines, so the page cannot end up
half-rewritten — swapping the showcase title into the hero without rewriting the showcase would put
the same sentence on the page twice, and section replacement makes that impossible by accident. The
`<h1>` is `commonCopy.tagline` from `VOCABULARY.md` and is deliberately out of reach: it is checked
against the social card by `scripts/build-og-image.mjs`.

**Switching:**

```bash
NEXT_PUBLIC_COPY_VARIANT=setlist pnpm build
```

Unset ships `files`. An unknown value fails the build rather than quietly shipping the default,
which on a marketing site looks exactly like a variant that did not work. On Vercel it is an
environment variable on a preview branch, so a variant can be read on a real URL — and shown to
someone — before it is promoted.

**The recommendation: ship `files` through launch.** The three highest-value channels between now
and 9 September are press, Hacker News, and the Obsidian communities, and all three respond to the
ownership story. Put `progressions` on a preview branch instead and use it as the landing page for
the video series and the musician communities once those start, mid-September. `setlist` is the one
to hold: it is the strongest writing of the three and the weakest argument, and it earns its place
only once there is paid or performer-targeted traffic to point at it.

Deciding this before the ninth is the point. Changing the hero during launch week discards the only
week where the before-and-after numbers would mean anything.

## Channels

### 1. Press and App Store featuring

Everything a reviewer needs is built: [`/press`](https://chordlist.app/press) with a downloadable
kit, reproducible screenshots, per-language App Store sets at `/screens`, a live pre-order listing,
a public TestFlight build, and `marketing@chordlist.app`. The only missing step is sending it.

**Coverage on launch day needs the pitch to land about a week before launch day.** That deadline has
already moved from 28 August to today; it does not survive another slip.

Pitch in three sentences — what it is, the one unusual thing, a TestFlight link so they can hold it
before they write. **Attach nothing**; link the kit. Personalise the first sentence per outlet or do
not send it.

Draft, English:

> chordlist is a songbook for iPhone and iPad that stores every song as a plain Markdown file in a
> folder you choose — no account, no sync, one purchase. It also reads the chord progression out of
> each file, so finishing a song shows you which others in your library share it. It is out on
> 9 September; here is a TestFlight build if you would like to hold it first, and the press kit is
> at chordlist.app/press.

Draft, German:

> chordlist ist ein Songbook für iPhone und iPad, das jeden Song als einfache Markdown-Datei in
> einem Ordner deiner Wahl ablegt – kein Account, keine Cloud, ein einmaliger Kauf. Die App liest
> außerdem die Akkordfolge aus jeder Datei und zeigt, welche anderen Songs in der Bibliothek
> dieselbe Folge nutzen. Release ist am 9. September; hier ist ein TestFlight-Build zum Ausprobieren,
> das Pressekit liegt unter chordlist.app/press.

| Target | Language | Angle |
| --- | --- | --- |
| MacStories | EN | Files, no account, one-time purchase — their long-running editorial interest |
| The Sweet Setup | EN | The Obsidian-adjacent workflow; link the one-folder post |
| Six Colors | EN | Indie iOS, short-form |
| 9to5Mac | EN | Launch news; expect a short item at best |
| iFun | DE | Mainz solo developer, launch date, price |
| Macerkopf | DE | Same, news-shaped |
| AppGefahren | DE | Same, slightly longer form |
| Apple featuring nomination | EN | *Local-first, no account, plain files, one-time purchase* |

Use each outlet's own published tips address — do not guess one, and do not send to a general
contact form when a tips address exists. Send English and German in one sitting; splitting them
across days is how the second half never goes out.

**One follow-up only**, on 4 September, one line, not a resend: the release date and the fact that
the build is still open. A second follow-up costs more standing than the reply is worth.

r/apple and Hacker News belong on the launch-day list, not the pitch list.

### 2. The plain-text and local-first communities

Six posts already argue this product's case to the audience most likely to enjoy it, published
where nobody is looking. No new asset is required.

| Post | Where | Framing |
| --- | --- | --- |
| [Use one folder for Obsidian and chordlist](../content/blog/one-folder-obsidian-and-chordlist.md) | r/ObsidianMD, Obsidian forum | *I made my songbook a vault* — 18 Sep, see below |
| [Why your songbook should be plain text](../content/blog/why-plain-text-songbooks-last.md) | Hacker News, Lobsters | *Show HN: a songbook app that stores songs as Markdown files in a folder you pick* |
| Either | r/selfhosted, r/DataHoarder, r/iosapps | Secondary; space them out |

Post as a participant, not a marketer: the article first, the app named once, the answers in the
comments. A one-time unlock against a subscription competitor is this audience's entire worldview,
so let them find that themselves rather than leading with it.

#### One conflict, and how it resolves

[Marketing strategies](marketing-strategies.md) puts the r/ObsidianMD post on **Monday 1 September**.
It cannot go there: `content/blog/one-folder-obsidian-and-chordlist.md` carries `published:
2026-09-18`, and until that date the URL 404s in production. A dead link in the first line of a
community post is the entire cost of getting this wrong.

**Move the r/ObsidianMD post to Friday 18 September**, the day its article goes live, rather than
moving the article. That keeps the blog calendar's Friday pairings intact — 4 September belongs to
[chord notation styles](../content/blog/chord-notation-styles.md) with `doo-wop-changes`, and
11 September to [matching progressions](../content/blog/finding-songs-that-share-a-progression.md)
with its asset — and it is the better date anyway: on the 18th the app is bought rather than
pre-ordered.

**1 September then takes the plain-text post instead**, which has been live since 1 August. Lobsters
or r/selfhosted, not Hacker News — that one is held for launch day, and a story only gets one front
page.

### 3. An owned list

There is no email capture anywhere on the site; RSS is the entire owned surface, and launch day is
the largest amount of attention this project will ever get in one go.

- **Home page closing CTA**, where *Start your songbook today* already sits. One field, two promises:
  you hear when it ships, and you hear when the next chordlink edition is printed.
- **`/chordlink`, as the sold-out state.** The people who arrive at a closed storefront are the
  highest-intent visitors on the site and currently hit a dead end.

Keep the list out of the analytics pipeline, per the existing rule about buyer data and Vercel
Analytics. Whatever provider is chosen must have a German-market-safe double opt-in and an
imprint-compatible footer; `siteConfig.businessAddress` is already the address that belongs in it.

This is the cheapest item in the plan and the one with the longest tail. If only one thing on the
list before 9 September gets done, it is the press pitch; if two, this is the second.

### 4. Video — two systems

Scripts and storyboards: **[Video scripts and storyboards](video-scripts.md)**.

- **Remotion owns the product truth.** Screens, features, the launch cut — anything that must look
  exact and be re-renderable when the UI changes. Already built in `video/`, with its own copy packs.
- **CapCut owns the person.** Face, hands on the keys, the failed prints, the chordlink tap.

They join at the end: the Remotion short is the payoff clip of a human video. Render it once, keep
the file, drop it into the last five seconds of the phone edit, and every human video gets a
pixel-exact product ending for free.

The blocker is that there is no video account and `siteConfig.social` declares only X and Instagram.
**Claim the handles now** whether or not the series starts — the worst outcome is finding them taken
in October. Realistically the series starts after the ninth: shoot raw footage before then, edit
later.

### 5. chordlink — give away the file, sell the object

Ten units at €9.99 is about a hundred euros. It is not a revenue line; it is a reason for a maker
community to look at a songbook app. `public/model.html` — a self-contained configurator and STL
exporter that runs offline and travels as one file — is the better distribution asset.

- Publish the model on Printables and MakerWorld.
- r/functionalprint and r/3Dprinting, framed as what it is: a one-file browser tool that generates a
  parametric STL.
- *A single HTML file that configures and exports an STL* is a legitimate Hacker News post
  independent of chordlist.

**Sequenced after the app launch**, mid-to-late September. The sales switch stays closed pending
seller identity, withdrawal, return-cost and §19 UStG wording, and a hardware story competing with
launch day halves both.

State the numbers plainly: twenty made, ten for sale, printed by one person, ships within Germany.
Scarcity you actually have beats scarcity you manufacture.

### 6. Germany — the decision

**German is a chordlink-only surface.** The app markets in English, the hardware markets in German,
and the partial `de.ts` is fine because German visitors arrive at `/de/chordlink` from a
German-language post. It is already almost true, it costs nothing, and it lets the German Apple blogs
send readers to a page that reads properly in their language.

Revisit once there is referrer data. The alternative — German as a real second market, with finished
locale objects, a wired switcher and German App Store metadata — is a decision for October, not for
the eleven days before launch. Drifting between the two is the only wrong answer.

A Mainz-based solo developer shipping an iOS app is also a story for German regional and maker press
in a way it is not for anyone in English. That is a September and October follow-up, not launch week.

### 7. Musicians, via the party trick

After launch. The *progression of the week* line in the social plan is the right ammunition, and
*these four songs are the same song* has a much higher ceiling as video than as a card.

r/piano, r/guitar, r/WeAreTheMusicMakers and the worship-tech communities are the right rooms and are
stricter than the plain-text ones. Earn standing before posting: read and answer for a fortnight
first. This is the channel that rewards patience and punishes a launch-week drive-by.

## Measurement

Vercel Analytics is on the site and TelemetryDeck is in the app. Three numbers are enough through
launch week:

1. **Pre-order to download conversion on the ninth.** App Store Connect, Sales and Trends.
2. **Free-to-unlock rate**, once there are users. TelemetryDeck; `siteConfig.freeSongLimit` is the
   boundary being tested.
3. **Referrers by source.** Vercel Analytics, plus App Store Connect campaign links for anything
   that lands on the store rather than the site.

**Use a distinct link per community and per press outlet.** It is the only way to tell afterwards
which channel did the work. Two conventions, and neither needs new code:

- Site links: `https://chordlist.app/?utm_source=<outlet>&utm_medium=<press|community|social>&utm_campaign=launch-2026-09`.
- Store links: an App Store Connect campaign link per outlet, which is what attributes an install
  rather than a visit.

Record which link went where as it is sent — the checklist has a column for it. A tracking parameter
nobody wrote down is a tracking parameter that measures nothing.

## Deliberately not doing

- **Rewriting the site's positioning before launch.** The file-ownership story is well made and
  consistently voiced. The variants exist so the question can be settled with a preview URL instead
  of a rewrite.
- **Starting the video series before the ninth.** Building a template, finding a rhythm, and
  launching an app in the same week and a half damages the launch, which is the part that cannot be
  repeated.
- **Letting chordlink share launch day.** Two announcements on one day is one announcement at half
  strength.
- **Adding a second launch flag.** The backend switch is the only gate, and a launch-week rush is
  exactly what breaks that.
- **Paid acquisition.** Nothing here is measured well enough yet for a budget to teach anything.
