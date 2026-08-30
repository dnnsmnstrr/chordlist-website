/**
 * Builds every email declared in content/emails into public/emails/.
 *
 *   pnpm build:emails
 *
 * One definition file produces the HTML to paste into Brevo and the plain-text alternative that
 * goes beside it, so the wording is reviewed once, in the repository, rather than typed into a
 * web editor where nothing can diff it.
 *
 * A slug must exist in every language before the build passes. That is the same honesty rule the
 * `Dictionary` type enforces for the site: a half-translated campaign is not something you want to
 * discover at send time, when half the list has already been mailed in the wrong language.
 *
 * Layout, palette, and the email-client workarounds live in scripts/lib/email-templates.mjs.
 * Copy lives in the definitions. Everything else is in the CONFIG block below.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { parse as parseYaml } from "yaml"

import { renderEmailDocument, renderPlainText } from "./lib/email-templates.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  source: "content/emails",
  outputDirectory: "public/emails",

  /** Every language a slug has to be written in before the build passes. */
  languages: ["en", "de"],
  htmlLang: { en: "en", de: "de" },

  wordmark: "chordlist",

  /** Mirrors lib/site-config.ts. These are the same facts the site's imprint states. */
  site: {
    url: "https://chordlist.app",
    operator: "makerer studio",
    legalName: "Dennis Muensterer",
    address: "Frauenlobplatz 2, 55118 Mainz, Germany",
  },

  /**
   * The footer, per language. `reason` says why this message arrived, which is the single most
   * effective thing a legitimate sender can do about spam complaints — a reader who remembers
   * signing up marks it read, not junk.
   */
  footer: {
    en: {
      reason: "You are receiving this because you asked to be notified about chordlink availability.",
      unsubscribeLabel: "Unsubscribe",
      imprintLabel: "Imprint",
      privacyLabel: "Privacy",
      imprintPath: "/imprint",
      privacyPath: "/privacy",
    },
    de: {
      reason: "Du erhältst diese E-Mail, weil du dich über die Verfügbarkeit von chordlink informieren lassen wolltest.",
      unsubscribeLabel: "Abmelden",
      imprintLabel: "Impressum",
      privacyLabel: "Datenschutz",
      imprintPath: "/de/impressum",
      privacyPath: "/privacy",
    },
  },

  /** Frontmatter that every definition must carry. */
  requiredFields: ["kind", "language", "subject", "preheader", "heading"],
  kinds: ["transactional", "campaign"],
}

/* ─────────────────────────────── BUILD ─────────────────────────────── */

function fail(file, message) {
  throw new Error(`${file}: ${message}`)
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return { frontmatter: match?.[1]?.trim() ?? null, body: (match?.[2] ?? source).trim() }
}

function readDefinition(file, source) {
  const { frontmatter, body } = splitFrontmatter(source)
  if (!frontmatter) fail(file, "missing a YAML frontmatter block")

  const data = parseYaml(frontmatter)
  if (typeof data !== "object" || data === null) fail(file, "frontmatter is not a mapping")

  for (const field of CONFIG.requiredFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      fail(file, `frontmatter needs a non-empty "${field}"`)
    }
  }
  if (!CONFIG.kinds.includes(data.kind)) {
    fail(file, `"kind" must be one of ${CONFIG.kinds.join(", ")} — got "${data.kind}"`)
  }
  if (!CONFIG.languages.includes(data.language)) {
    fail(file, `"language" must be one of ${CONFIG.languages.join(", ")} — got "${data.language}"`)
  }
  if (body === "") fail(file, "has no body")

  if (data.cta !== undefined) {
    const { label, url } = data.cta ?? {}
    if (typeof label !== "string" || typeof url !== "string" || !label.trim() || !url.trim()) {
      fail(file, '"cta" needs both a "label" and a "url"')
    }
    // A campaign whose only link is a merge field that Brevo will not resolve sends a dead button
    // to the whole list at once, so the shape is checked here rather than discovered in an inbox.
    if (!/^(https?:\/\/|\{\{)/.test(url.trim())) {
      fail(file, `"cta.url" must be an absolute URL or a merge field — got "${url}"`)
    }
  }

  return { ...data, body }
}

async function main() {
  const sourceDirectory = path.join(projectRoot, CONFIG.source)
  const outputRoot = path.join(projectRoot, CONFIG.outputDirectory)

  const files = (await readdir(sourceDirectory)).filter((name) => name.endsWith(".md")).sort()
  if (files.length === 0) fail(CONFIG.source, "contains no .md definitions")

  const bySlug = new Map()

  for (const file of files) {
    // "chordlink-on-sale.de.md" is the German wording of the "chordlink-on-sale" email. One file
    // per language keeps each one reviewable on its own while the slug still binds the set.
    const match = file.match(/^(.+)\.([a-z]{2})\.md$/)
    if (!match) fail(file, "must be named <slug>.<language>.md")
    const [, slug, language] = match

    const definition = readDefinition(file, await readFile(path.join(sourceDirectory, file), "utf8"))
    if (definition.language !== language) {
      fail(file, `frontmatter says language "${definition.language}" but the filename says "${language}"`)
    }

    if (!bySlug.has(slug)) bySlug.set(slug, new Map())
    bySlug.get(slug).set(language, definition)
  }

  for (const [slug, languages] of bySlug) {
    const missing = CONFIG.languages.filter((language) => !languages.has(language))
    if (missing.length > 0) {
      fail(`${slug}`, `is missing ${missing.map((language) => `${slug}.${language}.md`).join(" and ")}`)
    }
  }

  // Deleting a definition prunes its output on the next run, so public/emails never accumulates a
  // campaign that no longer exists in the repository.
  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })

  const manifest = []

  for (const [slug, languages] of [...bySlug].sort(([a], [b]) => a.localeCompare(b))) {
    await mkdir(path.join(outputRoot, slug), { recursive: true })

    for (const language of CONFIG.languages) {
      const definition = languages.get(language)
      const footerCopy = CONFIG.footer[language]
      const footer = {
        ...footerCopy,
        operator: CONFIG.site.operator,
        legalName: CONFIG.site.legalName,
        address: CONFIG.site.address,
        imprintUrl: `${CONFIG.site.url}${footerCopy.imprintPath}`,
        privacyUrl: `${CONFIG.site.url}${footerCopy.privacyPath}`,
      }

      const html = renderEmailDocument({
        definition,
        footer,
        htmlLang: CONFIG.htmlLang[language],
        wordmark: CONFIG.wordmark,
      })
      const text = renderPlainText({ definition, footer, wordmark: CONFIG.wordmark })

      await writeFile(path.join(outputRoot, slug, `${language}.html`), html, "utf8")
      await writeFile(path.join(outputRoot, slug, `${language}.txt`), text, "utf8")

      manifest.push({
        slug,
        language,
        kind: definition.kind,
        subject: definition.subject,
        preheader: definition.preheader,
        heading: definition.heading,
        cta: definition.cta ?? null,
        html: `/emails/${slug}/${language}.html`,
        text: `/emails/${slug}/${language}.txt`,
        bytes: Buffer.byteLength(html, "utf8"),
      })

      // Gmail clips a message past ~102KB and shows "View entire message", which hides the footer
      // and the unsubscribe link behind an extra click.
      if (Buffer.byteLength(html, "utf8") > 102_000) {
        console.warn(`  ! ${slug}/${language}.html is over Gmail's ~102KB clipping threshold`)
      }
    }
  }

  await writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

  console.log(`Built ${manifest.length} emails from ${bySlug.size} definitions into ${CONFIG.outputDirectory}/`)
  for (const entry of manifest) console.log(`  ${entry.slug}/${entry.language} — ${entry.subject}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
