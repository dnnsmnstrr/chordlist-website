---
name: social-asset
description: Create, edit, or rebuild chordlist social media assets in content/social — choosing a template, writing headline and caption copy, alt text, formats for X and Instagram, and regenerating the PNGs in public/social.
---

# Social asset

Work on social media assets in `content/social/` and their generated images in
`public/social/<slug>/`. One definition file produces every format it declares, so the copy is
written and reviewed once.

Do not draw a one-off image or add a bespoke script for a single post. If a request genuinely needs
a layout none of the five templates provides, identify that as a change to the system and agree it
separately before adding a template.

`docs/social-media-plan.md` is the running calendar: which assets exist, when each is meant to go
out, and what is still unwritten. Check it before inventing a new asset, and tick a line off when
its post is published.

## Workflow

1. Read `docs/social-media-system.md` completely before creating or editing a definition.
2. Establish what the asset is actually saying and which single idea it carries. Ask only when a
   missing choice would change the copy.
3. Choose the template from what the asset says, not from what is convenient: `statement` for a
   claim, `progression` for chords, `quote` for a line from an article, `screenshot` for evidence of
   app behaviour, `file` for the shape of a song on disk.
4. Choose formats. Default to `card` and `post`. Add `story` when the asset is worth a full-screen
   vertical, which is usually a launch or a single strong statement rather than a detailed one.
5. Create `content/social/<slug>.md` with frontmatter and a caption body. Reuse an existing slug only
   when genuinely revising that asset.
6. Verify every product claim against the sources under **Accuracy** below.
7. Run `pnpm build:social`.
8. **Look at the generated PNGs.** Confirm each authored line breaks where it was written to break,
   at every format. This is the step that catches real problems; the build succeeding does not mean
   the asset reads correctly.
9. Run `pnpm check` and commit the definition together with its PNGs.

## Templates and required fields

| Template | Requires | Use it for |
| --- | --- | --- |
| `statement` | `headline` | A single claim, set large. The default. |
| `progression` | `chords` | A chord row over Roman numerals. Optional `numerals`, `headline`. |
| `quote` | `headline` | A line from an article. Optional `attribution`. |
| `screenshot` | `screenshot` | A device screenshot from `public/app-screenshots/dark/`. |
| `file` | `lines` | A song file or folder tree in mono. Optional `filename`, `frontmatter`, `headline`. |
| `photo` | `photo` | Editorial photography as a backdrop, typography over it. Optional `focus`. |

Every definition also requires `alt`. `eyebrow`, `footnote`, `formats`, `created`, `scheduled`, and
`draft` are optional and documented in the system guide.

## File excerpts

`file` preserves the spacing you author, which is the whole point — chords have to land above the
right syllables. Copy a real excerpt instead of retyping one, then check the alignment in the PNG.

- Printable ASCII only. Geist Mono has no box-drawing glyphs and renders `├` as a hollow box instead
  of failing, so the build rejects them; indent a folder tree with spaces.
- A `card` holds about six rows and a `post` about twelve, including the blank row between the
  frontmatter and the body. A headline costs roughly two rows on a card.

## Formats

`card` is 1200×630 for X link previews and landscape timeline images. `post` is 1080×1350 for the
Instagram feed and X vertical images. `story` is 1080×1920 for Instagram stories.

Two constraints the build cannot check:

- Instagram crops a `post` to 3:4 in the profile grid. Keep essential content out of the top and
  bottom eighth.
- A `story` reserves 190px top and 240px bottom for Instagram's own chrome.

## Photography

Read `docs/visual-language.md` before using the `photo` template. Three rules decide most cases:

- **Never generate a photograph containing text.** The image generator produces the picture only;
  this template composites the type over it at build time. That is the entire reason the template
  exists.
- **Atmosphere, not evidence.** Use `photo` for mood or musical context. If the asset's job is to
  show what the app does, use `screenshot` — a blurred 35mm frame cannot carry a product claim.
- **Mind the crop.** `focus` takes a CSS-like string such as `60% 40%`. The build warns when a master
  loses 45% or more of its area to a format; a 3:2 master in a 9:16 story loses about 63%. Treat the
  warning as a prompt to generate a composition for that ratio, using the reusable prompt in the
  visual language guide, rather than as noise.

To add a new master, follow that guide: generate it from its prompt, keep the lossless file in
`assets/visual-references/analog-photography/`, and do not resize or overwrite it. This build reads
the masters and writes only into `public/social/`.

A `photo` asset is roughly forty times the file size of a typographic one, because grain is close to
the worst case for PNG. Use the template deliberately rather than as default dressing.

## Copy

Follow `docs/blog-editorial-guidelines.md` for voice: practical, calm, direct, musician-first,
British English, `chordlist` lowercase, no hype and no exclamation marks.

- One idea per asset. Two ideas are two assets.
- Author line breaks deliberately — each `headline` entry is one rendered line.
- Type is fitted to the frame, so long copy shrinks rather than wraps. Visibly small type means the
  copy is too long: cut words rather than accept it.
- Write the caption in the body. It ships in `public/social/manifest.json` with the image so nobody
  rewrites reviewed copy at posting time.
- Write `alt` describing the visible asset. Do not repeat the caption.

## Accuracy

Treat repository sources as authoritative, exactly as the blog skill does:

- `lib/site-config.ts` for URLs, launch status, platform version, and numeric configuration;
- `locales/en.ts` for current product, FAQ, and press wording;
- `app/privacy/page.tsx` for privacy and data-handling claims; and
- the sibling chordlist iOS repository for app behaviour the website does not specify.

Do not print a TestFlight, App Store, or pre-order URL into an image. Availability changes and
`siteConfig.links` is the only thing that can follow it; use `chordlist.app` instead.

Do not describe progression matching as approximate or intelligent similarity unless that is what
the current implementation does.

## Validation

```bash
pnpm build:social
pnpm check
```

The build fails with the filename in the message on an unknown template, a missing required field,
missing `alt`, an unknown format, a `screenshot` naming a file that is not there, or a `file`
carrying a character Geist Mono cannot render.

Then review the images themselves:

- every authored line breaks where intended, at every format;
- nothing essential falls in the cropped bands of a `post` or under a story's chrome;
- a `screenshot` asset shows a current screen; and
- the set still looks like one system beside the assets already in `public/social/`.

## Guardrails

- Keep asset copy in `content/social/`, not in the scripts.
- Never hand-edit a PNG in `public/social/` — regenerate it.
- Do not rename a slug that has been posted or linked.
- Do not add a template, format, or dependency for a single asset.
- Do not change `scripts/build-og-image.mjs` or `scripts/build-blog-og.mjs`; they own `public/og.png`
  and the per-post cards, and must not move when a campaign does.
- Change the mark in `scripts/lib/chordlist-mark.mjs` and `components/chordlist-icon.tsx` together,
  or the logo drifts between surfaces.
