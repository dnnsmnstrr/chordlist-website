import { isAdminRequest } from "@/lib/server/admin-auth"

/**
 * Whether the visitor is an administrator, for the admin link in the site header.
 *
 * The header is on every static page, so it cannot read the session while rendering without making
 * the whole site dynamic. It asks here instead, and only when there is a session cookie to ask
 * about. This is deliberately outside `adminRoutePrefixes`: a visitor who is not signed in gets a
 * plain `false`, not a redirect to the login.
 */
export async function GET() {
  return Response.json({ admin: await isAdminRequest() }, { headers: { "Cache-Control": "private, no-store" } })
}
