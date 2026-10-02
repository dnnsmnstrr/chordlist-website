import { NextResponse } from "next/server"

import { listImages, saveImage } from "@/lib/editorial/images"
import { EditorialError, assertEditable } from "@/lib/editorial/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// Article images for writing mode: list a post's folder, or upload one into it.
///
/// Separate from /api/editorial because an upload is multipart rather than JSON. Same rules:
/// guarded, and refused outright on a deployed build — see `assertEditable`.
export const dynamic = "force-dynamic"

function failure(error: unknown) {
  if (error instanceof EditorialError) return NextResponse.json({ error: error.message }, { status: 409 })
  const message = error instanceof Error ? error.message : String(error)
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertEditable()
    const slug = new URL(request.url).searchParams.get("slug") ?? ""
    return NextResponse.json({ images: await listImages(slug) })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertEditable()
    const form = await request.formData()
    const slug = form.get("slug")
    const file = form.get("file")

    if (typeof slug !== "string") throw new EditorialError("Which post is this image for?")
    if (!(file instanceof File)) throw new EditorialError("No image was sent.")

    return NextResponse.json({ image: await saveImage(slug, file) })
  } catch (error) {
    return failure(error)
  }
}
