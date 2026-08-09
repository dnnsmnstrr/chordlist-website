# Social media system

## Purpose

Social assets are generated from committed definitions, not drawn one at a time. A post's copy,
its alt text, its caption, and every image size it needs live in one reviewed file, and
`pnpm build:social` turns that file into finished PNGs.

The point is not speed. It is that the tenth asset looks like the first, that a headline is written
once rather than retyped into three canvases at three sizes, and that changing the wordmark or the
type scale updates every asset in the repository instead of only the ones somebody remembers.

This document covers the typographic assets the build produces. It is a companion to
[Visual language](visual-language.md), which governs editorial photography, and to
[Blog editorial guidelines](blog-editorial-guidelines.md), which governs the voice this copy is
written in.

## How the pieces fit

```
content/social/<slug>.md      Definition: frontmatter for the image, body for the caption
scripts/build-social.mjs      Runner: validation, fonts, formats, output, manifest
scripts/lib/social-templates.mjs   Layouts, shared frame, and type fitting
public/social/<slug>/<format>.png  Output — regenerate, never hand-edit
public/social/manifest.json   Every built asset with its alt text and caption
```

The build renders through Next's bundled `ImageResponse` (satori + resvg) and reads its fonts from
`assets/fonts/`, so it is hermetic and offline, exactly like `build-og-image.mjs` and
`build-blog-og.mjs`. It shares the mark geometry in `scripts/lib/chordlist-mark.mjs` with them, so
the logo can never drift between a favicon, a post card, and a story.

It is a separate script from `pnpm build:og` on purpose. That build owns two fixed, site-owned
images — `public/og.png` and one card per blog post — which must not change when a campaign does.

## Channels and formats

`siteConfig.social` declares two accounts, and the format matrix serves both from one definition.

| Format | Size | Ratio | Where it goes |
| --- | --- | --- | --- |
| `card` | 1200×630 | 1.91:1 | X link previews and any in-timeline landscape image. Matches `public/og.png`, so a shared link and a posted image sit at the same proportions. |
| `post` | 1080×1350 | 4:5 | Instagram feed and X vertical timeline images. The tallest ratio both accept uncropped. |
| `story` | 1080×1920 | 9:16 | Instagram story, full bleed. |

A definition that names no `formats` gets `card` and `post`.

Two cropping rules the build cannot enforce for you:

- Instagram's profile grid crops a 4:5 post to 3:4. Keep anything essential — the end of a headline,
  a URL — out of the top and bottom eighth of a `post`.
- Instagram draws the profile row and the reply bar over a story. The `story` format reserves 190px
  at the top and 240px at the bottom for this, which is why its copy sits closer to the centre than
  the other two.

## Templates

Pick the template that matches what the asset is actually saying. Adding a fifth template is a
change to the system; reaching for an existing one is the normal case.

**`statement`** — one short claim, set large. The workhorse: launch notes, feature announcements,
anything where the sentence is the whole asset. Requires `headline`.

**`progression`** — a chord row over its Roman numerals, with an optional line beneath. The only
template that shows the product's subject rather than describing it, and the one most recognisably
chordlist. Requires `chords`; `numerals` and `headline` are optional.

**`quote`** — a line lifted from an article, credited to its post, with the canonical URL in the
footnote so the asset stays self-sourcing when it is screenshotted onward. Requires `headline`;
`attribution` is optional.

**`screenshot`** — a real device screenshot from `public/app-screenshots/dark/` beside or above a
short line. The screenshot is never tinted, cropped, or perspective-tilted: it is evidence of what
the app does. Requires `screenshot`, naming a file in that directory.

## Writing a definition

```yaml
---
template: statement
eyebrow: Launch
formats:
  - card
  - post
  - story
headline:
  - Your lyrics and chords,
  - as files in your pocket.
footnote: chordlist.app
alt: A dark chordlist card reading "Your lyrics and chords, as files in your pocket."
created: 2026-08-09
scheduled: 2026-08-30
---

The caption goes here, below the frontmatter. It travels with the image in the manifest so
whoever posts it is not rewriting copy that was already reviewed.
```

| Field | Required | Rules |
| --- | --- | --- |
| `template` | yes | One of the four above. An unknown name fails the build. |
| `alt` | yes | Describes the visible asset. Never empty — these are published images. |
| `headline` | per template | One list entry per rendered line. Line breaks are an editorial decision. |
| `formats` | no | Defaults to `card` and `post`. |
| `eyebrow` | no | A short label beside the wordmark: `Launch`, `Feature`, `From the blog`. |
| `footnote` | no | The bottom line. Normally the canonical URL for the thing being posted. |
| `chords` / `numerals` | `progression` | `chords` is a list. `numerals` is one string. |
| `attribution` | `quote` | Normally the post title the line came from. |
| `screenshot` | `screenshot` | A filename in `public/app-screenshots/dark/`. |
| `created` | no | The date the definition was written. |
| `scheduled` | no | Planning only. The build does not act on it. |
| `draft` | no | `true` skips the definition entirely. |

The filename is the output directory name, so it behaves like a blog slug: lowercase ASCII
kebab-case, and stable once anything links to it.

### Copy

Follow the blog guidelines' voice — practical, calm, direct, musician-first, British English, and
`chordlist` lowercase. Beyond that, the frame is small and unforgiving:

- One idea per asset. If a headline needs a comma splice to fit two, it is two assets.
- Author line breaks deliberately. Each `headline` entry is a rendered line.
- Type is fitted to the frame width, so an over-long line shrinks rather than wraps. If an asset
  comes out visibly smaller than its siblings, cut words instead of accepting the smaller size.
- Do not put a store link in the image. Availability changes; `siteConfig.links` is the source of
  truth and a printed URL cannot follow it.
- Claims in an image are as public as claims on a page. The accuracy rules in the blog skill apply.

## Building

```bash
pnpm build:social
```

Every definition renders to `public/social/<slug>/<format>.png`, and the run writes
`public/social/manifest.json` listing each asset's outputs, alt text, and caption. A definition
whose directory no longer exists is pruned, so deleting a file also removes its images rather than
leaving an orphan resolving at a public URL.

Outputs are committed. They are build artefacts in the same sense as the favicons and the OG cards:
**edit the definition, never the PNG.**

## Review checklist

Before committing a new or changed asset, confirm that:

- the template matches what the asset is saying, rather than being the one that was already there;
- every rendered line breaks where it was authored to break, at every format it ships in;
- nothing essential sits in the top or bottom eighth of a `post`, which the profile grid crops;
- `alt` describes the visible asset and the caption adds context rather than repeating it;
- product claims match `lib/site-config.ts` and the current app, and no store URL is printed into
  the image;
- a `screenshot` asset uses a current file from `public/app-screenshots/dark/`;
- the PNGs were regenerated and committed alongside the definition; and
- the asset has been looked at, not just built — at the size it will actually appear.
