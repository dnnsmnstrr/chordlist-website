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
written in. [Social media plan](social-media-plan.md) is the running calendar of what exists, when it
goes out, and which campaign it belongs to.

## How the pieces fit

```
content/social/<slug>.md      Definition: frontmatter for the image, body for the caption
scripts/build-social.mjs      Runner: validation, fonts, formats, output, manifest
scripts/lib/social-templates.mjs   Layouts, shared frame, type fitting, cover maths
public/social/<slug>/<format>.png  Output — regenerate, never hand-edit
public/social/manifest.json   Every built asset with its alt text and caption

assets/visual-references/analog-photography/   Photography masters, read only
public/app-screenshots/dark/                   App screenshots, read only
```

The two source directories are inputs the build reads and never writes. The photography masters stay
lossless where `visual-language.md` requires; this build makes placement-specific exports from them.

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

Pick the template that matches what the asset is actually saying. Adding a sixth template is a
change to the system; reaching for an existing one is the normal case.

**`statement`** — one short claim, set large. The workhorse: launch notes, feature announcements,
anything where the sentence is the whole asset. Requires `headline`.

**`progression`** — a chord row over its Roman numerals, with an optional line beneath. The only
template that shows the product's subject rather than describing it, and the one most recognisably
chordlist. Requires `chords`; `numerals` and `headline` are optional.

**`quote`** — a line lifted from an article, credited to its post, with the canonical URL in the
footnote so the asset stays self-sourcing when it is screenshotted onward. Requires `headline`;
`attribution` is optional.

**`screenshot`** — a real device screenshot from `public/app-screenshots/dark/` running large off
the right edge beside a short line. `full` keeps the complete screen visible; `detail` uses a larger
top-aligned crop when the interface needs to read at timeline size. Screenshots are never tinted or
perspective-tilted. Requires `screenshot`, naming a file in that directory.

**`file`** — a song as it sits on disk: an optional filename, an optional frontmatter block, and the
chord and lyric lines, set in the mono face with the spacing preserved exactly as authored. The
counterpart to `progression`: both show the subject instead of describing it, one as harmony and one
as a file. Requires `lines`. See [Setting a file](#setting-a-file) below.

**`photo`** — editorial photography as a full-bleed backdrop with typography over it. Requires
`photo`, naming a master in `assets/visual-references/analog-photography/`. See
[Using the photography](#using-the-photography) below, which has rules the other templates do not.

## Setting a file

The claim this product makes is that a song is a readable text file, and that claim cannot be set in
a proportional face — chords only land above the right syllables on a monospaced grid. So `file`
renders every entry of `frontmatter` and `lines` as one row of Geist Mono with `white-space: pre`,
and the leading and interior spaces you author are the ones that ship. Copy a real excerpt rather
than retyping one, and check the alignment in the PNG.

Three things to know before writing one:

- **Keep it to an excerpt.** The type is fitted by width *and* by height, so a long block shrinks
  rather than overflowing. A `card` holds roughly six rows and a `post` about twelve, counting the
  blank row the template puts between the frontmatter and the body. Past that the excerpt is
  competing with the footnote for the reader — cut lines, or drop `card` and ship it vertical.
- **ASCII only.** Geist Mono covers Latin text and ordinary punctuation. A box-drawing character
  renders as a hollow box rather than failing, so the build rejects anything outside printable ASCII
  in `filename`, `frontmatter`, and `lines`, and names the offending character. Indent a folder tree
  with spaces — the `├──` in the docs page is the first thing anyone reaches for, and it is the one
  thing that cannot be used here.
- **A headline is optional and expensive.** On a `card` a headline and a six-row excerpt cannot both
  be large. Either let the file carry the asset on its own, or keep the excerpt to about five short
  rows.

## Using the photography

[Visual language](visual-language.md) governs the analog photography, and this template is the
sanctioned way to put it on a social surface. Two of that document's rules are the reason the
template works the way it does.

**Typography stays outside the photograph.** The guide is explicit that a generated image must never
contain text, logos, or borders, and that any headline is typeset separately over it. That is exactly
what happens here: the master is a backdrop and the copy is composited on top at build time. Never
ask an image generator for a photo with words in it — generate the picture from the reusable prompt
in the guide, then let this template set the type.

**The photograph is atmosphere, not evidence.** Use `photo` when an asset needs mood or musical
context. When the asset's job is to show what the app does, use `screenshot`: the guide keeps that
class of image sharp and literal, and a blurred 35mm frame cannot carry a product claim.

The masters have blown highlights by design, so the template lays a scrim over them to buy back the
contrast the copy needs — the guide's "quiet contrast behind any separately typeset headline". The
scrim is tuned in the script's `CONFIG.colors.scrim`.

### Cropping

The guide asks for a composition made for the final aspect ratio rather than one master forced into
every placement, and the current masters make that concrete: three are 3:2 landscape and
`phone-on-sheet-music.png` is 4:5, which is natively the `post` format.

`focus` steers the crop, taking a CSS-like string — `focus: 60% 40%` keeps the point 60% across and
40% down. It defaults to centre.

The build warns when a master loses 45% or more of its area to a format, naming the file, the format,
and the percentage. A 3:2 master in a 9:16 story loses about 63%. The warning does not fail the
build, because sometimes the crop is genuinely fine and only the author can tell — but treat it as a
prompt to generate a composition for that ratio rather than as noise.

### Weight

A grainy monochrome photograph is close to the worst case for PNG, and `ImageResponse` emits nothing
else, so a `photo` story lands around 2 MB against roughly 50 kB for a typographic one. The networks
re-encode on upload, so this costs repository weight rather than delivery speed. It is a reason to
use the template deliberately — for launches and atmosphere — rather than as the default dressing on
every asset.

## Writing a definition

```yaml
---
template: statement
theme: ink
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
| `template` | yes | One of the five above. An unknown name fails the build. |
| `alt` | yes | Describes the visible asset. Never empty — these are published images. |
| `headline` | per template | One list entry per rendered line. Line breaks are an editorial decision. |
| `formats` | no | Defaults to `card` and `post`. |
| `eyebrow` | no | A short label beside the wordmark: `Launch`, `Feature`, `From the blog`. Written as prose, rendered lowercase to match the wordmark. |
| `footnote` | no | The bottom line. Normally the canonical URL for the thing being posted. |
| `chords` / `numerals` | `progression` | `chords` is a list. `numerals` is one string. |
| `attribution` | `quote` | Normally the post title the line came from. |
| `lines` | `file` | The file's body, one entry per rendered row. Spacing is preserved; printable ASCII only. |
| `frontmatter` | no | A `file`'s YAML block, one entry per row, set muted above the body. |
| `filename` | no | A `file`'s name, set above a hairline rule. |
| `screenshot` | `screenshot` | A filename in `public/app-screenshots/dark/`. |
| `screenshotMode` | no | Screenshot framing: `full` keeps the complete screen visible; `detail` uses a larger top-aligned crop. Defaults to `full`. |
| `deviceFrame` | no | `true` adds a dark hardware shell and camera island around a screenshot. Defaults to `false`. |
| `photo` | `photo` | A master filename in `assets/visual-references/analog-photography/`. |
| `focus` | no | Steers the crop for `photo` and `backgroundImage`, e.g. `60% 40%`. Defaults to centre. |
| `backgroundScale` | no | Zooms `photo` or `backgroundImage` from `100%` to `200%` before applying focus. Defaults to `100%`. |
| `theme` | no | Colour system: `ink` (default), `paper`, or `blueprint`. Photo assets normally keep `ink` for white overlay type. |
| `texture` | no | A subtle website-derived background: `studio`, `stage`, `sampler`, `guitar`, `piano-keys`, or `piano-score`. Available on every template except `photo`. |
| `backgroundImage` | no | A full-bleed master filename for any non-`photo` template. Uses `focus` and the standard photo scrim. |
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
- a `file` asset is a real excerpt whose chords still sit over the right syllables, and is short
  enough to read at the sizes it ships in;
- a `photo` asset carries mood rather than a product claim, keeps its copy legible against the
  brightest part of the frame, and either survives its crop or has been given a composition made for
  that ratio;
- the PNGs were regenerated and committed alongside the definition; and
- the asset has been looked at, not just built — at the size it will actually appear.
