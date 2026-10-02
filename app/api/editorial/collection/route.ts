import { NextResponse } from "next/server"

import { collectionThumbnail, listCollection } from "@/lib/editorial/collection"
import { importFromCollection } from "@/lib/editorial/images"
import { EditorialError, assertEditable } from "@/lib/editorial/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// The photography collection for writing mode: list it, show a thumbnail of one master, or copy
/// one into a post's folder.
///
/// The masters live in assets/, outside public/, so the thumbnails are served from here. Same rules
/// as the other editorial routes: guarded, and refused outright on a deployed build.
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
    const file = new URL(request.url).searchParams.get("file")
    if (file === null) return NextResponse.json({ images: await listCollection() })

    const thumbnail = await collectionThumbnail(file)
    if (!thumbnail) return NextResponse.json({ error: `${file} is not in the collection.` }, { status: 404 })
    return new Response(new Uint8Array(thumbnail), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600" },
    })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertEditable()
    const input = (await request.json()) as { slug?: unknown; file?: unknown }
    if (typeof input.slug !== "string") throw new EditorialError("Which post is this image for?")
    if (typeof input.file !== "string") throw new EditorialError("Which image from the collection?")

    return NextResponse.json(await importFromCollection(input.slug, input.file))
  } catch (error) {
    return failure(error)
  }
}
