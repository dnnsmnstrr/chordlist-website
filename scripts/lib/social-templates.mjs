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

/** The estimated rendered width of the longest line, in the same terms as `fitSize`. */
export function estimateWidth(text, size, face = "sans") {
  const lines = Array.isArray(text) ? text : [text]
  return Math.round(Math.max(0, ...lines.map((line) => line.length)) * size * ADVANCE[face])
}

/**
 * The golden section of a width, as a fraction.
 *
 * The card is the one format wide enough to compose in two columns, and this is
 * where it divides: copy in the major part, the subject — a screenshot, a file —
 * in the minor one.
 */
const GOLDEN_SECTION = 0.618

/**
 * The subject column of a landscape card: where it starts, how wide it is, and
 * where an object of `subjectWidth` sits inside it.
 *
 * The division is the golden section, but it yields to the copy: a headline that
 * renders wider than the major part pushes the column right rather than being
 * run into, so the gap between the two is the same whether the line is two words
 * or six. An object narrower than the column is centred in what is left over,
 * which is what keeps a phone screenshot off the edge it used to hug — with a
 * short headline it settles around two thirds across, and with a long one it
 * moves right until it is flush with the padding.
 */
export function subjectColumn({ inner, gutter, textWidth = 0, subjectWidth = 0 }) {
  const start = Math.max(Math.round(inner.width * GOLDEN_SECTION), textWidth > 0 ? textWidth + gutter : 0)
  const width = Math.max(0, inner.width - start)
  const centred = start + Math.round(Math.max(0, width - subjectWidth) / 2)

  return { start, width, left: Math.max(0, Math.min(centred, inner.width - subjectWidth)) }
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
export function coverBox(source, format, focus, backgroundScale = 100) {
  const parsedScale = Number.parseFloat(String(backgroundScale))
  const percent = Number.isFinite(parsedScale) ? (parsedScale <= 2 ? parsedScale * 100 : parsedScale) : 100
  const zoom = Math.min(200, Math.max(100, percent)) / 100
  const factor = Math.max(format.width / source.width, format.height / source.height) * zoom
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

/**
 * A reusable background treatment for layouts whose subject is still the
 * typography or product screenshot. Full images get the same legibility scrim
 * as the photo template; textures stay deliberately faint, echoing the
 * website's ambient photography without turning into a second subject.
 */
export function backgroundBackdrop({ source, format, focus, backgroundScale, tokens, texture = false }) {
  const box = coverBox(source, format, focus, backgroundScale)
  const image = h("img", {
    key: "background-image",
    src: source.uri,
    width: box.width,
    height: box.height,
    style: {
      position: "absolute",
      left: box.left,
      top: box.top,
      opacity: texture ? 0.14 : 1,
    },
  })

  return [
    image,
    h("div", {
      key: "background-overlay",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: format.width,
        height: format.height,
        background: texture
          ? `linear-gradient(155deg, transparent 12%, ${tokens.colors.background} 76%)`
          : tokens.colors.scrim,
      },
    }),
  ]
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
 * is recognisable before any of the copy is read. The label is lowercased on the
 * way in so it sits beside the wordmark in the same voice the name is set in —
 * definitions stay readable as prose (`From the blog`) without a capital landing
 * next to a lowercase "chordlist".
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
          fontFamily: "Geist Mono",
          fontWeight: 400,
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
        label.toLowerCase(),
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
  // Width alone is not enough here. A pulled line is as long as the sentence the
  // article happens to use, so a four-line quote at the full subhead size runs
  // past the body box and collides with the footnote — visibly, and only in the
  // PNG. The stack is the quotation mark, the lines, and the optional
  // attribution, so its height is linear in the type size and can simply be
  // solved for.
  const markRatio = 1.7 * 0.78
  const lineRatio = 1.32 * definition.headline.length
  const fixed =
    Math.round(16 * scale) +
    (definition.attribution ? Math.round(40 * scale) + Math.round(tokens.type.footnote * scale * 1.4) : 0)
  const heightCap = (inner.height - fixed) / (markRatio + lineRatio)
  const size = Math.min(
    fitSize(tokens.type.subhead * scale, definition.headline, { maxWidth: inner.width }),
    Math.round(heightCap),
  )

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
 * The screenshot stays sharp and literal. `detail` enlarges the interface with a
 * top-aligned crop; `full` preserves the complete screen. An optional device
 * shell is drawn outside either treatment.
 *
 * The two portrait formats keep the oversized treatment the system was built on:
 * the shot runs past the right edge, leaving a stable left column for copy. The
 * card does not, because at 1.91:1 there is room for the phone to sit inside the
 * frame — it is placed in the subject column instead, whole, and vertically
 * centred rather than cropped by the bottom edge.
 *
 * `screenshotLayout: centered` drops the copy entirely and sets the phone whole
 * in the middle of the frame, in every format: the screen is the whole post.
 */
function screenshot({ definition, tokens, scale, inner, format, assets }) {
  const source = assets.screenshots.get(definition.screenshot)
  if (!source) {
    throw new Error(
      `unknown screenshot "${definition.screenshot}" — expected a file in the screenshot directory ` +
        `(available: ${assets.screenshots.names().join(", ") || "none"})`,
    )
  }
  if (definition.screenshotLayout === "centered") {
    return centeredScreenshot({ definition, scale, inner, format, source })
  }

  const detail = definition.screenshotMode === "detail"
  const deviceFrame = definition.deviceFrame === true
  const ratios = {
    card: { height: 0.78, detail: 0.76, visible: 1, copy: 0.58 },
    post: { height: 0.87, detail: 0.62, visible: 0.73, copy: 0.48 },
    story: { height: 0.8, detail: 0.58, visible: 0.68, copy: 0.45 },
  }[format.name]
  const screenshotRatio = 1242 / 2688
  // Contained on the card, where the phone is a whole object in a column of its
  // own and so may not be taller than the box the frame leaves for it; oversized
  // on the portrait formats, where it is a cropped backdrop to the copy.
  const contained = format.name === "card"
  const adjust = screenshotAdjustments(definition, format)
  const shotHeight = Math.round(
    (contained ? Math.min(format.height * ratios.height, inner.height) : format.height * ratios.height) *
      adjust.scale,
  )
  const shotWidth = Math.round(shotHeight * (detail ? ratios.detail : screenshotRatio))
  const outerPadding = (format.width - inner.width) / 2
  const deviceBorder = Math.max(2, Math.round(2 * scale))
  const shotRight = -Math.round(outerPadding + shotWidth * (1 - ratios.visible))
  const shotTop = -Math.round(16 * scale)
  const copyWidth = Math.round(inner.width * ratios.copy)
  const copySize = definition.headline
    ? fitSize(tokens.type.subhead * scale, definition.headline, { maxWidth: copyWidth })
    : 0
  const imageFit = detail ? "cover" : "contain"
  const imagePosition = detail ? "top" : "center"

  // The device shell draws its border outside the screen, so the column has to
  // place the wider box or the phone ends up sitting a border off centre.
  const outerWidth = shotWidth + (deviceFrame ? deviceBorder * 2 : 0)
  const column = subjectColumn({
    inner,
    gutter: Math.round(tokens.layout.columnGap * scale),
    textWidth: definition.headline ? estimateWidth(definition.headline, copySize) : 0,
    subjectWidth: outerWidth,
  })
  // Absolute against the body box on the portrait formats, a flex child in the
  // card's two-column row — which is what centres it vertically without the
  // template having to know how tall the body box came out.
  // The sliders' offsets go on top of either placement, as the editor's preview applies them.
  const placement = contained
    ? {
        position: "relative",
        flexShrink: 0,
        marginLeft: column.left - (definition.headline ? copyWidth : 0),
        left: adjust.left,
        top: adjust.top,
      }
    : { position: "absolute", right: shotRight - adjust.left, top: shotTop + adjust.top }

  let shot
  if (deviceFrame) {
    const framePadding = Math.round(Math.max(7 * scale, Math.min(shotWidth, shotHeight) * 0.022))
    const frameRadius = Math.round(Math.min(shotWidth * 0.13, 52 * scale))
    const screenRadius = Math.max(8, frameRadius - framePadding)
    const islandWidth = Math.round(Math.min((shotWidth - framePadding * 2) * 0.24, 112 * scale))
    const islandHeight = Math.round(Math.max(8 * scale, framePadding * 0.72))

    shot = h(
      "div",
      {
        style: {
          display: "flex",
          ...placement,
          width: shotWidth,
          height: shotHeight,
          background: "#050505",
          border: `${deviceBorder}px solid #3F3F46`,
          borderRadius: frameRadius,
        },
      },
      h("img", {
        src: source,
        style: {
          position: "absolute",
          left: framePadding,
          top: framePadding,
          width: shotWidth - framePadding * 2,
          height: shotHeight - framePadding * 2,
          objectFit: imageFit,
          objectPosition: imagePosition,
          borderRadius: screenRadius,
        },
      }),
      h("div", {
        style: {
          position: "absolute",
          left: Math.round((shotWidth - islandWidth) / 2),
          top: Math.round(framePadding * 1.45),
          width: islandWidth,
          height: islandHeight,
          background: "#050505",
          borderRadius: islandHeight,
        },
      }),
    )
  } else {
    shot = h("img", {
      src: source,
      style: {
        ...placement,
        width: shotWidth,
        height: shotHeight,
        objectFit: imageFit,
        objectPosition: imagePosition,
        borderRadius: detail ? Math.round(22 * scale) : 0,
      },
    })
  }

  const copy = definition.headline
    ? textBlock(definition.headline, {
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: copySize,
        letterSpacing: "-0.02em",
        lineHeight: 1.18,
        color: tokens.colors.text,
      })
    : null

  const copyBlock = copy
    ? h(
        "div",
        { style: { display: "flex", position: "relative", flexShrink: 0, width: copyWidth } },
        copy,
      )
    : null

  return {
    body: h(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          flexDirection: contained ? "row" : "column",
          // On the card the cross axis is vertical, so this is what centres the
          // phone against the copy; in the column it would centre the copy block
          // horizontally, which is not what a left column is.
          alignItems: contained ? "center" : "flex-start",
          justifyContent: contained ? "flex-start" : "center",
          width: "100%",
          height: "100%",
        },
      },
      // Document order decides paint order, and on the portrait formats the copy
      // has to land over the screenshot rather than under it.
      ...(contained ? [...(copyBlock ? [copyBlock] : []), shot] : [shot, ...(copyBlock ? [copyBlock] : [])]),
    ),
    footer: definition.footnote,
  }
}

/**
 * The phone alone, whole, in the middle of the body box. Sized to the box rather
 * than to the canvas, so it never runs under the lockup or the footnote, then
 * scaled and nudged by `screenshotScale` and `screenshotFocus` the way the
 * editor's sliders preview it.
 */
function centeredScreenshot({ definition, scale, inner, format, source }) {
  const detail = definition.screenshotMode === "detail"
  const deviceFrame = definition.deviceFrame === true
  const ratio = detail
    ? { card: 0.76, post: 0.62, story: 0.58 }[format.name]
    : 1242 / 2688
  const adjust = screenshotAdjustments(definition, format)
  const fitted = Math.min(inner.height, inner.width / ratio)
  const shotHeight = Math.round(fitted * adjust.scale)
  const shotWidth = Math.round(shotHeight * ratio)
  const deviceBorder = Math.max(2, Math.round(2 * scale))
  const imageFit = detail ? "cover" : "contain"
  const imagePosition = detail ? "top" : "center"
  const nudge = {
    position: "relative",
    flexShrink: 0,
    left: adjust.left,
    top: adjust.top,
  }

  let shot
  if (deviceFrame) {
    const framePadding = Math.round(Math.max(7 * scale, Math.min(shotWidth, shotHeight) * 0.022))
    const frameRadius = Math.round(Math.min(shotWidth * 0.13, 52 * scale))
    const screenRadius = Math.max(8, frameRadius - framePadding)
    const islandWidth = Math.round(Math.min((shotWidth - framePadding * 2) * 0.24, 112 * scale))
    const islandHeight = Math.round(Math.max(8 * scale, framePadding * 0.72))
    shot = h(
      "div",
      {
        style: {
          display: "flex",
          ...nudge,
          width: shotWidth,
          height: shotHeight,
          background: "#050505",
          border: `${deviceBorder}px solid #3F3F46`,
          borderRadius: frameRadius,
        },
      },
      h("img", {
        src: source,
        style: {
          position: "absolute",
          left: framePadding,
          top: framePadding,
          width: shotWidth - framePadding * 2,
          height: shotHeight - framePadding * 2,
          objectFit: imageFit,
          objectPosition: imagePosition,
          borderRadius: screenRadius,
        },
      }),
      h("div", {
        style: {
          position: "absolute",
          left: Math.round((shotWidth - islandWidth) / 2),
          top: Math.round(framePadding * 1.45),
          width: islandWidth,
          height: islandHeight,
          background: "#050505",
          borderRadius: islandHeight,
        },
      }),
    )
  } else {
    shot = h("img", {
      src: source,
      style: {
        ...nudge,
        width: shotWidth,
        height: shotHeight,
        objectFit: imageFit,
        objectPosition: imagePosition,
        borderRadius: detail ? Math.round(22 * scale) : 0,
      },
    })
  }

  return {
    body: h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        },
      },
      shot,
    ),
    footer: definition.footnote,
  }
}

/**
 * The editor's Scale and Position sliders, as the build applies them in both layouts:
 * `screenshotScale` multiplies the shot's height (50–150%), and `screenshotFocus` moves it by a
 * share of the canvas (each axis −20 to 20%), right and down for positive values.
 */
export function screenshotAdjustments(definition, format) {
  const [x, y] = String(definition.screenshotFocus ?? "0% 0%").trim().split(/\s+/)
  return {
    scale: percentage(definition.screenshotScale, 100, 50, 150),
    left: Math.round(percentage(x, 0, -20, 20) * format.width),
    top: Math.round(percentage(y, 0, -20, 20) * format.height),
  }
}

/** A percentage such as `120%` (or a bare `120`) as a fraction, clamped to [min, max]. */
function percentage(value, fallback, min, max) {
  if (value === undefined || value === null || value === "") return fallback / 100
  const parsed = Number.parseFloat(String(value))
  if (!Number.isFinite(parsed)) return fallback / 100
  return Math.min(max, Math.max(min, parsed)) / 100
}

/**
 * file — a song as it actually sits on disk: filename, frontmatter, lyric lines.
 *
 * The social surface of components/lyric-preview.tsx, and the counterpart to
 * `progression`: both show the product's subject instead of describing it, one
 * as harmony and one as a file. It exists because the strongest argument this
 * product has — a song is a text file you can read without us — cannot be made
 * in a proportional face. Chords only sit above the right words in a monospaced
 * grid, which is why the copy here is set in Geist Mono with `white-space: pre`
 * and why no other template can stand in for this one.
 *
 * The type is fitted by width *and* by height. Every other template sets a few
 * words, so width alone is enough; an excerpt is a block whose row count decides
 * whether it fits at all. A card holds roughly six rows and a post twice that.
 * Copy that shrinks past legibility wants fewer lines, not a smaller size — the
 * excerpt is an illustration, never the whole file.
 */
function file({ definition, tokens, scale, inner, format }) {
  const filename = definition.filename === undefined ? undefined : String(definition.filename)
  const meta = (definition.frontmatter ?? []).map(String)
  const lines = definition.lines.map(String)
  const lineHeight = 1.5

  /*
    Stacked, a headline and an excerpt split one 352px-tall box between them and
    both come out small — the excerpt worst, because it is the one thing on the
    card that has to stay readable as text. On the card they go side by side
    instead, the excerpt taking the same subject column the screenshot template
    uses, so each gets the full height. Without a headline there is no second
    column to fill, and the excerpt keeps the whole width.
  */
  const twoColumn = format.name === "card" && Boolean(definition.headline)
  const gutter = Math.round(tokens.layout.columnGap * scale)
  const column = subjectColumn({ inner, gutter })
  const contentWidth = twoColumn ? column.width : inner.width
  const headlineWidth = twoColumn ? column.start - gutter : inner.width

  const headlineSize = definition.headline
    ? fitSize(tokens.type.subhead * scale, definition.headline, { maxWidth: headlineWidth })
    : 0
  const headlineGap = Math.round(56 * scale)
  const headlineHeight =
    definition.headline && !twoColumn
      ? Math.round(headlineSize * 1.2 * definition.headline.length) + headlineGap
      : 0

  const filenameSize = Math.round(tokens.type.footnote * scale)
  const ruleGap = Math.round(20 * scale)
  const chromeHeight = filename ? Math.round(filenameSize * 1.4) + ruleGap * 2 : 0

  // The blank row between frontmatter and lyrics is part of the file, so it is
  // part of the budget too.
  const separator = meta.length > 0 && lines.length > 0
  const rows = meta.length + lines.length + (separator ? 1 : 0)
  const widthCap = fitSize(tokens.type.code * scale, [...meta, ...lines], {
    maxWidth: contentWidth,
    face: "mono",
  })
  const heightCap = (inner.height - headlineHeight - chromeHeight) / Math.max(1, rows * lineHeight)
  const size = Math.round(Math.max(tokens.type.code * scale * 0.5, Math.min(widthCap, heightCap)))
  const row = Math.round(size * lineHeight)

  // `pre` is load-bearing: collapse the runs of spaces and every chord lands over
  // the wrong syllable, which is precisely the thing the asset is claiming.
  const codeLine = (text, key, color) =>
    h(
      "div",
      {
        key,
        style: {
          display: "flex",
          height: row,
          fontFamily: "Geist Mono",
          fontSize: size,
          lineHeight,
          whiteSpace: "pre",
          color,
        },
      },
      text,
    )

  const children = []

  if (filename) {
    children.push(
      h(
        "div",
        {
          key: "filename",
          style: {
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: filenameSize,
            color: tokens.colors.muted,
          },
        },
        filename,
      ),
      h("div", {
        key: "rule",
        style: {
          display: "flex",
          height: Math.max(1, Math.round(scale)),
          width: "100%",
          marginTop: ruleGap,
          marginBottom: ruleGap,
          background: tokens.colors.rule,
        },
      }),
    )
  }

  meta.forEach((text, index) => children.push(codeLine(text, `meta-${index}`, tokens.colors.muted)))
  if (separator) children.push(h("div", { key: "separator", style: { display: "flex", height: row } }))
  lines.forEach((text, index) => children.push(codeLine(text, `line-${index}`, tokens.colors.text)))

  const headline = definition.headline
    ? textBlock(definition.headline, {
        fontFamily: "Geist",
        fontWeight: 700,
        fontSize: headlineSize,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        color: tokens.colors.text,
      })
    : null

  if (headline && !twoColumn) {
    children.push(h("div", { key: "headline", style: { display: "flex", marginTop: headlineGap } }, headline))
  }

  const excerpt = h(
    "div",
    { style: { display: "flex", flexDirection: "column", width: contentWidth } },
    ...children,
  )

  if (!twoColumn) return { body: excerpt, footer: definition.footnote }

  return {
    body: h(
      "div",
      { style: { display: "flex", flexDirection: "row", alignItems: "center", width: "100%" } },
      h("div", { key: "headline", style: { display: "flex", flexShrink: 0, width: headlineWidth } }, headline),
      h("div", { key: "excerpt", style: { display: "flex", flexShrink: 0, marginLeft: gutter } }, excerpt),
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

  const box = coverBox(source, format, definition.focus, definition.backgroundScale)

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
 * The release template's measures, at scale 1. Mirrored by `release` in
 * components/social-post-editor.tsx, whose canvas preview has to land where
 * this puts things.
 */
const RELEASE = {
  headline: 100,
  lineHeight: 1.04,
  tracking: -0.035,
  badge: 22,
  gap: 30,
  bottom: 36,
  // The share of a card's width the headline may take before it shrinks, so it
  // stays clear of the photograph's brightest part.
  cardMeasure: 0.72,
  cardPhotoStart: 0.38,
  portraitPhotoEnd: 0.62,
}

/** The badge's proportions for a font size. Mirrors `badgeGeometry` in lib/visual-assets.ts. */
export function badgeGeometry(size) {
  return { padding: size * 0.95, height: size * 2.3, line: Math.max(1, size * 0.07), tracking: 0.08, ruleOpacity: 0.5 }
}

/**
 * Where the release template's photograph sits: the right of a card, the top of
 * a portrait format. The runner measures crop loss against this rather than the
 * whole canvas, since that is the frame the master is actually cropped to.
 */
export function releasePhotoArea(format) {
  if (format.name === "card") {
    const left = Math.round(format.width * RELEASE.cardPhotoStart)
    return { left, top: 0, width: format.width - left, height: format.height }
  }
  return { left: 0, top: 0, width: format.width, height: Math.round(format.height * RELEASE.portraitPhotoEnd) }
}

/** `#RRGGBB` at an opacity, for the rules and fades that sit on a theme color. */
function withAlpha(hex, alpha) {
  const value = Number.parseInt(hex.replace("#", ""), 16)
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`
}

/** The hairline pill of short segments that heads a release card and a feature list. */
function badge({ segments, size, gap, tokens }) {
  const geometry = badgeGeometry(size)
  const rule = `${geometry.line}px solid ${withAlpha(tokens.colors.text, geometry.ruleOpacity)}`
  return h(
    "div",
    {
      key: "badge",
      style: {
        display: "flex",
        alignSelf: "flex-start",
        height: Math.round(geometry.height),
        marginBottom: gap,
        border: rule,
        borderRadius: Math.round(geometry.height / 2),
      },
    },
    ...segments.map((segment, index) =>
      h(
        "div",
        {
          key: index,
          style: {
            display: "flex",
            alignItems: "center",
            paddingLeft: Math.round(geometry.padding),
            paddingRight: Math.round(geometry.padding),
            borderLeft: index > 0 ? rule : "none",
            fontFamily: "Geist Mono",
            fontSize: size,
            letterSpacing: `${geometry.tracking}em`,
            color: tokens.colors.text,
          },
        },
        segment,
      ),
    ),
  )
}

/**
 * release — a version and what is new in it, after the release cards Raycast
 * posts with each update.
 *
 * The photograph takes its own area rather than the whole frame — the right of
 * a card, the top of a post or a story — and dissolves into the ground towards
 * the words, so the copy sits on the plain ground and needs no scrim. The words
 * are a hairline badge of short segments, the platforms and the version, over a
 * headline set large and light, both on the bottom of the body box.
 */
function release({ definition, tokens, scale, inner, format, assets }) {
  const source = assets.photos.get(definition.photo)
  if (!source) {
    throw new Error(
      `unknown photo "${definition.photo}" — expected a file in the photography directory ` +
        `(available: ${assets.photos.names().join(", ") || "none"})`,
    )
  }

  const area = releasePhotoArea(format)
  const box = coverBox(source, area, definition.focus, definition.backgroundScale)
  const clear = withAlpha(tokens.colors.background, 0)
  const fade =
    format.name === "card"
      ? `linear-gradient(90deg, ${tokens.colors.background} 0%, ${clear} 55%)`
      : // Dark behind the lockup at the top, clear through the middle, and the ground again by the words.
        `linear-gradient(180deg, ${withAlpha(tokens.colors.background, 0.8)} 0%, ` +
        `${withAlpha(tokens.colors.background, 0.5)} 24%, ${clear} 40%, ${clear} 48%, ${tokens.colors.background} 100%)`

  const backdrop = [
    h(
      "div",
      {
        key: "release-photo",
        style: {
          position: "absolute",
          left: area.left,
          top: area.top,
          width: area.width,
          height: area.height,
          display: "flex",
          overflow: "hidden",
        },
      },
      h("img", {
        src: source.uri,
        width: box.width,
        height: box.height,
        style: { position: "absolute", left: box.left, top: box.top },
      }),
      h("div", {
        style: { position: "absolute", left: 0, top: 0, width: area.width, height: area.height, background: fade },
      }),
    ),
  ]

  const maxWidth = format.name === "card" ? inner.width * RELEASE.cardMeasure : inner.width
  const size = fitSize(RELEASE.headline * scale, definition.headline, { maxWidth })
  const children = []

  const segments = (definition.badge ?? []).map(String)
  if (segments.length > 0) {
    children.push(badge({ segments, size: Math.round(RELEASE.badge * scale), gap: Math.round(RELEASE.gap * scale), tokens }))
  }

  children.push(
    textBlock(definition.headline, {
      fontFamily: "Geist",
      fontWeight: 400,
      fontSize: size,
      letterSpacing: `${RELEASE.tracking}em`,
      lineHeight: RELEASE.lineHeight,
      color: tokens.colors.text,
    }),
  )

  const body = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        flex: 1,
        paddingBottom: Math.round(RELEASE.bottom * scale),
      },
    },
    ...children,
  )

  return { body, footer: definition.footnote, backdrop }
}

/**
 * The feature list's measures, at scale 1. Mirrored by `features` in
 * components/social-post-editor.tsx.
 */
const FEATURES = {
  badge: 22,
  gap: 30,
  headline: 64,
  headlineLineHeight: 1.08,
  headlineGap: 40,
  title: 34,
  titleLineHeight: 1.2,
  detail: 24,
  detailLineHeight: 1.35,
  detailGap: 6,
  rowPadding: 18,
  index: 22,
  indexColumn: 64,
  // On a card the badge and heading take a left column of this share, and the
  // list the rest: stacked, a card is too short to hold more than two rows.
  cardHeading: 0.36,
  cardGutter: 56,
  // A list longer than the box would otherwise hold is set smaller rather than
  // cropped, down to this share of its size; past it the list wants an editor.
  floor: 0.6,
}

/**
 * The feature list's sizes for a definition and a box: every measure scaled by
 * one factor, so that the whole group fits the box's height. Satori cannot
 * measure, so the height is estimated from line counts — the editor's preview
 * runs the same arithmetic, which keeps the two in step.
 */
export function featuresLayout({ badgeCount, headlineLines, items, scale, inner, columns }) {
  const rows = items.reduce(
    (total, item) =>
      total +
      FEATURES.rowPadding * 2 +
      FEATURES.title * FEATURES.titleLineHeight +
      (item.detail ? FEATURES.detailGap + FEATURES.detail * FEATURES.detailLineHeight : 0),
    0,
  )
  const heading =
    (badgeCount > 0 ? badgeGeometry(FEATURES.badge).height + FEATURES.gap : 0) +
    (headlineLines > 0 ? headlineLines * FEATURES.headline * FEATURES.headlineLineHeight + FEATURES.headlineGap : 0)
  const height = columns ? Math.max(heading, rows) : heading + rows
  const factor = Math.max(FEATURES.floor, Math.min(1, inner.height / Math.max(1, height * scale)))
  const unit = scale * factor
  const size = (value) => Math.round(value * unit)
  return {
    badge: size(FEATURES.badge),
    gap: size(FEATURES.gap),
    headline: size(FEATURES.headline),
    headlineGap: size(FEATURES.headlineGap),
    title: size(FEATURES.title),
    detail: size(FEATURES.detail),
    detailGap: size(FEATURES.detailGap),
    rowPadding: size(FEATURES.rowPadding),
    index: size(FEATURES.index),
    indexColumn: size(FEATURES.indexColumn),
    line: Math.max(1, Math.round(scale)),
    headingWidth: columns ? Math.round(inner.width * FEATURES.cardHeading) : inner.width,
    gutter: columns ? Math.round(FEATURES.cardGutter * scale) : 0,
  }
}

/**
 * features — what is new, item by item: the slide after a release card.
 *
 * An optional badge and heading, then one row per item — a mono number, the
 * item's name, and an optional line on what it does, each row under a hairline
 * rule. Sits on any theme or background, like `statement`, so it can follow a
 * `release` card in a carousel on the same ink ground. Requires `items`.
 */
function features({ definition, tokens, scale, inner, format }) {
  const items = definition.items
  const headline = definition.headline ?? []
  const segments = (definition.badge ?? []).map(String)
  const columns = format.name === "card" && (headline.length > 0 || segments.length > 0)
  const layout = featuresLayout({
    badgeCount: segments.length,
    headlineLines: headline.length,
    items,
    scale,
    inner,
    columns,
  })
  const listWidth = columns ? inner.width - layout.headingWidth - layout.gutter : inner.width
  const textWidth = listWidth - layout.indexColumn
  const titleSize = fitSize(layout.title, items.map((item) => item.title), { maxWidth: textWidth })
  const details = items.map((item) => item.detail).filter(Boolean)
  const detailSize = details.length ? fitSize(layout.detail, details, { maxWidth: textWidth }) : layout.detail

  const heading = []
  if (segments.length > 0) heading.push(badge({ segments, size: layout.badge, gap: layout.gap, tokens }))
  if (headline.length > 0) {
    heading.push(
      textBlock(headline, {
        fontFamily: "Geist",
        fontWeight: 400,
        fontSize: fitSize(layout.headline, headline, { maxWidth: layout.headingWidth }),
        letterSpacing: "-0.03em",
        lineHeight: FEATURES.headlineLineHeight,
        color: tokens.colors.text,
        marginBottom: columns ? 0 : layout.headlineGap,
      }),
    )
  }

  const list = h(
      "div",
      { key: "items", style: { display: "flex", flexDirection: "column", width: listWidth } },
      ...items.map((item, index) =>
        h(
          "div",
          {
            key: index,
            style: {
              display: "flex",
              paddingTop: layout.rowPadding,
              paddingBottom: layout.rowPadding,
              borderTop: `${layout.line}px solid ${tokens.colors.rule}`,
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                width: layout.indexColumn,
                flexShrink: 0,
                paddingTop: Math.round((titleSize - layout.index) * 0.6),
                fontFamily: "Geist Mono",
                fontSize: layout.index,
                color: tokens.colors.muted,
              },
            },
            String(index + 1).padStart(2, "0"),
          ),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", width: textWidth } },
            h(
              "div",
              {
                style: {
                  display: "flex",
                  fontFamily: "Geist",
                  fontWeight: 700,
                  fontSize: titleSize,
                  lineHeight: FEATURES.titleLineHeight,
                  letterSpacing: "-0.02em",
                  color: tokens.colors.text,
                },
              },
              item.title,
            ),
            ...(item.detail
              ? [
                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        marginTop: layout.detailGap,
                        fontFamily: "Geist",
                        fontWeight: 400,
                        fontSize: detailSize,
                        lineHeight: FEATURES.detailLineHeight,
                        color: tokens.colors.muted,
                      },
                    },
                    item.detail,
                  ),
                ]
              : []),
          ),
        ),
      ),
    )

  const body = columns
    ? h(
        "div",
        { style: { display: "flex", alignItems: "center" } },
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              width: layout.headingWidth,
              marginRight: layout.gutter,
              flexShrink: 0,
            },
          },
          ...heading,
        ),
        list,
      )
    : h("div", { style: { display: "flex", flexDirection: "column" } }, ...heading, list)

  return { body, footer: definition.footnote }
}

/**
 * The registry the runner validates `template:` against. Adding a template means
 * adding it here, listing its required fields below, and documenting it in
 * docs/social-media-system.md.
 */
export const TEMPLATES = { statement, progression, quote, screenshot, file, photo, release, features }

/** Fields each template requires beyond the common ones, checked before rendering. */
export const TEMPLATE_FIELDS = {
  statement: ["headline"],
  progression: ["chords"],
  quote: ["headline"],
  screenshot: ["screenshot"],
  file: ["lines"],
  photo: ["photo"],
  release: ["photo", "headline"],
  features: ["items"],
}
