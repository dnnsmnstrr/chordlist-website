---
name: blog-post
description: Draft, place, and publish a chordlist marketing blog post as Markdown with frontmatter in content/blog.
---

# Blog post

Writes one new post for the chordlist website: a Markdown file in `content/blog/`, plus any images
in `public/blog/<slug>/`. The `/blog` route, the search, the tag filter, the RSS feed, and the social
cards already exist and pick the file up automatically.

Do **not** edit `lib/blog.ts`, the pages, or the components to accommodate a post. If a post seems to
need a code change, stop and say so instead.

# Workflow

1. Confirm the topic and the reader. If the request is one word ("Obsidian"), ask what angle before
   writing.
2. Read `lib/site-config.ts` for facts, `locales/en.ts` for voice, and the two most recent files in
   `content/blog/` for tone.
3. Pick the slug and create `content/blog/<slug>.md`.
4. Write the frontmatter, then the body.
5. Add at least two internal links from the table below.
6. Add images if they help, in `public/blog/<slug>/`.
7. Run `pnpm build:og` to generate the post's social card.
8. Run `pnpm check`. It must pass clean.

# Pick the slug

Kebab-case ASCII, two to five words, describing the topic rather than the format. No date prefix.
`content/blog/keep-a-songbook-in-git.md` becomes `/blog/keep-a-songbook-in-git`.

**The slug is the permanent URL.** Never rename an existing one — it breaks inbound links, the
sitemap, and the RSS GUID.

# Frontmatter

```yaml
---
title: Keep your songbook in Obsidian
description: One sentence. Shown on the index card, in the meta description, in the social card, and in the RSS item.
created: 2026-08-08
published: 2026-08-15
tags:
  - obsidian
  - workflow
cover: /blog/keep-your-songbook-in-obsidian/cover.png
coverAlt: An Obsidian vault open beside chordlist on an iPhone.
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | No trailing period. Sentence case. |
| `description` | yes | One sentence, reused in four places, so it must stand alone. |
| `created` | yes | `YYYY-MM-DD`, the day it was drafted. |
| `published` | yes | `YYYY-MM-DD`. **The visibility gate.** |
| `tags` | yes | One to three, from the closed list below. |
| `cover` / `coverAlt` | no | Required together — one without the other fails the build. |
| `draft` | no | `true` hides the post regardless of date. |

**Scheduling.** A post whose `published` date is in the future is hidden everywhere: the index, the
sitemap, the RSS feed, and its own URL, which returns 404. The blog routes revalidate hourly, so it
appears within about an hour of that date with no redeploy and no commit. Set `published` to today to
go live on merge.

# Tags

The vocabulary is closed. It lives in `blogTags` in `lib/blog.ts`:

`markdown` · `workflow` · `ios` · `obsidian` · `offline` · `chords` · `release`

A tag outside that list **fails `pnpm build`** by design. Adding a new one means adding it to
`blogTags` *and* adding its display label to `blogCopy.tags` in `locales/en.ts` in the same commit —
the label map is typed against the list, so a missing label is a typecheck error.

# Voice

Match the existing site copy, which is plain and concrete.

- Second person, present tense. Short sentences.
- Open with the reader's problem, not the product.
- No exclamation marks, no "revolutionary", no "seamless", no "effortless".
- `chordlist` is always lowercase and always spelled out.
- 500–900 words. No H1 — the title comes from the frontmatter. Use `##` for structure, `###` sparingly.
- Prefer a real file, folder, or chord example over an adjective.
- Being honest about a limitation is better copy than hiding it. The existing posts each end with
  what you give up.

# Link into the site

Every post needs at least two internal links, taken from this table and no other. These anchors are
verified to exist.

| Target | Use it for |
| --- | --- |
| `/docs#getting-started` | choosing the songs folder, first run, changing it later |
| `/docs#library` | search, tag filters, sorting, shuffle, Now Playing |
| `/docs#playing` | autoscroll, transpose, matching progressions, play history |
| `/docs#adding-songs` | creating songs, URL and share import, Apple Music |
| `/docs#file-format` | folder layout, frontmatter fields the app maintains |
| `/docs#other-apps` | Files and Finder, Markdown editors, Git backups |
| `/docs#obsidian` | using an Obsidian vault as the library |
| `/docs#offline` | Keep Downloaded for an iCloud folder |
| `/#features` | the four-point pitch |
| `/#preview` | the rendered sample song |
| `/songs/morning-light.md` | the downloadable sample song file |
| `/faq` | pricing, analytics, device support questions |
| `/press` · `/privacy` | press kit; data handling |

`/faq` has **no per-question anchors** — `CollapsibleSection` renders a bare `<details>` with no
`id` — so link to `/faq` as a whole.

**Never write a TestFlight, App Store, or pre-order URL into a post.** Every post renders an
`<AppCTA />` after the body, which derives its link and label from `siteConfig.links`. A hardcoded
store URL in prose goes stale the day that changes.

# Accuracy rules

Blog posts are marketing copy about a real product. CLAUDE.md forbids inventing, softening, or
embellishing claims about data handling, pricing, or availability. That applies here.

**You may state as fact:**

- Songs are plain Markdown files in a folder the user chooses through the Files picker.
- chordlist does not upload or sync the song library. A folder in iCloud Drive is synced by Apple
  under the user's own settings, not by chordlist.
- Browsing, editing, searching, transposing, and playing work offline. Importing from a URL needs a
  connection.
- Analytics go through TelemetryDeck, are anonymous, and can be turned off in Settings.
- Contributing chord data is a separate opt-in; lyrics and tags are never included.
- Free for a library of up to `freeSongLimit` songs, with an optional one-time purchase for
  unlimited songs. Final pricing will be announced before launch.
- iPhone and iPad, iOS or iPadOS `minimumOSVersion` or later. No Android version is planned.
- Currently distributed through TestFlight.

**Never assert:** a specific price or price range; download, user, or review counts; "available on
the App Store" while `links.appStore` is null; performance benchmarks; what a competing app does;
security language beyond what `app/privacy/page.tsx` already says — no "encrypted", "private by
design", or "zero-knowledge".

If a fact is not in `lib/site-config.ts`, `locales/en.ts`, or `app/privacy/page.tsx`, do not assert
it. Ask.

# Images

Put them in `public/blog/<slug>/` and reference them with ordinary Markdown:

```md
![A song file open in a text editor beside chordlist.](/blog/my-slug/editor.png "Same file, two apps")
```

- The Markdown **title** becomes a `<figcaption>`; the **alt text** describes the image for screen
  readers. Do not make them identical.
- Body images render as a plain lazy-loaded `<img>`, so they bypass `next/image` optimisation. Export
  at about 1600px wide and compress. For a tall or unusual aspect ratio, hand-write
  `<img src="…" width="1600" height="900" loading="lazy" decoding="async" alt="…">` — raw HTML passes
  through.
- **No remote image URLs.** There is no `images.remotePatterns` config, and they would break.
- A `cover` is optional. When set, author it at exactly **1200×630** and name it `cover.png`: the same
  file then serves the index card, the article hero, and the social preview.
- Without a cover, the post still gets a generated card at `public/blog/og/<slug>.png` from
  `pnpm build:og`. Run that command after creating the post and commit the PNG.

# Check it

```
pnpm build:og
pnpm check
```

`pnpm check` runs lint with `--max-warnings=0`, then typecheck, then the production build. The build
is where a bad date, an unknown tag, a `cover` without `coverAlt`, or a missing `description` will
fail, with the filename in the message.

Then `pnpm dev` and confirm:

- `/blog` shows the card, and the post is found by both the search box and its tag chip.
- `/blog/<slug>` renders, every internal link resolves, and images load in light and dark mode.
- To preview a scheduled post, temporarily set `published` to today — then **set it back before
  committing**.

# Do not

- Add a Markdown, date, or search dependency. `marked` and `yaml` are what we have.
- Put post copy in a `.tsx` file, or blog chrome in a Markdown file.
- Add an H1 to the body.
- Rename the slug of an existing post.
- Special-case a post inside `lib/blog.ts`.
- Invent a tag without updating `blogTags` and `blogCopy.tags`.
- Paste untrusted or fetched HTML into a post. The renderer does not sanitise; it passes raw HTML
  through on purpose, and that is safe only because posts are repo-committed.
