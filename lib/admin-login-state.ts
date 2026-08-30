/**
 * What the login form can say back.
 *
 * A `"use server"` module may only export async functions, so the state type and its initial value
 * live here rather than beside the actions that use them.
 */
export type AdminLoginError = "missing" | "denied" | "unconfigured"

export type AdminLoginState = { error: AdminLoginError | null }

export const emptyAdminLoginState: AdminLoginState = { error: null }
