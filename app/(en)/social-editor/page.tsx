import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/server/admin-auth"

export default async function LegacySocialEditorPage() {
  await requireAdmin("/social/editor")
  redirect("/social/editor")
}
