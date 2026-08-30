"use server"

import type { Route } from "next"
import { redirect } from "next/navigation"

import { adminEmails, isAdminEmail, safeRedirectPath } from "@/lib/admin-routes"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AdminLoginState } from "@/lib/admin-login-state"

export async function signIn(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = safeRedirectPath(String(formData.get("next") ?? ""))

  if (!email || !password) return { error: "missing" }

  // Checked before Supabase is asked, so an address that is not an administrator cannot be used to
  // probe which accounts exist in the project. Checked again after sign-in by `requireAdmin`,
  // because this one is about the form and that one is about the session.
  if (!isAdminEmail(email, adminEmails(process.env.ADMIN_EMAILS))) return { error: "denied" }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return { error: "unconfigured" }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: "denied" }

  redirect(next as Route)
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase?.auth.signOut()
  redirect("/login" as Route)
}
