---
name: blog-post
description: Draft, edit, review, schedule, or publish chordlist blog posts in content/blog, including frontmatter, editorial standards, product accuracy, internal links, images, social cards, and validation.
---

# Blog post

Work on chordlist articles in `content/blog/` and their optional images in
`public/blog/<slug>/`. Let the existing blog routes, search, filters, RSS feed, sitemap, related
posts, and social metadata discover the Markdown file automatically.

Do not change blog application code merely to accommodate one article. If the requested article
genuinely requires a new renderer feature, tag, or other site capability, identify that separately
before expanding the implementation scope.

## Workflow

1. Read `docs/blog-editorial-guidelines.md` completely before drafting, editing, or reviewing a
   post.
2. Establish the post's reader, problem, and single promise from the request and existing material.
   Ask only when a missing choice would materially change the article.
3. Read the most relevant existing posts for overlap and contextual links. Read the live product
   sources under **Accuracy** before making product claims.
4. For a new post, choose a permanent slug and create `content/blog/<slug>.md`. For an existing
   post, preserve its filename and publication history unless the user explicitly requests a
   change.
5. Draft or edit the frontmatter and body. Keep product explanation proportional to the article's
   reader value.
6. Fact-check broad music claims, external facts, and current product behaviour. Prefer primary
   sources.
7. Add relevant internal links and images where they improve the article.
8. Run `pnpm build:og` after adding a post or changing its title, description, or cover. Commit the
   resulting social card with the post.
9. Run `pnpm check`. Preview the article at mobile and desktop widths when the change affects layout,
   images, or complex Markdown.

## Slugs

Use lowercase ASCII kebab-case, normally two to five descriptive words, with no date prefix.
`content/blog/keep-a-songbook-in-git.md` becomes `/blog/keep-a-songbook-in-git`.

Treat the slug as a permanent URL. Do not rename an existing post: that breaks inbound links, the
sitemap entry, and the RSS GUID.

## Frontmatter

```yaml
---
title: Keep your songbook in Obsidian
description: Use one folder of Markdown files as both an Obsidian vault and a portable chordlist library.
created: 2026-08-08
published: 2026-08-15
tags:
  - obsidian
  - workflow
cover: /blog/keep-your-songbook-in-obsidian/cover.png
coverAlt: An Obsidian vault open beside chordlist on an iPhone.
draft: true
---
```

| Field | Required | Rules |
| --- | --- | --- |
| `title` | yes | Sentence case, no trailing period. |
| `description` | yes | One standalone sentence used for cards, metadata, social images, and RSS. |
| `created` | yes | Real `YYYY-MM-DD` date on which the draft was created. |
| `published` | yes | Real `YYYY-MM-DD` date; this controls scheduled visibility. |
| `tags` | yes | Normally one primary and at most one meaningful secondary tag. |
| `cover` / `coverAlt` | no | Set both or neither; one without the other fails the build. |
| `draft` | no | Use the boolean `true` to hide the post regardless of its date. |

In production, future-dated and draft posts are absent from the index, sitemap, RSS feed, and their
own URL. Blog routes revalidate hourly, so a scheduled post normally appears within about an hour
of its publication date without another deployment.

Preview deployments and the development server show unreleased posts with a status badge. Do not
temporarily change `published` merely to preview an article. Use `pnpm build && pnpm start` when an
exact rehearsal of production visibility is needed.

## Tags

Read the closed vocabulary from `lib/blog-tags.ts` and its display labels from `blogCopy.tags` in
`locales/en.ts`. An unknown or repeated tag fails the build.

Follow the editorial guide's selection rules. Adding a new tag is a site taxonomy change, not a
routine part of writing one post: update both sources in the same change only when the broader
content plan justifies it.

## Accuracy

Treat repository sources as authoritative for current chordlist behaviour:

- `lib/site-config.ts` for URLs, launch status, platform version, and numeric configuration;
- `locales/en.ts` for current product, FAQ, press, and blog-chrome wording;
- `app/privacy/page.tsx` and its copy in `locales/en.ts` for privacy and data-handling claims;
- the sibling chordlist iOS repository for detailed app behaviour that the website does not specify;
  and
- current official documentation for third-party products such as Apple or Obsidian.

Do not copy a possibly stale fact from an older post. Do not invent or embellish pricing,
availability, usage counts, performance, competitors' behaviour, or security properties. Preserve
tentative wording such as `planned` when the source remains tentative. If the sources do not support
a claim, qualify it, research it from a primary source, or omit it.

Do not hardcode a TestFlight, App Store, or pre-order URL in an article. Every post already renders
`AppCTA`, whose target and label come from the current site configuration.

## Internal links

Choose links for reader value rather than to satisfy a quota. Normally include one relevant docs
link and one contextual link to another post when a useful next article exists.

Verified site targets:

| Target | Use it for |
| --- | --- |
| `/docs#getting-started` | choosing the songs folder, first run, changing it later |
| `/docs#library` | search, tag filters, sorting, shuffle, Now Playing |
| `/docs#playing` | autoscroll, transposition, matching progressions, play history |
| `/docs#adding-songs` | creating songs, URL and share import, Apple Music |
| `/docs#file-format` | folder layout and app-maintained frontmatter |
| `/docs#other-apps` | Files, Finder, Markdown editors, and Git backups |
| `/docs#obsidian` | using an Obsidian vault as the library |
| `/docs#offline` | keeping an iCloud folder downloaded |
| `/#features` | the main product features |
| `/#preview` | the rendered sample song |
| `/songs/morning-light.md` | the downloadable sample song file |
| `/faq` | pricing, analytics, and device support |
| `/press` | the press kit |
| `/privacy` | data handling |

The FAQ currently has no per-question anchors, so link to `/faq` as a whole. Verify links against
the current routes rather than assuming this table can never change.

## Images

Put article images in `public/blog/<slug>/` and reference them with Markdown:

```md
![A song file open in a text editor beside chordlist.](/blog/my-slug/editor.png "Same file, two apps")
```

The alt text describes the image for screen readers; the Markdown title becomes the visible caption.
Do not make them identical.

- Use local images, not remote URLs.
- Export ordinary body images at about 1600px wide and compress them. They render as lazy-loaded
  `<img>` elements rather than through `next/image`.
- Author a cover at exactly 1200×630 and normally name it `cover.png`. The same file serves the index
  card, article hero, and social preview.
- Without a cover, `pnpm build:og` generates `public/blog/og/<slug>.png`.
- Remember that raw HTML is trusted and unsanitised. Never paste fetched or user-submitted HTML into
  a post.

## Validation

Run:

```bash
pnpm build:og # new post or changed title, description, or cover
pnpm check
```

`pnpm check` runs lint, typechecking, and the production build. The build validates dates, slugs,
tags, required frontmatter, and the `cover`/`coverAlt` pair.

When visual review is relevant, confirm that:

- `/blog` shows the expected card, search result, and tag filters;
- `/blog/<slug>` renders every link and image correctly;
- code blocks, tables, and images work at a narrow mobile width; and
- draft or scheduled visibility matches the intended release state.

## Guardrails

- Keep article copy in Markdown, not `.tsx` files.
- Keep blog chrome in `locales/en.ts`, not Markdown.
- Do not add an H1 to the article body.
- Do not rename an existing slug.
- Do not special-case one post in `lib/blog.ts`.
- Do not add Markdown, date, or search dependencies for an article.
- Do not feed untrusted content to the unsanitised Markdown renderer.
