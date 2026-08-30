import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"

import { EmailGallery, type EmailManifestEntry } from "@/components/email-gallery"
import { requireAdmin } from "@/lib/server/admin-auth"

export const metadata: Metadata = {
  title: "Email templates",
  description: "Review the built chordlist email templates before pasting them into Brevo.",
  robots: { index: false, follow: false },
}

async function getEmails() {
  const manifestPath = path.join(process.cwd(), "public", "emails", "manifest.json")
  return JSON.parse(await readFile(manifestPath, "utf8")) as EmailManifestEntry[]
}

export default async function EmailsPage() {
  await requireAdmin("/emails")
  return <EmailGallery emails={await getEmails()} />
}
