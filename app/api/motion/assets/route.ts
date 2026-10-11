import { NextResponse } from "next/server"

import { motionFailure } from "@/lib/motion/respond"
import { MotionError, assertLocal, listUploads, saveUpload } from "@/lib/motion/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// A definition's own media: list what has been uploaded for it, or upload another file.
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const slug = new URL(request.url).searchParams.get("slug") ?? ""
    return NextResponse.json({ assets: await listUploads(slug) })
  } catch (error) {
    return motionFailure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const form = await request.formData()
    const slug = form.get("slug")
    const file = form.get("file")
    if (typeof slug !== "string") throw new MotionError("Give the video a name before adding media.")
    if (!(file instanceof File)) throw new MotionError("No file was sent.")
    return NextResponse.json({ asset: await saveUpload(slug, file) })
  } catch (error) {
    return motionFailure(error)
  }
}
