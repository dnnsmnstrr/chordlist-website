/**
 * Layout templates for the social asset builds.
 *
 * A template is a pure function of (definition, format, context) that returns a
 * React element tree for satori. It never reads the filesystem and never knows
 * which file it came from, so the same definition renders identically at every
 * format and the runner stays responsible for I/O and validation.
 *
 * Every template renders inside `frame()`, which owns the background, the safe
 * area, the wordmark lockup, and the footer. That is what makes a set of assets
 * read as one system: a template chooses what goes in the middle, never what the
 * edges look like.
 *
 * Satori rules that bite here: any element with more than one child needs an
 * explicit `display: flex`, and there is no text measurement API, so copy is
 * fitted by estimating advance width rather than by measuring the rendered line.
 */
import { createElement as h } from "react"

/* ──────────────────────────── shared helpers ─────────────────────────── */

/**
 * Average glyph advance as a fraction of the font size, used to predict how wide
 * a line will render. Geist Mono is a fixed 0.6em by construction; the bold sans
 * figure is measured from the headlines this system actually sets, and is
 * deliberately a slight over-estimate so the fit errs toward smaller type.
 */
const ADVANCE = { sans: 0.53, mono: 0.6 }

/**
 * The largest size at or below `base` at which the longest line still fits
 * `maxWidth` on one line.
 *
 * A headline is authored as one array entry per rendered line, so a line that
 * wraps on its own has broken the author's intent — the story format is where
 * this bites, since it is 28% narrower than the card but sets type 34% larger.
 * Satori cannot measure text, so the estimate below stands in for measurement:
 * it is deterministic, which matters more than being exact, because the same
 * definition has to produce the same PNG on every machine and in CI.
 *
 * `floor` stops a pathological line from shrinking the type into illegibility;
 * copy that hits the floor is too long for the format and wants an editor, not
 * a smaller point size.
 */
export function fitSize(base, text, { maxWidth, face = "sans", floor = 0.58 } = {}) {
  const lines = Array.isArray(text) ? text : [text]
  const longest = Math.max(1, ...lines.map((line) => line.length))
  if (!maxWidth) return Math.round(base)

  const cap = maxWidth / (longest * ADVANCE[face])
  return Math.round(Math.max(base * floor, Math.min(base, cap)))
}

/**
 * Parses a CSS-like focus string ("60% 40%", "center", "50%") into a pair of
 * 0–1 fractions describing which part of the picture to keep when it is cropped.
 */
function parseFocus(focus) {
  if (!focus || focus === "center") return { x: 0.5, y: 0.5 }

  const parts = String(focus).trim().split(/\s+/)
  const toFraction = (value, fallback) => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(1, Math.max(0, parsed / 100))
  }

  const x = toFraction(parts[0], 0.5)
  return { x, y: parts.length > 1 ? toFraction(parts[1], 0.5) : 0.5 }
}

/**
 * The geometry of an image scaled to cover a frame, positioned by `focus`.
 *
 * Satori does not implement `background-size: cover` — it paints the image at
 * its intrinsic size and tiles the remainder, which turns any master that is not
 * already the frame's aspect ratio into a visible grid. So the cover maths is
 * done here and handed to a plain absolutely positioned `<img>` with explicit
 * dimensions, which satori does honour exactly.
 */
export function coverBox(source, format, focus) {
  const factor = Math.max(format.width / source.width, format.height / source.height)
  const width = Math.ceil(source.width * factor)
  const height = Math.ceil(source.height * factor)
  const { x, y } = parseFocus(focus)

  return {
    width,
    height,
    left: Math.round((format.width - width) * x),
    top: Math.round((format.height - height) * y),
  }
}

function textBlock(lines, style) {
  return h(
    "div",
    { style: { display: "flex", flexDirection: "column", ...style } },
    ...lines.map((line, index) => h("div", { key: index, style: { display: "flex" } }, line)),
  )
}

/**
 * The wordmark lockup: squircle mark, name, and an optional trailing label.
 *
 * Identical in every template and every format apart from scale, so the account
 * is recognisable before any of the copy is read.
 */
function lockup({ tokens, scale, iconUri, label }) {
  const size = Math.round(tokens.type.lockupMark * scale)

  const children = [
    h("img", { key: "mark", src: iconUri, width: size, height: size, style: { flexShrink: 0 } }),
    h(
      "div",
      {
        key: "name",
        style: {
          fontFamily: "Geist",
          fontWeight: 700,
          fontSize: Math.round(tokens.type.wordmark * scale),
          letterSpacing: "-0.03em",
          color: tokens.colors.text,
        },
      },
      tokens.copy.wordmark,
    ),
  ]

  if (label) {
    children.push(
      h(
        "div",
        {
          key: "label",
          style: {
            fontFamily: "Geist Mono",
            fontSize: Math.round(tokens.type.footnote * scale),
            color: tokens.colors.muted,
          },
        },
        label,
      ),
    )
  }

  return h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: Math.round(18 * scale) } },
    ...children,
  )
}

/**
 * The outer frame every asset shares.
 *
 * `format.safeTop` / `format.safeBottom` keep content clear of the platform's
 * own chrome — the profile row and reply bar Instagram draws over a story. They
 * are padding, not a crop: the background still bleeds to the edge.
 */
export function frame({ tokens, format, scale, padding, iconUri, label, body, footer, backdrop }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingTop: padding + (format.safeTop ?? 0),
        paddingBottom: padding + (format.safeBottom ?? 0),
        paddingLeft: padding,
        paddingRight: padding,
        background: tokens.colors.background,
      },
    },
    // Absolutely positioned, so it sits outside the flex flow and behind every
    // later child — satori paints in document order.
    ...(backdrop ?? []),
    lockup({ tokens, scale, iconUri, label }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" } },
      body,
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: Math.round(tokens.type.footnote * scale),
          color: tokens.colors.muted,
        },
      },
      footer ?? "",
    ),
  )
}

/* ─────────────────────────────── templates ───────────────────────────── */

/**
 * statement — one short claim, set large.
 *
 * The workhorse. Use it for launch notes, feature announcements, and anything
 * where the sentence is the whole asset.
 */
function statement({ definition, tokens, scale, inner }) {
  const size = fitSize(tokens.type.headline * scale, definition.headline, { maxWidth: inner.width })

  return {
    body: textBlock(definition.headline, {
      fontFamily: "Geist",
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.025em",
      lineHeight: 1.14,
      color: tokens.colors.text,
    }),
    footer: definition.footnote,
  }
}

/**
 * progression — a chord row over its Roman numerals.
 *
 * The one template that shows the product's subject rather than describing it.
 * Chords are set in the mono face, the site's accent voice, on a fixed gap so
 * four chords always fall into the same rhythm. The numerals are a caption to
 * the chords and sit tight under them; the headline is a separate thought and
 * gets a full step of space.
 */
function progression({ definition, tokens, scale, inner }) {
  const chords = definition.chords.map(String)
  const gap = Math.round(tokens.layout.chordGap * scale)

  // The row is laid out with a fixed flex gap, so its width is the glyphs plus
  // the gaps — not one estimated string. Geist Mono advances exactly 0.6em per
  // character, which makes this solvable rather than approximate: find the
  // largest size at which the glyphs fit whatever the gaps leave over.
  const characters = chords.reduce((total, chord) => total + chord.length, 0)
  const available = inner.width - gap * (chords.length - 1)
  const size = Math.round(Math.min(tokens.type.chord * scale, available / (characters * 0.6)))

  const children = [
    h(
      "div",
      {
        key: "chords",
        style: { display: "flex", alignItems: "flex-end", gap },
      },
      ...chords.map((chord, index) =>
        h(
          "div",
          {
            key: index,
            style: {
              fontFamily: "Geist Mono",
              fontSize: size,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: tokens.colors.text,
            },
          },
          chord,
        ),
      ),
    ),
  ]

  if (definition.numerals) {
    children.push(
      h(
        "div",
        {
          key: "numerals",
          style: {
            display: "flex",
            // The chord row is set at line-height 1, so it contributes no
            // descender space of its own and the caption needs the full gap.
            marginTop: Math.round(40 * scale),
            fontFamily: "Geist Mono",
            fontSize: Math.round(tokens.type.footnote * scale * 1.2),
            letterSpacing: "0.08em",
            color: tokens.colors.muted,
          },
        },
        definition.numerals,
      ),
    )
  }

  if (definition.headline) {
    children.push(
      h(
        "div",
        { key: "headline", style: { display: "flex", marginTop: Math.round(72 * scale) } },
        textBlock(definition.headline, {
          fontFamily: "Geist",
          fontWeight: 700,
          fontSize: fitSize(tokens.type.subhead * scale, definition.headline, { maxWidth: inner.width }),
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          color: tokens.colors.text,
        }),
      ),
    )
  }

  return {
    body: h("div", { style: { display: "flex", flexDirection: "column" } }, ...children),
    footer: definition.footnote,
  }
}

/**
 * quote — a line lifted from an article, credited to its post.
 *
 * Keeps the blog and the feed on one surface. The footnote carries the canonical
 * URL, so the asset stays self-sourcing even when it is screenshotted onward.
 */
function quote({ definition, tokens, scale, inner }) {
  const size = fitSize(tokens.type.subhead * scale, definition.headline, { maxWidth: inner.width })

  const children = [
    h(
      "div",
      {
        key: "mark",
        style: {
          display: "flex",
          fontFamily: "Geist",
          fontWeight: 700,
          fontSize: Math.round(size * 1.7),
          lineHeight: 0.78,
          color: tokens.colors.rule,
        },
      },
      "“",
    ),
    textBlock(definition.headline, {
      marginTop: Math.round(16 * scale),
      fontFamily: "Geist",
      fontWeight: 400,
      fontSize: size,
      letterSpacing: "-0.015em",
      lineHeight: 1.32,
      color: tokens.colors.text,
    }),
  ]

  if (definition.attribution) {
    children.push(
      h(
        "div",
        {
          key: "attribution",
          style: {
            display: "flex",
            marginTop: Math.round(40 * scale),
            fontFamily: "Geist Mono",
            fontSize: Math.round(tokens.type.footnote * scale),
            color: tokens.colors.muted,
          },
        },
        definition.attribution,
      ),
    )
  }

  return {
    body: h("div", { style: { display: "flex", flexDirection: "column" } }, ...children),
    footer: definition.footnote,
  }
}

/**
 * screenshot — a real device screenshot beside or above a short line.
 *
 * The screenshot is never tinted, cropped, or perspective-tilted: it is evidence
 * of what the app does, and docs/visual-language.md keeps that class of image
 * literal and sharp. The card sets it side by side because the frame is wide and
 * short; the taller formats put the copy on top and let the device run to the
 * full width underneath.
 */
function screenshot({ definition, tokens, scale, inner, assets }) {
  const source = assets.screenshots.get(definition.screenshot)
  if (!source) {
    throw new Error(
      `unknown screenshot "${definition.screenshot}" — expected a file in the screenshot directory ` +
        `(available: ${assets.screenshots.names().join(", ") || "none"})`,
    )
  }

  const side = inner.width > inner.height

  // Side by side, the device takes the full inner height and the copy takes the
  // rest of the width. Stacked, it is sized off the height so a tall screenshot
  // cannot push the copy out of the frame.
  const shot = h("img", {
    src: source,
    style: side
      ? // Fill the row the frame gives us, so the device grows with the format
        // instead of tracking a hand-tuned fraction of the canvas.
        { height: "100%", objectFit: "contain", flexShrink: 0 }
      : { height: Math.round(inner.height * 0.68), objectFit: "contain", flexShrink: 0 },
  })

  const copy = definition.headline
    ? textBlock(definition.headline, {
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: fitSize(tokens.type.subhead * scale, definition.headline, {
          maxWidth: side ? inner.width * 0.52 : inner.width,
        }),
        letterSpacing: "-0.02em",
        lineHeight: 1.18,
        color: tokens.colors.text,
      })
    : null

  return {
    body: h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: side ? "row" : "column",
          alignItems: side ? "center" : "flex-start",
          justifyContent: "space-between",
          gap: Math.round(tokens.layout.padding * scale * 0.75),
          width: "100%",
          height: "100%",
        },
      },
      ...(copy ? [copy] : []),
      shot,
    ),
    footer: definition.footnote,
  }
}

/**
 * photo — editorial photography as a full-bleed backdrop, typography over it.
 *
 * This is the sanctioned way to put the analog photography from
 * docs/visual-language.md on a social surface. That document is explicit on two
 * points this template exists to honour: the photograph is atmosphere rather
 * than evidence of a product feature, and all typography stays *outside* the
 * generated image and is composited afterwards — which is exactly what happens
 * here. Never ask an image generator for a photo with words in it.
 *
 * The scrim is not decoration. These masters have blown highlights by design, and
 * white type over a bloom is unreadable, so the frame is dimmed to buy back the
 * contrast the copy needs. `visual-language.md` calls this "quiet contrast behind
 * any separately typeset headline".
 *
 * `focus` steers the crop, because a 3:2 master in a 9:16 story loses most of its
 * width. The runner warns when that loss gets severe: the real fix is a
 * composition made for the ratio, not a cleverer crop.
 */
function photo({ definition, tokens, scale, inner, format, assets }) {
  const source = assets.photos.get(definition.photo)
  if (!source) {
    throw new Error(
      `unknown photo "${definition.photo}" — expected a file in the photography directory ` +
        `(available: ${assets.photos.names().join(", ") || "none"})`,
    )
  }

  const box = coverBox(source, format, definition.focus)

  const backdrop = [
    h("img", {
      key: "photo",
      src: source.uri,
      width: box.width,
      height: box.height,
      style: { position: "absolute", left: box.left, top: box.top },
    }),
    h("div", {
      key: "scrim",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: format.width,
        height: format.height,
        background: tokens.colors.scrim,
      },
    }),
  ]

  const body = definition.headline
    ? textBlock(definition.headline, {
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: fitSize(tokens.type.headline * scale, definition.headline, { maxWidth: inner.width }),
        letterSpacing: "-0.025em",
        lineHeight: 1.14,
        color: tokens.colors.text,
      })
    : h("div", { style: { display: "flex" } })

  return { body, footer: definition.footnote, backdrop }
}

/**
 * The registry the runner validates `template:` against. Adding a template means
 * adding it here, listing its required fields below, and documenting it in
 * docs/social-media-system.md.
 */
export const TEMPLATES = { statement, progression, quote, screenshot, photo }

/** Fields each template requires beyond the common ones, checked before rendering. */
export const TEMPLATE_FIELDS = {
  statement: ["headline"],
  progression: ["chords"],
  quote: ["headline"],
  screenshot: ["screenshot"],
  photo: ["photo"],
}
