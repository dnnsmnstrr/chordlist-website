import { NextResponse } from "next/server"

import { renderJob, startRender } from "@/lib/motion/render-jobs"
import { motionFailure } from "@/lib/motion/respond"
import { MotionError, assertLocal, assertSlug, listOutputs, readDefinition } from "@/lib/motion/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// Start a render of one saved definition, or ask how the last one is going.
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const slug = new URL(request.url).searchParams.get("slug") ?? ""
    assertSlug(slug)
    return NextResponse.json({ job: renderJob(slug), outputs: await listOutputs(slug) })
  } catch (error) {
    return motionFailure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const { slug } = (await request.json()) as { slug?: unknown }
    if (typeof slug !== "string") throw new MotionError("Which video should be rendered?")
    // Renders what is on disk, so a definition must have been saved to be rendered.
    await readDefinition(slug).catch(() => {
      throw new MotionError("Save the video before rendering it.")
    })
    return NextResponse.json({ job: startRender(slug) })
  } catch (error) {
    return motionFailure(error)
  }
}
