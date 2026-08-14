# Visual language

## Purpose

Chordlist's editorial photography should feel like a fragment of a rehearsal, performance, or
late-night writing session: tactile, imperfect, and recognisably musical without becoming a literal
product illustration.

Use this style for blog features, atmospheric sections of the website, and supporting backgrounds
in App Store artwork. It should complement clear product screenshots, diagrams, and instructional
images rather than replace them.

## Core style

- Black-and-white experimental 35mm photography.
- A subject that is relevant to the page but only partly recognisable.
- Strong movement, unusual close crops, unstable angles, and imperfect focus.
- Crushed blacks, blooming or blown highlights, visible grain, dust, and scratches.
- A candid, nocturnal feeling rather than a polished studio composition.
- No typography, logos, borders, collages, fake app interfaces, or decorative colour effects.

The recurring visual idea is **music caught in motion**. The subject should give the image meaning;
the blur and grain give it atmosphere.

## Reusable prompt

Replace both placeholders before generating an image. Keep the rest of the prompt intact unless a
specific placement needs a different crop or balance of light and dark.

```text
Create an abstract black-and-white analog photograph of **[SUBJECT]**.

The image should feel accidental, atmospheric, and imperfect rather than like a clean photograph of the subject. Use extreme motion blur, camera shake, shallow focus, soft blooming highlights, crushed blacks, blown-out whites, heavy monochrome film grain, subtle dust and scratches, and strong high-contrast lighting.

The subject should be only partially recognizable, dissolving into abstract shapes, streaks, shadows, and light. Use an unusual close-up crop and tilted or unstable composition, as though photographed quickly in a dark room with a slow shutter speed and pushed high-speed black-and-white film.

Aim for a raw experimental 35mm aesthetic: gritty, tactile, mysterious, nocturnal, imperfect, slightly underexposed, with occasional overexposed light sources. Avoid clean digital sharpness, polished commercial photography, symmetry, crisp edges, obvious AI surrealism, or neatly staged compositions.

**Subject details:** [SUBJECT DETAILS]

Single photograph, full-frame composition, no borders, no collage, no typography.
```

### Fill the placeholders with intent

`[SUBJECT]` should be a short, concrete noun phrase, such as:

- a guitarist changing chords during a small live performance;
- hands moving across a worn piano keyboard; or
- handwritten chord charts scattered beside an acoustic guitar.

`[SUBJECT DETAILS]` should describe only details that matter to the article: the action, setting,
instrument, light source, and desired framing. Do not prescribe every object in the frame; some
unpredictability is part of the style.

For example:

```text
**Subject details:** A close crop of the fretting hand and the upper neck of an acoustic guitar during a rehearsal. One harsh stage light blooms at the edge of the frame. The hand and strings smear diagonally with movement; no face is clearly visible.
```

## Reference masters

Use these project-supplied images as visual references when adapting the prompt:

| Reference | What to carry forward |
| --- | --- |
| `assets/visual-references/analog-photography/guitarist-in-motion.png` | Human movement, hard stage light, diagonal energy, and an identifiable subject that never becomes a portrait. |
| `assets/visual-references/analog-photography/piano-keys-in-motion.png` | Extreme close crop, severe motion blur, and keys dissolving into alternating bands of light and shadow. |
| `assets/visual-references/analog-photography/piano-with-sheet-music.png` | Shallow focus, a low unstable viewpoint, blooming highlights, and notation that remains suggestive rather than readable. |
| `assets/visual-references/analog-photography/phone-on-sheet-music.png` | A quiet contrast between physical and digital media, tactile page detail, and deep negative space around one clear object. |
| `assets/visual-references/analog-photography/stage-microphone-in-motion.png` | A horizontal live microphone, hard bloom, and smeared stand hardware that create strong directional energy. |
| `assets/visual-references/analog-photography/studio-microphone-in-motion.png` | A vertical studio microphone emerging from deep shadow, with tactile grille detail and blown stage lights. |
| `assets/visual-references/analog-photography/sampler-and-keyboard-in-motion.png` | Sampler pads and keyboard sharing the frame, with layered depth, glowing controls, and an unstable portrait crop. |
| `assets/visual-references/analog-photography/sampler-pads-in-motion.png` | A close crop of the pad grid and sequencer, with shallow focus, a luminous display, and a scratched tactile surface. |

Keep the files in this directory as lossless masters. Make compressed, placement-specific exports
elsewhere; do not resize or overwrite the masters.

## Choosing and placing an image

Use an image when it adds a useful pause, establishes the musical context, or gives a conceptual
article a memorable visual anchor. Do not add one simply because a post has none.

- Match the subject to the article's central idea, not just the general topic of music.
- Prefer one strong photograph to a sequence of nearly identical images.
- Keep instructional screenshots and diagrams clear and sharp; this analog style is not suitable
  for steps that the reader must inspect.
- Vary instruments, gestures, crops, and light sources across adjacent posts while retaining the
  same monochrome treatment.
- Never generate legible lyrics, chord charts, brand marks, or app screens inside the photograph.
- Write concrete alt text that describes the visible scene. Use the caption for editorial context,
  rather than repeating the alt text.

## Export guidance

### Blog

- Keep lossless source files under `assets/visual-references/`.
- Put web-ready article images in `public/blog/<slug>/` using descriptive lowercase filenames.
- Export ordinary body images at about 1600px wide in WebP or another efficiently compressed web
  format.
- Create a separate 1200×630 composition if an image will be used as a post cover. Do not stretch a
  body image to fit.
- Check that the important part of the image survives narrow screens and that the file has useful
  alt text and a distinct caption.

### Website and App Store artwork

- Treat the photograph as atmosphere or a supporting background, not evidence of a product feature.
- Keep real interface screenshots accurate, sharp, and visually separate from the photography.
- Choose or generate a composition for the final aspect ratio instead of forcing one master crop
  into every placement.
- Preserve enough quiet contrast behind any separately typeset headline, but keep all typography
  outside the generated image.
- Verify the final artwork at its actual display size, especially when bright highlights sit behind
  interface elements or text.

### Social

Social assets do not crop a master by hand. The `photo` template in
[Social media system](social-media-system.md) takes a master from this directory, lays a scrim over
it for contrast, and composites the typography on top at build time — which is how the rule above
about keeping type outside the generated image is enforced rather than merely stated.

Set `focus` on the definition to steer the crop. The build warns when a master loses 45% or more of
its area to a format, which is the practical form of "choose or generate a composition for the final
aspect ratio": a 3:2 master in a 9:16 story loses about 63% and usually wants its own composition.

Every master in this directory is currently 3:2, 2:3, or 4:5, so none of them is native to a card or
a story. [Social media plan](social-media-plan.md) keeps the running list of compositions worth
generating, each with its placeholders already filled in and the shape it needs to be. Add a row to
the reference table above when one of them lands here.

## Review checklist

Before publishing a new image, confirm that:

- its subject has a specific relationship to the surrounding content;
- it belongs to the same visual family as the reference masters without duplicating one;
- the instrument, hands, and other recognisable details do not contain distracting generation
  errors;
- no accidental text, logo, border, or collage appears in the image;
- alt text and, where useful, a distinct caption are present;
- the export is compressed and uses the correct dimensions for its placement; and
- the image works on both a narrow phone screen and a large display.
