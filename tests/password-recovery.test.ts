import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { isAdminRoute, isProtectedRoute } from "../lib/admin-routes"
import {
  classifyRecoveryFragment,
  isPasswordRecoveryRoute,
  isRecoveryLink,
  minimumPasswordLength,
  passwordRecoveryPath,
  urlWithoutFragment,
  validateNewPassword,
} from "../lib/supabase/password-recovery"

/** What Supabase actually puts on the end of the redirect for an implicit-flow recovery link. */
const recoveryFragment =
  "#access_token=eyJhbGciOiJIUzI1NiJ9.header.signature&expires_at=1780000000&expires_in=3600" +
  "&refresh_token=abc123def456&token_type=bearer&type=recovery"

test("a recovery link is recognised", () => {
  assert.deepEqual(classifyRecoveryFragment(recoveryFragment), { kind: "recovery" })
  assert.equal(isRecoveryLink(recoveryFragment), true)
})

test("the classifier reports a verdict and never hands back the tokens", () => {
  // The whole point of this function being pure and returning a verdict: an access token is a
  // bearer credential for the account, and there should be no way to get one out of here and into
  // component state, a log line, or a server action.
  const verdict = classifyRecoveryFragment(recoveryFragment)
  assert.deepEqual(Object.keys(verdict), ["kind"])
  assert.equal(JSON.stringify(verdict).includes("eyJhbGciOiJIUzI1NiJ9"), false)
  assert.equal(JSON.stringify(verdict).includes("abc123def456"), false)
})

test("an expired or reused link is told apart from an empty one", () => {
  const expired = classifyRecoveryFragment(
    "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
  )
  assert.deepEqual(expired, { kind: "error", code: "otp_expired" })

  // `error` alone, with no code, still counts — the reader needs the same message either way.
  assert.deepEqual(classifyRecoveryFragment("#error=server_error"), { kind: "error", code: "server_error" })
  assert.deepEqual(classifyRecoveryFragment("#error_description=Something+went+wrong"), {
    kind: "error",
    code: null,
  })
})

test("a half-delivered recovery fragment is an error, not silence", () => {
  // Supabase's client refuses a fragment without both tokens. Reporting "nothing here" would leave
  // somebody looking at a page that appears to ignore the link they just clicked.
  assert.deepEqual(classifyRecoveryFragment("#access_token=abc&type=recovery"), { kind: "error", code: null })
  assert.deepEqual(classifyRecoveryFragment("#refresh_token=abc&type=recovery"), { kind: "error", code: null })
})

test("nothing else on the site opens the reset form", () => {
  for (const hash of [
    "",
    "#",
    "#features",
    "#section-two",
    // Somebody else's flow: a magic link or an OAuth callback is not this form's business.
    "#access_token=abc&refresh_token=def&type=magiclink",
    "#access_token=abc&refresh_token=def&token_type=bearer",
  ]) {
    assert.deepEqual(classifyRecoveryFragment(hash), { kind: "none" }, hash)
    assert.equal(isRecoveryLink(hash), false, hash)
  }

  assert.deepEqual(classifyRecoveryFragment(null), { kind: "none" })
  assert.deepEqual(classifyRecoveryFragment(undefined), { kind: "none" })
})

test("the fragment is strippable from any address", () => {
  assert.equal(urlWithoutFragment(`https://chordlist.app/${recoveryFragment}`), "https://chordlist.app/")
  assert.equal(urlWithoutFragment("https://chordlist.app/de#"), "https://chordlist.app/de")
  assert.equal(urlWithoutFragment("https://chordlist.app/faq?q=chords"), "https://chordlist.app/faq?q=chords")
})

test("a new password has to be long enough and typed twice", () => {
  const good = "a".repeat(minimumPasswordLength)

  assert.equal(validateNewPassword(good, good), null)
  assert.equal(validateNewPassword("short", "short"), "tooShort")
  assert.equal(validateNewPassword(good, `${good}!`), "mismatch")

  // Length is checked first, so a password that was doomed anyway is never described as a typo.
  assert.equal(validateNewPassword("short", "different"), "tooShort")
  assert.equal(validateNewPassword("a".repeat(minimumPasswordLength - 1), "x"), "tooShort")
})

test("the reset page is public — nobody can sign in to reach it", () => {
  // It is reached by someone who has lost their password, so putting it behind the login would
  // make it useless. It must not appear in `adminRoutePrefixes` or the proxy matcher.
  assert.equal(isPasswordRecoveryRoute(passwordRecoveryPath), true)
  assert.equal(isPasswordRecoveryRoute("/account"), false)
  assert.equal(isPasswordRecoveryRoute(null), false)
  assert.equal(isAdminRoute(passwordRecoveryPath), false)
  assert.equal(isProtectedRoute(passwordRecoveryPath), false)
})

test("the fragment stays in the browser", () => {
  const panel = readFileSync(new URL("../components/password-recovery-panel.tsx", import.meta.url), "utf8")

  // A server action taking the access token would put an account's bearer credential in a request
  // body, a Vercel log line, and anything sitting between the two. The panel is a client component
  // and talks to Supabase directly, on purpose.
  assert.equal(panel.startsWith('"use client"'), true)
  assert.equal(/^\s*"use server"/m.test(panel), false)
  assert.equal(/from "@\/app\//.test(panel), false)

  // And not `createBrowserClient` from @supabase/ssr, which pins `flowType: "pkce"` and would
  // refuse the implicit-flow links that recovery emails already in inboxes carry. Matched as an
  // import and a call rather than as words, because both are named in the comments that explain
  // why they are not used.
  assert.equal(/from "@supabase\/ssr"/.test(panel), false)
  assert.equal(/createBrowserClient\s*\(/.test(panel), false)
  assert.equal(panel.includes('flowType: "implicit"'), true)
  assert.equal(panel.includes("persistSession: false"), true)
})
