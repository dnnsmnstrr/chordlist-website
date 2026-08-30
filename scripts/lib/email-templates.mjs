/**
 * Layout and type for the transactional and campaign emails built by scripts/build-emails.mjs.
 *
 * Email is not the web. Three constraints shape everything below, and none of them are style
 * preferences:
 *
 *   1. Outlook on Windows renders with Word, which has no flexbox, no grid, and no `border-radius`.
 *      Structure is therefore tables, and every table is `role="presentation"` so screen readers
 *      read the content rather than announcing a layout grid.
 *   2. Gmail strips `<style>` from a forwarded message and several clients strip it outright, so
 *      every rule that must survive is written inline on the element it applies to. The `<style>`
 *      block carries only progressive enhancement — the dark palette and the narrow breakpoint —
 *      which a client that drops it degrades out of, never into a broken layout.
 *   3. Images are blocked by default in most clients on first open. Nothing here is an image: the
 *      lockup is the wordmark set in the same mono voice the site uses, so a blocked-image inbox
 *      still shows a complete, branded message.
 *
 * The palette mirrors app/globals.css rather than inventing a second one, light-first because that
 * is what a client with no dark support will show.
 */
import { Marked } from "marked"

export const TOKENS = {
  layout: {
    /** 600px is the width every client renders without horizontal scroll. */
    width: 600,
    gutter: 24,
  },

  /**
   * No web fonts: a client that cannot load Geist would reflow the whole message on open. The
   * stacks below resolve to the closest thing already on the reader's machine, and the mono stack
   * carries the wordmark and eyebrow the way `font-mono` does on the site.
   */
  fonts: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },

  light: {
    page: "#F4F4F5",
    surface: "#FFFFFF",
    text: "#18181B",
    muted: "#71717A",
    border: "#E4E4E7",
    buttonBackground: "#18181B",
    buttonText: "#FAFAFA",
    quoteRule: "#D4D4D8",
  },

  dark: {
    page: "#09090B",
    surface: "#131316",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    border: "#27272A",
    buttonBackground: "#FAFAFA",
    buttonText: "#18181B",
    quoteRule: "#3F3F46",
  },
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Markdown to email-safe HTML.
 *
 * Every tag comes back with its styling already inline, because the `<style>` block cannot be
 * relied on. Merge fields such as {{ unsubscribe }} pass through untouched — they are Brevo's to
 * resolve at send time, and escaping their braces would break the link.
 */
function emailMarkdown(colors) {
  const marked = new Marked({ gfm: true })
  const body = `margin:0 0 16px 0;font-family:${TOKENS.fonts.sans};font-size:16px;line-height:26px;color:${colors.text};`

  marked.use({
    renderer: {
      paragraph({ tokens }) {
        return `<p style="${body}">${this.parser.parseInline(tokens)}</p>\n`
      },
      heading({ tokens, depth }) {
        // The subject and the <h1> in the header already occupy the top two levels, so a "#" in a
        // body clamps to h2 rather than emitting a competing document title.
        const level = Math.min(Math.max(depth, 2), 4)
        const size = level === 2 ? 20 : 17
        return (
          `<h${level} style="margin:28px 0 12px 0;font-family:${TOKENS.fonts.sans};font-size:${size}px;` +
          `line-height:28px;font-weight:600;color:${colors.text};">${this.parser.parseInline(tokens)}</h${level}>\n`
        )
      },
      link({ href, tokens }) {
        return `<a href="${href}" style="color:${colors.text};text-decoration:underline;">${this.parser.parseInline(tokens)}</a>`
      },
      strong({ tokens }) {
        return `<strong style="font-weight:600;color:${colors.text};">${this.parser.parseInline(tokens)}</strong>`
      },
      list(token) {
        const tag = token.ordered ? "ol" : "ul"
        const items = token.items.map((item) => this.listitem(item)).join("")
        return `<${tag} style="margin:0 0 16px 0;padding-left:22px;">${items}</${tag}>\n`
      },
      listitem({ tokens }) {
        return (
          `<li style="margin:0 0 8px 0;font-family:${TOKENS.fonts.sans};font-size:16px;line-height:26px;` +
          `color:${colors.text};">${this.parser.parseInline(tokens)}</li>`
        )
      },
      blockquote({ tokens }) {
        return (
          `<blockquote class="email-rule" style="margin:0 0 16px 0;padding:2px 0 2px 16px;border-left:3px solid ${colors.quoteRule};">` +
          `${this.parser.parse(tokens)}</blockquote>\n`
        )
      },
      hr() {
        return `<hr class="email-rule" style="border:0;border-top:1px solid ${colors.border};margin:28px 0;" />\n`
      },
      // An image in an email is a decision, not a default: it is blocked on first open and costs
      // the reader bandwidth. Definitions that want one write the tag themselves.
      image({ href, text }) {
        return `<img src="${href}" alt="${escapeHtml(text)}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;" />`
      },
    },
  })

  return (source) => marked.parse(source, { async: false })
}

/**
 * A button that survives Outlook.
 *
 * The colour sits on the `<td>` as a `bgcolor` attribute as well as a style, because Word drops the
 * style; the padding sits on the anchor so the whole coloured area is the click target rather than
 * just the words inside it.
 */
function ctaButton({ colors, label, url }) {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px 0;">
                <tr>
                  <td class="email-button" bgcolor="${colors.buttonBackground}" style="border-radius:8px;background-color:${colors.buttonBackground};">
                    <a href="${url}" style="display:inline-block;padding:13px 22px;font-family:${TOKENS.fonts.sans};font-size:15px;font-weight:600;line-height:20px;color:${colors.buttonText};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
                  </td>
                </tr>
              </table>`
}

/**
 * The hidden line the inbox shows beside the subject.
 *
 * Left unset, a client invents one from the first words of the body — usually the greeting, which
 * tells the reader nothing. The trailing zero-width spaces stop it appending body text to whatever
 * we chose.
 */
function preheaderBlock(preheader) {
  const padding = "&#847;&zwnj;&nbsp;".repeat(60)
  return `
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent;">${escapeHtml(preheader)}${padding}</div>`
}

function footerBlock({ colors, footer, kind }) {
  // A commercial email in Germany carries the sender's identity, so the operator, the legal name,
  // and the postal address are not optional decoration — they are the same disclosure the site's
  // imprint makes. `unsubscribeLabel` only appears on campaign mail: a confirmation message has
  // nothing to unsubscribe from yet, and offering it there invites people to opt out of a list
  // they have not joined.
  const unsubscribe =
    kind === "campaign"
      ? `
              <p style="margin:0 0 10px 0;font-family:${TOKENS.fonts.sans};font-size:12px;line-height:20px;color:${colors.muted};">
                <a href="{{ unsubscribe }}" style="color:${colors.muted};text-decoration:underline;">${escapeHtml(footer.unsubscribeLabel)}</a>
              </p>`
      : ""

  return `
              <hr class="email-rule" style="border:0;border-top:1px solid ${colors.border};margin:0 0 20px 0;" />
              <p style="margin:0 0 10px 0;font-family:${TOKENS.fonts.sans};font-size:12px;line-height:20px;color:${colors.muted};">
                ${escapeHtml(footer.reason)}
              </p>${unsubscribe}
              <p style="margin:0 0 10px 0;font-family:${TOKENS.fonts.sans};font-size:12px;line-height:20px;color:${colors.muted};">
                ${escapeHtml(footer.operator)} · ${escapeHtml(footer.legalName)}<br />
                ${escapeHtml(footer.address)}
              </p>
              <p style="margin:0;font-family:${TOKENS.fonts.sans};font-size:12px;line-height:20px;color:${colors.muted};">
                <a href="${footer.imprintUrl}" style="color:${colors.muted};text-decoration:underline;">${escapeHtml(footer.imprintLabel)}</a>
                &nbsp;·&nbsp;
                <a href="${footer.privacyUrl}" style="color:${colors.muted};text-decoration:underline;">${escapeHtml(footer.privacyLabel)}</a>
              </p>`
}

/** The complete document for one email, in one language. */
export function renderEmailDocument({ definition, footer, htmlLang, wordmark }) {
  const light = TOKENS.light
  const dark = TOKENS.dark
  const toHtml = emailMarkdown(light)
  const { width, gutter } = TOKENS.layout

  const eyebrow = definition.eyebrow
    ? `
              <p class="email-muted" style="margin:0 0 10px 0;font-family:${TOKENS.fonts.mono};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;line-height:18px;color:${light.muted};">${escapeHtml(definition.eyebrow)}</p>`
    : ""

  const cta = definition.cta ? ctaButton({ colors: light, label: definition.cta.label, url: definition.cta.url }) : ""

  const footnote = definition.footnote
    ? `
              <p class="email-muted" style="margin:20px 0 0 0;font-family:${TOKENS.fonts.sans};font-size:13px;line-height:22px;color:${light.muted};">${escapeHtml(definition.footnote)}</p>`
    : ""

  return `<!doctype html>
<html lang="${htmlLang}" dir="ltr" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <!-- Without these two a client that supports dark mode inverts the colours itself, usually
         badly: the button loses its contrast and the muted grey turns unreadable. -->
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(definition.subject)}</title>
    <style>
      /* Enhancement only. Everything that must render is inline above. */
      @media (prefers-color-scheme: dark) {
        .email-page { background-color: ${dark.page} !important; }
        .email-surface { background-color: ${dark.surface} !important; border-color: ${dark.border} !important; }
        .email-text, .email-surface h2, .email-surface h3, .email-surface h4,
        .email-surface p, .email-surface li, .email-surface strong, .email-surface a { color: ${dark.text} !important; }
        /* Descendant selectors on purpose: ".email-surface p" above outranks a bare ".email-muted",
           so without these the eyebrow and the footnote would come back at full contrast in dark
           mode and the button's label would end up the same colour as its own background. */
        .email-muted, .email-muted a,
        .email-surface .email-muted, .email-surface .email-muted a { color: ${dark.muted} !important; }
        .email-button, .email-surface .email-button { background-color: ${dark.buttonBackground} !important; }
        .email-button a, .email-surface .email-button a { color: ${dark.buttonText} !important; }
        .email-rule, .email-surface .email-rule { border-color: ${dark.border} !important; }
      }
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-pad { padding-left: 18px !important; padding-right: 18px !important; }
      }
      /* Stops iOS and some Android clients turning dates and addresses into blue links. */
      a[x-apple-data-detectors], .unstyle-auto-detected-links a { color: inherit !important; text-decoration: none !important; }
    </style>
  </head>
  <body class="email-page" style="margin:0;padding:0;width:100%;background-color:${light.page};">${preheaderBlock(definition.preheader)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-page" style="background-color:${light.page};">
      <tr>
        <td align="center" style="padding:32px ${gutter}px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}" class="email-shell" style="width:${width}px;max-width:100%;">
            <tr>
              <td class="email-pad" style="padding:0 4px 18px 4px;">
                <span class="email-text" style="font-family:${TOKENS.fonts.mono};font-size:16px;font-weight:600;letter-spacing:-0.01em;color:${light.text};">${escapeHtml(wordmark)}</span>
              </td>
            </tr>
            <tr>
              <td class="email-surface email-pad" style="background-color:${light.surface};border:1px solid ${light.border};border-radius:16px;padding:32px ${gutter}px;">${eyebrow}
                <h1 class="email-text" style="margin:0 0 16px 0;font-family:${TOKENS.fonts.sans};font-size:26px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:${light.text};">${escapeHtml(definition.heading)}</h1>
                ${toHtml(definition.body).trim()}${cta}${footnote}
              </td>
            </tr>
            <tr>
              <td class="email-muted email-pad" style="padding:22px 4px 0 4px;">${footerBlock({ colors: light, footer, kind: definition.kind })}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

/**
 * The plain-text alternative.
 *
 * Not a nicety: a message with no text part is scored as more likely to be spam, and some readers
 * only ever see this one. It is generated from the same Markdown as the HTML so the two cannot
 * drift — the formatting is stripped rather than the words being written twice.
 */
export function renderPlainText({ definition, footer, wordmark }) {
  const body = definition.body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  const lines = [wordmark, "", definition.heading, "", body]

  if (definition.cta) lines.push("", `${definition.cta.label}: ${definition.cta.url}`)
  if (definition.footnote) lines.push("", definition.footnote)

  lines.push("", "—", footer.reason)
  if (definition.kind === "campaign") lines.push(`${footer.unsubscribeLabel}: {{ unsubscribe }}`)
  lines.push(
    "",
    `${footer.operator} · ${footer.legalName}`,
    footer.address,
    `${footer.imprintLabel}: ${footer.imprintUrl}`,
    `${footer.privacyLabel}: ${footer.privacyUrl}`,
    "",
  )

  return lines.join("\n")
}
