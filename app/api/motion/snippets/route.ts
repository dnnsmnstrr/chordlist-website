import { NextResponse } from "next/server"

import { motionFailure } from "@/lib/motion/respond"
import { assertLocal, listDefinitions, readCatalog, saveSnippet, snippetUsage } from "@/lib/motion/store"
import { refuseUnlessAdmin } from "@/lib/server/admin-auth"

/// The snippet catalog for the /motion wizard, and the way to add or change one of its own snippets
/// in content/motion/snippets.yml. Vocabulary and social wording are read-only here.
export const dynamic = "force-dynamic"

async function catalogResponse() {
  return NextResponse.json({ catalog: await readCatalog(), usage: snippetUsage(await listDefinitions()) })
}

export async function GET() {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    return await catalogResponse()
  } catch (error) {
    return motionFailure(error)
  }
}

export async function POST(request: Request) {
  const refusal = await refuseUnlessAdmin()
  if (refusal) return refusal

  try {
    assertLocal()
    const input = (await request.json()) as { kind?: unknown; key?: unknown; value?: unknown }
    await saveSnippet(input.kind, input.key, input.value)
    return await catalogResponse()
  } catch (error) {
    return motionFailure(error)
  }
}
