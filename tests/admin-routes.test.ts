import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

import {
  adminEmails,
  adminRoutePrefixes,
  isAdminEmail,
  isAdminRoute,
  isProtectedRoute,
  safeRedirectPath,
} from "../lib/admin-routes"

test("the internal tools are behind the login and the marketing site is not", () => {
  for (const path of ["/emails", "/emails/", "/translations", "/social/editor", "/api/translations/languages", "/copy"]) {
    assert.equal(isProtectedRoute(path), true, path)
  }
  for (const path of ["/", "/de", "/chordlink", "/blog/a-post", "/privacy", "/press", "/chordlink/notified"]) {
    assert.equal(isAdminRoute(path), false, path)
  }
})

test("the App Store screenshot sets are public", () => {
  // /press links a journalist to /screens for the sets and the archives. A login in front of it
  // turns that link into a dead end, and there is nothing behind it the press kit does not show.
  assert.equal(isAdminRoute("/screens"), false)
  const press = readFileSync(new URL("../app/(en)/press/page.tsx", import.meta.url), "utf8")
  assert.ok(press.includes('href="/screens"'), "press no longer links /screens — is it still public?")
})

test("a prefix does not capture a route that merely starts with the same letters", () => {
  // /copywriting is not /copy, and /emails-archive is not /emails.
  assert.equal(isAdminRoute("/copywriting"), false)
  assert.equal(isAdminRoute("/emails-archive"), false)
  assert.equal(isAdminRoute("/social/posts-public"), false)
  assert.equal(isAdminRoute("/social/posts/anything"), true)
})

test("the login is reachable without being logged in", () => {
  assert.equal(isAdminRoute("/login"), true)
  assert.equal(isProtectedRoute("/login"), false)
})

test("the sign-in and sign-out pages sit inside a language group", () => {
  // A page outside (en) and (de) belongs to neither root layout, so Next renders it into a bare
  // document: no stylesheet, no fonts, no `<html lang>`. /login shipped exactly that until it moved,
  // which is why the route group — invisible in the URL — is the thing being asserted here.
  for (const file of ["app/(en)/login/page.tsx", "app/(en)/logout/page.tsx"]) {
    assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file} is missing`)
  }
  for (const file of ["app/login/page.tsx", "app/logout/page.tsx"]) {
    assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), false, `${file} has no root layout`)
  }
})

test("nobody is an administrator until ADMIN_EMAILS says so", () => {
  // The failure worth ruling out: an unset variable opening the tools to any account that can sign
  // up for the Supabase project.
  assert.deepEqual(adminEmails(undefined), [])
  assert.equal(isAdminEmail("ada@example.com", adminEmails(undefined)), false)
  assert.equal(isAdminEmail("ada@example.com", adminEmails("")), false)
  assert.equal(isAdminEmail(null, adminEmails("ada@example.com")), false)
})

test("the allowlist ignores spacing and case", () => {
  const allowlist = adminEmails(" Ada@Example.com , bob@example.com ")
  assert.deepEqual(allowlist, ["ada@example.com", "bob@example.com"])
  assert.equal(isAdminEmail("ADA@example.com", allowlist), true)
  assert.equal(isAdminEmail("eve@example.com", allowlist), false)
})

test("the post-login redirect cannot be pointed off-site", () => {
  // Otherwise /login?next=//evil.example turns this login into an open redirect that lends the
  // site's name to somebody else's phishing page.
  assert.equal(safeRedirectPath("//evil.example"), "/emails")
  assert.equal(safeRedirectPath("/\\evil.example"), "/emails")
  assert.equal(safeRedirectPath("https://evil.example"), "/emails")
  assert.equal(safeRedirectPath("evil"), "/emails")
  assert.equal(safeRedirectPath(null), "/emails")
  assert.equal(safeRedirectPath("/translations"), "/translations")
})

test("the proxy matcher covers every protected prefix", () => {
  // The matcher has to be static literals for Next to analyse it at build time, so it cannot import
  // the list. This is what stops the two drifting: a prefix added to lib/admin-routes.ts without a
  // matching entry in proxy.ts would still be guarded by requireAdmin, but would lose its session
  // refresh and its fast redirect.
  const proxySource = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8")
  const matcher = proxySource.slice(proxySource.indexOf("matcher: ["))

  for (const prefix of adminRoutePrefixes) {
    assert.ok(matcher.includes(`"${prefix}"`), `proxy.ts matcher is missing "${prefix}"`)
    assert.ok(matcher.includes(`"${prefix}/:path*"`), `proxy.ts matcher is missing "${prefix}/:path*"`)
  }
})

test("every protected page actually calls the guard", () => {
  // The proxy is not the authorization — Next's own docs warn that a matcher does not reliably
  // cover Server Functions — so each page has to ask for itself. This test is what makes forgetting
  // one a failing build rather than a quiet hole.
  const guarded = {
    "app/(en)/copy/page.tsx": "requireAdmin",
    "app/(en)/emails/page.tsx": "requireAdmin",
    "app/(en)/gallery/page.tsx": "requireAdmin",
    "app/(en)/social-editor/page.tsx": "requireAdmin",
    "app/(en)/social/editor/page.tsx": "requireAdmin",
    "app/(en)/social/posts/page.tsx": "requireAdmin",
    "app/(en)/translations/page.tsx": "requireAdmin",
    "app/api/translations/route.ts": "refuseUnlessAdmin",
    "app/api/translations/languages/route.ts": "refuseUnlessAdmin",
  }

  for (const [file, guard] of Object.entries(guarded)) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
    assert.ok(source.includes(guard), `${file} does not call ${guard}`)
  }
})

test("an admin page can never be prerendered as static content", () => {
  // `cookies()` is what marks a route dynamic. If the configuration were checked first, an
  // unconfigured build would prerender the internal tools as static pages — making "is this behind
  // the login" depend on whether an environment variable happened to be set when the build ran.
  // The build output is the real proof (every guarded route must be listed as dynamic); this keeps
  // the ordering that produces it from being tidied away.
  const source = readFileSync(new URL("../lib/supabase/server.ts", import.meta.url), "utf8")
  const cookiesAt = source.indexOf("await cookies()")
  const configAt = source.indexOf("supabaseBrowserConfig()")

  assert.ok(cookiesAt > 0 && configAt > 0)
  assert.ok(cookiesAt < configAt, "cookies() must be read before the configuration check")
})
