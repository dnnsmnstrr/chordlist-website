/**
 * Writes one built campaign email into Brevo as a draft. It never sends anything.
 *
 *   node scripts/brevo-campaign.mjs <slug> <language> --segment <id> [--campaign <id>]
 *
 * Without --campaign it creates a new draft and prints its ID; with it, it overwrites that draft's
 * subject, preview text, HTML, and recipients. Either way the HTML goes through the API rather
 * than Brevo's editor, which wraps pasted code in a container of its own.
 *
 * Recipients are a single Brevo segment and nothing else. Brevo's segments are where "on this list
 * and written to in this language" is expressed; mixing `listIds` into the same request would add
 * the whole list on top, in every language, and that is a mistake made once, to everybody.
 *
 * Reads BREVO_API_KEY from the environment and the email from public/emails — run
 * `pnpm build:emails` first so the draft matches the reviewed definition.
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/* ─────────────────────────────── CONFIG ─────────────────────────────── */

const CONFIG = {
  manifest: "public/emails/manifest.json",
  endpoint: "https://api.brevo.com/v3/emailCampaigns",

  /** The Brevo-verified sender the list mail goes out from — the same one as the confirmation. */
  sender: { name: "chordlist", email: "info@chordlist.app" },
}

/* ─────────────────────────────── RUN ─────────────────────────────── */

function usage(message) {
  console.error(`${message}\n\nUsage: node scripts/brevo-campaign.mjs <slug> <language> --segment <id> [--campaign <id>]`)
  process.exit(1)
}

function positiveInteger(value, flag) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) usage(`${flag} needs a numeric Brevo ID — got "${value ?? ""}"`)
  return parsed
}

function parseArguments(argv) {
  const positional = []
  const flags = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === "--segment" || argument === "--campaign") {
      flags[argument.slice(2)] = argv[index + 1]
      index += 1
    } else {
      positional.push(argument)
    }
  }
  const [slug, language] = positional
  if (!slug || !language) usage("Name the email and its language.")
  if (flags.segment === undefined) usage("--segment is required: it is who receives this draft.")
  return {
    slug,
    language,
    segmentId: positiveInteger(flags.segment, "--segment"),
    campaignId: flags.campaign === undefined ? null : positiveInteger(flags.campaign, "--campaign"),
  }
}

async function main() {
  const { slug, language, segmentId, campaignId } = parseArguments(process.argv.slice(2))

  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey) usage("BREVO_API_KEY is not set in this shell.")

  const manifest = JSON.parse(await readFile(path.join(projectRoot, CONFIG.manifest), "utf8"))
  const email = manifest.find((entry) => entry.slug === slug && entry.language === language)
  if (!email) usage(`No built email "${slug}" in "${language}". Run pnpm build:emails, or check the name.`)
  // A transactional mail has no unsubscribe link and is written to one person; sent as a campaign
  // it would reach the whole segment without the footer a campaign must carry.
  if (email.kind !== "campaign") usage(`"${slug}" is a ${email.kind} email, not a campaign.`)

  const htmlContent = await readFile(path.join(projectRoot, "public", email.html), "utf8")
  const body = {
    name: `${slug} (${language})`,
    subject: email.subject,
    previewText: email.preheader,
    sender: CONFIG.sender,
    htmlContent,
    recipients: { segmentIds: [segmentId] },
  }

  const response = await fetch(campaignId ? `${CONFIG.endpoint}/${campaignId}` : CONFIG.endpoint, {
    method: campaignId ? "PUT" : "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  })
  const reply = await response.text()

  if (!response.ok) {
    console.error(`Brevo refused the draft (${response.status}): ${reply}`)
    process.exit(1)
  }

  const id = campaignId ?? JSON.parse(reply).id
  console.log(`${campaignId ? "Updated" : "Created"} draft campaign ${id}: "${email.subject}" → segment ${segmentId}`)
  console.log("Nothing has been sent. Send a test to yourself from Brevo, then send or schedule it there.")
}

await main()
