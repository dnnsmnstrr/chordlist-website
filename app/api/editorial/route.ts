import { NextResponse } from "next/server"

import {
  EditorialError,
  approvePost,
  assertEditable,
  createPost,
  deletePost,
  reorder,
  revokeApproval,
  updateCadence,
  updatePost,
} from "@/lib/editorial/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// The editorial tool's writes, on the local filesystem.
///
/// One endpoint with an `action`, because every action is "change some files, then let the page
/// re-read them" — the client calls `router.refresh()` afterwards rather than trusting a reply.
/// Deployed builds refuse outright; see `assertEditable`.
export const dynamic = "force-dynamic"

type Action =
  | { action: "create"; slug: string; title: string; description: string; tags: string[]; outline: string[] }
  | {
      action: "update"
      slug: string
      title?: string
      description?: string
      tags?: string[]
      outline?: string[]
      body?: string
    }
  | { action: "approve"; slug: string }
  | { action: "revoke"; slug: string }
  | { action: "delete"; slug: string }
  | { action: "reorder"; order: string[] }
  | { action: "cadence"; start: string; everyDays: number; skip: string[] }

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertEditable()
    const input = (await request.json()) as Action

    switch (input.action) {
      case "create":
        return NextResponse.json({ slug: await createPost(input) })
      case "update":
        await updatePost(input.slug, input)
        return NextResponse.json({ ok: true })
      case "approve":
        await approvePost(input.slug)
        return NextResponse.json({ ok: true })
      case "revoke":
        await revokeApproval(input.slug)
        return NextResponse.json({ ok: true })
      case "delete":
        await deletePost(input.slug)
        return NextResponse.json({ ok: true })
      case "reorder":
        return NextResponse.json({ moved: await reorder(input.order) })
      case "cadence":
        return NextResponse.json({ moved: await updateCadence(input) })
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof EditorialError) return NextResponse.json({ error: error.message }, { status: 409 })
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
