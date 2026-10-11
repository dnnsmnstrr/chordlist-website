import { NextResponse } from "next/server"

import { motionFailure } from "@/lib/motion/respond"
import { MotionError, assertLocal, listDefinitions, listOutputs, writeDefinition } from "@/lib/motion/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// Motion definitions for the /motion wizard: list them, or save one to content/motion/<slug>.md.
/// Guarded, and refused outright on a deployed build, which can neither write the checkout nor render.
export const dynamic = "force-dynamic"

export async function GET() {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const definitions = await listDefinitions()
    return NextResponse.json({
      definitions: await Promise.all(definitions.map(async (entry) => ({ ...entry, outputs: await listOutputs(entry.slug) }))),
    })
  } catch (error) {
    return motionFailure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const input = (await request.json()) as { slug?: unknown; definition?: unknown; caption?: unknown }
    if (typeof input.slug !== "string") throw new MotionError("Give the video a name first.")
    const caption = typeof input.caption === "string" ? input.caption : ""
    return NextResponse.json({ saved: await writeDefinition(input.slug, input.definition, caption) })
  } catch (error) {
    return motionFailure(error)
  }
}
